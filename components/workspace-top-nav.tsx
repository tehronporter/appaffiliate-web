"use client";

import { useEffect, useState, type Ref } from "react";
import { Bell, Menu } from "lucide-react";
import { usePathname } from "next/navigation";

import { BrandLogoLink } from "@/components/brand-logo";
import { SiteHeaderFrame, SiteHeaderRow } from "@/components/site-header";
import { WorkspaceSearch } from "@/components/workspace-search";
import type { WorkspaceShellUser } from "@/components/workspace-shell-types";
import { WorkspaceUserMenu } from "@/components/workspace-user-menu";
import { getRouteContext } from "@/lib/navigation";

type WorkspaceTopNavProps = {
  user: WorkspaceShellUser;
  hasUnreadNotifications?: boolean;
  onOpenSidebar?: () => void;
  headerFrameRef?: Ref<HTMLDivElement>;
};

export function WorkspaceTopNav({
  user,
  hasUnreadNotifications = false,
  onOpenSidebar,
  headerFrameRef,
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
    <SiteHeaderFrame
      ref={headerFrameRef}
      scrolled={scrolled}
      maxWidthClassName="max-w-[var(--shell-max-width)]"
      stickyClassName="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4"
    >
      <SiteHeaderRow maxWidthClassName="max-w-[var(--shell-max-width)]">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          {onOpenSidebar ? (
            <button
              type="button"
              aria-label="Open workspace navigation"
              onClick={onOpenSidebar}
              className="inline-flex h-[var(--aa-shell-control-height)] w-[var(--aa-shell-control-height)] items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-muted transition hover:border-[var(--aa-shell-border-strong)] hover:bg-surface hover:text-ink lg:hidden"
            >
              <Menu size={18} strokeWidth={1.75} />
            </button>
          ) : null}

          <BrandLogoLink
            href="/dashboard"
            ariaLabel="Open AppAffiliate dashboard"
            size="workspace-header"
            priority
          />

          <div className="hidden h-5 w-px bg-[var(--aa-shell-border)] md:block" />

          <div className="min-w-0 hidden xl:block">
            <p className="truncate text-[15px] font-semibold text-ink">
              {routeContext?.item.label ?? "Dashboard"}
            </p>
          </div>
        </div>

        <div className="flex-1" />

        <WorkspaceSearch />

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-[var(--aa-shell-control-height)] w-[var(--aa-shell-control-height)] shrink-0 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-muted transition hover:border-[var(--aa-shell-border-strong)] hover:bg-surface hover:text-ink"
        >
          <Bell size={17} strokeWidth={1.75} />
          {hasUnreadNotifications ? (
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-white bg-primary" />
          ) : null}
        </button>

        <WorkspaceUserMenu user={user} />
      </SiteHeaderRow>
    </SiteHeaderFrame>
  );
}
