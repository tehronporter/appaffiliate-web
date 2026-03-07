import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import {
  INTERNAL_WORKSPACE_ROLE_KEYS,
  requireWorkspaceRole,
} from "@/lib/services/permissions";
import { writeAuditLog } from "@/lib/services/audit";

export type PromoCodeStatus =
  | "draft"
  | "active"
  | "paused"
  | "expired"
  | "archived";
export type PromoCodeType = "promo" | "referral" | "campaign" | "vanity";

type PromoCodeRow = {
  id: string;
  app_id: string;
  partner_id: string | null;
  code: string;
  code_type: PromoCodeType;
  status: PromoCodeStatus;
  channel: string | null;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  status: string;
};

type PartnerRow = {
  id: string;
  name: string;
  status: string;
};

export type SelectOption = {
  id: string;
  label: string;
};

export type PromoCodeView = {
  id: string;
  code: string;
  status: PromoCodeStatus;
  codeType: PromoCodeType;
  channel: string | null;
  appId: string;
  appName: string;
  appSlug: string;
  partnerId: string | null;
  partnerName: string | null;
  ownerAssigned: boolean;
  duplicateActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CodesPageData = {
  hasWorkspaceAccess: boolean;
  codes: PromoCodeView[];
  appOptions: SelectOption[];
  partnerOptions: SelectOption[];
  stats: {
    active: number;
    assigned: number;
    duplicateActive: number;
  };
};

type SavePromoCodeInput = {
  appId: string;
  partnerId?: string | null;
  code: string;
  status: PromoCodeStatus;
  codeType: PromoCodeType;
  channel?: string | null;
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

function normalizePromoCodeStatus(value: string): PromoCodeStatus {
  if (
    value === "draft" ||
    value === "active" ||
    value === "paused" ||
    value === "expired" ||
    value === "archived"
  ) {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid code status.", {
    status: 400,
  });
}

function normalizePromoCodeType(value: string): PromoCodeType {
  if (
    value === "promo" ||
    value === "referral" ||
    value === "campaign" ||
    value === "vanity"
  ) {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid code type.", {
    status: 400,
  });
}

function normalizeCodeValue(value: string) {
  return normalizeRequiredText(value, "Code", 80).toUpperCase();
}

function createDuplicateKey(row: PromoCodeRow) {
  return `${row.app_id}:${row.partner_id ?? "unassigned"}`;
}

function toSelectOptions<T extends { id: string; name: string }>(rows: T[]) {
  return rows.map((row) => ({
    id: row.id,
    label: row.name,
  }));
}

function buildCodeView(
  row: PromoCodeRow,
  appsById: Map<string, AppRow>,
  partnersById: Map<string, PartnerRow>,
  duplicateKeys: Set<string>,
): PromoCodeView {
  const app = appsById.get(row.app_id);
  const partner = row.partner_id ? partnersById.get(row.partner_id) ?? null : null;

  return {
    id: row.id,
    code: row.code,
    status: row.status,
    codeType: row.code_type,
    channel: row.channel,
    appId: row.app_id,
    appName: app?.name ?? "Unknown app",
    appSlug: app?.slug ?? "unknown-app",
    partnerId: row.partner_id,
    partnerName: partner?.name ?? null,
    ownerAssigned: Boolean(row.partner_id),
    duplicateActive: row.status === "active" && duplicateKeys.has(createDuplicateKey(row)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadProgramReferenceData(organizationId: string) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase || context.workspace.organization?.id !== organizationId) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  const [{ data: appRows, error: appError }, { data: partnerRows, error: partnerError }] =
    await Promise.all([
      context.supabase
        .from("apps")
        .select("id, slug, name, status")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true })
        .returns<AppRow[]>(),
      context.supabase
        .from("partners")
        .select("id, name, status")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true })
        .returns<PartnerRow[]>(),
    ]);

  if (appError) {
    throw new ServiceError("internal_error", "Failed to read apps.", {
      status: 500,
      details: {
        message: appError.message,
      },
    });
  }

  if (partnerError) {
    throw new ServiceError("internal_error", "Failed to read partners.", {
      status: 500,
      details: {
        message: partnerError.message,
      },
    });
  }

  return {
    apps: appRows ?? [],
    partners: partnerRows ?? [],
  };
}

