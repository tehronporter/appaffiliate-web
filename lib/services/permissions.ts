import type { ServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import type { RoleKey } from "@/lib/workspace-types";

export const INTERNAL_WORKSPACE_ROLE_KEYS = [
  "owner",
  "admin",
  "finance",
  "analyst",
] as const satisfies readonly RoleKey[];

export const PARTNER_PORTAL_ROLE_KEYS = [
  "partner_user",
] as const satisfies readonly RoleKey[];

export const ORGANIZATION_ADMIN_ROLE_KEYS = [
  "owner",
  "admin",
] as const satisfies readonly RoleKey[];

export function getWorkspaceRoleKey(context: ServiceContext): RoleKey | null {
  return context.workspace.role?.key ?? null;
}

export function hasWorkspaceRole(
  context: ServiceContext,
  allowedRoles: readonly RoleKey[],
) {
  const roleKey = getWorkspaceRoleKey(context);

  return roleKey ? allowedRoles.includes(roleKey) : false;
}

export function isInternalWorkspaceRole(roleKey: RoleKey | null) {
  return roleKey
    ? INTERNAL_WORKSPACE_ROLE_KEYS.some((allowedRole) => allowedRole === roleKey)
    : false;
}

export function requireWorkspaceRole(
  context: ServiceContext,
  allowedRoles: readonly RoleKey[],
  message: string,
) {
  if (!hasWorkspaceRole(context, allowedRoles)) {
    throw new ServiceError("forbidden", message, {
      status: 403,
    });
  }
}
