import { redirect } from "next/navigation";

import { getPrimaryWorkspaceApp } from "@/lib/services/apps";

export default async function AppleHealthOverviewPage() {
  const app = await getPrimaryWorkspaceApp();

  if (!app) {
    redirect("/onboarding?step=1");
  }

  redirect(`/apps/${app.slug}/apple-health`);
}
