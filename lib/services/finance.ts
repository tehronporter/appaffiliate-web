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
  starts_at: string | null;
  ends_at: string | null;
};

type CommissionLedgerEntryRow = {
  id: string;
  normalized_event_id: string | null;
  commission_rule_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  entry_type: string;
  status: LedgerStatus;
  currency: string;
  amount: number | string;
  effective_at: string;
  notes: string | null;
  metadata: Record<string, unknown> | null;
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
  latestEffectiveAt: string | null;
};

export type PayoutBatchItemView = {
  id: string;
  ledgerEntryId: string;
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
      .select("id, slug, name")
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
        "id, app_id, partner_id, promo_code_id, event_type, event_status, attribution_status, event_at, received_at, currency, gross_amount, amount_minor, product_id, environment, source_type, source_event_key, payload",
      )
      .eq("organization_id", finance.organizationId)
      .eq("attribution_status", "attributed")
      .not("partner_id", "is", null)
      .order("received_at", { ascending: false })
      .limit(120)
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
        "id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, rate, flat_amount, priority, starts_at, ends_at",
      )
      .eq("organization_id", finance.organizationId)
      .eq("status", "active")
      .returns<CommissionRuleRow[]>(),
    finance.supabase
      .from("commission_ledger_entries")
      .select(
        "id, normalized_event_id, commission_rule_id, partner_id, promo_code_id, entry_type, status, currency, amount, effective_at, notes, metadata, created_at, updated_at",
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
        "id, payout_batch_id, commission_ledger_entry_id, partner_id, amount, status, created_at, updated_at",
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

function getEventBasisAmount(event: NormalizedEventRow) {
  const grossAmount = toNumber(event.gross_amount);

  if (grossAmount !== null) {
    return grossAmount;
  }

  if (typeof event.amount_minor === "number") {
    return Math.round((event.amount_minor / 100) * 100) / 100;
  }

  return null;
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

function calculateRuleMatch(event: NormalizedEventRow, rules: CommissionRuleRow[]): RuleMatch {
  const rule = findMatchingRule(event, rules);
  const fallbackCurrency = rule ? normalizeCurrency(rule.currency) : normalizeCurrency(event.currency);
  const basisAmount = getEventBasisAmount(event);
  const basisCurrency = getEventBasisCurrency(event, fallbackCurrency);

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
          : `${formatCurrency(basisAmount, basisCurrency)} event basis`,
      ruleSummary: "No active commission rule matched this event. Approval remains manual.",
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
      : `${formatCurrency(basisAmount, basisCurrency)} event basis`;

  return {
    rule,
    suggestedAmount,
    suggestedCurrency: normalizeCurrency(rule.currency) || basisCurrency,
    basisAmount,
    basisCurrency,
    basisLabel,
    ruleSummary:
      rule.rule_type === "revenue_share"
        ? `${rule.name}: ${rateLabel ?? "No rate"} revenue share`
        : rule.rule_type === "hybrid"
          ? `${rule.name}: hybrid rule`
          : `${rule.name}: ${formatCurrency(flatAmount, normalizeCurrency(rule.currency))} ${titleCaseLabel(rule.rule_type)}`,
  };
}

function pickLedgerEntryForEvent(eventId: string, ledgerEntries: CommissionLedgerEntryRow[]) {
  return (
    ledgerEntries
      .filter((entry) => entry.normalized_event_id === eventId && entry.entry_type === "accrual")
      .sort((left, right) => right.updated_at.localeCompare(left.updated_at))[0] ?? null
  );
}

function deriveCommissionState(params: {
  ledgerEntry: CommissionLedgerEntryRow | null;
  batchItem: PayoutBatchItemRow | null;
  batch: PayoutBatchRow | null;
}): CommissionReviewState {
  if (
    params.ledgerEntry?.status === "paid" ||
    params.batchItem?.status === "paid" ||
    params.batch?.status === "paid"
  ) {
    return "paid";
  }

  if (params.ledgerEntry?.status === "void" || params.ledgerEntry?.status === "reversed") {
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

  if (params.ledgerEntry?.status === "approved") {
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
    if (item.reviewState !== "approved" || !item.ledgerEntryId || item.commissionAmount === null) {
      continue;
    }

    const groupKey = `${item.partnerId ?? "unassigned"}:${item.currency}`;
    const existing = groups.get(groupKey);

    if (existing) {
      existing.entryCount += 1;
        existing.totalAmount = Math.round((existing.totalAmount + item.commissionAmount) * 100) / 100;
        existing.totalAmountLabel = formatCurrency(existing.totalAmount, existing.currency);
        existing.commissionEntryIds.push(item.ledgerEntryId);
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
    const ledgerEntry = pickLedgerEntryForEvent(event.id, rows.ledgerEntries);

    if (ledgerEntry) {
      ledgerByEventId.set(event.id, ledgerEntry);
    }
  }

  const batchItemByLedgerId = new Map<string, PayoutBatchItemRow>();

  for (const batchItem of rows.batchItems) {
    if (!batchItemByLedgerId.has(batchItem.commission_ledger_entry_id)) {
      batchItemByLedgerId.set(batchItem.commission_ledger_entry_id, batchItem);
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
      ruleMatch: calculateRuleMatch(event, rows.rules),
      ledgerEntry: ledgerByEventId.get(event.id) ?? null,
      latestDecisionLabel: latestDecisionByEvent.get(event.id) || null,
      batchItem:
        ledgerByEventId.get(event.id)?.id
          ? batchItemByLedgerId.get(ledgerByEventId.get(event.id)!.id) ?? null
          : null,
      batch:
        ledgerByEventId.get(event.id)?.id &&
        batchItemByLedgerId.get(ledgerByEventId.get(event.id)!.id)?.payout_batch_id
          ? batchesById.get(
              batchItemByLedgerId.get(ledgerByEventId.get(event.id)!.id)!.payout_batch_id,
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

  const ledgerEntry = pickLedgerEntryForEvent(event.id, rows.ledgerEntries);
  const ruleMatch = calculateRuleMatch(event, rows.rules);

  return {
    event,
    ledgerEntry,
    ruleMatch,
  };
}

async function upsertAccrualLedgerEntry(params: {
  finance: FinanceContext;
  event: NormalizedEventRow;
  existingEntry: CommissionLedgerEntryRow | null;
  matchedRuleId: string | null;
  amount: number;
  currency: string;
  status: LedgerStatus;
  note: string | null;
  metadata: Record<string, unknown>;
}) {
  const payload = {
    organization_id: params.finance.organizationId,
    normalized_event_id: params.event.id,
    commission_rule_id: params.matchedRuleId,
    partner_id: params.event.partner_id,
    promo_code_id: params.event.promo_code_id,
    entry_type: "accrual",
    status: params.status,
    currency: params.currency,
    amount: params.amount,
    effective_at: params.event.received_at ?? params.event.event_at,
    notes: params.note,
    metadata: params.metadata,
  };

  if (params.existingEntry) {
    const { data, error } = await params.finance.supabase
      .from("commission_ledger_entries")
      .update(payload)
      .eq("organization_id", params.finance.organizationId)
      .eq("id", params.existingEntry.id)
      .select(
        "id, normalized_event_id, commission_rule_id, partner_id, promo_code_id, entry_type, status, currency, amount, effective_at, notes, metadata, created_at, updated_at",
      )
      .single<CommissionLedgerEntryRow>();

    if (error) {
      throw new ServiceError("internal_error", "Failed to update the commission ledger entry.", {
        status: 500,
        details: { message: error.message },
      });
    }

    return data;
  }

  const { data, error } = await params.finance.supabase
    .from("commission_ledger_entries")
    .insert(payload)
    .select(
      "id, normalized_event_id, commission_rule_id, partner_id, promo_code_id, entry_type, status, currency, amount, effective_at, notes, metadata, created_at, updated_at",
    )
    .single<CommissionLedgerEntryRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to create the commission ledger entry.", {
      status: 500,
      details: { message: error.message },
    });
  }

  return data;
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
  const { event, ledgerEntry, ruleMatch } = await getEventForFinanceAction(finance, input.eventId);
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
  const savedEntry = await upsertAccrualLedgerEntry({
    finance,
    event,
    existingEntry: ledgerEntry,
    matchedRuleId: ruleMatch.rule?.id ?? null,
    amount: resolvedAmount,
    currency: resolvedCurrency,
    status: "approved",
    note,
    metadata: {
      review_status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by_membership_id: finance.membershipId,
      basis_amount: ruleMatch.basisAmount,
      basis_currency: ruleMatch.basisCurrency,
      rule_id: ruleMatch.rule?.id ?? null,
      rule_summary: ruleMatch.ruleSummary,
    },
  });

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "commission_ledger_entry",
    entityId: savedEntry.id,
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
    ledgerEntryId: savedEntry.id,
  };
}

export async function rejectCommissionItem(input: {
  eventId: string;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { event, ledgerEntry, ruleMatch } = await getEventForFinanceAction(finance, input.eventId);
  const note = normalizeOptionalText(input.note);
  const fallbackAmount = ledgerEntry ? toNumber(ledgerEntry.amount) ?? 0 : ruleMatch.suggestedAmount ?? 0;
  const currency = ledgerEntry
    ? normalizeCurrency(ledgerEntry.currency)
    : ruleMatch.suggestedCurrency;
  const savedEntry = await upsertAccrualLedgerEntry({
    finance,
    event,
    existingEntry: ledgerEntry,
    matchedRuleId: ruleMatch.rule?.id ?? null,
    amount: fallbackAmount,
    currency,
    status: "void",
    note,
    metadata: {
      review_status: "rejected",
      reviewed_at: new Date().toISOString(),
      reviewed_by_membership_id: finance.membershipId,
      rejection_reason: note,
      rule_id: ruleMatch.rule?.id ?? null,
      rule_summary: ruleMatch.ruleSummary,
    },
  });

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "commission_ledger_entry",
    entityId: savedEntry.id,
    action: "commission.rejected",
    summary: `Rejected commission review for event ${event.id}.`,
    metadata: {
      normalizedEventId: event.id,
    },
  });

  return {
    eventId: event.id,
    ledgerEntryId: savedEntry.id,
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
        item.ledgerEntryId && group.commissionEntryIds.includes(item.ledgerEntryId),
    )
    .map((item) => item.receivedAt ?? item.occurredAt);
  const note = normalizeOptionalText(input.note);
  const { data: batch, error: batchError } = await finance.supabase
    .from("payout_batches")
    .insert({
      organization_id: finance.organizationId,
      name: buildBatchName(group.partnerName, effectiveDates),
      status: "draft",
      currency: group.currency,
      period_start: effectiveDates.length ? effectiveDates.slice().sort()[0].slice(0, 10) : null,
      period_end: effectiveDates.length
        ? effectiveDates.slice().sort()[effectiveDates.length - 1].slice(0, 10)
        : null,
      notes: note,
    })
    .select(
      "id, name, status, currency, period_start, period_end, external_reference, approved_by_membership_id, approved_at, notes, created_at, updated_at",
    )
    .single<PayoutBatchRow>();

  if (batchError) {
    throw new ServiceError("internal_error", "Failed to create the payout batch.", {
      status: 500,
      details: { message: batchError.message },
    });
  }

  const itemPayload = readModel.commissionItems
    .filter(
      (item) =>
        item.ledgerEntryId &&
        group.commissionEntryIds.includes(item.ledgerEntryId) &&
        item.commissionAmount !== null,
    )
    .map((item) => ({
      organization_id: finance.organizationId,
      payout_batch_id: batch.id,
      commission_ledger_entry_id: item.ledgerEntryId as string,
      partner_id: group.partnerId,
      amount: item.commissionAmount as number,
      status: "pending" as const,
    }));

  const { error: itemError } = await finance.supabase
    .from("payout_batch_items")
    .insert(itemPayload);

  if (itemError) {
    throw new ServiceError("internal_error", "Failed to create payout batch items.", {
      status: 500,
      details: { message: itemError.message },
    });
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: batch.id,
    action: "payout_batch.created",
    summary: `Created payout batch ${batch.name}.`,
    metadata: {
      batchId: batch.id,
      ledgerEntryCount: itemPayload.length,
    },
  });

  return {
    batchId: batch.id,
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
      "id, payout_batch_id, commission_ledger_entry_id, partner_id, amount, status, created_at, updated_at",
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
  const { batch, batchItems } = await getBatchForAction(finance, input.batchId);
  const note = normalizeOptionalText(input.note);
  const externalReference = normalizeOptionalText(input.externalReference, 120);
  const { data: updatedBatch, error: batchError } = await finance.supabase
    .from("payout_batches")
    .update({
      status: "exported",
      external_reference: externalReference,
      notes: note ?? batch.notes,
      approved_at: new Date().toISOString(),
      approved_by_membership_id: finance.membershipId,
    })
    .eq("organization_id", finance.organizationId)
    .eq("id", batch.id)
    .select(
      "id, name, status, currency, period_start, period_end, external_reference, approved_by_membership_id, approved_at, notes, created_at, updated_at",
    )
    .single<PayoutBatchRow>();

  if (batchError) {
    throw new ServiceError("internal_error", "Failed to mark the payout batch as exported.", {
      status: 500,
      details: { message: batchError.message },
    });
  }

  if (batchItems.length > 0) {
    const { error: itemError } = await finance.supabase
      .from("payout_batch_items")
      .update({ status: "exported" })
      .eq("organization_id", finance.organizationId)
      .eq("payout_batch_id", batch.id);

    if (itemError) {
      throw new ServiceError("internal_error", "Failed to mark payout batch items as exported.", {
        status: 500,
        details: { message: itemError.message },
      });
    }
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: updatedBatch.id,
    action: "payout_batch.exported",
    summary: `Marked payout batch ${updatedBatch.name} as exported.`,
    metadata: {
      batchId: updatedBatch.id,
      externalReference,
    },
  });

  return {
    batchId: updatedBatch.id,
  };
}

export async function markPayoutBatchPaid(input: {
  batchId: string;
  note?: string | null;
}) {
  const finance = await requireFinanceContext();
  const { batch, batchItems } = await getBatchForAction(finance, input.batchId);
  const note = normalizeOptionalText(input.note);
  const { data: updatedBatch, error: batchError } = await finance.supabase
    .from("payout_batches")
    .update({
      status: "paid",
      notes: note ?? batch.notes,
      approved_at: batch.approved_at ?? new Date().toISOString(),
      approved_by_membership_id: finance.membershipId,
    })
    .eq("organization_id", finance.organizationId)
    .eq("id", batch.id)
    .select(
      "id, name, status, currency, period_start, period_end, external_reference, approved_by_membership_id, approved_at, notes, created_at, updated_at",
    )
    .single<PayoutBatchRow>();

  if (batchError) {
    throw new ServiceError("internal_error", "Failed to mark the payout batch as paid.", {
      status: 500,
      details: { message: batchError.message },
    });
  }

  if (batchItems.length > 0) {
    const ledgerEntryIds = batchItems.map((item) => item.commission_ledger_entry_id);
    const [{ error: itemError }, { error: ledgerError }] = await Promise.all([
      finance.supabase
        .from("payout_batch_items")
        .update({ status: "paid" })
        .eq("organization_id", finance.organizationId)
        .eq("payout_batch_id", batch.id),
      finance.supabase
        .from("commission_ledger_entries")
        .update({ status: "paid" })
        .eq("organization_id", finance.organizationId)
        .in("id", ledgerEntryIds),
    ]);

    if (itemError || ledgerError) {
      throw new ServiceError("internal_error", "Failed to mark payout records as paid.", {
        status: 500,
        details: {
          itemMessage: itemError?.message,
          ledgerMessage: ledgerError?.message,
        },
      });
    }
  }

  await writeAuditLog(finance.context, {
    organizationId: finance.organizationId,
    entityType: "payout_batch",
    entityId: updatedBatch.id,
    action: "payout_batch.paid",
    summary: `Marked payout batch ${updatedBatch.name} as paid.`,
    metadata: {
      batchId: updatedBatch.id,
    },
  });

  return {
    batchId: updatedBatch.id,
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
