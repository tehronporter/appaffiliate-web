import Link from "next/link";
import type { ReactNode } from "react";

import type {
  WorkspaceActivationReminder,
  WorkspaceShellUser,
} from "@/components/workspace-shell-types";
import { WorkspaceSidebar } from "@/components/workspace-sidebar";
import { WorkspaceTopNav } from "@/components/workspace-top-nav";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type AppShellProps = {
  children: ReactNode;
  workspaceName: string;
  user: WorkspaceShellUser;
  activationReminder?: WorkspaceActivationReminder | null;
};

export function AppShell({
  children,
  workspaceName,
  user,
  activationReminder,
}: AppShellProps) {
  return (
    <div className="aa-workspace-shell min-h-screen bg-[var(--aa-shell-canvas)] text-ink">
      <WorkspaceTopNav user={user} />
      <div className="mx-auto min-h-screen max-w-[1600px] pt-[var(--aa-shell-top-offset)] lg:grid lg:grid-cols-[var(--aa-shell-sidebar-width)_minmax(0,1fr)]">
        <aside className="border-b border-[var(--aa-shell-border)] bg-white lg:sticky lg:top-[var(--aa-shell-top-offset)] lg:h-[calc(100vh-var(--aa-shell-top-offset))] lg:border-r lg:border-b-0">
          <WorkspaceSidebar
            workspaceName={workspaceName}
            user={user}
            activationReminder={activationReminder}
          />
        </aside>

        <div className="min-w-0 bg-[var(--aa-shell-canvas)]">
          {children}
        </div>
      </div>
    </div>
  );
}

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main
      className={joinClasses(
        "mx-auto max-w-[var(--page-max-width)] space-y-2.5 px-4 py-2.5 sm:px-6 lg:px-8 lg:py-4",
        className,
      )}
    >
      {children}
    </main>
  );
}

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary";
};

export function ActionLink({
  href,
  children,
  variant = "secondary",
}: ActionLinkProps) {
  const classes =
    variant === "primary"
      ? "aa-button aa-button-primary"
      : variant === "tertiary"
        ? "aa-button aa-button-tertiary"
        : "aa-button aa-button-secondary";

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
