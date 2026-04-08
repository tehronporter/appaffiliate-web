import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import {
  INTERNAL_WORKSPACE_ROLE_KEYS,
  requireWorkspaceRole,
} from "@/lib/services/permissions";
import { writeAuditLog } from "@/lib/services/audit";

export type PartnerStatus = "pending" | "active" | "inactive" | "archived";

type PartnerRow = {
  id: string;
  slug: string;
  name: string;
  partner_type: string;
  status: PartnerStatus;
  contact_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PartnerCodeRow = {
  partner_id: string | null;
  app_id: string;
};

type AppRow = {
  id: string;
  name: string;
};

export type PartnerView = {
  id: string;
  slug: string;
  name: string;
  status: PartnerStatus;
  contactEmail: string | null;
  notes: string | null;
  partnerType: string;
  assignedCodes: number;
  appNames: string[];
  updatedAt: string;
};

export type PartnersPageData = {
  hasWorkspaceAccess: boolean;
  partners: PartnerView[];
  stats: {
    pending: number;
    active: number;
    inactive: number;
    archived: number;
  };
};

type SavePartnerInput = {
  name: string;
  contactEmail?: string | null;
  status: PartnerStatus;
  notes?: string | null;
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

function normalizePartnerStatus(value: string): PartnerStatus {
  if (
    value === "pending" ||
    value === "active" ||
    value === "inactive" ||
    value === "archived"
  ) {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid partner status.", {
    status: 400,
  });
}

function normalizeEmail(value: string | null | undefined) {
  const normalized = normalizeOptionalText(value, 320);

  if (!normalized) {
    return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new ServiceError("validation_error", "Invalid email address.", {
      status: 400,
    });
  }

  return normalized.toLowerCase();
}

function slugifyName(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return slug || "partner";
}

async function reservePartnerSlug(organizationId: string, name: string) {
  const supabase = (await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  })).supabase;

  if (!supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const baseSlug = slugifyName(name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("partners")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", candidate)
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new ServiceError(
        "internal_error",
        "Failed to reserve a partner slug.",
        {
          status: 500,
          details: {
            message: error.message,
          },
        },
      );
    }

    if (!data) {
      return candidate;
    }
  }

  throw new ServiceError("conflict", "Unable to reserve a unique partner slug.", {
    status: 409,
  });
}

function toPartnerView(
  row: PartnerRow,
  codeRows: PartnerCodeRow[],
  appsById: Map<string, AppRow>,
): PartnerView {
  const partnerCodes = codeRows.filter((codeRow) => codeRow.partner_id === row.id);
  const appNames = Array.from(
    new Set(
      partnerCodes
        .map((codeRow) => appsById.get(codeRow.app_id)?.name ?? null)
        .filter((appName): appName is string => Boolean(appName)),
    ),
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    contactEmail: row.contact_email,
    notes: row.notes,
    partnerType: row.partner_type,
    assignedCodes: partnerCodes.length,
    appNames,
    updatedAt: row.updated_at,
  };
}

export async function listWorkspacePartners() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      partners: [],
      stats: {
        pending: 0,
        active: 0,
        inactive: 0,
        archived: 0,
      },
    } satisfies PartnersPageData;
  }

  const [{ data: partnerRows, error: partnerError }, { data: codeRows, error: codeError }] =
    await Promise.all([
      context.supabase
        .from("partners")
        .select(
          "id, slug, name, partner_type, status, contact_email, notes, created_at, updated_at",
        )
        .eq("organization_id", context.workspace.organization.id)
        .order("updated_at", { ascending: false })
        .returns<PartnerRow[]>(),
      context.supabase
        .from("promo_codes")
        .select("partner_id, app_id")
        .eq("organization_id", context.workspace.organization.id)
        .returns<PartnerCodeRow[]>(),
    ]);

  if (partnerError) {
    throw new Error(partnerError.message);
  }

  if (codeError) {
    throw new Error(codeError.message);
  }

  const appIds = Array.from(
    new Set((codeRows ?? []).map((codeRow) => codeRow.app_id)),
  );
  let appsById = new Map<string, AppRow>();

  if (appIds.length > 0) {
    const { data: appRows, error: appError } = await context.supabase
      .from("apps")
      .select("id, name")
      .in("id", appIds)
      .returns<AppRow[]>();

    if (appError) {
      throw new Error(appError.message);
    }

    appsById = new Map((appRows ?? []).map((appRow) => [appRow.id, appRow]));
  }

  const partners = (partnerRows ?? []).map((partnerRow) =>
    toPartnerView(partnerRow, codeRows ?? [], appsById),
  );

  return {
    hasWorkspaceAccess: true,
    partners,
    stats: {
      pending: partners.filter((partner) => partner.status === "pending").length,
      active: partners.filter((partner) => partner.status === "active").length,
      inactive: partners.filter((partner) => partner.status === "inactive").length,
      archived: partners.filter((partner) => partner.status === "archived").length,
    },
  } satisfies PartnersPageData;
}

export async function createPartner(input: SavePartnerInput) {
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
    "Only internal workspace members can create partners.",
  );

  const name = normalizeRequiredText(input.name, "Partner name");
  const status = normalizePartnerStatus(input.status);
  const contactEmail = normalizeEmail(input.contactEmail);
  const notes = normalizeOptionalText(input.notes);
  const slug = await reservePartnerSlug(context.workspace.organization.id, name);

  const { data, error } = await context.supabase
    .from("partners")
    .insert({
      organization_id: context.workspace.organization.id,
      slug,
      name,
      status,
      partner_type: "affiliate",
      contact_email: contactEmail,
      notes,
    })
    .select(
      "id, slug, name, partner_type, status, contact_email, notes, created_at, updated_at",
    )
    .single<PartnerRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to create the partner.", {
      status: 500,
      details: {
        requestId: context.requestId,
        message: error.message,
      },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "partner",
    entityId: data.id,
    action: "partner.created",
    summary: `Created partner ${data.name}.`,
    metadata: {
      partnerId: data.id,
      status: data.status,
    },
  });

  return {
    id: data.id,
    slug: data.slug,
  };
}

export async function updatePartner(
  partnerId: string,
  input: SavePartnerInput,
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
    "Only internal workspace members can update partners.",
  );

  const name = normalizeRequiredText(input.name, "Partner name");
  const status = normalizePartnerStatus(input.status);
  const contactEmail = normalizeEmail(input.contactEmail);
  const notes = normalizeOptionalText(input.notes);

  const { data, error } = await context.supabase
    .from("partners")
    .update({
      name,
      status,
      contact_email: contactEmail,
      notes,
    })
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", partnerId)
    .select(
      "id, slug, name, partner_type, status, contact_email, notes, created_at, updated_at",
    )
    .single<PartnerRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to update the partner.", {
      status: 500,
      details: {
        requestId: context.requestId,
        message: error.message,
      },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "partner",
    entityId: data.id,
    action: "partner.updated",
    summary: `Updated partner ${data.name}.`,
    metadata: {
      partnerId: data.id,
      status: data.status,
    },
  });

  return {
    id: data.id,
    slug: data.slug,
  };
}
