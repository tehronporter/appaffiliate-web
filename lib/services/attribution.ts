import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import {
  INTERNAL_WORKSPACE_ROLE_KEYS,
  requireWorkspaceRole,
} from "@/lib/services/permissions";
import { writeAuditLog } from "@/lib/services/audit";

type QueueStatus = "open" | "in_review" | "resolved" | "ignored";

type NormalizedEventRow = {
  id: string;
  app_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  source_type: string;
  source_event_key: string | null;
  event_type: string;
  event_status: string;
  attribution_status: string;
  event_at: string;
  received_at: string | null;
  offer_identifier: string | null;
  product_id: string | null;
  reason_code: string | null;
  payload: Record<string, unknown> | null;
};

type QueueRow = {
  id: string;
  normalized_event_id: string;
  status: QueueStatus;
  reason: string;
  notes: string | null;
};

type PromoCodeRow = {
  id: string;
  app_id: string;
  partner_id: string | null;
  code: string;
  status: string;
};

type PartnerRow = {
  id: string;
  name: string;
  status: string;
};

type AppRow = {
  id: string;
  name: string;
  slug: string;
};

export type AttributionCandidateOption = {
  id: string;
  label: string;
};

export type UnattributedItemView = {
  eventId: string;
  queueId: string | null;
  eventType: string;
  appId: string | null;
  appName: string;
  appSlug: string | null;
  queueStatus: QueueStatus;
  reason: string;
  reasonLabel: string;
  reasonDetail: string;
  suggestedCodeId: string | null;
  suggestedCodeLabel: string | null;
  suggestedPartnerId: string | null;
  suggestedPartnerLabel: string | null;
  confidenceLabel: string;
  receivedAt: string | null;
  occurredAt: string;
  note: string | null;
  signalValues: string[];
  availableCodeOptions: AttributionCandidateOption[];
  availablePartnerOptions: AttributionCandidateOption[];
};

export type UnattributedPageData = {
  hasWorkspaceAccess: boolean;
  items: UnattributedItemView[];
  stats: {
    queueSize: number;
    inReview: number;
    unresolved: number;
  };
  reasonOptions: string[];
};

type DerivedAttributionContext = {
  reason: string;
  reasonLabel: string;
  reasonDetail: string;
  suggestedCodeId: string | null;
  suggestedCodeLabel: string | null;
  suggestedPartnerId: string | null;
  suggestedPartnerLabel: string | null;
  confidenceLabel: string;
  signalValues: string[];
};

const SIGNAL_KEYS = [
  "code",
  "promoCode",
  "promo_code",
  "referralCode",
  "referral_code",
  "offerCode",
  "offer_code",
  "coupon",
  "coupon_code",
];

function normalizeOptionalText(value: string | null | undefined, maxLength = 1000) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function upperCaseCode(value: string) {
  return value.trim().toUpperCase();
}

function formatEventType(eventType: string) {
  return eventType.replaceAll("_", " ");
}

function collectSignals(
  value: unknown,
  collected: Set<string>,
  depth = 0,
) {
  if (depth > 2 || value === null || value === undefined) {
    return;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (normalized) {
      collected.add(normalized);
    }

    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSignals(item, collected, depth + 1);
    }

    return;
  }

  if (typeof value === "object") {
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (SIGNAL_KEYS.includes(key)) {
        collectSignals(item, collected, depth + 1);
        continue;
      }

      if (depth < 1 && (Array.isArray(item) || typeof item === "object")) {
        collectSignals(item, collected, depth + 1);
      }
    }
  }
}

function getEventSignalValues(event: NormalizedEventRow) {
  const signals = new Set<string>();

  collectSignals(event.payload, signals);

  if (event.offer_identifier) {
    signals.add(event.offer_identifier);
  }

  return Array.from(signals).map(upperCaseCode);
}

function toCodeOption(
  code: PromoCodeRow,
  app: AppRow | undefined,
  partner: PartnerRow | undefined,
) {
  const context = [
    app?.name ?? "Unknown app",
    partner?.name ?? "Unassigned partner",
    code.status,
  ].join(" • ");

  return {
    id: code.id,
    label: `${code.code} (${context})`,
  };
}

function toPartnerOption(partner: PartnerRow) {
  return {
    id: partner.id,
    label: `${partner.name} (${partner.status})`,
  };
}

