import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import { writeAuditLog } from "@/lib/services/audit";

type FinanceSupabase = NonNullable<
  Awaited<ReturnType<typeof createServiceContext>>["supabase"]
>;

type FinanceRoleKey = "owner" | "admin" | "finance";
type CommissionRuleType = "revenue_share" | "flat_fee" | "cpa" | "hybrid";
type LedgerStatus = "pending" | "approved" | "held" | "paid" | "reversed" | "void";
type PayoutBatchStatus =
  | "draft"
  | "reviewing"
  | "approved"
  | "exported"
  | "paid"
  | "cancelled";
type PayoutBatchItemStatus =
  | "pending"
  | "exported"
  | "paid"
  | "failed"
  | "cancelled";

type NormalizedEventRow = {
  id: string;
  app_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  event_type: string;
  event_status: string;
  attribution_status: string;
  event_at: string;
  received_at: string | null;
  currency: string | null;
  gross_amount: number | string | null;
  net_amount: number | string | null;
  amount_minor: number | null;
  product_id: string | null;
  environment: string;
  source_type: string;
  source_event_key: string | null;
  payload: Record<string, unknown> | null;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  apple_fee_mode: "standard_30" | "small_business_15" | "custom";
  apple_fee_bps: number | null;
};

type PartnerRow = {
  id: string;
  name: string;
  status: string;
};

type PromoCodeRow = {
  id: string;
  code: string;
};

type AttributionDecisionRow = {
  id: string;
  normalized_event_id: string;
  decision_type: string;
  reason: string | null;
  created_at: string;
};

type CommissionRuleRow = {
  id: string;
  name: string;
  app_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  rule_type: CommissionRuleType;
  status: string;
  currency: string;
  rate: number | string | null;
  flat_amount: number | string | null;
  priority: number;
  basis_mode: "gross_revenue" | "net_revenue";
  starts_at: string | null;
  ends_at: string | null;
};

type CommissionLedgerEntryRow = {
  id: string;
  chain_id: string;
  normalized_event_id: string | null;
  commission_rule_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  entry_type: string;
  status: LedgerStatus;
  transition_type:
    | "approved"
    | "rejected"
    | "reserved"
    | "released"
    | "paid"
    | "reversed";
  currency: string;
  amount: number | string;
  effective_at: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  related_entry_id: string | null;
  payout_batch_id: string | null;
  actor_membership_id: string | null;
  created_at: string;
  updated_at: string;
};

type PayoutBatchRow = {
  id: string;
  name: string;
  status: PayoutBatchStatus;
  currency: string;
  period_start: string | null;
  period_end: string | null;
  external_reference: string | null;
  approved_by_membership_id: string | null;
  approved_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PayoutBatchItemRow = {
  id: string;
  payout_batch_id: string;
  commission_ledger_entry_id: string;
  commission_chain_id: string | null;
  partner_id: string | null;
  amount: number | string;
  status: PayoutBatchItemStatus;
  created_at: string;
  updated_at: string;
};

type FinanceContext = {
  context: Awaited<ReturnType<typeof createServiceContext>>;
  supabase: FinanceSupabase;
  organizationId: string;
  membershipId: string | null;
};

type RuleMatch = {
  rule: CommissionRuleRow | null;
  suggestedAmount: number | null;
  suggestedCurrency: string;
  basisAmount: number | null;
  basisCurrency: string;
  basisLabel: string;
  ruleSummary: string;
  basisMode: "gross_revenue" | "net_revenue";
  basisSource: string;
  appleFeeMode: AppRow["apple_fee_mode"] | null;
  appleFeeBps: number | null;
};

type FinanceReadModel = {
  hasFinanceAccess: boolean;
  commissionItems: CommissionItemView[];
  readyGroups: PayoutReadyGroupView[];
  batches: PayoutBatchView[];
};

export type CommissionReviewState =
  | "pending_review"
  | "approved"
  | "rejected"
  | "payout_ready"
  | "paid";

export type CommissionItemView = {
  id: string;
  eventId: string;
  ledgerEntryId: string | null;
  ledgerChainId: string | null;
  batchId: string | null;
  batchItemId: string | null;
  partnerId: string | null;
  appName: string;
  appSlug: string | null;
  partnerName: string;
  codeLabel: string | null;
  eventType: string;
  eventStatus: string;
  environment: string;
  sourceLabel: string;
  occurredAt: string;
  receivedAt: string | null;
  reviewState: CommissionReviewState;
  reviewStateLabel: string;
  basisAmountLabel: string;
  commissionAmountLabel: string;
  currency: string;
  commissionAmount: number | null;
  basisAmount: number | null;
  ruleSummary: string;
  latestDecisionLabel: string | null;
  note: string | null;
  payoutBatchName: string | null;
  payoutBatchStatus: string | null;
  canApprove: boolean;
  canReject: boolean;
  canPreparePayout: boolean;
  suggestedAmount: number | null;
};

export type CommissionsPageData = {
  hasFinanceAccess: boolean;
  items: CommissionItemView[];
  stats: {
    pendingReview: number;
    approved: number;
    rejected: number;
    payoutReady: number;
    paid: number;
  };
};

export type PayoutReadyGroupView = {
  id: string;
  partnerId: string | null;
  partnerName: string;
  entryCount: number;
  totalAmount: number;
  totalAmountLabel: string;
  currency: string;
  appNames: string[];
  commissionEntryIds: string[];
  commissionChainIds: string[];
  latestEffectiveAt: string | null;
};

export type PayoutBatchItemView = {
  id: string;
  ledgerEntryId: string;
  chainId: string | null;
  partnerName: string;
  appName: string;
  codeLabel: string | null;
  amountLabel: string;
  status: PayoutBatchItemStatus;
  commissionEventId: string | null;
  eventType: string | null;
};

export type PayoutBatchView = {
  id: string;
  name: string;
  status: PayoutBatchStatus;
  statusLabel: string;
  currency: string;
  totalAmount: number;
  totalAmountLabel: string;
  entryCount: number;
  partnerCount: number;
  partnerNames: string[];
  windowLabel: string;
  exportStatusLabel: string;
  paymentStatusLabel: string;
  externalReference: string | null;
  note: string | null;
  items: PayoutBatchItemView[];
  createdAt: string;
  approvedAt: string | null;
  updatedAt: string;
};

export type PayoutsPageData = {
  hasFinanceAccess: boolean;
  readyGroups: PayoutReadyGroupView[];
  batches: PayoutBatchView[];
  stats: {
    readyGroups: number;
    readyEntries: number;
    draftBatches: number;
    exportedBatches: number;
    paidBatches: number;
  };
};

export type FinanceExportScope = "commission-register" | "payout-tracking";

export type FinanceExportOverview = {
  hasFinanceAccess: boolean;
  commissionRows: number;
  payoutRows: number;
  approvedEntries: number;
  payoutTrackedEntries: number;
  recentBatches: Array<{
    id: string;
    name: string;
    status: string;
    totalAmountLabel: string;
  }>;
};

export type FinanceOpsSummary = {
  hasFinanceAccess: boolean;
  pendingReviewCount: number;
  approvedCount: number;
  payoutTrackedCount: number;
  paidCount: number;
  draftBatchCount: number;
  exportedBatchCount: number;
  paidBatchCount: number;
};

const FINANCE_ROLE_KEYS = new Set<FinanceRoleKey>(["owner", "admin", "finance"]);

function normalizeOptionalText(value: string | null | undefined, maxLength = 2000) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
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

function parseMoneyInput(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replaceAll(",", "");

  if (!normalized) {
    return null;
  }

  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new ServiceError("validation_error", "Commission amount must be a valid number.", {
      status: 400,
    });
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ServiceError("validation_error", "Commission amount must be zero or greater.", {
      status: 400,
    });
  }

  return Math.round(parsed * 100) / 100;
}

