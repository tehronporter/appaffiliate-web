import { redirect } from "next/navigation";

import { getPrimaryWorkspaceApp } from "@/lib/services/apps";

export default async function AppleHealthOverviewPage() {
  const app = await getPrimaryWorkspaceApp();

  if (!app) {
    redirect("/setup");
  }

  redirect(`/apps/${app.slug}/apple-health`);
}
