"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getRouteContext } from "@/lib/navigation";

export function TopBar() {
  const pathname = usePathname();
  const routeContext = getRouteContext(pathname);
  const isDashboard = pathname === "/dashboard";

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-[rgba(248,250,253,0.84)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[var(--page-max-width)] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-[10px] font-normal text-[#94a3b8]">
            {routeContext?.groupTitle ?? "Workspace"}
          </p>
          <p className="mt-1.5 text-sm font-semibold tracking-[-0.01em] text-ink">
            {routeContext?.item.label ?? "Dashboard"}
          </p>
          <p className="mt-1 text-sm leading-5 text-ink-muted">
            {routeContext?.item.description ??
              "Creator performance, review posture, and payout confidence."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!isDashboard ? (
            <Link href="/dashboard" className="aa-button aa-button-secondary">
              Dashboard
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
