import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { getAppleVerificationConfigState } from "@/lib/services/apple-verifier";

export type EventOperationalState =
  | "attributed"
  | "unattributed"
  | "ignored"
  | "failed";

export type AppleReadinessCheckStatus = "ready" | "attention" | "blocked";

type NormalizedEventRow = {
  id: string;
  app_id: string | null;
  apple_notification_receipt_id: string | null;
  source_type: string;
  source_event_key: string | null;
  event_type: string;
  event_status: string;
  attribution_status: string;
  event_at: string;
  received_at: string | null;
  environment: string;
  transaction_id: string | null;
  original_transaction_id: string | null;
  web_order_line_item_id: string | null;
  product_id: string | null;
  offer_identifier: string | null;
  currency: string | null;
  amount_minor: number | null;
  reason_code: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  ingest_key: string | null;
  status: string;
};

type ReceiptRow = {
  id: string;
  received_at: string;
  environment: string | null;
  verification_status: string | null;
  processed_status: string | null;
  last_error: string | null;
  notification_type: string | null;
  notification_subtype: string | null;
  request_id: string | null;
};

export type WorkspaceEventView = {
  id: string;
  appName: string;
  appSlug: string | null;
  eventType: string;
  eventStatus: string;
  attributionStatus: string;
  state: EventOperationalState;
  sourceType: string;
  sourceEventKey: string | null;
  environment: string;
  occurredAt: string;
  receivedAt: string | null;
  transactionId: string | null;
  originalTransactionId: string | null;
  webOrderLineItemId: string | null;
  productId: string | null;
  offerIdentifier: string | null;
  currency: string | null;
  amountMinor: number | null;
  reasonCode: string | null;
  appleNotificationReceiptId: string | null;
  payloadSummary: Record<string, unknown>;
};

export type WorkspaceEventsData = {
  events: WorkspaceEventView[];
  stats: Record<Exclude<EventOperationalState, never>, number>;
  hasWorkspaceAccess: boolean;
};

export type AppleReadinessCheck = {
  id: string;
  title: string;
  status: AppleReadinessCheckStatus;
  label: string;
  detail: string;
};

export type AppleWebhookSetupData = {
  appUrl: string | null;
  endpointPath: string | null;
  endpointUrl: string | null;
  requestMethod: "POST";
  requestBodyExample: string;
  hasConfiguredAppUrl: boolean;
  hasVerificationConfig: boolean;
  verificationDetail: string;
};

export type AppleHealthReadinessData = {
  hasWorkspaceAccess: boolean;
  app: AppRow | null;
  latestReceipt: ReceiptRow | null;
  latestEvent: WorkspaceEventView | null;
  overallStatus: AppleReadinessCheckStatus;
  readinessLabel: string;
  readinessTone: "primary" | "success" | "warning";
  readinessDetail: string;
  warningNote: string | null;
  environmentLabel: string;
  readinessChecks: AppleReadinessCheck[];
  webhookSetup: AppleWebhookSetupData;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapOperationalState(row: NormalizedEventRow): EventOperationalState {
  if (row.event_status === "invalid") {
    return "failed";
  }

  if (row.event_status === "ignored" || row.attribution_status === "ignored") {
    return "ignored";
  }

  if (row.attribution_status === "attributed") {
    return "attributed";
  }

  return "unattributed";
}

function buildPayloadSummary(value: Record<string, unknown> | null) {
  if (!value) {
    return {};
  }

  const summary: Record<string, unknown> = {};

  if (typeof value.notificationType === "string") {
    summary.notificationType = value.notificationType;
  }

  if (typeof value.notificationSubtype === "string") {
    summary.notificationSubtype = value.notificationSubtype;
  }

  if (typeof value.verificationStatus === "string") {
    summary.verificationStatus = value.verificationStatus;
  }

  if (
    value.rawClaimsAvailable &&
    typeof value.rawClaimsAvailable === "object" &&
    !Array.isArray(value.rawClaimsAvailable)
  ) {
    summary.rawClaimsAvailable = value.rawClaimsAvailable;
  }

  const additionalKeys = Object.keys(value).filter(
    (key) =>
      key !== "notificationType" &&
      key !== "notificationSubtype" &&
      key !== "verificationStatus" &&
      key !== "rawClaimsAvailable" &&
      key !== "requestId" &&
      key !== "receiptId" &&
      key !== "notificationUuid",
  );

  if (additionalKeys.length > 0) {
    summary.additionalKeys = additionalKeys.sort();
  }

  return summary;
}

function normalizeTextLabel(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();

  return normalized || fallback;
}

function normalizeEnvironmentLabel(value: string | null | undefined) {
  const normalized = normalizeTextLabel(value, "unknown").toLowerCase();

  if (normalized === "sandbox" || normalized === "production") {
    return normalized;
  }

  return "unknown";
}

function getConfiguredAppUrl() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!value) {
    return null;
  }

  return value.replace(/\/+$/, "");
}

