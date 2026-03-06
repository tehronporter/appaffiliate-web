import type { PostgrestError, User } from "@supabase/supabase-js";

import { getAuthenticatedUser } from "@/lib/auth";
import { createAuthenticatedServerClient } from "@/lib/authenticated-supabase";
import {
  PHASE0_ROLE_DEFINITIONS,
  type OrganizationMembershipRecord,
  type OrganizationRecord,
  type PartnerUserRecord,
  type RoleDefinition,
  type RoleKey,
  type WorkspaceContext,
} from "@/lib/workspace-types";

const WORKSPACE_SETUP_ERROR_CODES = new Set(["42P01", "PGRST205", "42501"]);

function isWorkspaceSetupError(error: PostgrestError | null) {
  if (!error?.code) {
    return false;
  }

  return WORKSPACE_SETUP_ERROR_CODES.has(error.code);
}

async function createAuthenticatedWorkspaceClient() {
  return createAuthenticatedServerClient();
}

function getRoleDefinition(roleKey: RoleKey | null) {
  if (!roleKey) {
    return null;
  }

  return PHASE0_ROLE_DEFINITIONS.find((role) => role.key === roleKey) ?? null;
}

export async function getCurrentOrganizationMembership(
  user: User,
): Promise<OrganizationMembershipRecord | null> {
  const supabase = await createAuthenticatedWorkspaceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("organization_memberships")
    .select("id, organization_id, user_id, role_key, status")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<OrganizationMembershipRecord>();

  if (error) {
    if (isWorkspaceSetupError(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
}

export async function getCurrentOrganization(
  membership: OrganizationMembershipRecord | null,
): Promise<OrganizationRecord | null> {
  if (!membership) {
    return null;
  }

  const supabase = await createAuthenticatedWorkspaceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("organizations")
    .select("id, slug, name")
    .eq("id", membership.organization_id)
    .maybeSingle<OrganizationRecord>();

  if (error) {
    if (isWorkspaceSetupError(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
}

export async function getCurrentPartnerUser(
  user: User,
  membership: OrganizationMembershipRecord | null,
): Promise<PartnerUserRecord | null> {
  if (!membership) {
    return null;
  }

  const supabase = await createAuthenticatedWorkspaceClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("partner_users")
    .select("id, organization_id, user_id, display_name, partner_name")
    .eq("organization_id", membership.organization_id)
    .eq("user_id", user.id)
    .maybeSingle<PartnerUserRecord>();

  if (error) {
    if (isWorkspaceSetupError(error)) {
      return null;
    }

    throw new Error(error.message);
  }

  return data;
}

export async function getAvailableRoles(): Promise<{
  roles: RoleDefinition[];
  source: WorkspaceContext["source"];
}> {
  const supabase = await createAuthenticatedWorkspaceClient();

  if (!supabase) {
    return {
      roles: PHASE0_ROLE_DEFINITIONS,
      source: "missing_setup",
    };
  }

  const { data, error } = await supabase
    .from("roles")
    .select("key, name, description")
    .order("name", { ascending: true });

  if (error) {
    if (isWorkspaceSetupError(error)) {
      return {
        roles: PHASE0_ROLE_DEFINITIONS,
        source: "missing_setup",
      };
    }

    throw new Error(error.message);
  }

  return {
    roles: (data as RoleDefinition[]) ?? PHASE0_ROLE_DEFINITIONS,
    source: "database",
  };
}

export async function getCurrentWorkspaceContext(): Promise<WorkspaceContext> {
  const user = await getAuthenticatedUser();

  if (!user) {
    const { roles, source } = await getAvailableRoles();

    return {
      organization: null,
      membership: null,
      partnerUser: null,
      role: null,
      roles,
      source,
    };
  }

  return getWorkspaceContextForUser(user);
}

export async function getWorkspaceContextForUser(
  user: User,
): Promise<WorkspaceContext> {
  const { roles, source } = await getAvailableRoles();

  const membership = await getCurrentOrganizationMembership(user);
  const organization = await getCurrentOrganization(membership);
  const partnerUser = await getCurrentPartnerUser(user, membership);
  const role = getRoleDefinition(membership?.role_key ?? null);

  return {
    organization,
    membership,
    partnerUser,
    role,
    roles,
    source,
  };
}

export async function getCurrentRole() {
  const workspace = await getCurrentWorkspaceContext();

  return workspace.role;
}