function deriveAttributionContext(params: {
  event: NormalizedEventRow;
  queueRow: QueueRow | null;
  app: AppRow | null;
  promoCodes: PromoCodeRow[];
  appsById: Map<string, AppRow>;
  partnersById: Map<string, PartnerRow>;
}) {
  const signalValues = getEventSignalValues(params.event);
  const sameAppCodes = params.event.app_id
    ? params.promoCodes.filter((code) => code.app_id === params.event.app_id)
    : params.promoCodes;
  const directMatches = sameAppCodes.filter((code) =>
    signalValues.includes(upperCaseCode(code.code)),
  );
  const activeAppCodes = sameAppCodes.filter((code) => code.status === "active");

  if (directMatches.length === 1) {
    const code = directMatches[0];
    const partner = code.partner_id
      ? params.partnersById.get(code.partner_id) ?? null
      : null;

    return {
      reason: "code_signal_detected",
      reasonLabel: "Code signal detected",
      reasonDetail:
        "The event carries a code-like signal that matches one workspace code. This remains review-first until an operator confirms the match.",
      suggestedCodeId: code.id,
      suggestedCodeLabel: code.code,
      suggestedPartnerId: partner?.id ?? null,
      suggestedPartnerLabel: partner?.name ?? null,
      confidenceLabel: "High confidence",
      signalValues,
    } satisfies DerivedAttributionContext;
  }

  if (directMatches.length > 1) {
    return {
      reason: "duplicate_code_signal",
      reasonLabel: "Duplicate code signal",
      reasonDetail:
        "Multiple workspace codes match the available event signal, so automatic attribution would be unsafe.",
      suggestedCodeId: null,
      suggestedCodeLabel: null,
      suggestedPartnerId: null,
      suggestedPartnerLabel: null,
      confidenceLabel: "Review required",
      signalValues,
    } satisfies DerivedAttributionContext;
  }

  if (activeAppCodes.length === 1) {
    const code = activeAppCodes[0];
    const partner = code.partner_id
      ? params.partnersById.get(code.partner_id) ?? null
      : null;

    return {
      reason: "single_app_code_candidate",
      reasonLabel: "Single app code candidate",
      reasonDetail:
        "Only one active code currently covers this app lane. It is shown as a candidate, not as a trusted automatic match.",
      suggestedCodeId: code.id,
      suggestedCodeLabel: code.code,
      suggestedPartnerId: partner?.id ?? null,
      suggestedPartnerLabel: partner?.name ?? null,
      confidenceLabel: "Medium confidence",
      signalValues,
    } satisfies DerivedAttributionContext;
  }

  if (activeAppCodes.length > 1) {
    return {
      reason: "multiple_active_codes",
      reasonLabel: "Multiple active app codes",
      reasonDetail:
        "The app currently has multiple active codes, so an operator needs to decide which lane applies.",
      suggestedCodeId: null,
      suggestedCodeLabel: null,
      suggestedPartnerId: null,
      suggestedPartnerLabel: null,
      confidenceLabel: "Review required",
      signalValues,
    } satisfies DerivedAttributionContext;
  }

  return {
    reason: params.queueRow?.reason || "missing_code_context",
    reasonLabel: "Missing code context",
    reasonDetail:
      "No safe code or partner candidate could be derived from the current event fields and app coverage.",
    suggestedCodeId: null,
    suggestedCodeLabel: null,
    suggestedPartnerId: null,
    suggestedPartnerLabel: null,
    confidenceLabel: "No candidate",
    signalValues,
  } satisfies DerivedAttributionContext;
}

