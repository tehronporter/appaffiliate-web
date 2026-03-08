"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPartner, updatePartner } from "@/lib/services/partners";
import {
  invitePartnerPortalUser,
  resendWorkspaceInvitation,
  revokeWorkspaceInvitation,
} from "@/lib/services/invitations";

function buildPartnersHref(params: {
  partnerId?: string;
  notice: string;
}) {
  const search = new URLSearchParams();

  if (params.partnerId) {
    search.set("partner", params.partnerId);
  }

  search.set("notice", params.notice);

  return `/partners?${search.toString()}`;
}

export async function createPartnerAction(formData: FormData) {
  try {
    const contactEmail = String(formData.get("contactEmail") ?? "");
    const result = await createPartner({
      name: String(formData.get("name") ?? ""),
      contactEmail,
      status: String(formData.get("status") ?? "active") as
        | "pending"
        | "active"
        | "inactive"
        | "archived",
      notes: String(formData.get("notes") ?? ""),
    });

    if (contactEmail.trim()) {
      await invitePartnerPortalUser({
        partnerId: result.id,
        email: contactEmail,
        displayName: String(formData.get("name") ?? ""),
      });
    }

    revalidatePath("/partners");
    revalidatePath("/settings/team");
    redirect(
      buildPartnersHref({
        partnerId: result.id,
        notice: "partner-created",
      }),
    );
  } catch {
    redirect(
      buildPartnersHref({
        notice: "partner-error",
      }),
    );
  }
}

export async function updatePartnerAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");

  try {
    const result = await updatePartner(partnerId, {
      name: String(formData.get("name") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      status: String(formData.get("status") ?? "active") as
        | "pending"
        | "active"
        | "inactive"
        | "archived",
      notes: String(formData.get("notes") ?? ""),
    });

    revalidatePath("/partners");
    redirect(
      buildPartnersHref({
        partnerId: result.id,
        notice: "partner-updated",
      }),
    );
  } catch {
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "partner-error",
      }),
    );
  }
}

export async function resendPartnerInviteAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");

  try {
    await resendWorkspaceInvitation(invitationId);
    revalidatePath("/partners");
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "partner-invite-resent",
      }),
    );
  } catch {
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "partner-error",
      }),
    );
  }
}

export async function revokePartnerInviteAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");

  try {
    await revokeWorkspaceInvitation(invitationId);
    revalidatePath("/partners");
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "partner-invite-revoked",
      }),
    );
  } catch {
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "partner-error",
      }),
    );
  }
}