function formatCurrency(amount: number | null, currency: string) {
  if (amount === null) {
    return "Not set";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency || "USD"} ${amount.toFixed(2)}`;
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

function titleCaseLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeCurrency(value: string | null | undefined) {
  return normalizeOptionalText(value, 12)?.toUpperCase() ?? "USD";
}

function normalizeOptionalCurrency(value: string | null | undefined) {
  return normalizeOptionalText(value, 12)?.toUpperCase() ?? null;
}

function resolveAppleFeeBps(app: AppRow | null) {
  if (!app) {
    return null;
  }

  if (app.apple_fee_mode === "small_business_15") {
    return 1500;
  }

  if (app.apple_fee_mode === "custom") {
    return app.apple_fee_bps ?? null;
  }

  return 3000;
}

async function requireFinanceContext() {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase || !context.workspace.organization) {
    throw new ServiceError("forbidden", "No active finance workspace was found.", {
      status: 403,
    });
  }

  const roleKey = context.workspace.role?.key;

  if (!roleKey || !FINANCE_ROLE_KEYS.has(roleKey as FinanceRoleKey)) {
    throw new ServiceError(
      "forbidden",
      "Finance access is limited to owner, admin, or finance roles.",
      {
        status: 403,
      },
    );
  }

  return {
    context,
    supabase: context.supabase,
    organizationId: context.workspace.organization.id,
    membershipId: context.workspace.membership?.id ?? null,
  } satisfies FinanceContext;
}

async function getOptionalFinanceContext() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return null;
  }

  const roleKey = context.workspace.role?.key;

  if (!roleKey || !FINANCE_ROLE_KEYS.has(roleKey as FinanceRoleKey)) {
    return null;
  }

  return {
    context,
    supabase: context.supabase,
    organizationId: context.workspace.organization.id,
    membershipId: context.workspace.membership?.id ?? null,
  } satisfies FinanceContext;
}

async function loadFinanceRows(finance: FinanceContext) {
  const [
    { data: appRows, error: appError },
    { data: partnerRows, error: partnerError },
    { data: promoCodeRows, error: promoCodeError },
    { data: eventRows, error: eventError },
    { data: decisionRows, error: decisionError },
    { data: ruleRows, error: ruleError },
    { data: ledgerRows, error: ledgerError },
    { data: batchRows, error: batchError },
    { data: batchItemRows, error: batchItemError },
  ] = await Promise.all([
    finance.supabase
      .from("apps")
      .select("id, slug, name, apple_fee_mode, apple_fee_bps")
      .eq("organization_id", finance.organizationId)
      .returns<AppRow[]>(),
    finance.supabase
      .from("partners")
      .select("id, name, status")
      .eq("organization_id", finance.organizationId)
      .returns<PartnerRow[]>(),
    finance.supabase
      .from("promo_codes")
      .select("id, code")
      .eq("organization_id", finance.organizationId)
      .returns<PromoCodeRow[]>(),
    finance.supabase
      .from("normalized_events")
      .select(
        "id, app_id, partner_id, promo_code_id, event_type, event_status, attribution_status, event_at, received_at, currency, gross_amount, net_amount, amount_minor, product_id, environment, source_type, source_event_key, payload",
      )
      .eq("organization_id", finance.organizationId)
      .eq("attribution_status", "attributed")
      .not("partner_id", "is", null)
      .order("received_at", { ascending: false })
      .returns<NormalizedEventRow[]>(),
    finance.supabase
      .from("attribution_decisions")
      .select("id, normalized_event_id, decision_type, reason, created_at")
      .eq("organization_id", finance.organizationId)
      .order("created_at", { ascending: false })
      .returns<AttributionDecisionRow[]>(),
    finance.supabase
      .from("commission_rules")
      .select(
        "id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, rate, flat_amount, priority, basis_mode, starts_at, ends_at",
      )
      .eq("organization_id", finance.organizationId)
      .eq("status", "active")
      .returns<CommissionRuleRow[]>(),
    finance.supabase
      .from("commission_ledger_entries")
      .select(
        "id, chain_id, normalized_event_id, commission_rule_id, partner_id, promo_code_id, entry_type, status, transition_type, currency, amount, effective_at, notes, metadata, related_entry_id, payout_batch_id, actor_membership_id, created_at, updated_at",
      )
      .eq("organization_id", finance.organizationId)
      .returns<CommissionLedgerEntryRow[]>(),
    finance.supabase
      .from("payout_batches")
      .select(
        "id, name, status, currency, period_start, period_end, external_reference, approved_by_membership_id, approved_at, notes, created_at, updated_at",
      )
      .eq("organization_id", finance.organizationId)
      .order("created_at", { ascending: false })
      .returns<PayoutBatchRow[]>(),
    finance.supabase
      .from("payout_batch_items")
      .select(
        "id, payout_batch_id, commission_ledger_entry_id, commission_chain_id, partner_id, amount, status, created_at, updated_at",
      )
      .eq("organization_id", finance.organizationId)
      .returns<PayoutBatchItemRow[]>(),
  ]);

  const errors = [
    appError,
    partnerError,
    promoCodeError,
    eventError,
    decisionError,
    ruleError,
    ledgerError,
    batchError,
    batchItemError,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new ServiceError("internal_error", "Failed to load finance records.", {
      status: 500,
      details: {
        message: errors[0]?.message,
      },
    });
  }

  return {
    appsById: new Map((appRows ?? []).map((row) => [row.id, row])),
    partnersById: new Map((partnerRows ?? []).map((row) => [row.id, row])),
    promoCodesById: new Map((promoCodeRows ?? []).map((row) => [row.id, row])),
    events: eventRows ?? [],
    decisions: decisionRows ?? [],
    rules: ruleRows ?? [],
    ledgerEntries: ledgerRows ?? [],
    batches: batchRows ?? [],
    batchItems: batchItemRows ?? [],
  };
}

function getEventGrossAmount(event: NormalizedEventRow) {
  const grossAmount = toNumber(event.gross_amount);

  if (grossAmount !== null) {
    return grossAmount;
  }

  if (typeof event.amount_minor === "number") {
    return Math.round((event.amount_minor / 100) * 100) / 100;
  }

  return null;
}

function getEventNetAmount(event: NormalizedEventRow, app: AppRow | null) {
  const netAmount = toNumber(event.net_amount);

  if (netAmount !== null) {
    return netAmount;
  }

  const grossAmount = getEventGrossAmount(event);
  const feeBps = resolveAppleFeeBps(app);

  if (grossAmount === null || feeBps === null) {
    return null;
  }

  return Math.round(grossAmount * ((10000 - feeBps) / 10000) * 100) / 100;
}

function getEventBasisAmount(
  event: NormalizedEventRow,
  rule: CommissionRuleRow | null,
  app: AppRow | null,
) {
  if (rule?.basis_mode === "net_revenue") {
    return getEventNetAmount(event, app);
  }

  return getEventGrossAmount(event);
}

function getEventBasisCurrency(event: NormalizedEventRow, fallbackCurrency: string) {
  return normalizeCurrency(event.currency) || fallbackCurrency;
}

function pickLatestDecisionLabel(eventId: string, decisions: AttributionDecisionRow[]) {
  const decision = decisions.find((row) => row.normalized_event_id === eventId);

  if (!decision) {
    return null;
  }

  const reason = normalizeOptionalText(decision.reason, 240);
  return reason ? `${titleCaseLabel(decision.decision_type)}: ${reason}` : titleCaseLabel(decision.decision_type);
}

function scoreRuleMatch(rule: CommissionRuleRow) {
  let score = 0;

  if (rule.promo_code_id) {
    score += 4;
  }

  if (rule.partner_id) {
    score += 2;
  }

  if (rule.app_id) {
    score += 1;
  }

  if (rule.priority !== null && rule.priority !== undefined) {
    score += Math.max(0, 1000 - rule.priority);
  }

  return score;
}

function findMatchingRule(event: NormalizedEventRow, rules: CommissionRuleRow[]) {
  const eventTime = new Date(event.event_at).getTime();
  const candidates = rules.filter((rule) => {
    if (rule.app_id && rule.app_id !== event.app_id) {
      return false;
    }

    if (rule.partner_id && rule.partner_id !== event.partner_id) {
      return false;
    }

    if (rule.promo_code_id && rule.promo_code_id !== event.promo_code_id) {
      return false;
    }

    if (rule.starts_at && new Date(rule.starts_at).getTime() > eventTime) {
      return false;
    }

    if (rule.ends_at && new Date(rule.ends_at).getTime() < eventTime) {
      return false;
    }

    return true;
  });

  candidates.sort((left, right) => scoreRuleMatch(right) - scoreRuleMatch(left));

  return candidates[0] ?? null;
}

function calculateRuleMatch(
  event: NormalizedEventRow,
  rules: CommissionRuleRow[],
  app: AppRow | null,
): RuleMatch {
  const rule = findMatchingRule(event, rules);
  const fallbackCurrency = rule ? normalizeCurrency(rule.currency) : normalizeCurrency(event.currency);
  const basisAmount = getEventBasisAmount(event, rule, app);
  const basisCurrency = getEventBasisCurrency(event, fallbackCurrency);
  const basisMode = rule?.basis_mode ?? "gross_revenue";
  const appleFeeMode = app?.apple_fee_mode ?? null;
  const appleFeeBps = resolveAppleFeeBps(app);
  const basisSource =
    basisMode === "net_revenue"
      ? toNumber(event.net_amount) !== null
        ? "verified_net"
        : appleFeeBps !== null
          ? "derived_net_from_app_fee"
          : "missing_net_basis"
      : toNumber(event.gross_amount) !== null || typeof event.amount_minor === "number"
        ? "verified_gross"
        : "missing_gross_basis";

  if (!rule) {
    return {
      rule: null,
      suggestedAmount: null,
      suggestedCurrency: basisCurrency,
      basisAmount,
      basisCurrency,
      basisLabel:
        basisAmount === null
          ? "No event revenue basis is available yet."
          : `${formatCurrency(basisAmount, basisCurrency)} ${basisMode === "net_revenue" ? "net" : "gross"} event basis`,
      ruleSummary: "No active commission rule matched this event. Approval remains manual.",
      basisMode,
      basisSource,
      appleFeeMode,
      appleFeeBps,
    };
  }

  const rate = toNumber(rule.rate);
  const flatAmount = toNumber(rule.flat_amount);
  let suggestedAmount: number | null = null;

  if (rule.rule_type === "revenue_share") {
    suggestedAmount =
      basisAmount !== null && rate !== null
        ? Math.round(basisAmount * rate * 100) / 100
        : null;
  } else if (rule.rule_type === "flat_fee" || rule.rule_type === "cpa") {
    suggestedAmount = flatAmount;
  } else if (rule.rule_type === "hybrid") {
    const revenueShareAmount =
      basisAmount !== null && rate !== null
        ? Math.round(basisAmount * rate * 100) / 100
        : 0;
    suggestedAmount =
      revenueShareAmount || flatAmount !== null
        ? Math.round((revenueShareAmount + (flatAmount ?? 0)) * 100) / 100
        : null;
  }

  const rateLabel = rate === null ? null : `${Math.round(rate * 10000) / 100}%`;
  const basisLabel =
    basisAmount === null
      ? "Event basis is not available yet."
      : `${formatCurrency(basisAmount, basisCurrency)} ${basisMode === "net_revenue" ? "net" : "gross"} event basis`;

  return {
    rule,
    suggestedAmount,
    suggestedCurrency: normalizeCurrency(rule.currency) || basisCurrency,
    basisAmount,
    basisCurrency,
    basisLabel,
    ruleSummary:
      rule.rule_type === "revenue_share"
        ? `${rule.name}: ${rateLabel ?? "No rate"} revenue share on ${basisMode === "net_revenue" ? "net" : "gross"} revenue`
        : rule.rule_type === "hybrid"
          ? `${rule.name}: hybrid rule on ${basisMode === "net_revenue" ? "net" : "gross"} revenue`
          : `${rule.name}: ${formatCurrency(flatAmount, normalizeCurrency(rule.currency))} ${titleCaseLabel(rule.rule_type)}`,
    basisMode,
    basisSource,
    appleFeeMode,
    appleFeeBps,
  };
}

function sortLedgerEntriesDescending(
  left: CommissionLedgerEntryRow,
  right: CommissionLedgerEntryRow,
) {
  return (
    right.created_at.localeCompare(left.created_at) ||
    right.updated_at.localeCompare(left.updated_at) ||
    right.id.localeCompare(left.id)
  );
}

function getLatestLedgerEntryForEvent(
  eventId: string,
  ledgerEntries: CommissionLedgerEntryRow[],
) {
  const latestEntriesByChain = new Map<string, CommissionLedgerEntryRow>();

  for (const entry of ledgerEntries
    .filter((candidate) => candidate.normalized_event_id === eventId)
    .sort(sortLedgerEntriesDescending)) {
    if (!latestEntriesByChain.has(entry.chain_id)) {
      latestEntriesByChain.set(entry.chain_id, entry);
    }
  }

  return Array.from(latestEntriesByChain.values()).sort(sortLedgerEntriesDescending)[0] ?? null;
}

function deriveCommissionState(params: {
  ledgerEntry: CommissionLedgerEntryRow | null;
  batchItem: PayoutBatchItemRow | null;
  batch: PayoutBatchRow | null;
}): CommissionReviewState {
  if (
    params.ledgerEntry?.transition_type === "paid" ||
    params.batchItem?.status === "paid" ||
    params.batch?.status === "paid"
  ) {
    return "paid";
  }

  if (
    params.ledgerEntry?.transition_type === "rejected" ||
    params.ledgerEntry?.transition_type === "reversed"
  ) {
    return "rejected";
  }

  if (
    params.batchItem &&
    params.batch &&
    params.batch.status !== "cancelled" &&
    params.batchItem.status !== "cancelled"
  ) {
    return "payout_ready";
  }

  if (
    params.ledgerEntry?.transition_type === "approved" ||
    params.ledgerEntry?.transition_type === "released"
  ) {
    return "approved";
  }

  return "pending_review";
}

function stateLabel(state: CommissionReviewState) {
  if (state === "pending_review") {
    return "Pending review";
  }

  if (state === "payout_ready") {
    return "Payout-ready";
  }

  return titleCaseLabel(state);
}

function batchStatusLabel(status: PayoutBatchStatus) {
  return titleCaseLabel(status);
}

function buildWindowLabel(batch: PayoutBatchRow) {
  if (!batch.period_start && !batch.period_end) {
    return "No period set";
  }

  if (batch.period_start && batch.period_end) {
    return `${formatDateLabel(batch.period_start)} - ${formatDateLabel(batch.period_end)}`;
  }

  return batch.period_start
    ? `From ${formatDateLabel(batch.period_start)}`
    : `Until ${formatDateLabel(batch.period_end)}`;
}

function buildPayoutStatusLabel(batch: PayoutBatchRow) {
  if (batch.status === "paid") {
    return "Paid";
  }

  if (batch.status === "exported") {
    return "Awaiting remittance";
  }

  return "Not paid";
}

function buildExportStatusLabel(batch: PayoutBatchRow) {
  if (batch.status === "exported" || batch.status === "paid") {
    return batch.external_reference ? `Exported (${batch.external_reference})` : "CSV exported";
  }

  return "Not exported";
}

function buildCommissionItem(params: {
  event: NormalizedEventRow;
  app: AppRow | null;
  partner: PartnerRow | null;
  promoCode: PromoCodeRow | null;
  ruleMatch: RuleMatch;
  ledgerEntry: CommissionLedgerEntryRow | null;
  latestDecisionLabel: string | null;
  batchItem: PayoutBatchItemRow | null;
  batch: PayoutBatchRow | null;
}) {
  const state = deriveCommissionState({
    ledgerEntry: params.ledgerEntry,
    batchItem: params.batchItem,
    batch: params.batch,
  });
  const amount =
    params.ledgerEntry?.amount !== undefined && params.ledgerEntry?.amount !== null
      ? toNumber(params.ledgerEntry.amount)
      : params.ruleMatch.suggestedAmount;
  const currency =
    normalizeCurrency(params.ledgerEntry?.currency) || params.ruleMatch.suggestedCurrency;
  const note =
    normalizeOptionalText(params.ledgerEntry?.notes, 400) ??
    (state === "pending_review" ? params.ruleMatch.ruleSummary : null);

  return {
    id: params.event.id,
    eventId: params.event.id,
    ledgerEntryId: params.ledgerEntry?.id ?? null,
    ledgerChainId: params.ledgerEntry?.chain_id ?? null,
    batchId: params.batch?.id ?? null,
    batchItemId: params.batchItem?.id ?? null,
    partnerId: params.event.partner_id,
    appName: params.app?.name ?? "Unknown app",
    appSlug: params.app?.slug ?? null,
    partnerName: params.partner?.name ?? "Unknown partner",
    codeLabel: params.promoCode?.code ?? null,
    eventType: titleCaseLabel(params.event.event_type),
    eventStatus: titleCaseLabel(params.event.event_status),
    environment: titleCaseLabel(params.event.environment),
    sourceLabel: titleCaseLabel(params.event.source_type),
    occurredAt: params.event.event_at,
    receivedAt: params.event.received_at,
    reviewState: state,
    reviewStateLabel: stateLabel(state),
    basisAmountLabel: params.ruleMatch.basisLabel,
    commissionAmountLabel:
      amount === null
        ? "Manual amount required"
        : formatCurrency(amount, currency),
    currency,
    commissionAmount: amount,
    basisAmount: params.ruleMatch.basisAmount,
    ruleSummary: params.ruleMatch.ruleSummary,
    latestDecisionLabel: params.latestDecisionLabel,
    note,
    payoutBatchName: params.batch?.name ?? null,
    payoutBatchStatus: params.batch ? batchStatusLabel(params.batch.status) : null,
    canApprove: state === "pending_review" || state === "rejected",
    canReject: state === "pending_review" || state === "approved",
    canPreparePayout: state === "approved",
    suggestedAmount: params.ruleMatch.suggestedAmount,
  } satisfies CommissionItemView;
}

function buildReadyGroups(items: CommissionItemView[]) {
  const groups = new Map<string, PayoutReadyGroupView>();

  for (const item of items) {
    if (
      item.reviewState !== "approved" ||
      !item.ledgerEntryId ||
      !item.ledgerChainId ||
      item.commissionAmount === null
    ) {
      continue;
    }

    const groupKey = `${item.partnerId ?? "unassigned"}:${item.currency}`;
    const existing = groups.get(groupKey);

    if (existing) {
        existing.entryCount += 1;
        existing.totalAmount = Math.round((existing.totalAmount + item.commissionAmount) * 100) / 100;
        existing.totalAmountLabel = formatCurrency(existing.totalAmount, existing.currency);
        existing.commissionEntryIds.push(item.ledgerEntryId);
      if (!existing.commissionChainIds.includes(item.ledgerChainId)) {
        existing.commissionChainIds.push(item.ledgerChainId);
      }
      if (item.appName && !existing.appNames.includes(item.appName)) {
        existing.appNames.push(item.appName);
      }
      if (!existing.latestEffectiveAt || item.occurredAt > existing.latestEffectiveAt) {
        existing.latestEffectiveAt = item.occurredAt;
      }
      continue;
    }

    groups.set(groupKey, {
      id: groupKey,
      partnerId: item.partnerId,
      partnerName: item.partnerName,
      entryCount: 1,
      totalAmount: item.commissionAmount,
      totalAmountLabel: formatCurrency(item.commissionAmount, item.currency),
      currency: item.currency,
      appNames: item.appName ? [item.appName] : [],
      commissionEntryIds: [item.ledgerEntryId],
      commissionChainIds: [item.ledgerChainId],
      latestEffectiveAt: item.occurredAt,
    });
  }

  return Array.from(groups.values()).sort((left, right) =>
    right.totalAmount - left.totalAmount,
  );
}

function buildBatchViews(params: {
  batches: PayoutBatchRow[];
  batchItems: PayoutBatchItemRow[];
  ledgerEntriesById: Map<string, CommissionLedgerEntryRow>;
  eventsById: Map<string, NormalizedEventRow>;
  appsById: Map<string, AppRow>;
  partnersById: Map<string, PartnerRow>;
  promoCodesById: Map<string, PromoCodeRow>;
}) {
  const itemsByBatchId = new Map<string, PayoutBatchItemRow[]>();

  for (const batchItem of params.batchItems) {
    const items = itemsByBatchId.get(batchItem.payout_batch_id) ?? [];
    items.push(batchItem);
    itemsByBatchId.set(batchItem.payout_batch_id, items);
  }

  return params.batches.map((batch) => {
    const batchItems = itemsByBatchId.get(batch.id) ?? [];
    const partnerNames = new Set<string>();
    const items = batchItems.map((batchItem) => {
      const ledgerEntry = params.ledgerEntriesById.get(batchItem.commission_ledger_entry_id) ?? null;
      const event = ledgerEntry?.normalized_event_id
        ? params.eventsById.get(ledgerEntry.normalized_event_id) ?? null
        : null;
      const partner = batchItem.partner_id
        ? params.partnersById.get(batchItem.partner_id) ?? null
        : event?.partner_id
          ? params.partnersById.get(event.partner_id) ?? null
          : null;

      if (partner?.name) {
        partnerNames.add(partner.name);
      }

      const app = event?.app_id ? params.appsById.get(event.app_id) ?? null : null;
      const promoCode = event?.promo_code_id
        ? params.promoCodesById.get(event.promo_code_id) ?? null
        : null;

      return {
        id: batchItem.id,
        ledgerEntryId: batchItem.commission_ledger_entry_id,
        chainId: batchItem.commission_chain_id,
        partnerName: partner?.name ?? "Unknown partner",
        appName: app?.name ?? "Unknown app",
        codeLabel: promoCode?.code ?? null,
        amountLabel: formatCurrency(toNumber(batchItem.amount), batch.currency),
        status: batchItem.status,
        commissionEventId: event?.id ?? null,
        eventType: event ? titleCaseLabel(event.event_type) : null,
      } satisfies PayoutBatchItemView;
    });
    const totalAmount = batchItems.reduce(
      (sum, batchItem) => sum + (toNumber(batchItem.amount) ?? 0),
      0,
    );

    return {
      id: batch.id,
      name: batch.name,
      status: batch.status,
      statusLabel: batchStatusLabel(batch.status),
      currency: batch.currency,
      totalAmount,
      totalAmountLabel: formatCurrency(totalAmount, batch.currency),
      entryCount: batchItems.length,
      partnerCount: partnerNames.size,
      partnerNames: Array.from(partnerNames.values()),
      windowLabel: buildWindowLabel(batch),
      exportStatusLabel: buildExportStatusLabel(batch),
      paymentStatusLabel: buildPayoutStatusLabel(batch),
      externalReference: batch.external_reference,
      note: batch.notes,
      items,
      createdAt: batch.created_at,
      approvedAt: batch.approved_at,
      updatedAt: batch.updated_at,
    } satisfies PayoutBatchView;
  });
}

async function buildFinanceReadModel() {
  const finance = await getOptionalFinanceContext();

  if (!finance) {
    return {
      hasFinanceAccess: false,
      commissionItems: [],
      readyGroups: [],
      batches: [],
    } satisfies FinanceReadModel;
  }

  const rows = await loadFinanceRows(finance);
  const latestDecisionByEvent = new Map<string, string>();

  for (const decision of rows.decisions) {
    if (!latestDecisionByEvent.has(decision.normalized_event_id)) {
      latestDecisionByEvent.set(
        decision.normalized_event_id,
        pickLatestDecisionLabel(decision.normalized_event_id, rows.decisions) ?? "",
      );
    }
  }

  const ledgerByEventId = new Map<string, CommissionLedgerEntryRow>();

  for (const event of rows.events) {
    const ledgerEntry = getLatestLedgerEntryForEvent(event.id, rows.ledgerEntries);

    if (ledgerEntry) {
      ledgerByEventId.set(event.id, ledgerEntry);
    }
  }

  const batchItemByChainId = new Map<string, PayoutBatchItemRow>();

  for (const batchItem of rows.batchItems) {
    const chainId = batchItem.commission_chain_id;

    if (chainId && !batchItemByChainId.has(chainId)) {
      batchItemByChainId.set(chainId, batchItem);
    }
  }

  const batchesById = new Map(rows.batches.map((batch) => [batch.id, batch]));
  const eventsById = new Map(rows.events.map((event) => [event.id, event]));
  const ledgerEntriesById = new Map(rows.ledgerEntries.map((entry) => [entry.id, entry]));
  const commissionItems = rows.events.map((event) =>
    buildCommissionItem({
      event,
      app: event.app_id ? rows.appsById.get(event.app_id) ?? null : null,
      partner: event.partner_id ? rows.partnersById.get(event.partner_id) ?? null : null,
      promoCode: event.promo_code_id ? rows.promoCodesById.get(event.promo_code_id) ?? null : null,
      ruleMatch: calculateRuleMatch(
        event,
        rows.rules,
        event.app_id ? rows.appsById.get(event.app_id) ?? null : null,
      ),
      ledgerEntry: ledgerByEventId.get(event.id) ?? null,
      latestDecisionLabel: latestDecisionByEvent.get(event.id) || null,
      batchItem:
        ledgerByEventId.get(event.id)?.chain_id
          ? batchItemByChainId.get(ledgerByEventId.get(event.id)!.chain_id) ?? null
          : null,
      batch:
        ledgerByEventId.get(event.id)?.chain_id &&
        batchItemByChainId.get(ledgerByEventId.get(event.id)!.chain_id)?.payout_batch_id
          ? batchesById.get(
              batchItemByChainId.get(ledgerByEventId.get(event.id)!.chain_id)!.payout_batch_id,
            ) ?? null
          : null,
    }),
  );
  const readyGroups = buildReadyGroups(commissionItems);
  const batches = buildBatchViews({
    batches: rows.batches,
    batchItems: rows.batchItems,
    ledgerEntriesById,
    eventsById,
    appsById: rows.appsById,
    partnersById: rows.partnersById,
    promoCodesById: rows.promoCodesById,
  });

  return {
    hasFinanceAccess: true,
    commissionItems,
    readyGroups,
    batches,
  } satisfies FinanceReadModel;
}

function buildCommissionStats(items: CommissionItemView[]) {
  return {
    pendingReview: items.filter((item) => item.reviewState === "pending_review").length,
    approved: items.filter((item) => item.reviewState === "approved").length,
    rejected: items.filter((item) => item.reviewState === "rejected").length,
    payoutReady: items.filter((item) => item.reviewState === "payout_ready").length,
    paid: items.filter((item) => item.reviewState === "paid").length,
  };
}

async function getEventForFinanceAction(finance: FinanceContext, eventId: string) {
  const rows = await loadFinanceRows(finance);
  const event = rows.events.find((row) => row.id === eventId) ?? null;

  if (!event) {
    throw new ServiceError("not_found", "Commission event was not found.", {
      status: 404,
    });
  }

  const ledgerEntry = getLatestLedgerEntryForEvent(event.id, rows.ledgerEntries);
  const ruleMatch = calculateRuleMatch(
    event,
    rows.rules,
    event.app_id ? rows.appsById.get(event.app_id) ?? null : null,
  );

  return {
    event,
    ledgerEntry,
    ruleMatch,
  };
}

function buildBatchName(partnerName: string, effectiveDates: string[]) {
  const today = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  if (effectiveDates.length === 0) {
    return `${partnerName} payout draft ${today}`;
  }

  const sorted = [...effectiveDates].sort();
  return `${partnerName} payout draft ${formatDateLabel(sorted[0])} - ${formatDateLabel(
    sorted[sorted.length - 1],
  )}`;
}

export async function listCommissionItems() {
  const readModel = await buildFinanceReadModel();

  return {
    hasFinanceAccess: readModel.hasFinanceAccess,
    items: readModel.commissionItems,
    stats: buildCommissionStats(readModel.commissionItems),
  } satisfies CommissionsPageData;
}

export async function approveCommissionItem(input: {
  eventId: string;
  amount?: string | null;
  currency?: string | null;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { event, ruleMatch } = await getEventForFinanceAction(finance, input.eventId);
  const explicitAmount = parseMoneyInput(input.amount);
  const resolvedAmount = explicitAmount ?? ruleMatch.suggestedAmount;

  if (resolvedAmount === null) {
    throw new ServiceError(
      "validation_error",
      "Enter a commission amount before approving this item.",
      {
        status: 400,
      },
    );
  }

  const resolvedCurrency =
    normalizeOptionalCurrency(input.currency) ?? ruleMatch.suggestedCurrency;
  const note = normalizeOptionalText(input.note);
  const approvalMetadata = {
    review_status: "approved",
    reviewed_at: new Date().toISOString(),
    reviewed_by_membership_id: finance.membershipId,
    basis_amount: ruleMatch.basisAmount,
    basis_currency: ruleMatch.basisCurrency,
    basis_mode: ruleMatch.basisMode,
    basis_source: ruleMatch.basisSource,
    apple_fee_mode: ruleMatch.appleFeeMode,
    apple_fee_bps: ruleMatch.appleFeeBps,
    rule_id: ruleMatch.rule?.id ?? null,
    rule_summary: ruleMatch.ruleSummary,
  };
  const { data: savedEntryId, error } = await finance.supabase.rpc("approve_commission_event", {
    target_organization_id: finance.organizationId,
    target_event_id: event.id,
    target_amount: resolvedAmount,
    target_currency: resolvedCurrency,
    target_note: note,
    target_rule_id: ruleMatch.rule?.id ?? null,
    target_metadata: approvalMetadata,
  });

  if (error || !savedEntryId) {
    throw new ServiceError("internal_error", "Failed to approve the commission item.", {
      status: 500,
      details: { message: error?.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "commission_ledger_entry",
    entityId: savedEntryId,
    action: "commission.approved",
    summary: `Approved commission review for event ${event.id}.`,
    metadata: {
      normalizedEventId: event.id,
      amount: resolvedAmount,
      currency: resolvedCurrency,
    },
  });

  return {
    eventId: event.id,
    ledgerEntryId: savedEntryId,
  };
}

export async function rejectCommissionItem(input: {
  eventId: string;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { event, ruleMatch } = await getEventForFinanceAction(finance, input.eventId);
  const note = normalizeOptionalText(input.note);
  const { data: savedEntryId, error } = await finance.supabase.rpc("reject_commission_event", {
    target_organization_id: finance.organizationId,
    target_event_id: event.id,
    target_note: note,
    target_rule_id: ruleMatch.rule?.id ?? null,
    target_metadata: {
      review_status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by_membership_id: finance.membershipId,
      rejection_reason: note,
      basis_mode: ruleMatch.basisMode,
      basis_source: ruleMatch.basisSource,
      apple_fee_mode: ruleMatch.appleFeeMode,
      apple_fee_bps: ruleMatch.appleFeeBps,
      rule_id: ruleMatch.rule?.id ?? null,
      rule_summary: ruleMatch.ruleSummary,
    },
  });

  if (error || !savedEntryId) {
    throw new ServiceError("internal_error", "Failed to reject the commission item.", {
      status: 500,
      details: { message: error?.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "commission_ledger_entry",
    entityId: savedEntryId,
    action: "commission.rejected",
    summary: `Rejected commission review for event ${event.id}.`,
    metadata: {
      normalizedEventId: event.id,
    },
  });

  return {
    eventId: event.id,
    ledgerEntryId: savedEntryId,
  };
}

export async function listPayoutsData() {
  const readModel = await buildFinanceReadModel();

  return {
    hasFinanceAccess: readModel.hasFinanceAccess,
    readyGroups: readModel.readyGroups,
    batches: readModel.batches,
    stats: {
      readyGroups: readModel.readyGroups.length,
      readyEntries: readModel.readyGroups.reduce((sum, group) => sum + group.entryCount, 0),
      draftBatches: readModel.batches.filter((batch) => batch.status === "draft").length,
      exportedBatches: readModel.batches.filter((batch) => batch.status === "exported").length,
      paidBatches: readModel.batches.filter((batch) => batch.status === "paid").length,
    },
  } satisfies PayoutsPageData;
}

export async function createDraftPayoutBatch(input: {
  groupId: string;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const readModel = await buildFinanceReadModel();
  const group = readModel.readyGroups.find((item) => item.id === input.groupId) ?? null;

  if (!group) {
    throw new ServiceError("not_found", "No payout-ready partner group was found.", {
      status: 404,
    });
  }

  if (group.commissionEntryIds.length === 0) {
    throw new ServiceError("validation_error", "This partner group has no payout-ready items.", {
      status: 400,
    });
  }

  const effectiveDates = readModel.commissionItems
    .filter(
      (item) =>
        item.ledgerChainId && group.commissionChainIds.includes(item.ledgerChainId),
    )
    .map((item) => item.receivedAt ?? item.occurredAt);
  const note = normalizeOptionalText(input.note);
  const batchName = buildBatchName(group.partnerName, effectiveDates);
  const { data: batchId, error: batchError } = await finance.supabase.rpc(
    "create_payout_batch_from_group",
    {
      target_organization_id: finance.organizationId,
      target_partner_id: group.partnerId,
      target_currency: group.currency,
      target_name: batchName,
      target_period_start: effectiveDates.length ? effectiveDates.slice().sort()[0].slice(0, 10) : null,
      target_period_end: effectiveDates.length
        ? effectiveDates.slice().sort()[effectiveDates.length - 1].slice(0, 10)
        : null,
      target_note: note,
      target_chain_ids: group.commissionChainIds,
    },
  );

  if (batchError || !batchId) {
    throw new ServiceError("internal_error", "Failed to create the payout batch.", {
      status: 500,
      details: { message: batchError?.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: batchId,
    action: "payout_batch.created",
    summary: `Created payout batch ${batchName}.`,
    metadata: {
      batchId,
      chainCount: group.commissionChainIds.length,
    },
  });

  return {
    batchId,
  };
}

async function getBatchForAction(finance: FinanceContext, batchId: string) {
  const { data, error } = await finance.supabase
    .from("payout_batches")
    .select(
      "id, name, status, currency, period_start, period_end, external_reference, approved_by_membership_id, approved_at, notes, created_at, updated_at",
    )
    .eq("organization_id", finance.organizationId)
    .eq("id", batchId)
    .single<PayoutBatchRow>();

  if (error) {
    throw new ServiceError("not_found", "Payout batch was not found.", {
      status: 404,
    });
  }

  const { data: batchItems, error: batchItemsError } = await finance.supabase
    .from("payout_batch_items")
    .select(
      "id, payout_batch_id, commission_ledger_entry_id, commission_chain_id, partner_id, amount, status, created_at, updated_at",
    )
    .eq("organization_id", finance.organizationId)
    .eq("payout_batch_id", batchId)
    .returns<PayoutBatchItemRow[]>();

  if (batchItemsError) {
    throw new ServiceError("internal_error", "Failed to read payout batch items.", {
      status: 500,
      details: { message: batchItemsError.message },
    });
  }

  return {
    batch: data,
    batchItems: batchItems ?? [],
  };
}

export async function markPayoutBatchExported(input: {
  batchId: string;
  externalReference?: string | null;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { batch } = await getBatchForAction(finance, input.batchId);
  const note = normalizeOptionalText(input.note);
  const externalReference = normalizeOptionalText(input.externalReference, 120);
  const { data: updatedBatchId, error: batchError } = await finance.supabase.rpc(
    "export_payout_batch",
    {
      target_organization_id: finance.organizationId,
      target_batch_id: batch.id,
      target_external_reference: externalReference,
      target_note: note,
    },
  );

  if (batchError || !updatedBatchId) {
    throw new ServiceError("internal_error", "Failed to mark the payout batch as exported.", {
      status: 500,
      details: { message: batchError?.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: updatedBatchId,
    action: "payout_batch.exported",
    summary: `Marked payout batch ${batch.name} as exported.`,
    metadata: {
      batchId: updatedBatchId,
      externalReference,
    },
  });

  return {
    batchId: updatedBatchId,
  };
}

export async function markPayoutBatchPaid(input: {
  batchId: string;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { batch } = await getBatchForAction(finance, input.batchId);
  const note = normalizeOptionalText(input.note);
  const { data: updatedBatchId, error: batchError } = await finance.supabase.rpc(
    "mark_payout_batch_paid",
    {
      target_organization_id: finance.organizationId,
      target_batch_id: batch.id,
      target_note: note,
    },
  );

  if (batchError || !updatedBatchId) {
    throw new ServiceError("internal_error", "Failed to mark the payout batch as paid.", {
      status: 500,
      details: { message: batchError?.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: updatedBatchId,
    action: "payout_batch.paid",
    summary: `Marked payout batch ${batch.name} as paid.`,
    metadata: {
      batchId: updatedBatchId,
    },
  });

  return {
    batchId: updatedBatchId,
  };
}

export async function cancelPayoutBatch(input: {
  batchId: string;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { batch } = await getBatchForAction(finance, input.batchId);
  const note = normalizeOptionalText(input.note);
  const { data: batchId, error } = await finance.supabase.rpc("cancel_payout_batch", {
    target_organization_id: finance.organizationId,
    target_batch_id: batch.id,
    target_note: note,
  });

  if (error || !batchId) {
    throw new ServiceError("internal_error", "Failed to cancel the payout batch.", {
      status: 500,
      details: { message: error?.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: batchId,
    action: "payout_batch.cancelled",
    summary: `Cancelled payout batch ${batch.name}.`,
    metadata: {
      batchId,
    },
  });

  return {
    batchId,
  };
}

export async function listFinanceExportOverview() {
  const readModel = await buildFinanceReadModel();

  return {
    hasFinanceAccess: readModel.hasFinanceAccess,
    commissionRows: readModel.commissionItems.length,
    payoutRows: readModel.batches.reduce((sum, batch) => sum + batch.items.length, 0),
    approvedEntries: readModel.commissionItems.filter((item) => item.reviewState === "approved").length,
    payoutTrackedEntries: readModel.commissionItems.filter((item) => item.reviewState === "payout_ready" || item.reviewState === "paid").length,
    recentBatches: readModel.batches.slice(0, 5).map((batch) => ({
      id: batch.id,
      name: batch.name,
      status: batch.statusLabel,
      totalAmountLabel: batch.totalAmountLabel,
    })),
  } satisfies FinanceExportOverview;
}

export async function listFinanceOpsSummary() {
  const readModel = await buildFinanceReadModel();

  return {
    hasFinanceAccess: readModel.hasFinanceAccess,
    pendingReviewCount: readModel.commissionItems.filter(
      (item) => item.reviewState === "pending_review",
    ).length,
    approvedCount: readModel.commissionItems.filter(
      (item) => item.reviewState === "approved",
    ).length,
    payoutTrackedCount: readModel.commissionItems.filter(
      (item) =>
        item.reviewState === "payout_ready" || item.reviewState === "paid",
    ).length,
    paidCount: readModel.commissionItems.filter(
      (item) => item.reviewState === "paid",
    ).length,
    draftBatchCount: readModel.batches.filter(
      (batch) => batch.status === "draft",
    ).length,
    exportedBatchCount: readModel.batches.filter(
      (batch) => batch.status === "exported",
    ).length,
    paidBatchCount: readModel.batches.filter(
      (batch) => batch.status === "paid",
    ).length,
  } satisfies FinanceOpsSummary;
}

function csvEscape(value: string) {
  if (value.includes(",") || value.includes("\"") || value.includes("\n")) {
    return `"${value.replaceAll("\"", "\"\"")}"`;
  }

  return value;
}

