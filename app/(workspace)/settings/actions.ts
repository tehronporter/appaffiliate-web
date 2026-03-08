"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createApp,
  updateApp,
} from "@/lib/services/apps";
import {
  inviteInternalTeamMember,
  resendWorkspaceInvitation,
  revokeWorkspaceInvitation,
} from "@/lib/services/invitations";
import {
  createCommissionRule,
  updateCommissionRule,
} from "@/lib/services/rules";
import {
  updateOrganizationSettings,
  updateTeamMemberRole,
} from "@/lib/services/settings";

function buildSettingsHref(pathname: string, notice: string) {
  const search = new URLSearchParams();
  search.set("notice", notice);
  return `${pathname}?${search.toString()}`;
}

export async function updateOrganizationSettingsAction(formData: FormData) {
  try {
    await updateOrganizationSettings({
      displayName: String(formData.get("displayName") ?? ""),
    });

    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/settings/organization");
    revalidatePath("/settings/audit");
    redirect(buildSettingsHref("/settings/organization", "organization-saved"));
  } catch {
    redirect(buildSettingsHref("/settings/organization", "organization-error"));
  }
}

export async function saveWorkspaceAppAction(formData: FormData) {
  const appId = String(formData.get("appId") ?? "");

  try {
    if (appId) {
      await updateApp(appId, {
        name: String(formData.get("name") ?? ""),
        bundleId: String(formData.get("bundleId") ?? ""),
        appStoreId: String(formData.get("appStoreId") ?? ""),
        appleTeamId: String(formData.get("appleTeamId") ?? ""),
        timezone: String(formData.get("timezone") ?? "UTC"),
        appleFeeMode: String(formData.get("appleFeeMode") ?? "standard_30") as
          | "standard_30"
          | "small_business_15"
          | "custom",
        appleFeeBps: String(formData.get("appleFeeBps") ?? ""),
      });
    } else {
      await createApp({
        name: String(formData.get("name") ?? ""),
        bundleId: String(formData.get("bundleId") ?? ""),
        appStoreId: String(formData.get("appStoreId") ?? ""),
        appleTeamId: String(formData.get("appleTeamId") ?? ""),
        timezone: String(formData.get("timezone") ?? "UTC"),
        appleFeeMode: String(formData.get("appleFeeMode") ?? "standard_30") as
          | "standard_30"
          | "small_business_15"
          | "custom",
        appleFeeBps: String(formData.get("appleFeeBps") ?? ""),
      });
    }

    revalidatePath("/dashboard");
    revalidatePath("/onboarding");
    revalidatePath("/apple-health");
    revalidatePath("/settings");
    revalidatePath("/settings/organization");
    redirect(buildSettingsHref("/settings/organization", "app-saved"));
  } catch {
    redirect(buildSettingsHref("/settings/organization", "app-error"));
  }
}

export async function updateTeamMemberRoleAction(formData: FormData) {
  try {
    await updateTeamMemberRole({
      membershipId: String(formData.get("membershipId") ?? ""),
      roleKey: String(formData.get("roleKey") ?? ""),
    });

    revalidatePath("/settings");
    revalidatePath("/settings/team");
    revalidatePath("/settings/audit");
    redirect(buildSettingsHref("/settings/team", "team-role-saved"));
  } catch {
    redirect(buildSettingsHref("/settings/team", "team-role-error"));
  }
}

export async function inviteTeamMemberAction(formData: FormData) {
  try {
    await inviteInternalTeamMember({
      email: String(formData.get("email") ?? ""),
      roleKey: String(formData.get("roleKey") ?? "analyst") as "admin" | "finance" | "analyst",
    });

    revalidatePath("/settings");
    revalidatePath("/settings/team");
    revalidatePath("/settings/audit");
    redirect(buildSettingsHref("/settings/team", "team-invite-sent"));
  } catch {
    redirect(buildSettingsHref("/settings/team", "team-invite-error"));
  }
}

export async function resendTeamInviteAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");

  try {
    await resendWorkspaceInvitation(invitationId);
    revalidatePath("/settings/team");
    revalidatePath("/settings/audit");
    redirect(buildSettingsHref("/settings/team", "team-invite-resent"));
  } catch {
    redirect(buildSettingsHref("/settings/team", "team-invite-error"));
  }
}

export async function revokeTeamInviteAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");

  try {
    await revokeWorkspaceInvitation(invitationId);
    revalidatePath("/settings/team");
    revalidatePath("/settings/audit");
    redirect(buildSettingsHref("/settings/team", "team-invite-revoked"));
  } catch {
    redirect(buildSettingsHref("/settings/team", "team-invite-error"));
  }
}

export async function createCommissionRuleAction(formData: FormData) {
  try {
    await createCommissionRule({
      name: String(formData.get("name") ?? ""),
      appId: String(formData.get("appId") ?? "") || null,
      partnerId: String(formData.get("partnerId") ?? "") || null,
      promoCodeId: String(formData.get("promoCodeId") ?? "") || null,
      ruleType: String(formData.get("ruleType") ?? "revenue_share") as
        | "revenue_share"
        | "flat_fee"
        | "cpa"
        | "hybrid",
      status: String(formData.get("status") ?? "active") as
        | "draft"
        | "active"
        | "paused"
        | "archived",
      currency: String(formData.get("currency") ?? "USD"),
      rate: String(formData.get("rate") ?? ""),
      flatAmount: String(formData.get("flatAmount") ?? ""),
      priority: String(formData.get("priority") ?? ""),
      basisMode: String(formData.get("basisMode") ?? "gross_revenue") as
        | "gross_revenue"
        | "net_revenue",
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? ""),
    });

    revalidatePath("/settings");
    revalidatePath("/settings/rules");
    revalidatePath("/commissions");
    redirect(buildSettingsHref("/settings/rules", "rule-saved"));
  } catch {
    redirect(buildSettingsHref("/settings/rules", "rule-error"));
  }
}

export async function updateCommissionRuleAction(formData: FormData) {
  const ruleId = String(formData.get("ruleId") ?? "");

  try {
    await updateCommissionRule(ruleId, {
      name: String(formData.get("name") ?? ""),
      appId: String(formData.get("appId") ?? "") || null,
      partnerId: String(formData.get("partnerId") ?? "") || null,
      promoCodeId: String(formData.get("promoCodeId") ?? "") || null,
      ruleType: String(formData.get("ruleType") ?? "revenue_share") as
        | "revenue_share"
        | "flat_fee"
        | "cpa"
        | "hybrid",
      status: String(formData.get("status") ?? "active") as
        | "draft"
        | "active"
        | "paused"
        | "archived",
      currency: String(formData.get("currency") ?? "USD"),
      rate: String(formData.get("rate") ?? ""),
      flatAmount: String(formData.get("flatAmount") ?? ""),
      priority: String(formData.get("priority") ?? ""),
      basisMode: String(formData.get("basisMode") ?? "gross_revenue") as
        | "gross_revenue"
        | "net_revenue",
      startsAt: String(formData.get("startsAt") ?? ""),
      endsAt: String(formData.get("endsAt") ?? ""),
    });

    revalidatePath("/settings");
    revalidatePath("/settings/rules");
    revalidatePath("/commissions");
    redirect(buildSettingsHref("/settings/rules", "rule-saved"));
  } catch {
    redirect(buildSettingsHref("/settings/rules", "rule-error"));
  }
}
