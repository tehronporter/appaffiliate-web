import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Code2,
  DollarSign,
  Heart,
  Rocket,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { getAuthenticatedUser } from "@/lib/auth";
import { listCommissionItems } from "@/lib/services/finance";
import {
  getLaunchReadinessData,
  type LaunchReadinessCheck,
} from "@/lib/services/launch-readiness";
import {
  toneForActivationState,
  toneForLaunchStatus,
  toneForRoleLabel,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";
import { buildActivationProgress } from "@/lib/activation-progress";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

function actionLabelForCheck(check: LaunchReadinessCheck) {
  if (check.href.startsWith("/apps/")) {
    return "Open Apple health";
  }

  if (check.href === "/unattributed") {
    return "Review queue";
  }

  if (check.href === "/codes") {
    return "Review codes";
  }

  if (check.href === "/payouts") {
    return "Open payouts";
  }

  if (check.href === "/settings/exports") {
    return "Open exports";
  }

  if (check.href.startsWith("/settings")) {
    return "Open settings";
  }

  return "Open";
}

type DashboardMetricTone = "blue" | "green" | "amber" | "red";

type DashboardMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  badge: string;
  tone: DashboardMetricTone;
  icon: LucideIcon;
};

function dashboardMetricCardToneClass(tone: DashboardMetricTone) {
  if (tone === "red") {
    return "border-[color:color-mix(in_srgb,var(--color-danger)_18%,var(--aa-shell-border))] bg-[color:color-mix(in_srgb,var(--color-danger-soft)_72%,white)]";
  }

  if (tone === "amber") {
    return "border-[color:color-mix(in_srgb,var(--color-warning)_20%,var(--aa-shell-border))] bg-[color:color-mix(in_srgb,var(--color-warning-soft)_72%,white)]";
  }

  return "border-[var(--aa-shell-border)] bg-white";
}

function dashboardMetricBadgeTone(tone: DashboardMetricTone) {
  return tone;
}

function DashboardMetricCard({
  label,
  value,
  detail,
  badge,
  tone,
  icon: Icon,
}: DashboardMetricCardProps) {
  return (
    <div
      className={`h-[88px] min-w-[156px] max-w-[156px] rounded-[var(--radius-card)] border px-3 py-2.5 transition-colors hover:border-[var(--aa-shell-border-strong)] ${dashboardMetricCardToneClass(tone)}`}
    >
      <div className="flex items-start justify-between gap-3">
        <StatusBadge tone={dashboardMetricBadgeTone(tone)} className="min-h-6 px-2 py-0.5 text-[10px]">
          {badge}
        </StatusBadge>
        <Icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-ink-subtle" />
      </div>
      <p className="mt-2.5 text-[28px] font-semibold tracking-[-0.04em] text-ink">{value}</p>
      <p className="mt-0.5 truncate text-xs leading-5 text-ink-muted">{detail}</p>
      <span className="sr-only">{label}</span>
    </div>
  );
}

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffMinutes = Math.round((date.getTime() - Date.now()) / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, "day");
}

