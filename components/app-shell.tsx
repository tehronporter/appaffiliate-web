"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";

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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const root = document.documentElement;
    const previousScrollPadding = root.style.scrollPaddingTop;
    const shell = shellRef.current;

    if (shell) {
      const styles = getComputedStyle(shell);
      root.style.scrollPaddingTop =
        styles.getPropertyValue("--aa-shell-scroll-padding").trim() ||
        styles.getPropertyValue("--aa-shell-top-offset").trim();
    }

    return () => {
      root.style.scrollPaddingTop = previousScrollPadding;
    };
  }, []);

  return (
    <div
      ref={shellRef}
      className="aa-workspace-shell min-h-screen bg-[var(--aa-shell-canvas)] text-ink"
    >
      <WorkspaceTopNav user={user} onOpenSidebar={() => setMobileNavOpen(true)} />

      {mobileNavOpen ? (
        <div className="fixed inset-0 top-[var(--aa-shell-top-offset)] z-30 lg:hidden">
          <button
            type="button"
            aria-label="Close workspace navigation"
            onClick={() => setMobileNavOpen(false)}
            className="absolute inset-0 bg-[rgba(17,24,39,0.16)] backdrop-blur-[2px]"
          />
          <aside className="absolute inset-y-0 left-0 w-[min(19rem,calc(100vw-2.5rem))] border-r border-[var(--aa-shell-border)] bg-white shadow-[0_24px_44px_rgba(17,24,39,0.12)]">
            <WorkspaceSidebar
              workspaceName={workspaceName}
              user={user}
              activationReminder={activationReminder}
              onNavigate={() => setMobileNavOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="aa-shell-width min-h-screen pt-[var(--aa-shell-top-offset)] lg:grid lg:grid-cols-[var(--aa-shell-sidebar-width)_minmax(0,1fr)]">
        <aside className="hidden border-r border-[var(--aa-shell-border)] bg-white lg:sticky lg:top-[var(--aa-shell-top-offset)] lg:block lg:h-[calc(100vh-var(--aa-shell-top-offset))]">
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
        "aa-page-width space-y-3 py-3 sm:space-y-4 sm:py-4 lg:py-5",
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
