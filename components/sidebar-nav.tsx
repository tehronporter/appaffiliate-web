"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ActionLink } from "@/components/app-shell";
import {
  PARTNER_PORTAL_BASE_PATH,
  isNavItemActive,
  workspaceNavGroups,
} from "@/lib/navigation";

function navItemClasses(active: boolean) {
  if (active) {
    return "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-ink shadow-[0_10px_28px_rgba(46,83,255,0.08)]";
  }

  return "border-transparent bg-transparent text-ink-muted hover:border-border hover:bg-white hover:text-ink";
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="rounded-[30px] border border-border bg-[rgba(255,255,255,0.92)] p-5 shadow-[var(--shadow-soft)]">
        <Link
          href="/dashboard"
          className="text-sm font-semibold tracking-[-0.02em] text-ink"
        >
          AppAffiliate
        </Link>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
          Internal workspace
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-ink">
          Admin workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Built for daily affiliate operations, attribution review, finance
          handoff, and workspace controls.
        </p>
      </div>

      <nav className="rounded-[30px] border border-border bg-[rgba(255,255,255,0.92)] p-3 shadow-[var(--shadow-soft)]">
        <div className="space-y-4">
          {workspaceNavGroups.map((group) => (
            <div key={group.title} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
                {group.title}
              </p>
              <div className="space-y-1.5">
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
                      className={`block rounded-[20px] border px-3.5 py-3.5 transition ${navItemClasses(active)}`}
                    >
                      <p className="text-sm font-semibold tracking-[-0.01em]">
                        {item.label}
                      </p>
                      <p
                        className={`mt-1 text-xs leading-5 ${
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

      <div className="rounded-[30px] border border-border bg-surface-muted p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
          Partner portal
        </p>
        <h3 className="mt-3 text-base font-semibold tracking-[-0.02em] text-ink">
          Separate read-only view
        </h3>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Routes under <span className="font-medium text-ink">{PARTNER_PORTAL_BASE_PATH}</span>{" "}
          stay distinct from internal admin tools so partners see only their
          own codes, performance, and payouts.
        </p>
        <div className="mt-4">
          <ActionLink href="/portal">Open partner portal</ActionLink>
        </div>
      </div>
    </div>
  );
}