export async function buildFinanceExportCsv(scope: FinanceExportScope) {
  const finance = await requireFinanceContext();
  const readModel = await buildFinanceReadModel();

  if (!readModel.hasFinanceAccess) {
    throw new ServiceError("forbidden", "Finance export access is not available.", {
      status: 403,
    });
  }

  const rows =
    scope === "commission-register"
      ? [
          [
            "event_id",
            "review_state",
            "app",
            "partner",
            "code",
            "event_type",
            "event_status",
            "basis_amount",
            "commission_amount",
            "currency",
            "rule_summary",
            "batch_name",
            "batch_status",
            "occurred_at",
            "received_at",
          ],
          ...readModel.commissionItems.map((item) => [
            item.eventId,
            item.reviewStateLabel,
            item.appName,
            item.partnerName,
            item.codeLabel ?? "",
            item.eventType,
            item.eventStatus,
            item.basisAmount === null ? "" : item.basisAmount.toFixed(2),
            item.commissionAmount === null ? "" : item.commissionAmount.toFixed(2),
            item.currency,
            item.ruleSummary,
            item.payoutBatchName ?? "",
            item.payoutBatchStatus ?? "",
            item.occurredAt,
            item.receivedAt ?? "",
          ]),
        ]
      : [
          [
            "batch_id",
            "batch_name",
            "batch_status",
            "partner",
            "app",
            "code",
            "event_id",
            "event_type",
            "item_status",
            "amount",
            "currency",
          ],
          ...readModel.batches.flatMap((batch) =>
            batch.items.map((item) => [
              batch.id,
              batch.name,
              batch.statusLabel,
              item.partnerName,
              item.appName,
              item.codeLabel ?? "",
              item.commissionEventId ?? "",
              item.eventType ?? "",
              titleCaseLabel(item.status),
              item.amountLabel.replace(/[^0-9.\-]/g, ""),
              batch.currency,
            ]),
          ),
        ];

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "export",
    action: "finance.export.downloaded",
    summary: `Downloaded ${scope} finance export.`,
    metadata: {
      scope,
      rowCount: rows.length - 1,
    },
  });

  return rows.map((row) => row.map((cell) => csvEscape(String(cell))).join(",")).join("\n");
}
