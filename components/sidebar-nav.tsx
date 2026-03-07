"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/app-shell";
import { BrandLogoLink } from "@/components/brand-logo";
import {
  isNavItemActive,
  workspaceNavGroups,
} from "@/lib/navigation";

function navItemClasses(active: boolean) {
  if (active) {
    return "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-ink shadow-[0_8px_20px_rgba(46,83,255,0.08)]";
  }

  return "border-transparent bg-transparent text-ink-muted hover:border-border hover:bg-white hover:text-ink";
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-2.5">
      <div className="rounded-[var(--radius-card)] border border-border bg-[rgba(255,255,255,0.94)] p-4 shadow-[var(--shadow-soft)]">
        <BrandLogoLink
          href="/dashboard"
          ariaLabel="Open AppAffiliate workspace"
          size="workspace"
          priority
        />
        <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Creator growth ops
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-ink">
          Internal workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Review creator performance, clear what needs attention, and keep payouts moving.
        </p>
      </div>

      <nav className="rounded-[var(--radius-card)] border border-border bg-[rgba(255,255,255,0.92)] p-2 shadow-[var(--shadow-soft)]">
        <div className="space-y-2.5">
          {workspaceNavGroups.map((group) => (
            <div key={group.title} className="border-b border-border pb-2.5 last:border-b-0 last:pb-0">
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                {group.title}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  const href =
                    item.activePrefixes?.some((prefix) => pathname.startsWith(prefix)) &&
                    active
                      ? pathname
                      : item.href;

                  return (
                    <Link
                      key={item.href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-[14px] border px-3 py-2.5 transition focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white ${navItemClasses(active)}`}
                    >
                      <p className="text-sm font-semibold tracking-[-0.01em]">
                        {item.label}
                      </p>
                      <p
                        className={`mt-0.5 text-[11px] leading-5 ${
                          active ? "text-[color:color-mix(in_srgb,var(--color-primary)_72%,black)]" : "text-ink-subtle"
                        }`}
                      >
                        {item.description}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="rounded-[var(--radius-card)] border border-border bg-[rgba(243,247,252,0.82)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-ink-subtle">
          Creator portal
        </p>
        <h3 className="mt-2 text-sm font-semibold tracking-[-0.02em] text-ink">
          Read-only creator view
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Keep creator access separate so the portal only shows each person their own codes, results, and payouts.
        </p>
        <div className="mt-3">
          <ActionLink href="/portal">Open partner portal</ActionLink>
        </div>
      </div>
    </div>
  );
}