function buildWebhookSetup(app: AppRow | null): AppleWebhookSetupData {
  const appUrl = getConfiguredAppUrl();
  const verification = getAppleVerificationConfigState();
  const endpointPath = app?.ingest_key
    ? `/api/v1/apple/notifications/${app.ingest_key}`
    : null;

  return {
    appUrl,
    endpointPath,
    endpointUrl: appUrl && endpointPath ? `${appUrl}${endpointPath}` : null,
    requestMethod: "POST",
    requestBodyExample: '{ "signedPayload": "<Apple signedPayload>" }',
    hasConfiguredAppUrl: Boolean(appUrl),
    hasVerificationConfig: verification.hasRootCertificates,
    verificationDetail: verification.hasRootCertificates
      ? `${verification.rootCertificateCount} Apple root certificate${verification.rootCertificateCount === 1 ? "" : "s"} configured${verification.onlineChecksEnabled ? " with online checks enabled" : ""}.`
      : "Apple root certificates are not configured yet, so signature verification cannot be confirmed.",
  };
}

function overallStatusFromChecks(checks: AppleReadinessCheck[]) {
  if (checks.some((check) => check.status === "blocked")) {
    return "blocked" as const;
  }

  if (checks.some((check) => check.status === "attention")) {
    return "attention" as const;
  }

  return "ready" as const;
}

function toneForReadinessStatus(status: AppleReadinessCheckStatus) {
  return status === "ready" ? "success" : "warning";
}

