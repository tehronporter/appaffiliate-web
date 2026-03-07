"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPromoCode, updatePromoCode } from "@/lib/services/codes";

function buildCodesHref(params: {
  codeId?: string;
  notice: string;
}) {
  const search = new URLSearchParams();

  if (params.codeId) {
    search.set("code", params.codeId);
  }

  search.set("notice", params.notice);

  return `/codes?${search.toString()}`;
}

export async function createPromoCodeAction(formData: FormData) {
  try {
    const result = await createPromoCode({
      appId: String(formData.get("appId") ?? ""),
      partnerId: String(formData.get("partnerId") ?? "none"),
      code: String(formData.get("code") ?? ""),
      status: String(formData.get("status") ?? "active") as
        | "draft"
        | "active"
        | "paused"
        | "expired"
        | "archived",
      codeType: String(formData.get("codeType") ?? "promo") as
        | "promo"
        | "referral"
        | "campaign"
        | "vanity",
      channel: String(formData.get("channel") ?? ""),
    });

    revalidatePath("/codes");
    redirect(
      buildCodesHref({
        codeId: result.id,
        notice: "code-created",
      }),
    );
  } catch {
    redirect(
      buildCodesHref({
        notice: "code-error",
      }),
    );
  }
}

export async function updatePromoCodeAction(formData: FormData) {
  const promoCodeId = String(formData.get("promoCodeId") ?? "");

  try {
    const result = await updatePromoCode(promoCodeId, {
      appId: String(formData.get("appId") ?? ""),
      partnerId: String(formData.get("partnerId") ?? "none"),
      code: String(formData.get("code") ?? ""),
      status: String(formData.get("status") ?? "active") as
        | "draft"
        | "active"
        | "paused"
        | "expired"
        | "archived",
      codeType: String(formData.get("codeType") ?? "promo") as
        | "promo"
        | "referral"
        | "campaign"
        | "vanity",
      channel: String(formData.get("channel") ?? ""),
    });

    revalidatePath("/codes");
    redirect(
      buildCodesHref({
        codeId: result.id,
        notice: "code-updated",
      }),
    );
  } catch {
    redirect(
      buildCodesHref({
        codeId: promoCodeId,
        notice: "code-error",
      }),
    );
  }
}
