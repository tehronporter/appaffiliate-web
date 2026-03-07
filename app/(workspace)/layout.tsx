import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

type WorkspaceLayoutProps = {
  children: ReactNode;
};

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  const workspace = await getCurrentWorkspaceContext();

  if (workspace.role?.key === "partner_user") {
    redirect("/portal");
  }

  return <AppShell>{children}</AppShell>;
}