export async function listWorkspacePromoCodes() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      codes: [],
      appOptions: [],
      partnerOptions: [],
      stats: {
        active: 0,
        assigned: 0,
        duplicateActive: 0,
      },
    } satisfies CodesPageData;
  }

  const { apps, partners } = await loadProgramReferenceData(
    context.workspace.organization.id,
  );

  const { data: codeRows, error: codeError } = await context.supabase
    .from("promo_codes")
    .select(
      "id, app_id, partner_id, code, code_type, status, channel, starts_at, ends_at, created_at, updated_at",
    )
    .eq("organization_id", context.workspace.organization.id)
    .order("updated_at", { ascending: false })
    .returns<PromoCodeRow[]>();

  if (codeError) {
    throw new Error(codeError.message);
  }

  const duplicateKeyCounts = new Map<string, number>();

  for (const codeRow of codeRows ?? []) {
    if (codeRow.status !== "active") {
      continue;
    }

    const key = createDuplicateKey(codeRow);
    duplicateKeyCounts.set(key, (duplicateKeyCounts.get(key) ?? 0) + 1);
  }

  const duplicateKeys = new Set(
    Array.from(duplicateKeyCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([key]) => key),
  );
  const appsById = new Map(apps.map((app) => [app.id, app]));
  const partnersById = new Map(partners.map((partner) => [partner.id, partner]));
  const codes = (codeRows ?? []).map((codeRow) =>
    buildCodeView(codeRow, appsById, partnersById, duplicateKeys),
  );

  return {
    hasWorkspaceAccess: true,
    codes,
    appOptions: toSelectOptions(apps),
    partnerOptions: toSelectOptions(partners),
    stats: {
      active: codes.filter((code) => code.status === "active").length,
      assigned: codes.filter((code) => code.ownerAssigned).length,
      duplicateActive: codes.filter((code) => code.duplicateActive).length,
    },
  } satisfies CodesPageData;
}

async function ensureAppAndPartnerScope(params: {
  organizationId: string;
  appId: string;
  partnerId?: string | null;
}) {
  const { apps, partners } = await loadProgramReferenceData(params.organizationId);
  const app = apps.find((row) => row.id === params.appId) ?? null;

  if (!app) {
    throw new ServiceError("validation_error", "Invalid app selection.", {
      status: 400,
    });
  }

  const partner =
    params.partnerId && params.partnerId !== "none"
      ? partners.find((row) => row.id === params.partnerId) ?? null
      : null;

  if (params.partnerId && params.partnerId !== "none" && !partner) {
    throw new ServiceError("validation_error", "Invalid partner selection.", {
      status: 400,
    });
  }

  return {
    app,
    partner,
  };
}

export async function createPromoCode(input: SavePromoCodeInput) {
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
    "Only internal workspace members can create codes.",
  );

  const code = normalizeCodeValue(input.code);
  const status = normalizePromoCodeStatus(input.status);
  const codeType = normalizePromoCodeType(input.codeType);
  const channel = normalizeOptionalText(input.channel);
  const { app, partner } = await ensureAppAndPartnerScope({
    organizationId: context.workspace.organization.id,
    appId: input.appId,
    partnerId: input.partnerId,
  });

  const { data, error } = await context.supabase
    .from("promo_codes")
    .insert({
      organization_id: context.workspace.organization.id,
      app_id: app.id,
      partner_id: partner?.id ?? null,
      code,
      code_type: codeType,
      status,
      channel,
    })
    .select(
      "id, app_id, partner_id, code, code_type, status, channel, starts_at, ends_at, created_at, updated_at",
    )
    .single<PromoCodeRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to create the code.", {
      status: 500,
      details: {
        requestId: context.requestId,
        message: error.message,
      },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "promo_code",
    entityId: data.id,
    action: "promo_code.created",
    summary: `Created code ${data.code}.`,
    metadata: {
      promoCodeId: data.id,
      appId: data.app_id,
      partnerId: data.partner_id,
      status: data.status,
    },
  });

  return {
    id: data.id,
  };
}

export async function updatePromoCode(
  promoCodeId: string,
  input: SavePromoCodeInput,
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
    "Only internal workspace members can update codes.",
  );

  const code = normalizeCodeValue(input.code);
  const status = normalizePromoCodeStatus(input.status);
  const codeType = normalizePromoCodeType(input.codeType);
  const channel = normalizeOptionalText(input.channel);
  const { app, partner } = await ensureAppAndPartnerScope({
    organizationId: context.workspace.organization.id,
    appId: input.appId,
    partnerId: input.partnerId,
  });

  const { data, error } = await context.supabase
    .from("promo_codes")
    .update({
      app_id: app.id,
      partner_id: partner?.id ?? null,
      code,
      code_type: codeType,
      status,
      channel,
    })
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", promoCodeId)
    .select(
      "id, app_id, partner_id, code, code_type, status, channel, starts_at, ends_at, created_at, updated_at",
    )
    .single<PromoCodeRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to update the code.", {
      status: 500,
      details: {
        requestId: context.requestId,
        message: error.message,
      },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "promo_code",
    entityId: data.id,
    action: "promo_code.updated",
    summary: `Updated code ${data.code}.`,
    metadata: {
      promoCodeId: data.id,
      appId: data.app_id,
      partnerId: data.partner_id,
      status: data.status,
    },
  });

  return {
    id: data.id,
  };
}