function DashboardPanel({
  label,
  action,
  children,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white p-4 transition-colors hover:border-[var(--aa-shell-border-strong)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {label}
        </p>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const [workspace, launch, commissions] = await Promise.all([
    getCurrentWorkspaceContext(),
    getLaunchReadinessData(),
    listCommissionItems(),
  ]);

  const financeSummary = launch.overview.financeSummary;
  const monitoring = launch.overview.monitoring;
  const actionableChecks = launch.checklist.filter(
    (check) => check.status === "blocked" || check.status === "attention",
  );
  const topPriority = actionableChecks[0] ?? null;
  const reviewQueuePreview = actionableChecks.slice(0, 2);
  const readyApps = launch.rules?.appleReadiness.filter((app) => app.ingestReady).length ?? 0;
  const totalApps = launch.rules?.appleReadiness.length ?? 0;
  const activeCreators = launch.team?.partnerUserCount ?? 0;
  const needsReviewCount =
    monitoring.queueVolume +
    (financeSummary.hasFinanceAccess ? financeSummary.pendingReviewCount : 0);
  const workspaceRole = workspace.role?.name ?? "No active membership";
  const workspaceName =
    workspace.organization?.name ??
    launch.organizationName ??
    "No organization linked";
  const latestResults = [...commissions.items]
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
    .slice(0, 5);
  const priorityCards = actionableChecks.slice(0, 2);

  const performanceSnapshot = [
    {
      label: "Tracked results",
      value: String(monitoring.recentReceiptCount),
      detail:
        monitoring.recentReceiptCount > 0
          ? "Recent Apple receipts are flowing."
          : "No recent results visible.",
      tone: monitoring.recentReceiptCount > 0 ? ("blue" as const) : ("amber" as const),
      badge: "Tracked results",
      icon: Activity,
    },
    {
      label: "Needs review",
      value: needsReviewCount > 0 ? String(needsReviewCount) : "Calm",
      detail: financeSummary.hasFinanceAccess
        ? `${monitoring.queueVolume} attribution and ${financeSummary.pendingReviewCount} finance items open.`
        : `${monitoring.queueVolume} attribution items open.`,
      tone: needsReviewCount > 0 ? ("amber" as const) : ("green" as const),
      badge: "Needs review",
      icon: AlertTriangle,
    },
    {
      label: "Approved earnings",
      value: financeSummary.hasFinanceAccess
        ? String(financeSummary.approvedCount)
        : "Hidden",
      detail: financeSummary.hasFinanceAccess
        ? "Reviewed commissions cleared for payout."
        : "Visible only to finance-safe roles.",
      tone:
        financeSummary.hasFinanceAccess && financeSummary.approvedCount > 0
          ? ("green" as const)
          : ("blue" as const),
      badge: "Approved earnings",
      icon: DollarSign,
    },
    {
      label: "Payout ready",
      value: financeSummary.hasFinanceAccess
        ? String(financeSummary.payoutTrackedCount)
        : "Hidden",
      detail: financeSummary.hasFinanceAccess
        ? `${financeSummary.draftBatchCount} draft and ${financeSummary.exportedBatchCount} exported batches in motion.`
        : "Visible only to finance-safe roles.",
      tone:
        financeSummary.hasFinanceAccess && financeSummary.payoutTrackedCount > 0
          ? ("green" as const)
          : ("blue" as const),
      badge: "Payout ready",
      icon: Wallet,
    },
    {
      label: "Active creators",
      value: String(activeCreators),
      detail:
        activeCreators > 0
          ? "Creator-linked identities are active."
          : "No active creator links yet.",
      tone: activeCreators > 0 ? ("green" as const) : ("amber" as const),
      badge: "Active creators",
      icon: Users,
    },
    {
      label: "Apple health",
      value: totalApps > 0 ? `${readyApps}/${totalApps} ready` : "No apps yet",
      detail:
        totalApps === 0
          ? "Add the first app lane."
          : monitoring.failedReceiptCount > 0 || monitoring.pendingReceiptCount > 0
            ? `${monitoring.failedReceiptCount} failed and ${monitoring.pendingReceiptCount} pending receipts need review.`
            : "Apple intake looks calm.",
      tone:
        monitoring.failedReceiptCount > 0
          ? ("red" as const)
          : totalApps > 0 && readyApps === totalApps && monitoring.pendingReceiptCount === 0
            ? ("green" as const)
            : ("amber" as const),
      badge: "Apple health",
      icon: Heart,
    },
  ];

  const quickActions = [
    {
      href: "/onboarding",
      title: "Continue activation",
      description: "Keep the first creator path moving.",
      badge: <StatusBadge tone="blue">Setup</StatusBadge>,
      icon: Rocket,
    },
    {
      href: "/codes",
      title: "Add code",
      description: "Create or assign the next trackable asset.",
      badge: <StatusBadge tone="blue">Program</StatusBadge>,
      icon: Code2,
    },
    {
      href: "/events",
      title: "Review activity",
      description: "Inspect the newest tracked results.",
      badge: <StatusBadge tone="blue">Activity</StatusBadge>,
      icon: Activity,
    },
    {
      href: "/payouts",
      title: "Open payouts",
      description: "Move approved work toward payout.",
      badge: <StatusBadge tone="blue">Finance</StatusBadge>,
      icon: Wallet,
    },
    {
      href: launch.appleHealthHref,
      title: "Open Apple health",
      description: "Check ingest readiness and receipt posture.",
      badge: <StatusBadge tone="blue">Apps</StatusBadge>,
      icon: Heart,
    },
  ];

  const activationProgress = buildActivationProgress(launch);
  const showActivationCard = !activationProgress.isComplete;

  return (
    <PageContainer>
      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-[22px] font-bold tracking-[-0.03em] text-ink">Dashboard</h1>
          <ActionLink href="/unattributed" variant="primary">
            Review queue
          </ActionLink>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>{workspaceName}</StatusBadge>
          <StatusBadge tone={toneForRoleLabel()}>{workspaceRole}</StatusBadge>
          <StatusBadge tone={toneForLaunchStatus(launch.overallStatus)}>
            {launch.completedChecks}/{launch.totalChecks} checks calm
          </StatusBadge>
        </div>
      </section>

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          {performanceSnapshot.map((metric) => (
            <DashboardMetricCard
              key={metric.label}
              label={metric.label}
              value={metric.value}
              detail={metric.detail}
              badge={metric.badge}
              tone={metric.tone}
              icon={metric.icon}
            />
          ))}
        </div>
      </section>

      {topPriority ? (
        <SurfaceCard density="compact" className="py-2.5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                <AlertTriangle size={16} strokeWidth={1.75} />
              </span>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {actionableChecks.length} active priorit{actionableChecks.length === 1 ? "y" : "ies"}
              </p>
              <p className="min-w-0 truncate text-sm text-ink-muted">{topPriority.title} needs attention.</p>
            </div>
            <Link
              href={topPriority.href}
              className="shrink-0 text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
            >
              Review now
            </Link>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.65fr)_minmax(320px,0.35fr)]">
        <div className="space-y-5">
          <DashboardPanel
            label="Needs attention"
            action={
              priorityCards.length > 0 ? (
                <Link
                  href={topPriority?.href ?? "/unattributed"}
                  className="text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
                >
                  Review now
                </Link>
              ) : undefined
            }
          >
            {priorityCards.length > 0 ? (
              <div className="space-y-2.5">
                {priorityCards.map((check) => (
                  <div
                    key={check.id}
                    className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                        <AlertTriangle size={16} strokeWidth={1.75} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[15px] font-semibold text-ink">{check.title}</p>
                          <StatusBadge tone={toneForLaunchStatus(check.status)}>
                            {check.label}
                          </StatusBadge>
                        </div>
                        <p className="mt-1 truncate text-sm text-ink-muted">{check.detail}</p>
                      </div>
                    </div>
                    <ActionLink href={check.href}>{actionLabelForCheck(check)}</ActionLink>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Rocket}
                title="Activation is the next useful step"
                description="New priorities will appear here when setup or review needs attention."
                action={
                  <ActionLink href="/onboarding" variant="primary">
                    Continue activation
                  </ActionLink>
                }
              />
            )}
          </DashboardPanel>

          <DashboardPanel
            label="Latest results"
            action={
              <Link
                href="/settings/audit"
                className="text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
              >
                Open audit
              </Link>
            }
          >
            {latestResults.length > 0 ? (
              <div>
                <div className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] gap-3 border-b border-[var(--aa-shell-border)] px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                  <span>Creator</span>
                  <span>Event</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">Time</span>
                </div>
                <div className="divide-y divide-[var(--aa-shell-border)]">
                  {latestResults.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] gap-3 px-1 py-2.5 text-sm"
                    >
                      <p className="truncate text-[15px] font-medium text-ink">{item.partnerName}</p>
                      <p className="truncate text-ink-muted">{item.eventType}</p>
                      <p className="text-right font-medium text-ink">
                        {item.commissionAmountLabel}
                      </p>
                      <p className="text-right text-ink-muted">
                        {formatRelativeTime(item.occurredAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="Your first tracked result will appear here"
                description="This feed fills with the newest creator-linked results after app, creator, and code setup are live."
                action={
                  <ActionLink href="/onboarding" variant="primary">
                    Continue activation
                  </ActionLink>
                }
              />
            )}
          </DashboardPanel>

          <DashboardPanel
            label="Review queue"
            action={
              <Link
                href="/unattributed"
                className="text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
              >
                Open full queue
              </Link>
            }
          >
            {reviewQueuePreview.length > 0 ? (
              <div className="space-y-2.5">
                {reviewQueuePreview.map((check) => (
                  <div
                    key={check.id}
                    className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={toneForLaunchStatus(check.status)}>
                          {check.label}
                        </StatusBadge>
                        <p className="text-[15px] font-semibold text-ink">{check.title}</p>
                      </div>
                      <p className="mt-1 truncate text-sm text-ink-muted">{check.detail}</p>
                    </div>
                    <ActionLink href={check.href}>Review</ActionLink>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title="The next review item will appear here"
                description="Records that need an attribution or readiness decision show up here after results start landing."
                action={
                  <ActionLink href="/events" variant="primary">
                    Open events
                  </ActionLink>
                }
              />
            )}
          </DashboardPanel>
        </div>

        <div className="space-y-5">
          <DashboardPanel label="Utilities">
            <div className="space-y-0.5">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-start gap-3 rounded-[var(--radius-card)] border border-transparent px-2 py-2.5 transition-colors hover:border-[var(--aa-shell-border)] hover:bg-surface"
                  >
                    <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-subtle">
                      <Icon size={16} strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{action.title}</p>
                        {action.badge}
                      </div>
                      <p className="mt-0.5 text-sm text-ink-muted">{action.description}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </DashboardPanel>

          {showActivationCard ? (
            <DashboardPanel
              label="Activation"
              action={
                <Link
                  href="/onboarding"
                  className="text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
                >
                  Continue activation →
                </Link>
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-ink">Activation is still in progress</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Keep the first creator path moving.
                  </p>
                </div>
                <StatusBadge tone={toneForActivationState("in_progress")}>
                  {activationProgress.completeCount}/{activationProgress.totalCount}
                </StatusBadge>
              </div>
              <div className="mt-4 flex items-center gap-2">
                {activationProgress.steps.map((step) => (
                  <span
                    key={step.label}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      step.complete ? "bg-primary" : "bg-[var(--aa-shell-border)]"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2.5 text-sm text-ink-muted">
                {activationProgress.completeCount === 0
                  ? "Start with app connection, then add the first creator."
                  : activationProgress.completeCount === activationProgress.totalCount - 1
                    ? "One setup step remains."
                    : `${activationProgress.completeCount} of ${activationProgress.totalCount} steps are already in place.`}
              </p>
              <div className="mt-3">
                <ActionLink href="/onboarding" variant="primary">
                  Continue activation →
                </ActionLink>
              </div>
            </DashboardPanel>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
