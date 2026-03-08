"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Code2,
  DollarSign,
  Heart,
  LayoutDashboard,
  Layers,
  Rocket,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type {
  WorkspaceActivationReminder,
  WorkspaceShellUser,
} from "@/components/workspace-shell-types";
import {
  isNavItemActive,
  workspaceSidebarNavItems,
  workspaceUtilityNavItems,
} from "@/lib/navigation";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

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
  Settings,
};

const navigationGroups = [
  {
    label: "Overview",
    hrefs: ["/dashboard", "/onboarding"],
  },
  {
    label: "Operations",
    hrefs: ["/partners", "/codes", "/apple-health", "/events", "/unattributed"],
  },
  {
    label: "Finance",
    hrefs: ["/commissions", "/payouts", "/payout-batches"],
  },
] as const;

type WorkspaceSidebarProps = {
  workspaceName: string;
  user: WorkspaceShellUser;
  activationReminder?: WorkspaceActivationReminder | null;
  onNavigate?: () => void;
};

export function WorkspaceSidebar({
  workspaceName,
  user,
  activationReminder,
  onNavigate,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const compactWorkspaceName =
    workspaceName.length > 28 ? `${workspaceName.slice(0, 28)}...` : workspaceName;

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-[var(--aa-shell-border)] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Workspace
        </p>
        <p className="mt-1 truncate text-sm font-semibold text-ink" title={workspaceName}>
          {compactWorkspaceName}
        </p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                {group.label}
              </p>
              <div className="mt-2 space-y-1.5">
                {workspaceSidebarNavItems
                  .filter((item) => group.hrefs.some((href) => href === item.href))
                  .map((item) => {
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
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={joinClasses(
                          "group flex min-h-[var(--aa-shell-nav-item-height)] items-center gap-3 rounded-[12px] border px-3.5 py-2.5 text-sm transition",
                          active
                            ? "border-[color:color-mix(in_srgb,var(--color-primary)_18%,var(--aa-shell-border))] bg-[linear-gradient(180deg,rgba(238,243,255,0.92)_0%,rgba(255,255,255,0.98)_100%)] text-ink shadow-[0_8px_18px_rgba(46,83,255,0.08)]"
                            : "border-transparent text-ink-muted hover:border-[var(--aa-shell-border)] hover:bg-surface hover:text-ink",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={joinClasses(
                            "inline-flex h-9 w-1 shrink-0 rounded-full transition-colors",
                            active ? "bg-primary" : "bg-transparent group-hover:bg-[var(--aa-shell-border)]",
                          )}
                        />
                        {Icon ? (
                          <Icon
                            size={18}
                            strokeWidth={1.85}
                            className={active ? "text-primary" : "text-ink-subtle"}
                          />
                        ) : null}
                        <span className={joinClasses("truncate", active && "font-semibold")}>
                          {item.label}
                        </span>
                        {item.href === "/onboarding" &&
                        activationReminder &&
                        !activationReminder.isComplete ? (
                          <span
                            className={joinClasses(
                              "ml-auto inline-flex min-h-5 items-center rounded-full px-2 text-[10px] font-semibold",
                              active
                                ? "bg-white text-primary"
                                : "bg-primary-soft text-primary",
                            )}
                          >
                            {activationReminder.completeCount}/{activationReminder.totalCount}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className="mt-auto border-t border-[var(--aa-shell-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,1)_18%)] px-3 py-4">
        <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Workspace access
        </p>
        <div className="mt-2 flex items-center gap-3 rounded-[12px] border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] px-3 py-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-semibold text-primary">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.role}</p>
          </div>
          {workspaceUtilityNavItems[0] ? (
            <Link
              href={workspaceUtilityNavItems[0].href}
              onClick={onNavigate}
              aria-label={workspaceUtilityNavItems[0].label}
              className="inline-flex h-[var(--aa-shell-control-height)] w-[var(--aa-shell-control-height)] items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-muted transition hover:border-[var(--aa-shell-border-strong)] hover:bg-white hover:text-ink"
            >
              <Settings size={16} strokeWidth={1.75} />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
