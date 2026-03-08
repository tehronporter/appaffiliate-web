import "server-only";

import { createServiceSupabaseClient } from "@/lib/service-supabase";
import { getAuthenticatedUser } from "@/lib/auth";
import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import { writeAuditLog } from "@/lib/services/audit";
import {
  INTERNAL_WORKSPACE_ROLE_KEYS,
  ORGANIZATION_ADMIN_ROLE_KEYS,
  requireWorkspaceRole,
} from "@/lib/services/permissions";
import type { RoleKey } from "@/lib/workspace-types";

type InvitationType = "internal_team" | "partner_portal";
type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

type InvitationRow = {
  id: string;
  organization_id: string;
  email: string;
  invite_type: InvitationType;
  role_key: RoleKey;
  partner_id: string | null;
  status: InvitationStatus;
  invited_by_membership_id: string | null;
  expires_at: string;
  accepted_at: string | null;
  accepted_user_id: string | null;
  created_at: string;
  updated_at: string;
};

type PartnerRow = {
  id: string;
  name: string;
  contact_email: string | null;
};

export type WorkspaceInvitationView = {
  id: string;
  email: string;
  inviteType: InvitationType;
  roleKey: RoleKey;
  roleLabel: string;
  partnerId: string | null;
  partnerName: string | null;
  status: InvitationStatus;
  statusLabel: string;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
};

function normalizeOptionalText(value: string | null | undefined, maxLength = 320) {
  if (!value) {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function normalizeEmail(value: string | null | undefined) {
  const normalized = normalizeOptionalText(value, 320);

  if (!normalized) {
    throw new ServiceError("validation_error", "Email is required.", {
      status: 400,
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new ServiceError("validation_error", "Invalid email address.", {
      status: 400,
    });
  }

  return normalized.toLowerCase();
}

function normalizeDisplayName(value: string | null | undefined, fallback: string) {
  return normalizeOptionalText(value, 120) ?? fallback;
}

function titleCaseLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!appUrl) {
    throw new Error("Missing required environment variable: NEXT_PUBLIC_APP_URL");
  }

  return appUrl.replace(/\/+$/, "");
}

async function findPendingInvitation(params: {
  organizationId: string;
  email: string;
  inviteType: InvitationType;
  partnerId?: string | null;
}) {
  const serviceSupabase = createServiceSupabaseClient();
  let query = serviceSupabase
    .from("workspace_invitations")
    .select(
      "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
    )
    .eq("organization_id", params.organizationId)
    .eq("email", params.email)
    .eq("invite_type", params.inviteType)
    .eq("status", "pending");

  query =
    params.partnerId
      ? query.eq("partner_id", params.partnerId)
      : query.is("partner_id", null);

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<InvitationRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to read pending invitations.", {
      status: 500,
      details: { message: error.message },
    });
  }

  return data;
}

async function upsertInvitationRecord(params: {
  organizationId: string;
  email: string;
  inviteType: InvitationType;
  roleKey: RoleKey;
  partnerId?: string | null;
  invitedByMembershipId?: string | null;
}) {
  const serviceSupabase = createServiceSupabaseClient();
  const existing = await findPendingInvitation({
    organizationId: params.organizationId,
    email: params.email,
    inviteType: params.inviteType,
    partnerId: params.partnerId,
  });

  if (existing) {
    const { data, error } = await serviceSupabase
      .from("workspace_invitations")
      .update({
        role_key: params.roleKey,
        invited_by_membership_id: params.invitedByMembershipId ?? existing.invited_by_membership_id,
        status: "pending",
        expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
      })
      .eq("id", existing.id)
      .select(
        "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
      )
      .single<InvitationRow>();

    if (error) {
      throw new ServiceError("internal_error", "Failed to refresh the workspace invitation.", {
        status: 500,
        details: { message: error.message },
      });
    }

    return data;
  }

  const { data, error } = await serviceSupabase
    .from("workspace_invitations")
    .insert({
      organization_id: params.organizationId,
      email: params.email,
      invite_type: params.inviteType,
      role_key: params.roleKey,
      partner_id: params.partnerId ?? null,
      status: "pending",
      invited_by_membership_id: params.invitedByMembershipId ?? null,
    })
    .select(
      "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
    )
    .single<InvitationRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to create the workspace invitation.", {
      status: 500,
      details: { message: error.message },
    });
  }

  return data;
}

