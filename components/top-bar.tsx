"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getRouteContext } from "@/lib/navigation";

export function TopBar() {
  const pathname = usePathname();
  const routeContext = getRouteContext(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[color:color-mix(in_srgb,var(--color-surface-elevated)_86%,transparent)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
            {routeContext?.groupTitle ?? "Workspace"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-lg font-semibold text-ink">
              {routeContext?.item.label ?? "Operations"}
            </h1>
            <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
              Finance-first admin shell
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink-muted">
            Program, operations, and settings stay one click away
          </span>
          <Link
            href="/settings"
            className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface"
          >
            Open settings
          </Link>
        </div>
      </div>
    </header>
  );
}
