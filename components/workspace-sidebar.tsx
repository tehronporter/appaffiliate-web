"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  ChevronDown,
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

import { BrandLogoLink } from "@/components/brand-logo";
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

type WorkspaceSidebarProps = {
  workspaceName: string;
  user: WorkspaceShellUser;
  activationReminder?: WorkspaceActivationReminder | null;
};

export function WorkspaceSidebar({
  workspaceName,
  user,
  activationReminder,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-[var(--aa-shell-border)] px-4 py-5">
        <div className="flex items-start justify-between gap-3">
          <BrandLogoLink
            href="/dashboard"
            ariaLabel="Open AppAffiliate dashboard"
            size="workspace"
            priority
          />
          <button
            type="button"
            aria-label="Workspace switching placeholder"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-subtle"
          >
            <ChevronDown size={16} strokeWidth={1.75} />
          </button>
        </div>
        <p className="mt-4 text-sm font-medium text-ink-muted">{workspaceName}</p>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {workspaceSidebarNavItems.map((item) => {
            const active = isNavItemActive(pathname, item);
            const href =
              item.activePrefixes?.some((prefix) => pathname.startsWith(prefix)) &&
              active
                ? pathname
                : item.href;
            const Icon = iconMap[item.icon];

            return (
              <div key={item.href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={joinClasses(
                    "flex min-h-[44px] items-center gap-3 rounded-[var(--radius-card)] border-l-2 px-3 py-2.5 text-sm font-medium transition",
                    active
                      ? "border-l-primary bg-primary-soft text-ink"
                      : "border-l-transparent text-ink-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  {Icon ? (
                    <Icon
                      size={18}
                      strokeWidth={1.75}
                      className={active ? "text-primary" : "text-ink-subtle"}
                    />
                  ) : null}
                  <span className="truncate">{item.label}</span>
                  {item.href === "/onboarding" &&
                  activationReminder &&
                  !activationReminder.isComplete ? (
                    <span
                      className={joinClasses(
                        "ml-auto inline-flex min-h-6 items-center rounded-full px-2 text-[11px] font-semibold",
                        active
                          ? "bg-white text-primary"
                          : "bg-primary-soft text-primary",
                      )}
                    >
                      {activationReminder.completeCount}/{activationReminder.totalCount}
                    </span>
                  ) : null}
                </Link>

                {item.dividerAfter ? (
                  <div className="mx-3 my-3 border-t border-[var(--aa-shell-border)]" />
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="mt-auto border-t border-[var(--aa-shell-border)] px-3 py-4">
        <div className="flex items-center gap-3 rounded-[var(--radius-card)] px-2 py-2">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            {user.initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-ink-muted">{user.role}</p>
          </div>
          {workspaceUtilityNavItems[0] ? (
            <Link
              href={workspaceUtilityNavItems[0].href}
              aria-label={workspaceUtilityNavItems[0].label}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-muted transition hover:border-[var(--aa-shell-border-strong)] hover:bg-surface hover:text-ink"
            >
              <Settings size={16} strokeWidth={1.75} />
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