async function sendSupabaseInvite(email: string) {
  const serviceSupabase = createServiceSupabaseClient();

  const { error } = await serviceSupabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${getAppUrl()}/accept-invite`,
  });

  if (!error) {
    return {
      delivery: "email_invite" as const,
    };
  }

  if (/already been registered|already registered|exists/i.test(error.message)) {
    return {
      delivery: "existing_account" as const,
    };
  }

  throw new ServiceError("internal_error", "Failed to send the invitation email.", {
    status: 500,
    details: { message: error.message },
  });
}

export async function listWorkspaceInvitations() {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.workspace.organization) {
    return [];
  }

  requireWorkspaceRole(
    context,
    INTERNAL_WORKSPACE_ROLE_KEYS,
    "Only internal workspace members can review invitations.",
  );

  const serviceSupabase = createServiceSupabaseClient();
  const [{ data: invites, error: invitesError }, { data: partnerRows, error: partnerError }] =
    await Promise.all([
      serviceSupabase
        .from("workspace_invitations")
        .select(
          "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
        )
        .eq("organization_id", context.workspace.organization.id)
        .order("created_at", { ascending: false })
        .returns<InvitationRow[]>(),
      serviceSupabase
        .from("partners")
        .select("id, name, contact_email")
        .eq("organization_id", context.workspace.organization.id)
        .returns<PartnerRow[]>(),
    ]);

  if (invitesError || partnerError) {
    throw new ServiceError("internal_error", "Failed to load workspace invitations.", {
      status: 500,
      details: {
        invitesMessage: invitesError?.message,
        partnerMessage: partnerError?.message,
      },
    });
  }

  const partnersById = new Map((partnerRows ?? []).map((partner) => [partner.id, partner]));

  return (invites ?? []).map((invite) => ({
    id: invite.id,
    email: invite.email,
    inviteType: invite.invite_type,
    roleKey: invite.role_key,
    roleLabel: titleCaseLabel(invite.role_key),
    partnerId: invite.partner_id,
    partnerName: invite.partner_id ? partnersById.get(invite.partner_id)?.name ?? null : null,
    status: invite.status,
    statusLabel: titleCaseLabel(invite.status),
    expiresAt: invite.expires_at,
    acceptedAt: invite.accepted_at,
    createdAt: invite.created_at,
  })) satisfies WorkspaceInvitationView[];
}

export async function inviteInternalTeamMember(input: {
  email: string;
  roleKey: Extract<RoleKey, "admin" | "finance" | "analyst">;
}) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.workspace.organization) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  requireWorkspaceRole(
    context,
    ORGANIZATION_ADMIN_ROLE_KEYS,
    "Only owners and admins can invite internal team members.",
  );

  const email = normalizeEmail(input.email);
  const invitation = await upsertInvitationRecord({
    organizationId: context.workspace.organization.id,
    email,
    inviteType: "internal_team",
    roleKey: input.roleKey,
    invitedByMembershipId: context.workspace.membership?.id ?? null,
  });
  const delivery = await sendSupabaseInvite(email);

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "workspace_invitation",
    entityId: invitation.id,
    action: "workspace_invitation.internal_sent",
    summary: `Invited ${email} into the internal workspace.`,
    metadata: {
      inviteId: invitation.id,
      roleKey: invitation.role_key,
      delivery: delivery.delivery,
    },
  });

  return {
    invitationId: invitation.id,
    delivery: delivery.delivery,
  };
}

export async function invitePartnerPortalUser(input: {
  partnerId: string;
  email: string;
  displayName?: string | null;
}) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.workspace.organization || !context.supabase) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  requireWorkspaceRole(
    context,
    INTERNAL_WORKSPACE_ROLE_KEYS,
    "Only internal workspace members can invite creators.",
  );

  const email = normalizeEmail(input.email);
  const { data: partner, error: partnerError } = await context.supabase
    .from("partners")
    .select("id, name, contact_email")
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", input.partnerId)
    .single<PartnerRow>();

  if (partnerError) {
    throw new ServiceError("not_found", "Creator record was not found.", {
      status: 404,
      details: { message: partnerError.message },
    });
  }

  const invitation = await upsertInvitationRecord({
    organizationId: context.workspace.organization.id,
    email,
    inviteType: "partner_portal",
    roleKey: "partner_user",
    partnerId: partner.id,
    invitedByMembershipId: context.workspace.membership?.id ?? null,
  });
  const delivery = await sendSupabaseInvite(email);

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "workspace_invitation",
    entityId: invitation.id,
    action: "workspace_invitation.partner_sent",
    summary: `Invited ${email} to the creator portal for ${partner.name}.`,
    metadata: {
      inviteId: invitation.id,
      partnerId: partner.id,
      delivery: delivery.delivery,
      displayName: normalizeDisplayName(input.displayName, partner.name),
    },
  });

  return {
    invitationId: invitation.id,
    delivery: delivery.delivery,
  };
}

export async function revokeWorkspaceInvitation(invitationId: string) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.workspace.organization) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  requireWorkspaceRole(
    context,
    INTERNAL_WORKSPACE_ROLE_KEYS,
    "Only internal workspace members can revoke invites.",
  );

  const serviceSupabase = createServiceSupabaseClient();
  const { data, error } = await serviceSupabase
    .from("workspace_invitations")
    .update({
      status: "revoked",
    })
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", invitationId)
    .select(
      "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
    )
    .single<InvitationRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to revoke the invite.", {
      status: 500,
      details: { message: error.message },
    });
  }

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "workspace_invitation",
    entityId: data.id,
    action: "workspace_invitation.revoked",
    summary: `Revoked workspace invitation for ${data.email}.`,
    metadata: {
      inviteId: data.id,
      inviteType: data.invite_type,
    },
  });

  return {
    invitationId: data.id,
  };
}

export async function resendWorkspaceInvitation(invitationId: string) {
  const context = await createServiceContext({
    requireAuth: true,
    requireOrganization: true,
  });

  if (!context.workspace.organization) {
    throw new ServiceError("forbidden", "No active workspace was found.", {
      status: 403,
    });
  }

  requireWorkspaceRole(
    context,
    INTERNAL_WORKSPACE_ROLE_KEYS,
    "Only internal workspace members can resend invites.",
  );

  const serviceSupabase = createServiceSupabaseClient();
  const { data, error } = await serviceSupabase
    .from("workspace_invitations")
    .update({
      status: "pending",
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
    })
    .eq("organization_id", context.workspace.organization.id)
    .eq("id", invitationId)
    .select(
      "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
    )
    .single<InvitationRow>();

  if (error) {
    throw new ServiceError("internal_error", "Failed to refresh the invite.", {
      status: 500,
      details: { message: error.message },
    });
  }

  const delivery = await sendSupabaseInvite(data.email);

  await writeAuditLog(context, {
    organizationId: context.workspace.organization.id,
    entityType: "workspace_invitation",
    entityId: data.id,
    action: "workspace_invitation.resent",
    summary: `Resent workspace invitation for ${data.email}.`,
    metadata: {
      inviteId: data.id,
      inviteType: data.invite_type,
      delivery: delivery.delivery,
    },
  });

  return {
    invitationId: data.id,
    delivery: delivery.delivery,
  };
}

export async function acceptPendingInvitation() {
  const user = await getAuthenticatedUser();

  if (!user?.email) {
    throw new ServiceError("unauthenticated", "You must be signed in to accept an invite.", {
      status: 401,
    });
  }

  const serviceSupabase = createServiceSupabaseClient();
  const email = user.email.toLowerCase();
  const { data: invite, error: inviteError } = await serviceSupabase
    .from("workspace_invitations")
    .select(
      "id, organization_id, email, invite_type, role_key, partner_id, status, invited_by_membership_id, expires_at, accepted_at, accepted_user_id, created_at, updated_at",
    )
    .eq("email", email)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle<InvitationRow>();

  if (inviteError) {
    throw new ServiceError("internal_error", "Failed to load the pending invite.", {
      status: 500,
      details: { message: inviteError.message },
    });
  }

  if (!invite) {
    throw new ServiceError("not_found", "No pending workspace invite was found for this account.", {
      status: 404,
    });
  }

  if (invite.invite_type === "internal_team") {
    const { error: membershipError } = await serviceSupabase
      .from("organization_memberships")
      .upsert(
        {
          organization_id: invite.organization_id,
          user_id: user.id,
          role_key: invite.role_key,
          status: "active",
        },
        {
          onConflict: "organization_id,user_id",
        },
      );

    if (membershipError) {
      throw new ServiceError("internal_error", "Failed to activate the internal workspace invite.", {
        status: 500,
        details: { message: membershipError.message },
      });
    }
  } else {
    if (!invite.partner_id) {
      throw new ServiceError("internal_error", "This creator invite is missing its partner link.", {
        status: 500,
      });
    }

    const { data: partner, error: partnerError } = await serviceSupabase
      .from("partners")
      .select("id, name, contact_email")
      .eq("organization_id", invite.organization_id)
      .eq("id", invite.partner_id)
      .single<PartnerRow>();

    if (partnerError) {
      throw new ServiceError("internal_error", "Failed to load the linked creator record.", {
        status: 500,
        details: { message: partnerError.message },
      });
    }

    const displayName = normalizeDisplayName(
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.name === "string"
          ? user.user_metadata.name
          : null,
      partner.name,
    );

    const [{ error: membershipError }, { error: partnerUserError }] = await Promise.all([
      serviceSupabase.from("organization_memberships").upsert(
        {
          organization_id: invite.organization_id,
          user_id: user.id,
          role_key: "partner_user",
          status: "active",
        },
        {
          onConflict: "organization_id,user_id",
        },
      ),
      serviceSupabase.from("partner_users").upsert(
        {
          organization_id: invite.organization_id,
          user_id: user.id,
          partner_id: partner.id,
          display_name: displayName,
          partner_name: partner.name,
        },
        {
          onConflict: "organization_id,user_id",
        },
      ),
    ]);

    if (membershipError || partnerUserError) {
      throw new ServiceError("internal_error", "Failed to activate the creator portal invite.", {
        status: 500,
        details: {
          membershipMessage: membershipError?.message,
          partnerUserMessage: partnerUserError?.message,
        },
      });
    }
  }

  const { error: updateInviteError } = await serviceSupabase
    .from("workspace_invitations")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
      accepted_user_id: user.id,
    })
    .eq("id", invite.id);

  if (updateInviteError) {
    throw new ServiceError("internal_error", "Failed to finalize the workspace invite.", {
      status: 500,
      details: { message: updateInviteError.message },
    });
  }

  return {
    redirectTo: invite.invite_type === "partner_portal" ? "/portal" : "/dashboard",
    organizationId: invite.organization_id,
    invitationId: invite.id,
    inviteType: invite.invite_type,
  };
}
