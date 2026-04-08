import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import { ORGANIZATION_ADMIN_ROLE_KEYS, requireWorkspaceRole } from "@/lib/services/permissions";
import { writeAuditLog } from "@/lib/services/audit";

export type CommissionRuleType = "revenue_share" | "flat_fee" | "cpa" | "hybrid";
export type RuleStatus = "draft" | "active" | "paused" | "archived";
export type RuleBasisMode = "gross_revenue" | "net_revenue";

type RuleRow = {
  id: string;
  organization_id: string;
  name: string;
  app_id: string | null;
  partner_id: string | null;
  promo_code_id: string | null;
  rule_type: CommissionRuleType;
  status: RuleStatus;
  currency: string;
  rate: number | string | null;
  flat_amount: number | string | null;
  priority: number;
  basis_mode: RuleBasisMode;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string;
};

export type EditableCommissionRule = {
  id: string;
  name: string;
  appId: string | null;
  partnerId: string | null;
  promoCodeId: string | null;
  ruleType: CommissionRuleType;
  status: RuleStatus;
  currency: string;
  rate: number | null;
  flatAmount: number | null;
  priority: number;
  basisMode: RuleBasisMode;
  startsAt: string | null;
  endsAt: string | null;
  updatedAt: string;
};

type SaveRuleInput = {
  name: string;
  appId?: string | null;
  partnerId?: string | null;
  promoCodeId?: string | null;
  ruleType: CommissionRuleType;
  status: RuleStatus;
  currency: string;
  rate?: string | null;
  flatAmount?: string | null;
  priority?: string | number | null;
  basisMode: RuleBasisMode;
  startsAt?: string | null;
  endsAt?: string | null;
};

function normalizeRequiredText(value: string, field: string, maxLength = 120) {
  const normalized = value.trim();

  if (!normalized) {
    throw new ServiceError("validation_error", `${field} is required.`, {
      status: 400,
    });
  }

  return normalized.slice(0, maxLength);
}

function normalizeOptionalText(value: string | null | undefined, maxLength = 255) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function normalizeRuleType(value: string): CommissionRuleType {
  if (
    value === "revenue_share" ||
    value === "flat_fee" ||
    value === "cpa" ||
    value === "hybrid"
  ) {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid rule type.", {
    status: 400,
  });
}

function normalizeRuleStatus(value: string): RuleStatus {
  if (value === "draft" || value === "active" || value === "paused" || value === "archived") {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid rule status.", {
    status: 400,
  });
}

function normalizeBasisMode(value: string): RuleBasisMode {
  if (value === "gross_revenue" || value === "net_revenue") {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid basis mode.", {
    status: 400,
  });
}

function normalizeCurrency(value: string) {
  return normalizeRequiredText(value, "Currency", 12).toUpperCase();
}

function normalizeOptionalDate(value: string | null | undefined) {
  const normalized = normalizeOptionalText(value, 40);

  if (!normalized) {
    return null;
  }

  const parsed = new Date(normalized);

  if (Number.isNaN(parsed.getTime())) {
    throw new ServiceError("validation_error", "Invalid date value.", {
      status: 400,
    });
  }

  return parsed.toISOString();
}

function normalizeOptionalRate(value: string | null | undefined) {
  const normalized = normalizeOptionalText(value, 32);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
    throw new ServiceError("validation_error", "Revenue-share rate must be between 0 and 1.", {
      status: 400,
    });
  }

  return Math.round(parsed * 10000) / 10000;
}

function normalizeOptionalMoney(value: string | null | undefined) {
  const normalized = normalizeOptionalText(value, 32);

  if (!normalized) {
    return null;
  }

  const parsed = Number(normalized.replaceAll(",", ""));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new ServiceError("validation_error", "Flat amount must be zero or greater.", {
      status: 400,
    });
  }

  return Math.round(parsed * 100) / 100;
}

function normalizePriority(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") {
    return 100;
  }

  const parsed = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 100000) {
    throw new ServiceError("validation_error", "Priority must be a whole number between 0 and 100000.", {
      status: 400,
    });
  }

  return parsed;
}

async function ensureReferenceScope(params: {
  organizationId: string;
  appId?: string | null;
  partnerId?: string | null;
  promoCodeId?: string | null;
  supabase: NonNullable<Awaited<ReturnType<typeof createServiceContext>>["supabase"]>;
}) {
  if (params.appId && params.appId !== "all") {
    const { data, error } = await params.supabase
      .from("apps")
      .select("id")
      .eq("organization_id", params.organizationId)
      .eq("id", params.appId)
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      throw new ServiceError("validation_error", "Invalid app selection.", {
        status: 400,
      });
    }
  }

  if (params.partnerId && params.partnerId !== "all") {
    const { data, error } = await params.supabase
      .from("partners")
      .select("id")
      .eq("organization_id", params.organizationId)
      .eq("id", params.partnerId)
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      throw new ServiceError("validation_error", "Invalid partner selection.", {
        status: 400,
      });
    }
  }

  if (params.promoCodeId && params.promoCodeId !== "all") {
    const { data, error } = await params.supabase
      .from("promo_codes")
      .select("id")
      .eq("organization_id", params.organizationId)
      .eq("id", params.promoCodeId)
      .maybeSingle<{ id: string }>();

    if (error || !data) {
      throw new ServiceError("validation_error", "Invalid code selection.", {
        status: 400,
      });
    }
  }
}

