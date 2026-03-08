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
  slug?: string;
}) {
  const search = new URLSearchParams();

  if (params.partnerId) {
    search.set("partner", params.partnerId);
  }

  search.set("notice", params.notice);

  if (params.slug) {
    return `/creators/${params.slug}?${search.toString()}`;
  }

  return `/creators?${search.toString()}`;
}

export async function createPartnerAction(formData: FormData) {
  let redirectTarget: string | null = null;

  try {
    const contactEmail = String(formData.get("contactEmail") ?? "");
    const sendInviteValue = formData.get("sendInvite");
    const shouldSendInvite =
      sendInviteValue === null
        ? contactEmail.trim().length > 0
        : String(sendInviteValue) === "yes";
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
    let notice = "creator-created";

    if (contactEmail.trim() && shouldSendInvite) {
      try {
        await invitePartnerPortalUser({
          partnerId: result.id,
          email: contactEmail,
          displayName: String(formData.get("name") ?? ""),
        });
      } catch {
        notice = "creator-created-invite-error";
      }
    }

    revalidatePath("/creators");
    revalidatePath(`/creators/${result.slug}`);
    revalidatePath("/codes");
    revalidatePath("/setup");
    revalidatePath("/dashboard");
    revalidatePath("/settings/team");
    redirectTarget = buildPartnersHref({
      partnerId: result.id,
      slug: result.slug,
      notice,
    });
  } catch {
    redirect(
      buildPartnersHref({
        notice: "creator-error",
      }),
    );
  }

  redirect(redirectTarget!);
}

export async function updatePartnerAction(formData: FormData) {
  const partnerId = String(formData.get("partnerId") ?? "");
  let redirectTarget: string | null = null;

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

    revalidatePath("/creators");
    revalidatePath(`/creators/${result.slug}`);
    revalidatePath("/codes");
    revalidatePath("/setup");
    revalidatePath("/dashboard");
    redirectTarget = buildPartnersHref({
      partnerId: result.id,
      slug: result.slug,
      notice: "creator-updated",
    });
  } catch {
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "creator-error",
      }),
    );
  }

  redirect(redirectTarget!);
}

export async function resendPartnerInviteAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  let redirectTarget: string | null = null;

  try {
    await resendWorkspaceInvitation(invitationId);
    revalidatePath("/creators");
    revalidatePath("/setup");
    revalidatePath("/dashboard");
    redirectTarget = buildPartnersHref({
      partnerId,
      notice: "creator-invite-resent",
    });
  } catch {
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "creator-error",
      }),
    );
  }

  redirect(redirectTarget!);
}

export async function revokePartnerInviteAction(formData: FormData) {
  const invitationId = String(formData.get("invitationId") ?? "");
  const partnerId = String(formData.get("partnerId") ?? "");
  let redirectTarget: string | null = null;

  try {
    await revokeWorkspaceInvitation(invitationId);
    revalidatePath("/creators");
    revalidatePath("/setup");
    revalidatePath("/dashboard");
    redirectTarget = buildPartnersHref({
      partnerId,
      notice: "creator-invite-revoked",
    });
  } catch {
    redirect(
      buildPartnersHref({
        partnerId,
        notice: "creator-error",
      }),
    );
  }

  redirect(redirectTarget!);
}
