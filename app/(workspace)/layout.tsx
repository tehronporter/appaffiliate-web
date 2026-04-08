import type { ReactNode } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { WorkspaceLayoutBoundary } from "@/components/workspace-layout-boundary";
import type { WorkspaceShellUser } from "@/components/workspace-shell-types";
import { getAuthenticatedUser } from "@/lib/auth";
import { buildActivationProgress } from "@/lib/activation-progress";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const headerStore = await headers();
  const requestPath = headerStore.get("x-appaffiliate-request-path") ?? "/dashboard";
  const [workspace, user] = await Promise.all([
    getCurrentWorkspaceContext(),
    getAuthenticatedUser(),
  ]);

  if (!user) {
    redirect(`/login?redirectTo=${encodeURIComponent(requestPath)}`);
  }

  if (workspace.role?.key === "partner_user") {
    redirect("/portal");
  }

  const userName =
    workspace.partnerUser?.display_name ??
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : typeof user?.user_metadata?.name === "string"
        ? user.user_metadata.name
        : user?.email?.split("@")[0]) ??
    "Workspace user";
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
  const shellUser: WorkspaceShellUser = {
    name: userName,
    email: user?.email ?? null,
    role: workspace.role?.name ?? "No active role",
    initials: initials || "AA",
  };
  const launch = await getLaunchReadinessData();
  const activationProgress = buildActivationProgress(launch);

  return (
    <WorkspaceLayoutBoundary
      workspaceName={workspace.organization?.name ?? "No organization linked"}
      user={shellUser}
      activationReminder={activationProgress}
    >
      {children}
    </WorkspaceLayoutBoundary>
  );
}
