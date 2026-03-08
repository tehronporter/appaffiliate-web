"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createApp, updateApp } from "@/lib/services/apps";

function buildAppsHref(params: {
  app?: string;
  notice: string;
  drawer?: string;
}) {
  const search = new URLSearchParams();

  if (params.notice) {
    search.set("notice", params.notice);
  }

  if (params.app) {
    search.set("app", params.app);
  }

  if (params.drawer) {
    search.set("drawer", params.drawer);
  }

  return `/apps?${search.toString()}`;
}

function revalidateAppSurfaces(slug?: string | null) {
  revalidatePath("/apps");
  revalidatePath("/apple-health");
  revalidatePath("/setup");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  revalidatePath("/settings/organization");
  revalidatePath("/settings/rules");

  if (slug) {
    revalidatePath(`/apps/${slug}`);
    revalidatePath(`/apps/${slug}/apple-health`);
  }
}

export async function createWorkspaceAppAction(formData: FormData) {
  let redirectTarget: string | null = null;

  try {
    const app = await createApp({
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
      status: String(formData.get("status") ?? "active") as
        | "draft"
        | "active"
        | "paused"
        | "archived",
    });

    revalidateAppSurfaces(app.slug);
    redirectTarget = `/apps/${app.slug}?notice=app-created`;
  } catch {
    redirect(
      buildAppsHref({
        notice: "app-error",
        drawer: "create",
      }),
    );
  }

  redirect(redirectTarget!);
}

export async function updateWorkspaceAppAction(formData: FormData) {
  const appId = String(formData.get("appId") ?? "");
  const appSlug = String(formData.get("appSlug") ?? "");
  let redirectTarget: string | null = null;

  try {
    const app = await updateApp(appId, {
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
      status: String(formData.get("status") ?? "active") as
        | "draft"
        | "active"
        | "paused"
        | "archived",
    });

    revalidateAppSurfaces(app.slug);
    redirectTarget = `/apps/${app.slug}?notice=app-updated`;
  } catch {
    revalidateAppSurfaces(appSlug || null);
    if (appSlug) {
      redirect(`/apps/${appSlug}?notice=app-error`);
    }

    redirect(
      buildAppsHref({
        app: appId,
        notice: "app-error",
      }),
    );
  }

  redirect(redirectTarget!);
}
