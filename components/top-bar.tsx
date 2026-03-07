"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getRouteContext } from "@/lib/navigation";

export function TopBar() {
  const pathname = usePathname();
  const routeContext = getRouteContext(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[rgba(251,252,253,0.92)] backdrop-blur">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
            Internal workspace
          </p>
          <p className="mt-2 text-sm font-medium text-ink">
            {(routeContext?.groupTitle ?? "Overview") + " / " + (routeContext?.item.label ?? "Dashboard")}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">
            {routeContext?.item.description ??
              "Daily affiliate operations, finance handoff, and workspace controls."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard" className="aa-button aa-button-secondary">
            Open dashboard
          </Link>
          <Link href="/settings" className="aa-button aa-button-secondary">
            Open settings
          </Link>
        </div>
      </div>
    </header>
  );
}
