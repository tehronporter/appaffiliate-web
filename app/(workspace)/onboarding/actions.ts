"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPromoCode } from "@/lib/services/codes";
import { createPartner } from "@/lib/services/partners";

function buildOnboardingHref(params: {
  step: string;
  error?: "creator" | "code";
}) {
  const search = new URLSearchParams();
  search.set("step", params.step);

  if (params.error) {
    search.set("error", params.error);
  }

  return `/onboarding?${search.toString()}`;
}

export async function createActivationPartnerAction(formData: FormData) {
  try {
    await createPartner({
      name: String(formData.get("name") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      status: "active",
      notes: "",
    });

    revalidatePath("/onboarding");
    revalidatePath("/partners");
    redirect(buildOnboardingHref({ step: "3" }));
  } catch {
    redirect(buildOnboardingHref({ step: "2", error: "creator" }));
  }
}

export async function createActivationCodeAction(formData: FormData) {
  try {
    const assetKind = String(formData.get("assetKind") ?? "promo");

    await createPromoCode({
      appId: String(formData.get("appId") ?? ""),
      partnerId: String(formData.get("partnerId") ?? "none"),
      code: String(formData.get("assetValue") ?? ""),
      status: "active",
      codeType: assetKind === "tracking" ? "referral" : "promo",
      channel: assetKind === "tracking" ? "Tracking link" : "Promo code",
    });

    revalidatePath("/onboarding");
    revalidatePath("/codes");
    revalidatePath("/events");
    redirect(buildOnboardingHref({ step: "4" }));
  } catch {
    redirect(buildOnboardingHref({ step: "3", error: "code" }));
  }
}