function buildQueueItemView(params: {
  event: NormalizedEventRow;
  queueRow: QueueRow | null;
  app: AppRow | null;
  promoCodes: PromoCodeRow[];
  allPromoCodes: PromoCodeRow[];
  appsById: Map<string, AppRow>;
  partnersById: Map<string, PartnerRow>;
}) {
  const attributionContext = deriveAttributionContext({
    event: params.event,
    queueRow: params.queueRow,
    app: params.app,
    promoCodes: params.promoCodes,
    appsById: params.appsById,
    partnersById: params.partnersById,
  });
  const availableCodes = (params.event.app_id
    ? params.allPromoCodes.filter((code) => code.app_id === params.event.app_id)
    : params.allPromoCodes
  ).map((code) =>
    toCodeOption(
      code,
      params.appsById.get(code.app_id),
      code.partner_id ? params.partnersById.get(code.partner_id) : undefined,
    ),
  );
  const availablePartners = Array.from(params.partnersById.values()).map((partner) =>
    toPartnerOption(partner),
  );

  return {
    eventId: params.event.id,
    queueId: params.queueRow?.id ?? null,
    eventType: formatEventType(params.event.event_type),
    appId: params.event.app_id,
    appName: params.app?.name ?? "Unknown app",
    appSlug: params.app?.slug ?? null,
    queueStatus: params.queueRow?.status ?? "open",
    reason: attributionContext.reason,
    reasonLabel: attributionContext.reasonLabel,
    reasonDetail: attributionContext.reasonDetail,
    suggestedCodeId: attributionContext.suggestedCodeId,
    suggestedCodeLabel: attributionContext.suggestedCodeLabel,
    suggestedPartnerId: attributionContext.suggestedPartnerId,
    suggestedPartnerLabel: attributionContext.suggestedPartnerLabel,
    confidenceLabel: attributionContext.confidenceLabel,
    receivedAt: params.event.received_at,
    occurredAt: params.event.event_at,
    note: params.queueRow?.notes ?? null,
    signalValues: attributionContext.signalValues,
    availableCodeOptions: availableCodes,
    availablePartnerOptions: availablePartners,
  } satisfies UnattributedItemView;
}

async function loadAttributionReferenceData(organizationId: string) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase || context.workspace.organization?.id !== organizationId) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  const [
    { data: appRows, error: appError },
    { data: partnerRows, error: partnerError },
    { data: promoCodeRows, error: promoCodeError },
  ] = await Promise.all([
    context.supabase
      .from("apps")
      .select("id, name, slug")
      .eq("organization_id", organizationId)
      .returns<AppRow[]>(),
    context.supabase
      .from("partners")
      .select("id, name, status")
      .eq("organization_id", organizationId)
      .returns<PartnerRow[]>(),
    context.supabase
      .from("promo_codes")
      .select("id, app_id, partner_id, code, status")
      .eq("organization_id", organizationId)
      .returns<PromoCodeRow[]>(),
  ]);

  if (appError) {
    throw new ServiceError("internal_error", "Failed to load apps.", {
      status: 500,
      details: { message: appError.message },
    });
  }

  if (partnerError) {
    throw new ServiceError("internal_error", "Failed to load partners.", {
      status: 500,
      details: { message: partnerError.message },
    });
  }

  if (promoCodeError) {
    throw new ServiceError("internal_error", "Failed to load promo codes.", {
      status: 500,
      details: { message: promoCodeError.message },
    });
  }

  return {
    appsById: new Map((appRows ?? []).map((app) => [app.id, app])),
    partnersById: new Map((partnerRows ?? []).map((partner) => [partner.id, partner])),
    promoCodes: promoCodeRows ?? [],
  };
}

export async function listUnattributedItems() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      items: [],
      stats: {
        queueSize: 0,
        inReview: 0,
        unresolved: 0,
      },
      reasonOptions: [],
    } satisfies UnattributedPageData;
  }

  const { appsById, partnersById, promoCodes } = await loadAttributionReferenceData(
    context.workspace.organization.id,
  );
  const [{ data: eventRows, error: eventError }, { data: queueRows, error: queueError }] =
    await Promise.all([
      context.supabase
        .from("normalized_events")
        .select(
          "id, app_id, partner_id, promo_code_id, source_type, source_event_key, event_type, event_status, attribution_status, event_at, received_at, offer_identifier, product_id, reason_code, payload",
        )
        .eq("organization_id", context.workspace.organization.id)
        .in("attribution_status", ["pending", "unattributed"])
        .in("event_status", ["received", "normalized"])
        .order("received_at", { ascending: false })
        .limit(80)
        .returns<NormalizedEventRow[]>(),
      context.supabase
        .from("unattributed_queue")
        .select("id, normalized_event_id, status, reason, notes")
        .eq("organization_id", context.workspace.organization.id)
        .returns<QueueRow[]>(),
    ]);

  if (eventError) {
    throw new Error(eventError.message);
  }

  if (queueError) {
    throw new Error(queueError.message);
  }

  const queueByEventId = new Map(
    (queueRows ?? []).map((queueRow) => [queueRow.normalized_event_id, queueRow]),
  );
  const items = (eventRows ?? []).map((eventRow) =>
    buildQueueItemView({
      event: eventRow,
      queueRow: queueByEventId.get(eventRow.id) ?? null,
      app: eventRow.app_id ? appsById.get(eventRow.app_id) ?? null : null,
      promoCodes,
      allPromoCodes: promoCodes,
      appsById,
      partnersById,
    }),
  );

  return {
    hasWorkspaceAccess: true,
    items,
    stats: {
      queueSize: items.length,
      inReview: items.filter((item) => item.queueStatus === "in_review").length,
      unresolved: items.filter((item) => item.queueStatus !== "resolved").length,
    },
    reasonOptions: Array.from(new Set(items.map((item) => item.reason))),
  } satisfies UnattributedPageData;
}

