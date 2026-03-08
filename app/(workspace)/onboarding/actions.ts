"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createPromoCode } from "@/lib/services/codes";
import { createApp, updateApp } from "@/lib/services/apps";
import { invitePartnerPortalUser } from "@/lib/services/invitations";
import { createPartner } from "@/lib/services/partners";

function buildOnboardingHref(params: {
  step: string;
  error?: "app" | "creator" | "code";
}) {
  const search = new URLSearchParams();
  search.set("step", params.step);

  if (params.error) {
    search.set("error", params.error);
  }

  return `/setup?${search.toString()}`;
}

export async function createActivationAppAction(formData: FormData) {
  try {
    const appId = String(formData.get("appId") ?? "");
    const input = {
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
      status: "active" as const,
    };

    if (appId) {
      await updateApp(appId, input);
    } else {
      await createApp(input);
    }

    revalidatePath("/setup");
    revalidatePath("/apps");
    revalidatePath("/dashboard");
    revalidatePath("/settings");
    revalidatePath("/settings/organization");
    revalidatePath("/settings/rules");
    revalidatePath("/apps");
    redirect(buildOnboardingHref({ step: "2" }));
  } catch {
    redirect(buildOnboardingHref({ step: "1", error: "app" }));
  }
}

export async function createActivationPartnerAction(formData: FormData) {
  try {
    const partner = await createPartner({
      name: String(formData.get("name") ?? ""),
      contactEmail: String(formData.get("contactEmail") ?? ""),
      status: "active",
      notes: "",
    });
    await invitePartnerPortalUser({
      partnerId: partner.id,
      email: String(formData.get("contactEmail") ?? ""),
      displayName: String(formData.get("name") ?? ""),
    });

    revalidatePath("/setup");
    revalidatePath("/creators");
    revalidatePath("/settings/team");
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

    revalidatePath("/setup");
    revalidatePath("/codes");
    revalidatePath("/review");
    redirect(buildOnboardingHref({ step: "4" }));
  } catch {
    redirect(buildOnboardingHref({ step: "3", error: "code" }));
  }
}
