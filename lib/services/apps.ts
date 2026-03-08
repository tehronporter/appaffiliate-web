import "server-only";

import { randomBytes } from "node:crypto";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import {
  INTERNAL_WORKSPACE_ROLE_KEYS,
  requireWorkspaceRole,
} from "@/lib/services/permissions";
import { isWorkspaceSetupError } from "@/lib/supabase-errors";
import { writeAuditLog } from "@/lib/services/audit";

export type AppStatus = "draft" | "active" | "paused" | "archived";
export type AppleFeeMode = "standard_30" | "small_business_15" | "custom";

type AppRow = {
  id: string;
  slug: string;
  name: string;
  status: AppStatus;
  bundle_id: string | null;
  app_store_id: string | null;
  apple_team_id: string | null;
  timezone: string;
  ingest_key: string | null;
  apple_fee_mode: AppleFeeMode;
  apple_fee_bps: number | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceAppView = {
  id: string;
  slug: string;
  name: string;
  status: AppStatus;
  bundleId: string | null;
  appStoreId: string | null;
  appleTeamId: string | null;
  timezone: string;
  ingestKey: string | null;
  appleFeeMode: AppleFeeMode;
  appleFeeBps: number | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceAppsData = {
  hasWorkspaceAccess: boolean;
  apps: WorkspaceAppView[];
};

type SaveAppInput = {
  name: string;
  bundleId?: string | null;
  appStoreId?: string | null;
  appleTeamId?: string | null;
  timezone?: string | null;
  appleFeeMode: AppleFeeMode;
  appleFeeBps?: string | number | null;
  status?: AppStatus;
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

function normalizeStatus(value: string | null | undefined): AppStatus {
  if (!value || value === "active") {
    return "active";
  }

  if (value === "draft" || value === "paused" || value === "archived") {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid app status.", {
    status: 400,
  });
}

function normalizeTimezone(value: string | null | undefined) {
  return normalizeOptionalText(value, 80) ?? "UTC";
}

function normalizeFeeMode(value: string): AppleFeeMode {
  if (
    value === "standard_30" ||
    value === "small_business_15" ||
    value === "custom"
  ) {
    return value;
  }

  throw new ServiceError("validation_error", "Invalid Apple fee mode.", {
    status: 400,
  });
}

function normalizeFeeBps(value: string | number | null | undefined, mode: AppleFeeMode) {
  if (mode !== "custom") {
    return null;
  }

  if (value === null || value === undefined || value === "") {
    throw new ServiceError("validation_error", "Custom Apple fee bps is required.", {
      status: 400,
    });
  }

  const parsed = typeof value === "number" ? value : Number(String(value).trim());

  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10000) {
    throw new ServiceError("validation_error", "Custom Apple fee bps must be between 0 and 10000.", {
      status: 400,
    });
  }

  return parsed;
}

function slugifyName(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

  return slug || "app";
}

async function reserveAppSlug(organizationId: string, name: string) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const baseSlug = slugifyName(name);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await context.supabase
      .from("apps")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("slug", candidate)
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new ServiceError("internal_error", "Failed to reserve an app slug.", {
        status: 500,
        details: { message: error.message },
      });
    }

    if (!data) {
      return candidate;
    }
  }

  throw new ServiceError("conflict", "Unable to reserve a unique app slug.", {
    status: 409,
  });
}

async function reserveIngestKey(organizationId: string) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  for (let attempt = 0; attempt < 20; attempt += 1) {
    const candidate = randomBytes(18).toString("base64url");
    const { data, error } = await context.supabase
      .from("apps")
      .select("id")
      .eq("organization_id", organizationId)
      .eq("ingest_key", candidate)
      .maybeSingle<{ id: string }>();

    if (error) {
      throw new ServiceError("internal_error", "Failed to reserve an ingest key.", {
        status: 500,
        details: { message: error.message },
      });
    }

    if (!data) {
      return candidate;
    }
  }

  throw new ServiceError("conflict", "Unable to reserve a unique ingest key.", {
    status: 409,
  });
}