function buildReadinessChecks(params: {
  app: AppRow;
  latestReceipt: ReceiptRow | null;
  latestEvent: WorkspaceEventView | null;
  webhookSetup: AppleWebhookSetupData;
}) {
  const checks: AppleReadinessCheck[] = [
    {
      id: "app-record",
      title: "App record",
      status: "ready",
      label: "App saved",
      detail: `${params.app.name} exists in the current workspace.`,
    },
    {
      id: "public-app-url",
      title: "Public app URL",
      status: params.webhookSetup.hasConfiguredAppUrl ? "ready" : "blocked",
      label: params.webhookSetup.hasConfiguredAppUrl
        ? "App URL configured"
        : "Missing NEXT_PUBLIC_APP_URL",
      detail: params.webhookSetup.hasConfiguredAppUrl
        ? `Webhook routes will resolve against ${params.webhookSetup.appUrl}.`
        : "Set NEXT_PUBLIC_APP_URL so operators can copy a real webhook endpoint and validate tunnel or deployment routing.",
    },
    {
      id: "ingest-key",
      title: "Ingest key",
      status: params.app.ingest_key ? "ready" : "blocked",
      label: params.app.ingest_key ? "Ingest key assigned" : "Ingest key missing",
      detail: params.app.ingest_key
        ? "Apple can target this app lane through its dedicated notification route."
        : "Save the app with an ingest key before Apple can send signed notifications into this lane.",
    },
    {
      id: "apple-verification-config",
      title: "Apple verification config",
      status: params.webhookSetup.hasVerificationConfig ? "ready" : "attention",
      label: params.webhookSetup.hasVerificationConfig
        ? "Verification configured"
        : "Verification config incomplete",
      detail: params.webhookSetup.verificationDetail,
    },
    {
      id: "latest-receipt",
      title: "Latest receipt stored",
      status: params.latestReceipt ? "ready" : "attention",
      label: params.latestReceipt ? "Receipt stored" : "No receipt yet",
      detail: params.latestReceipt
        ? `The latest Apple receipt was stored at ${formatOperationalTimestamp(params.latestReceipt.received_at)}.`
        : "No Apple notification receipt has been stored for this app yet.",
    },
    {
      id: "latest-receipt-verified",
      title: "Latest receipt verified",
      status: !params.latestReceipt
        ? "attention"
        : params.latestReceipt.verification_status === "verified"
          ? "ready"
          : "attention",
      label: !params.latestReceipt
        ? "Awaiting receipt"
        : params.latestReceipt.verification_status === "verified"
          ? "Verified"
          : params.latestReceipt.verification_status === "failed"
            ? "Verification failed"
            : "Verification pending",
      detail: !params.latestReceipt
        ? "A verification result appears here after the first Apple notification is stored."
        : params.latestReceipt.verification_status === "verified"
          ? "The latest stored receipt passed Apple signature verification."
          : params.latestReceipt.last_error ??
            "The latest stored receipt has not completed verification successfully.",
    },
    {
      id: "latest-event-normalized",
      title: "Latest event normalized",
      status: params.latestEvent && params.latestEvent.eventStatus !== "invalid"
        ? "ready"
        : "attention",
      label: params.latestEvent
        ? params.latestEvent.eventStatus === "invalid"
          ? "Normalization failed"
          : "Normalized event visible"
        : "No normalized event yet",
      detail: params.latestEvent
        ? params.latestEvent.eventStatus === "invalid"
          ? params.latestEvent.reasonCode ?? "The latest receipt did not normalize into a usable event row."
          : `The latest event is ${params.latestEvent.eventType} with ${params.latestEvent.attributionStatus} attribution state.`
        : params.latestReceipt?.processed_status === "failed"
          ? params.latestReceipt.last_error ??
            "The latest receipt was stored, but normalization did not complete."
          : "A normalized event will appear here after receipt processing completes.",
    },
  ];

  return checks;
}

function buildReadinessSummary(params: {
  overallStatus: AppleReadinessCheckStatus;
  latestReceipt: ReceiptRow | null;
  latestEvent: WorkspaceEventView | null;
  webhookSetup: AppleWebhookSetupData;
}) {
  if (params.overallStatus === "ready") {
    return {
      label: "Ready for Apple intake",
      detail:
        "Webhook configuration, receipt verification, and normalized event visibility are all present for this app.",
    };
  }

  if (!params.webhookSetup.hasConfiguredAppUrl) {
    return {
      label: "Setup needs configuration",
      detail:
        "Set NEXT_PUBLIC_APP_URL before treating the webhook endpoint as copyable or demo-ready.",
    };
  }

  if (!params.latestReceipt) {
    return {
      label: "Waiting for first Apple receipt",
      detail:
        "The endpoint can be configured before traffic arrives, but this app is not demo-ready until the first receipt is stored.",
    };
  }

  if (params.latestReceipt.verification_status !== "verified") {
    return {
      label: "Receipt received and verification needs attention",
      detail:
        "The latest receipt is stored, but verification has not completed successfully, so setup should not be treated as ready.",
    };
  }

  if (!params.latestEvent || params.latestEvent.eventStatus === "invalid") {
    return {
      label: "Receipt received and normalization needs attention",
      detail:
        "Receipt intake is active, but normalized event visibility is still incomplete for the latest signal.",
    };
  }

  return {
    label: "Receipt intake needs attention",
    detail:
      "Apple setup is partly connected, but one or more readiness checks still need operator follow-up.",
  };
}