function buildRulePayload(
  input: SaveRuleInput,
  organizationId: string,
) {
  const name = normalizeRequiredText(input.name, "Rule name");
  const ruleType = normalizeRuleType(input.ruleType);
  const status = normalizeRuleStatus(input.status);
  const currency = normalizeCurrency(input.currency);
  const basisMode = normalizeBasisMode(input.basisMode);
  const rate = normalizeOptionalRate(input.rate ?? null);
  const flatAmount = normalizeOptionalMoney(input.flatAmount ?? null);

  if ((ruleType === "revenue_share" || ruleType === "hybrid") && rate === null) {
    throw new ServiceError("validation_error", "A revenue-share rule needs a rate.", {
      status: 400,
    });
  }

  if ((ruleType === "flat_fee" || ruleType === "cpa") && flatAmount === null) {
    throw new ServiceError("validation_error", "A fixed-amount rule needs a flat amount.", {
      status: 400,
    });
  }

  return {
    organization_id: organizationId,
    name,
    app_id: input.appId && input.appId !== "all" ? input.appId : null,
    partner_id: input.partnerId && input.partnerId !== "all" ? input.partnerId : null,
    promo_code_id: input.promoCodeId && input.promoCodeId !== "all" ? input.promoCodeId : null,
    rule_type: ruleType,
    status,
    currency,
    rate,
    flat_amount: flatAmount,
    priority: normalizePriority(input.priority),
    basis_mode: basisMode,
    starts_at: normalizeOptionalDate(input.startsAt ?? null),
    ends_at: normalizeOptionalDate(input.endsAt ?? null),
  };
}

export async function createCommissionRule(input: SaveRuleInput) {
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
    ORGANIZATION_ADMIN_ROLE_KEYS,
    "Only owners and admins can create rules.",
  );

  await ensureReferenceScope({
    organizationId: context.workspace.organization.id,
    appId: input.appId,
    partnerId: input.partnerId,
    promoCodeId: input.promoCodeId,
    supabase: context.supabase,
  });

  const payload = buildRulePayload(input, context.workspace.organization.id);
  const { data, error } = await context.supabase
    .from("commission_rules")
    .insert(payload)
    .select(
      "id, organization_id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, rate, flat_amount, priority, basis_mode, starts_at, ends_at, updated_at",
    )
    .single<RuleRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to create the commission rule.", {
      status: 500,
      details: { message: error.message },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "commission_rule",
    entityId: data.id,
    action: "commission_rule.created",
    summary: `Created commission rule ${data.name}.`,
    metadata: {
      ruleId: data.id,
      basisMode: data.basis_mode,
      ruleType: data.rule_type,
      status: data.status,
    },
  });

  return {
    id: data.id,
  };
}

export async function listEditableCommissionRules() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return [];
  }

  const { data, error } = await context.supabase
    .from("commission_rules")
    .select(
      "id, organization_id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, rate, flat_amount, priority, basis_mode, starts_at, ends_at, updated_at",
    )
    .eq("organization_id", context.workspace.organization.id)
    .order("priority", { ascending: true })
    .order("updated_at", { ascending: false })
    .returns<RuleRow[]>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to read commission rules.", {
      status: 500,
      details: { message: error.message },
    });
  }

  return (data ?? []).map((rule) => ({
    id: rule.id,
    name: rule.name,
    appId: rule.app_id,
    partnerId: rule.partner_id,
    promoCodeId: rule.promo_code_id,
    ruleType: rule.rule_type,
    status: rule.status,
    currency: rule.currency,
    rate: normalizeOptionalRate(String(rule.rate ?? "")),
    flatAmount: normalizeOptionalMoney(String(rule.flat_amount ?? "")),
    priority: rule.priority,
    basisMode: rule.basis_mode,
    startsAt: rule.starts_at,
    endsAt: rule.ends_at,
    updatedAt: rule.updated_at,
  })) satisfies EditableCommissionRule[];
}

export async function updateCommissionRule(ruleId: string, input: SaveRuleInput) {
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
    ORGANIZATION_ADMIN_ROLE_KEYS,
    "Only owners and admins can update rules.",
  );

  await ensureReferenceScope({
    organizationId: context.workspace.organization.id,
    appId: input.appId,
    partnerId: input.partnerId,
    promoCodeId: input.promoCodeId,
    supabase: context.supabase,
  });

  const payload = buildRulePayload(input, context.workspace.organization.id);
  const { data, error } = await context.supabase
    .from("commission_rules")
    .update(payload)
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", ruleId)
    .select(
      "id, organization_id, name, app_id, partner_id, promo_code_id, rule_type, status, currency, rate, flat_amount, priority, basis_mode, starts_at, ends_at, updated_at",
    )
    .single<RuleRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to update the commission rule.", {
      status: 500,
      details: { message: error.message },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "commission_rule",
    entityId: data.id,
    action: "commission_rule.updated",
    summary: `Updated commission rule ${data.name}.`,
    metadata: {
      ruleId: data.id,
      basisMode: data.basis_mode,
      ruleType: data.rule_type,
      status: data.status,
    },
  });

  return {
    id: data.id,
  };
}
