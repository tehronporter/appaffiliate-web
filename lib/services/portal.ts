import "server-only";

import { createServiceContext } from "@/lib/services/context";

type PortalSupabase = NonNullable<
  Awaited<ReturnType<typeof createServiceContext>>["supabase"]
>;

type PartnerRow = {
  id: string;
  name: string;
  status: string;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
};

type PromoCodeRow = {
  id: string;
  app_id: string;
  code: string;
  status: string;
  code_type: string;
  created_at: string;
};

type EventRow = {
  id: string;
  app_id: string | null;
  promo_code_id: string | null;
  event_type: string;
  event_status: string;
  event_at: string;
  received_at: string | null;
  currency: string | null;
  gross_amount: number | string | null;
};

type LedgerRow = {
  id: string;
  normalized_event_id: string | null;
  promo_code_id: string | null;
  status: string;
  currency: string;
  amount: number | string;
  effective_at: string;
  created_at: string;
  updated_at: string;
};

type PayoutBatchRow = {
  id: string;
  name: string;
  status: string;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  external_reference: string | null;
  created_at: string;
};

type PayoutBatchItemRow = {
  id: string;
  payout_batch_id: string;
  commission_ledger_entry_id: string;
  amount: number | string;
  status: string;
  created_at: string;
};

export type PortalViewerState = {
  isAuthenticated: boolean;
  hasPortalRole: boolean;
  hasOrganization: boolean;
  hasPartnerProfile: boolean;
  isLinkedToPartner: boolean;
  organizationName: string | null;
  roleLabel: string | null;
  displayName: string | null;
  partnerName: string | null;
  partnerStatus: string | null;
};

export type PortalPerformanceState =
  | "under_review"
  | "approved"
  | "included_in_payout"
  | "paid"
  | "not_approved";

export type PortalCodeView = {
  id: string;
  code: string;
  status: string;
  codeType: string;
  appName: string;
  createdAt: string;
  attributedEventsCount: number;
  approvedCount: number;
  paidCount: number;
};

export type PortalPerformanceItem = {
  id: string;
  appName: string;
  codeLabel: string | null;
  eventTypeLabel: string;
  occurredAt: string;
  status: PortalPerformanceState;
  statusLabel: string;
  currency: string | null;
  commissionAmount: number | null;
  commissionAmountLabel: string;
  payoutBatchName: string | null;
  payoutBatchStatusLabel: string | null;
};

export type PortalPayoutView = {
  id: string;
  name: string;
  status: string;
  statusLabel: string;
  periodLabel: string;
  amount: number;
  amountLabel: string;
  externalReference: string | null;
  entryCount: number;
  createdAt: string;
};

export type PortalSummaryStats = {
  activeCodes: number;
  attributedEvents: number;
  pendingReviewCount: number;
  approvedCount: number;
  approvedValueLabel: string;
  includedInPayoutCount: number;
  includedInPayoutValueLabel: string;
  paidCount: number;
  paidValueLabel: string;
};

type PortalReadModel = {
  viewer: PortalViewerState;
  codes: PortalCodeView[];
  performance: PortalPerformanceItem[];
  payouts: PortalPayoutView[];
  stats: PortalSummaryStats;
};

function createEmptyViewer(
  context: Awaited<ReturnType<typeof createServiceContext>>,
): PortalViewerState {
  return {
    isAuthenticated: Boolean(context.user),
    hasPortalRole: context.workspace.role?.key === "partner_user",
    hasOrganization: Boolean(context.workspace.organization),
    hasPartnerProfile: Boolean(context.workspace.partnerUser),
    isLinkedToPartner: Boolean(context.workspace.partnerUser?.partner_id),
    organizationName: context.workspace.organization?.name ?? null,
    roleLabel: context.workspace.role?.name ?? null,
    displayName: context.workspace.partnerUser?.display_name ?? null,
    partnerName: context.workspace.partnerUser?.partner_name ?? null,
    partnerStatus: null,
  };
}

function titleCaseLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatCurrency(amount: number | null, currency: string | null | undefined) {
  if (amount === null) {
    return "Under review";
  }

  const normalizedCurrency = currency?.trim().toUpperCase() || "USD";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${normalizedCurrency} ${amount.toFixed(2)}`;
  }
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildPeriodLabel(batch: PayoutBatchRow) {
  if (batch.period_start && batch.period_end) {
    return `${formatDateLabel(batch.period_start)} - ${formatDateLabel(batch.period_end)}`;
  }

  if (batch.period_start) {
    return `From ${formatDateLabel(batch.period_start)}`;
  }

  if (batch.period_end) {
    return `Until ${formatDateLabel(batch.period_end)}`;
  }

  return "No period set";
}

function derivePerformanceState(params: {
  ledgerEntry: LedgerRow | null;
  batchItem: PayoutBatchItemRow | null;
  batch: PayoutBatchRow | null;
}): PortalPerformanceState {
  if (
    params.ledgerEntry?.status === "paid" ||
    params.batchItem?.status === "paid" ||
    params.batch?.status === "paid"
  ) {
    return "paid";
  }

  if (
    params.ledgerEntry?.status === "void" ||
    params.ledgerEntry?.status === "reversed"
  ) {
    return "not_approved";
  }

  if (
    params.batchItem &&
    params.batch &&
    params.batch.status !== "cancelled" &&
    params.batchItem.status !== "cancelled"
  ) {
    return "included_in_payout";
  }

  if (params.ledgerEntry?.status === "approved") {
    return "approved";
  }

  return "under_review";
}

function performanceStatusLabel(status: PortalPerformanceState) {
  if (status === "under_review") {
    return "Still under review";
  }

  if (status === "included_in_payout") {
    return "In payout batch";
  }

  if (status === "not_approved") {
    return "Not approved";
  }

  return titleCaseLabel(status);
}

async function loadPartnerScopedRows(params: {
  supabase: PortalSupabase;
  organizationId: string;
  partnerId: string;
}) {
  const [
    { data: partnerRows, error: partnerError },
    { data: codeRows, error: codeError },
    { data: eventRows, error: eventError },
    { data: ledgerRows, error: ledgerError },
    { data: batchItemRows, error: batchItemError },
  ] = await Promise.all([
    params.supabase
      .from("partners")
      .select("id, name, status")
      .eq("organization_id", params.organizationId)
      .eq("id", params.partnerId)
      .returns<PartnerRow[]>(),
    params.supabase
      .from("promo_codes")
      .select("id, app_id, code, status, code_type, created_at")
      .eq("organization_id", params.organizationId)
      .eq("partner_id", params.partnerId)
      .order("created_at", { ascending: false })
      .returns<PromoCodeRow[]>(),
    params.supabase
      .from("normalized_events")
      .select(
        "id, app_id, promo_code_id, event_type, event_status, event_at, received_at, currency, gross_amount",
      )
      .eq("organization_id", params.organizationId)
      .eq("partner_id", params.partnerId)
      .eq("attribution_status", "attributed")
      .order("event_at", { ascending: false })
      .returns<EventRow[]>(),
    params.supabase
      .from("commission_ledger_entries")
      .select(
        "id, normalized_event_id, promo_code_id, status, currency, amount, effective_at, created_at, updated_at",
      )
      .eq("organization_id", params.organizationId)
      .eq("partner_id", params.partnerId)
      .order("updated_at", { ascending: false })
      .returns<LedgerRow[]>(),
    params.supabase
      .from("payout_batch_items")
      .select("id, payout_batch_id, commission_ledger_entry_id, amount, status, created_at")
      .eq("organization_id", params.organizationId)
      .eq("partner_id", params.partnerId)
      .order("created_at", { ascending: false })
      .returns<PayoutBatchItemRow[]>(),
  ]);

  const firstError =
    partnerError ?? codeError ?? eventError ?? ledgerError ?? batchItemError;

  if (firstError) {
    throw new Error(firstError.message);
  }

  const batchIds = Array.from(
    new Set((batchItemRows ?? []).map((row) => row.payout_batch_id)),
  );
  const appIds = Array.from(
    new Set(
      [...(codeRows ?? []).map((row) => row.app_id), ...(eventRows ?? []).map((row) => row.app_id)]
        .filter((value): value is string => Boolean(value)),
    ),
  );

  const [{ data: batchRows, error: batchError }, { data: appRows, error: appError }] =
    await Promise.all([
      batchIds.length > 0
        ? params.supabase
            .from("payout_batches")
            .select(
              "id, name, status, currency, period_start, period_end, external_reference, created_at",
            )
            .in("id", batchIds)
            .order("created_at", { ascending: false })
            .returns<PayoutBatchRow[]>()
        : Promise.resolve({ data: [] as PayoutBatchRow[], error: null }),
      appIds.length > 0
        ? params.supabase
            .from("apps")
            .select("id, slug, name")
            .in("id", appIds)
            .returns<AppRow[]>()
        : Promise.resolve({ data: [] as AppRow[], error: null }),
    ]);

  if (batchError) {
    throw new Error(batchError.message);
  }

  if (appError) {
    throw new Error(appError.message);
  }

  return {
    partner: partnerRows?.[0] ?? null,
    codes: codeRows ?? [],
    events: eventRows ?? [],
    ledgerEntries: ledgerRows ?? [],
    batchItems: batchItemRows ?? [],
    batches: batchRows ?? [],
    apps: appRows ?? [],
  };
}

function formatAmountSummary(items: PortalPerformanceItem[], state: PortalPerformanceState) {
  const matchingItems = items.filter(
    (item) => item.status === state && item.commissionAmount !== null,
  );

  if (matchingItems.length === 0) {
    return formatCurrency(0, "USD");
  }

  const currencies = Array.from(
    new Set(matchingItems.map((item) => item.currency).filter(Boolean)),
  );

  if (currencies.length !== 1) {
    return "Mixed currencies";
  }

  const total =
    Math.round(
      matchingItems.reduce((sum, item) => sum + (item.commissionAmount ?? 0), 0) * 100,
    ) / 100;

  return formatCurrency(total, currencies[0]);
}

function buildPortalStats(items: PortalPerformanceItem[]) {
  const pendingReviewCount = items.filter((item) => item.status === "under_review").length;
  const approvedCount = items.filter((item) => item.status === "approved").length;
  const includedInPayoutCount = items.filter(
    (item) => item.status === "included_in_payout",
  ).length;
  const paidCount = items.filter((item) => item.status === "paid").length;

  return {
    pendingReviewCount,
    approvedCount,
    approvedValueLabel: formatAmountSummary(items, "approved"),
    includedInPayoutCount,
    includedInPayoutValueLabel: formatAmountSummary(items, "included_in_payout"),
    paidCount,
    paidValueLabel: formatAmountSummary(items, "paid"),
  };
}

async function buildPortalReadModel(): Promise<PortalReadModel> {
  const context = await createServiceContext();
  const viewer = createEmptyViewer(context);

  if (
    !context.user ||
    !context.supabase ||
    !context.workspace.organization ||
    context.workspace.role?.key !== "partner_user" ||
    !context.workspace.partnerUser
  ) {
    return {
      viewer,
      codes: [],
      performance: [],
      payouts: [],
      stats: {
        activeCodes: 0,
        attributedEvents: 0,
        pendingReviewCount: 0,
        approvedCount: 0,
        approvedValueLabel: formatCurrency(0, "USD"),
        includedInPayoutCount: 0,
        includedInPayoutValueLabel: formatCurrency(0, "USD"),
        paidCount: 0,
        paidValueLabel: formatCurrency(0, "USD"),
      },
    };
  }

  const partnerId = context.workspace.partnerUser.partner_id;

  if (!partnerId) {
    return {
      viewer,
      codes: [],
      performance: [],
      payouts: [],
      stats: {
        activeCodes: 0,
        attributedEvents: 0,
        pendingReviewCount: 0,
        approvedCount: 0,
        approvedValueLabel: formatCurrency(0, "USD"),
        includedInPayoutCount: 0,
        includedInPayoutValueLabel: formatCurrency(0, "USD"),
        paidCount: 0,
        paidValueLabel: formatCurrency(0, "USD"),
      },
    };
  }

  const rows = await loadPartnerScopedRows({
    supabase: context.supabase,
    organizationId: context.workspace.organization.id,
    partnerId,
  });

  const appsById = new Map(rows.apps.map((row) => [row.id, row]));
  const codesById = new Map(rows.codes.map((row) => [row.id, row]));
  const batchesById = new Map(rows.batches.map((row) => [row.id, row]));
  const ledgerByEventId = new Map<string, LedgerRow>();
  const batchItemByLedgerId = new Map<string, PayoutBatchItemRow>();

  for (const ledgerEntry of rows.ledgerEntries) {
    if (
      ledgerEntry.normalized_event_id &&
      !ledgerByEventId.has(ledgerEntry.normalized_event_id)
    ) {
      ledgerByEventId.set(ledgerEntry.normalized_event_id, ledgerEntry);
    }
  }

  for (const batchItem of rows.batchItems) {
    if (!batchItemByLedgerId.has(batchItem.commission_ledger_entry_id)) {
      batchItemByLedgerId.set(batchItem.commission_ledger_entry_id, batchItem);
    }
  }

  const performance = rows.events.map((event) => {
    const ledgerEntry = ledgerByEventId.get(event.id) ?? null;
    const batchItem = ledgerEntry
      ? batchItemByLedgerId.get(ledgerEntry.id) ?? null
      : null;
    const batch = batchItem ? batchesById.get(batchItem.payout_batch_id) ?? null : null;
    const status = derivePerformanceState({ ledgerEntry, batchItem, batch });
    const app = event.app_id ? appsById.get(event.app_id) ?? null : null;
    const code = event.promo_code_id ? codesById.get(event.promo_code_id) ?? null : null;
    const amount = ledgerEntry ? toNumber(ledgerEntry.amount) : null;

    return {
      id: event.id,
      appName: app?.name ?? "Unknown app",
      codeLabel: code?.code ?? null,
      eventTypeLabel: titleCaseLabel(event.event_type),
      occurredAt: event.event_at,
      status,
      statusLabel: performanceStatusLabel(status),
      currency: ledgerEntry?.currency ?? event.currency ?? "USD",
      commissionAmount: amount,
      commissionAmountLabel:
        status === "under_review" && amount === null
          ? "Under review"
          : formatCurrency(amount, ledgerEntry?.currency ?? event.currency ?? "USD"),
      payoutBatchName: batch?.name ?? null,
      payoutBatchStatusLabel: batch ? titleCaseLabel(batch.status) : null,
    } satisfies PortalPerformanceItem;
  });

  const performanceByCodeId = new Map<string, PortalPerformanceItem[]>();

  for (const item of performance) {
    const code = rows.events.find((event) => event.id === item.id)?.promo_code_id;

    if (!code) {
      continue;
    }

    const existing = performanceByCodeId.get(code) ?? [];
    existing.push(item);
    performanceByCodeId.set(code, existing);
  }

  const codes = rows.codes.map((code) => {
    const codeItems = performanceByCodeId.get(code.id) ?? [];
    const app = appsById.get(code.app_id);

    return {
      id: code.id,
      code: code.code,
      status: titleCaseLabel(code.status),
      codeType: titleCaseLabel(code.code_type),
      appName: app?.name ?? "Unknown app",
      createdAt: code.created_at,
      attributedEventsCount: codeItems.length,
      approvedCount: codeItems.filter((item) => item.status === "approved").length,
      paidCount: codeItems.filter((item) => item.status === "paid").length,
    } satisfies PortalCodeView;
  });

  const payoutItemsByBatchId = new Map<string, PayoutBatchItemRow[]>();

  for (const batchItem of rows.batchItems) {
    const existing = payoutItemsByBatchId.get(batchItem.payout_batch_id) ?? [];
    existing.push(batchItem);
    payoutItemsByBatchId.set(batchItem.payout_batch_id, existing);
  }

  const payouts = rows.batches.map((batch) => {
    const items = payoutItemsByBatchId.get(batch.id) ?? [];
    const amount = Math.round(
      items.reduce((sum, item) => sum + (toNumber(item.amount) ?? 0), 0) * 100,
    ) / 100;

    return {
      id: batch.id,
      name: batch.name,
      status: batch.status,
      statusLabel:
        batch.status === "exported"
          ? "Awaiting payout"
          : titleCaseLabel(batch.status),
      periodLabel: buildPeriodLabel(batch),
      amount,
      amountLabel: formatCurrency(amount, batch.currency),
      externalReference: batch.external_reference,
      entryCount: items.length,
      createdAt: batch.created_at,
    } satisfies PortalPayoutView;
  });

  const partnerName = rows.partner?.name ?? viewer.partnerName;
  const stats = buildPortalStats(performance);

  return {
    viewer: {
      ...viewer,
      partnerName,
      partnerStatus: rows.partner?.status ? titleCaseLabel(rows.partner.status) : null,
    },
    codes,
    performance,
    payouts,
    stats: {
      activeCodes: codes.filter((code) => code.status === "Active").length,
      attributedEvents: performance.length,
      pendingReviewCount: stats.pendingReviewCount,
      approvedCount: stats.approvedCount,
      approvedValueLabel: stats.approvedValueLabel,
      includedInPayoutCount: stats.includedInPayoutCount,
      includedInPayoutValueLabel: stats.includedInPayoutValueLabel,
      paidCount: stats.paidCount,
      paidValueLabel: stats.paidValueLabel,
    },
  };
}

export async function getPortalViewerState() {
  const readModel = await buildPortalReadModel();
  return readModel.viewer;
}

export async function getPortalHomeData() {
  const readModel = await buildPortalReadModel();

  return {
    viewer: readModel.viewer,
    stats: readModel.stats,
    recentCodes: readModel.codes.slice(0, 5),
    recentPerformance: readModel.performance.slice(0, 5),
    recentPayouts: readModel.payouts.slice(0, 5),
  };
}

export async function listPortalCodes() {
  const readModel = await buildPortalReadModel();

  return {
    viewer: readModel.viewer,
    codes: readModel.codes,
    stats: readModel.stats,
  };
}

export async function listPortalPerformance() {
  const readModel = await buildPortalReadModel();

  return {
    viewer: readModel.viewer,
    items: readModel.performance,
    stats: readModel.stats,
  };
}

export async function listPortalPayouts() {
  const readModel = await buildPortalReadModel();

  return {
    viewer: readModel.viewer,
    payouts: readModel.payouts,
    stats: readModel.stats,
  };
}