async function getEventForManualReview(
  eventId: string,
  organizationId: string,
  supabase: NonNullable<Awaited<ReturnType<typeof createServiceContext>>["supabase"]>,
) {
  const { data, error } = await supabase
    .from("normalized_events")
    .select(
      "id, app_id, partner_id, promo_code_id, source_type, source_event_key, event_type, event_status, attribution_status, event_at, received_at, offer_identifier, product_id, reason_code, payload",
    )
    .eq("organization_id", organizationId)
    .eq("id", eventId)
    .single<NormalizedEventRow>();

  if (error) {
    throw new ServiceError("not_found", "Normalized event was not found.", {
      status: 404,
    });
  }

  return data;
}

async function upsertQueueItem(params: {
  organizationId: string;
  normalizedEventId: string;
  membershipId: string | null;
  status: QueueStatus;
  reason: string;
  notes: string | null;
  resolvedAt?: string | null;
  supabase: NonNullable<Awaited<ReturnType<typeof createServiceContext>>["supabase"]>;
}) {
  const { data, error } = await params.supabase
    .from("unattributed_queue")
    .upsert(
      {
        organization_id: params.organizationId,
        normalized_event_id: params.normalizedEventId,
        assigned_membership_id: params.membershipId,
        status: params.status,
        reason: params.reason,
        notes: params.notes,
        resolved_at: params.resolvedAt ?? null,
      },
      {
        onConflict: "normalized_event_id",
      },
    )
    .select("id, normalized_event_id, status, reason, notes")
    .single<QueueRow>();

  if (error) {
    throw new ServiceError(
      "internal_error",
      "Failed to update the unattributed queue item.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  return data;
}

export async function markUnattributedItemInReview(
  eventId: string,
  note?: string | null,
) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase || !context.workspace.organization) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  requireWorkspaceRole(
    context,
    INTERNAL_WORKSPACE_ROLE_KEYS,
    "Only internal workspace members can review unattributed events.",
  );

  const event = await getEventForManualReview(
    eventId,
    context.workspace.organization.id,
    context.supabase,
  );
  const { appsById, partnersById, promoCodes } = await loadAttributionReferenceData(
    context.workspace.organization.id,
  );
  const derived = deriveAttributionContext({
    event,
    queueRow: null,
    app: event.app_id ? appsById.get(event.app_id) ?? null : null,
    promoCodes,
    appsById,
    partnersById,
  });
  const savedQueue = await upsertQueueItem({
    organizationId: context.workspace.organization.id,
    normalizedEventId: event.id,
    membershipId: context.workspace.membership?.id ?? null,
    status: "in_review",
    reason: derived.reason,
    notes: normalizeOptionalText(note),
    supabase: context.supabase,
  });

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "unattributed_queue",
    entityId: savedQueue.id,
    action: "unattributed_queue.review_started",
    summary: `Marked event ${event.id} as in review.`,
    metadata: {
      normalizedEventId: event.id,
    },
  });

  return {
    eventId: event.id,
  };
}

