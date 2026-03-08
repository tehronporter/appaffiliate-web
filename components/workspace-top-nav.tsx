"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLogoLink } from "@/components/brand-logo";
import { WorkspaceSearch } from "@/components/workspace-search";
import type { WorkspaceShellUser } from "@/components/workspace-shell-types";
import { WorkspaceUserMenu } from "@/components/workspace-user-menu";
import { getRouteContext } from "@/lib/navigation";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type WorkspaceTopNavProps = {
  user: WorkspaceShellUser;
  hasUnreadNotifications?: boolean;
};

export function WorkspaceTopNav({
  user,
  hasUnreadNotifications = false,
}: WorkspaceTopNavProps) {
  const pathname = usePathname();
  const routeContext = getRouteContext(pathname);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 0);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={joinClasses(
        "fixed inset-x-0 top-0 z-40 h-16 border-b border-[var(--aa-shell-border)] bg-white transition-shadow",
        scrolled && "shadow-[0_4px_16px_rgba(17,24,39,0.05)]",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <BrandLogoLink
          href="/dashboard"
          ariaLabel="Open AppAffiliate dashboard"
          size="workspace-compact"
          priority
        />

        <div className="hidden h-5 w-px bg-[var(--aa-shell-border)] md:block" />

        <div className="min-w-0">
          <p className="truncate text-[16px] font-semibold text-ink">
            {routeContext?.item.label ?? "Dashboard"}
          </p>
        </div>

        <div className="flex-1" />

        <WorkspaceSearch />

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-muted transition hover:border-[var(--aa-shell-border-strong)] hover:bg-surface hover:text-ink"
        >
          <Bell size={18} strokeWidth={1.75} />
          {hasUnreadNotifications ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-primary" />
          ) : null}
        </button>

        <WorkspaceUserMenu user={user} />
      </div>
    </header>
  );
}
