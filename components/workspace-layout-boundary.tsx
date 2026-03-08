"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app-shell";
import type {
  WorkspaceActivationReminder,
  WorkspaceShellUser,
} from "@/components/workspace-shell-types";

type WorkspaceLayoutBoundaryProps = {
  children: ReactNode;
  workspaceName: string;
  user: WorkspaceShellUser;
  activationReminder?: WorkspaceActivationReminder | null;
};

export function WorkspaceLayoutBoundary({
  children,
  workspaceName,
  user,
  activationReminder,
}: WorkspaceLayoutBoundaryProps) {
  return (
    <AppShell
      workspaceName={workspaceName}
      user={user}
      activationReminder={activationReminder}
    >
      {children}
    </AppShell>
  );
}
