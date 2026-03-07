"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Rocket,
  Users,
  Code2,
  Heart,
  Activity,
  AlertTriangle,
  DollarSign,
  Wallet,
  Layers,
  Download,
  Settings,
  FileSearch,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { ActionLink } from "@/components/app-shell";
import { BrandLogoLink } from "@/components/brand-logo";
import {
  isNavItemActive,
  workspaceNavGroups,
} from "@/lib/navigation";

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Rocket,
  Users,
  Code2,
  Heart,
  Activity,
  AlertTriangle,
  DollarSign,
  Wallet,
  Layers,
  Download,
  Settings,
  FileSearch,
};

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
        <h2 className="mt-3 text-base font-semibold tracking-[-0.03em] text-ink">
          AppAffiliate
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Internal workspace
        </p>
      </div>

      <nav className="rounded-[var(--radius-card)] border border-border bg-[rgba(255,255,255,0.92)] p-2 shadow-[var(--shadow-soft)]">
        <div className="space-y-1">
          {workspaceNavGroups.map((group, groupIndex) => (
            <div key={group.title}>
              {groupIndex > 0 ? (
                <div className="mx-3 my-2 border-t border-[#e8e8e8]" />
              ) : null}
              <p className="px-3 pb-1 pt-1.5 text-[10px] font-normal text-[#94a3b8]">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  const href =
                    item.activePrefixes?.some((prefix) => pathname.startsWith(prefix)) &&
                    active
                      ? pathname
                      : item.href;
                  const Icon = iconMap[item.icon];

                  return (
                    <Link
                      key={item.href}
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded-[var(--radius-soft)] px-3 py-2.5 transition-colors ${
                        active
                          ? "border-l-2 border-l-primary bg-surface text-ink"
                          : "border-l-2 border-l-transparent text-ink-muted hover:bg-surface hover:text-ink"
                      }`}
                    >
                      {Icon ? (
                        <Icon
                          size={16}
                          strokeWidth={1.5}
                          className={active ? "text-primary" : "text-[#94a3b8]"}
                        />
                      ) : null}
                      <div className="min-w-0">
                        <p className="text-sm font-medium tracking-[-0.01em]">
                          {item.label}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
        <p className="text-[10px] font-normal text-[#94a3b8]">
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