export async function applyManualAttribution(input: {
  eventId: string;
  promoCodeId?: string | null;
  partnerId?: string | null;
  note?: string | null;
}) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase || !context.workspace.organization) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  requireWorkspaceRole(
    context,
    INTERNAL_WORKSPACE_ROLE_KEYS,
    "Only internal workspace members can apply manual attribution.",
  );

  const normalizedNote = normalizeOptionalText(input.note);
  const event = await getEventForManualReview(
    input.eventId,
    context.workspace.organization.id,
    context.supabase,
  );
  const { appsById, partnersById, promoCodes } = await loadAttributionReferenceData(
    context.workspace.organization.id,
  );
  const selectedCode =
    input.promoCodeId && input.promoCodeId !== "none"
      ? promoCodes.find((code) => code.id === input.promoCodeId) ?? null
      : null;
  const selectedPartner =
    input.partnerId && input.partnerId !== "none"
      ? partnersById.get(input.partnerId) ?? null
      : null;

  if (input.promoCodeId && input.promoCodeId !== "none" && !selectedCode) {
    throw new ServiceError("validation_error", "Invalid code selection.", {
      status: 400,
    });
  }

  if (input.partnerId && input.partnerId !== "none" && !selectedPartner) {
    throw new ServiceError("validation_error", "Invalid partner selection.", {
      status: 400,
    });
  }

  if (selectedCode && event.app_id && selectedCode.app_id !== event.app_id) {
    throw new ServiceError(
      "validation_error",
      "Selected code does not belong to this event's app.",
      {
        status: 400,
      },
    );
  }

  const derivedPartner =
    selectedCode?.partner_id
      ? partnersById.get(selectedCode.partner_id) ?? null
      : null;

  if (
    selectedCode?.partner_id &&
    selectedPartner &&
    selectedPartner.id !== selectedCode.partner_id
  ) {
    throw new ServiceError(
      "validation_error",
      "Selected partner does not match the selected code owner.",
      {
        status: 400,
      },
    );
  }

  const finalPartnerId = selectedPartner?.id ?? derivedPartner?.id ?? null;

  if (!finalPartnerId) {
    throw new ServiceError(
      "validation_error",
      "Select a partner or a code that already belongs to a partner.",
      {
        status: 400,
      },
    );
  }

  const derived = deriveAttributionContext({
    event,
    queueRow: null,
    app: event.app_id ? appsById.get(event.app_id) ?? null : null,
    promoCodes,
    appsById,
    partnersById,
  });

  const { data: updatedEvent, error: updatedEventError } = await context.supabase
    .from("normalized_events")
    .update({
      partner_id: finalPartnerId,
      promo_code_id: selectedCode?.id ?? null,
      attribution_status: "attributed",
    })
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", event.id)
    .select("id")
    .single<{ id: string }>();

  if (updatedEventError) {
    throw new ServiceError(
      "internal_error",
      "Failed to update the normalized event attribution.",
      {
        status: 500,
        details: {
          message: updatedEventError.message,
        },
      },
    );
  }

  const savedQueue = await upsertQueueItem({
    organizationId: context.workspace.organization.id,
    normalizedEventId: event.id,
    membershipId: context.workspace.membership?.id ?? null,
    status: "resolved",
    reason: derived.reason,
    notes: normalizedNote,
    resolvedAt: new Date().toISOString(),
    supabase: context.supabase,
  });

  const { error: decisionError } = await context.supabase
    .from("attribution_decisions")
    .insert({
      organization_id: context.workspace.organization.id,
      normalized_event_id: updatedEvent.id,
      partner_id: finalPartnerId,
      promo_code_id: selectedCode?.id ?? null,
      decision_type: "manual_match",
      confidence: 100,
      reason: normalizedNote ?? `Resolved from ${derived.reason}.`,
      decided_by_membership_id: context.workspace.membership?.id ?? null,
    });

  if (decisionError) {
    throw new ServiceError(
      "internal_error",
      "Failed to save the attribution decision.",
      {
        status: 500,
        details: {
          message: decisionError.message,
        },
      },
    );
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "normalized_event",
    entityId: updatedEvent.id,
    action: "normalized_event.manually_attributed",
    summary: `Manually attributed event ${updatedEvent.id}.`,
    metadata: {
      normalizedEventId: updatedEvent.id,
      partnerId: finalPartnerId,
      promoCodeId: selectedCode?.id ?? null,
      queueId: savedQueue.id,
    },
  });

  return {
    eventId: updatedEvent.id,
  };
}
