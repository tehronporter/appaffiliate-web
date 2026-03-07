"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