function toWorkspaceAppView(row: AppRow): WorkspaceAppView {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    status: row.status,
    bundleId: row.bundle_id,
    appStoreId: row.app_store_id,
    appleTeamId: row.apple_team_id,
    timezone: row.timezone,
    ingestKey: row.ingest_key,
    appleFeeMode: row.apple_fee_mode,
    appleFeeBps: row.apple_fee_bps,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listWorkspaceApps() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      apps: [],
    } satisfies WorkspaceAppsData;
  }

  const { data, error } = await context.supabase
    .from("apps")
    .select(
      "id, slug, name, status, bundle_id, app_store_id, apple_team_id, timezone, ingest_key, apple_fee_mode, apple_fee_bps, created_at, updated_at",
    )
    .eq("organization_id", context.workspace.organization.id)
    .order("created_at", { ascending: true })
    .returns<AppRow[]>();

  if (error) {
    if (isWorkspaceSetupError(error)) {
      return {
        hasWorkspaceAccess: true,
        apps: [],
      } satisfies WorkspaceAppsData;
    }

    throw new Error(error.message);
  }

  return {
    hasWorkspaceAccess: true,
    apps: (data ?? []).map(toWorkspaceAppView),
  } satisfies WorkspaceAppsData;
}

export async function getPrimaryWorkspaceApp() {
  const data = await listWorkspaceApps();
  return data.apps[0] ?? null;
}

export async function createApp(input: SaveAppInput) {
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
    "Only internal workspace members can create apps.",
  );

  const name = normalizeRequiredText(input.name, "App name");
  const appleFeeMode = normalizeFeeMode(input.appleFeeMode);
  const appleFeeBps = normalizeFeeBps(input.appleFeeBps ?? null, appleFeeMode);
  const slug = await reserveAppSlug(context.workspace.organization.id, name);
  const ingestKey = await reserveIngestKey(context.workspace.organization.id);

  const { data, error } = await context.supabase
    .from("apps")
    .insert({
      organization_id: context.workspace.organization.id,
      slug,
      name,
      platform: "ios",
      status: normalizeStatus(input.status),
      bundle_id: normalizeOptionalText(input.bundleId, 160),
      app_store_id: normalizeOptionalText(input.appStoreId, 120),
      apple_team_id: normalizeOptionalText(input.appleTeamId, 120),
      timezone: normalizeTimezone(input.timezone),
      ingest_key: ingestKey,
      apple_fee_mode: appleFeeMode,
      apple_fee_bps: appleFeeBps,
    })
    .select(
      "id, slug, name, status, bundle_id, app_store_id, apple_team_id, timezone, ingest_key, apple_fee_mode, apple_fee_bps, created_at, updated_at",
    )
    .single<AppRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to create the app.", {
      status: 500,
      details: { message: error.message, requestId: context.requestId },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "app",
    entityId: data.id,
    action: "app.created",
    summary: `Created app ${data.name}.`,
    metadata: {
      appId: data.id,
      slug: data.slug,
      ingestKeyAssigned: Boolean(data.ingest_key),
      appleFeeMode: data.apple_fee_mode,
      appleFeeBps: data.apple_fee_bps,
    },
  });

  return toWorkspaceAppView(data);
}

export async function updateApp(appId: string, input: SaveAppInput) {
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
    "Only internal workspace members can update apps.",
  );

  const name = normalizeRequiredText(input.name, "App name");
  const appleFeeMode = normalizeFeeMode(input.appleFeeMode);
  const appleFeeBps = normalizeFeeBps(input.appleFeeBps ?? null, appleFeeMode);

  const { data, error } = await context.supabase
    .from("apps")
    .update({
      name,
      status: normalizeStatus(input.status),
      bundle_id: normalizeOptionalText(input.bundleId, 160),
      app_store_id: normalizeOptionalText(input.appStoreId, 120),
      apple_team_id: normalizeOptionalText(input.appleTeamId, 120),
      timezone: normalizeTimezone(input.timezone),
      apple_fee_mode: appleFeeMode,
      apple_fee_bps: appleFeeBps,
    })
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", appId)
    .select(
      "id, slug, name, status, bundle_id, app_store_id, apple_team_id, timezone, ingest_key, apple_fee_mode, apple_fee_bps, created_at, updated_at",
    )
    .single<AppRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to update the app.", {
      status: 500,
      details: { message: error.message, requestId: context.requestId },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "app",
    entityId: data.id,
    action: "app.updated",
    summary: `Updated app ${data.name}.`,
    metadata: {
      appId: data.id,
      appleFeeMode: data.apple_fee_mode,
      appleFeeBps: data.apple_fee_bps,
    },
  });

  return toWorkspaceAppView(data);
}