function toWorkspaceEventView(
  row: NormalizedEventRow,
  appsById: Map<string, AppRow>,
): WorkspaceEventView {
  const app = row.app_id ? appsById.get(row.app_id) ?? null : null;

  return {
    id: row.id,
    appName: app?.name ?? "Unknown app",
    appSlug: app?.slug ?? null,
    eventType: row.event_type,
    eventStatus: row.event_status,
    attributionStatus: row.attribution_status,
    state: mapOperationalState(row),
    sourceType: row.source_type,
    sourceEventKey: row.source_event_key,
    environment: row.environment,
    occurredAt: row.event_at,
    receivedAt: row.received_at,
    transactionId: row.transaction_id,
    originalTransactionId: row.original_transaction_id,
    webOrderLineItemId: row.web_order_line_item_id,
    productId: row.product_id,
    offerIdentifier: row.offer_identifier,
    currency: row.currency,
    amountMinor: row.amount_minor,
    reasonCode: row.reason_code,
    appleNotificationReceiptId: row.apple_notification_receipt_id,
    payloadSummary: buildPayloadSummary(row.payload),
  };
}

export function formatOperationalTimestamp(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

async function resolveAppleHealthApp(
  context: Awaited<ReturnType<typeof createServiceContext>>,
  appIdentifier: string,
) {
  const normalizedIdentifier = appIdentifier.trim();

  if (!normalizedIdentifier) {
    return null;
  }

  if (UUID_PATTERN.test(normalizedIdentifier)) {
    const { data: appById, error: appByIdError } = await context.supabase!
      .from("apps")
      .select("id, slug, name, ingest_key, status")
      .eq("organization_id", context.workspace.organization!.id)
      .eq("id", normalizedIdentifier)
      .maybeSingle<AppRow>();

    if (appByIdError) {
      throw new Error(appByIdError.message);
    }

    if (appById) {
      return appById;
    }
  }

  const { data: appBySlug, error: appBySlugError } = await context.supabase!
    .from("apps")
    .select("id, slug, name, ingest_key, status")
    .eq("organization_id", context.workspace.organization!.id)
    .eq("slug", normalizedIdentifier)
    .maybeSingle<AppRow>();

  if (appBySlugError) {
    throw new Error(appBySlugError.message);
  }

  return appBySlug;
}

export async function listWorkspaceNormalizedEvents() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      events: [],
      stats: {
        attributed: 0,
        unattributed: 0,
        ignored: 0,
        failed: 0,
      },
      hasWorkspaceAccess: false,
    } satisfies WorkspaceEventsData;
  }

  const { data: eventRows, error: eventError } = await context.supabase
    .from("normalized_events")
    .select(
      "id, app_id, apple_notification_receipt_id, source_type, source_event_key, event_type, event_status, attribution_status, event_at, received_at, environment, transaction_id, original_transaction_id, web_order_line_item_id, product_id, offer_identifier, currency, amount_minor, reason_code, payload, created_at",
    )
    .eq("organization_id", context.workspace.organization.id)
    .order("received_at", { ascending: false })
    .limit(80)
    .returns<NormalizedEventRow[]>();

  if (eventError) {
    throw new Error(eventError.message);
  }

  const appIds = Array.from(
    new Set(
      (eventRows ?? [])
        .map((eventRow) => eventRow.app_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  let appsById = new Map<string, AppRow>();

  if (appIds.length > 0) {
    const { data: appRows, error: appError } = await context.supabase
      .from("apps")
      .select("id, slug, name, ingest_key, status")
      .in("id", appIds)
      .returns<AppRow[]>();

    if (appError) {
      throw new Error(appError.message);
    }

    appsById = new Map((appRows ?? []).map((app) => [app.id, app]));
  }

  const events = (eventRows ?? []).map((row) => toWorkspaceEventView(row, appsById));
  const stats = {
    attributed: events.filter((event) => event.state === "attributed").length,
    unattributed: events.filter((event) => event.state === "unattributed").length,
    ignored: events.filter((event) => event.state === "ignored").length,
    failed: events.filter((event) => event.state === "failed").length,
  };

  return {
    events,
    stats,
    hasWorkspaceAccess: true,
  } satisfies WorkspaceEventsData;
}

export async function getAppleHealthReadinessData(appIdentifier: string) {
  const context = await createServiceContext();
  const emptyWebhookSetup = buildWebhookSetup(null);

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      app: null,
      latestReceipt: null,
      latestEvent: null,
      overallStatus: "blocked",
      readinessLabel: "Workspace access required",
      readinessTone: "warning",
      readinessDetail:
        "Sign in to a workspace to review app-scoped Apple receipt readiness.",
      warningNote: null,
      environmentLabel: "Unknown",
      readinessChecks: [],
      webhookSetup: emptyWebhookSetup,
    } satisfies AppleHealthReadinessData;
  }

  const app = await resolveAppleHealthApp(context, appIdentifier);

  if (!app) {
    return {
      hasWorkspaceAccess: true,
      app: null,
      latestReceipt: null,
      latestEvent: null,
      overallStatus: "blocked",
      readinessLabel: "App record not found",
      readinessTone: "warning",
      readinessDetail:
        "No app row matched this workspace path yet, so receipt readiness cannot be evaluated.",
      warningNote: "Create the app row and assign an ingest key before Apple can post receipts here.",
      environmentLabel: "Unknown",
      readinessChecks: [],
      webhookSetup: emptyWebhookSetup,
    } satisfies AppleHealthReadinessData;
  }

  const webhookSetup = buildWebhookSetup(app);

  const [latestReceiptResult, latestEventResult] = await Promise.all([
    context.supabase
      .from("apple_notification_receipts")
      .select(
        "id, received_at, environment, verification_status, processed_status, last_error, notification_type, notification_subtype, request_id",
      )
      .eq("app_id", app.id)
      .order("received_at", { ascending: false })
      .limit(1)
      .maybeSingle<ReceiptRow>(),
    context.supabase
      .from("normalized_events")
      .select(
        "id, app_id, apple_notification_receipt_id, source_type, source_event_key, event_type, event_status, attribution_status, event_at, received_at, environment, transaction_id, original_transaction_id, web_order_line_item_id, product_id, offer_identifier, currency, amount_minor, reason_code, payload, created_at",
      )
      .eq("app_id", app.id)
      .order("received_at", { ascending: false })
      .limit(1)
      .maybeSingle<NormalizedEventRow>(),
  ]);

  if (latestReceiptResult.error) {
    throw new Error(latestReceiptResult.error.message);
  }

  if (latestEventResult.error) {
    throw new Error(latestEventResult.error.message);
  }

  const appsById = new Map([[app.id, app]]);
  const latestEvent = latestEventResult.data
    ? toWorkspaceEventView(latestEventResult.data, appsById)
    : null;
  const latestReceipt = latestReceiptResult.data ?? null;
  const environmentLabel = normalizeEnvironmentLabel(
    latestEvent?.environment ?? latestReceipt?.environment,
  );
  const readinessChecks = buildReadinessChecks({
    app,
    latestReceipt,
    latestEvent,
    webhookSetup,
  });
  const overallStatus = overallStatusFromChecks(readinessChecks);
  const readinessSummary = buildReadinessSummary({
    overallStatus,
    latestReceipt,
    latestEvent,
    webhookSetup,
  });
  const warningNote =
    latestReceipt?.last_error ??
    (!webhookSetup.hasVerificationConfig
      ? webhookSetup.verificationDetail
      : latestReceipt?.verification_status === "failed"
        ? "The latest receipt failed Apple signature verification or payload decoding."
        : latestReceipt?.processed_status === "failed"
          ? "The latest receipt was stored, but normalization did not complete successfully."
          : latestEvent?.eventStatus === "invalid"
            ? latestEvent.reasonCode ?? "The latest normalized event is invalid."
            : null);

  return {
    hasWorkspaceAccess: true,
    app,
    latestReceipt,
    latestEvent,
    overallStatus,
    readinessLabel: readinessSummary.label,
    readinessTone: toneForReadinessStatus(overallStatus),
    readinessDetail: readinessSummary.detail,
    warningNote,
    environmentLabel: environmentLabel === "unknown" ? "Unknown" : environmentLabel,
    readinessChecks,
    webhookSetup,
  } satisfies AppleHealthReadinessData;
}
