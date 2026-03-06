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
    return "border-primary bg-primary text-white shadow-[var(--shadow-soft)]";
  }

  return "border-transparent bg-transparent text-ink-muted hover:border-border hover:bg-surface hover:text-ink";
}

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="rounded-[28px] border border-border bg-surface-elevated p-5 shadow-[var(--shadow-soft)]">
        <Link
          href="/dashboard"
          className="text-sm font-semibold uppercase tracking-[0.28em] text-primary"
        >
          AppAffiliate
        </Link>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
          Admin workspace
        </h2>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Calm, finance-first operations for affiliate programs, attribution,
          and payout review.
        </p>
      </div>

      <nav className="rounded-[28px] border border-border bg-surface-elevated p-3 shadow-[var(--shadow-soft)]">
        <div className="space-y-4">
          {workspaceNavGroups.map((group) => (
            <div key={group.title}>
              <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
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
                      className={`block rounded-2xl border px-3 py-3 transition ${navItemClasses(active)}`}
                    >
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p
                        className={`mt-1 text-xs leading-5 ${
                          active ? "text-white/80" : "text-ink-subtle"
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

      <div className="rounded-[28px] border border-border bg-surface-muted p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
          Future extension
        </p>
        <h3 className="mt-3 text-base font-semibold text-ink">Partner portal</h3>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Routes under <span className="font-medium text-ink">{PARTNER_PORTAL_BASE_PATH}</span>{" "}
          are reserved for external partner-facing screens so admin tools stay
          separate from creator workflows.
        </p>
        <div className="mt-4">
          <ActionLink href="/portal">Open placeholder</ActionLink>
        </div>
      </div>
    </div>
  );
}
