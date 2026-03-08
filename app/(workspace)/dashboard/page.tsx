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
import type { ReactNode } from "react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InsetPanel,
  PageHeader,
  QuickActionTile,
  StatCard,
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

function billingStatusTone(
  status: Awaited<ReturnType<typeof getLaunchReadinessData>>["billingSummary"]["status"],
) {
  if (status === "trial_expired" || status === "missing") {
    return "amber" as const;
  }

  if (status === "manual_contact") {
    return "blue" as const;
  }

  return "green" as const;
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
    <SurfaceCard density="compact" className="shadow-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {label}
        </p>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </SurfaceCard>
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
  const activeCreators = launch.billingSummary.usage?.activeCreators.used ?? 0;
  const needsReviewCount =
    monitoring.queueVolume +
    (financeSummary.hasFinanceAccess ? financeSummary.pendingReviewCount : 0);
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
          ? "Recent receipts flowing."
          : "No recent results yet.",
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
        ? "Cleared for payout."
        : "Finance-only.",
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
        ? `${financeSummary.draftBatchCount} draft and ${financeSummary.exportedBatchCount} exported in motion.`
        : "Finance-only.",
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
          ? "Creator records live."
          : "No active creators yet.",
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
            ? `${monitoring.failedReceiptCount} failed and ${monitoring.pendingReceiptCount} pending.`
            : "Apple intake calm.",
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
      title: "Activation guide",
      description: "Continue setup.",
      badge: undefined,
      icon: Rocket,
    },
    {
      href: "/codes",
      title: "Add code",
      description: "Create or assign the next asset.",
      badge: undefined,
      icon: Code2,
    },
    {
      href: "/events",
      title: "Review activity",
      description: "Inspect tracked results.",
      badge: undefined,
      icon: Activity,
    },
    {
      href: "/payouts",
      title: "Open payouts",
      description: "Move approved work forward.",
      badge: undefined,
      icon: Wallet,
    },
    {
      href: launch.appleHealthHref,
      title: "Open Apple health",
      description: "Check ingest readiness.",
      badge: undefined,
      icon: Heart,
    },
  ];

  const activationProgress = buildActivationProgress(launch);
  const showActivationCard = !activationProgress.isComplete;

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description="Review priorities and recent results."
        actions={
          <ActionLink href="/unattributed" variant="primary">
            Review queue
          </ActionLink>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>{workspaceName}</StatusBadge>
          <StatusBadge tone={billingStatusTone(launch.billingSummary.status)}>
            {launch.billingSummary.planName ?? "No plan"}
          </StatusBadge>
        </div>
      </PageHeader>

      <section>
        <div className="aa-stat-grid">
          {performanceSnapshot.map((metric) => {
            const Icon = metric.icon;

            return (
              <StatCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                detail={metric.detail}
                tone={metric.tone}
                size="compact"
                badge={
                  <StatusBadge tone={metric.tone} className="min-h-6 px-2 py-0.5 text-[10px]">
                    {metric.badge}
                  </StatusBadge>
                }
                icon={<Icon size={16} strokeWidth={1.75} />}
              />
            );
          })}
        </div>
      </section>

      {topPriority ? (
        <SurfaceCard density="compact" className="py-2.5 shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning">
                <AlertTriangle size={16} strokeWidth={1.75} />
              </span>
              <p className="shrink-0 text-sm font-semibold text-ink">
                {actionableChecks.length} active priorit{actionableChecks.length === 1 ? "y" : "ies"}
              </p>
              <p
                className="min-w-0 text-sm text-ink-muted"
                title={`${topPriority.title} needs attention.`}
              >
                {topPriority.title} needs attention.
              </p>
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
                  <InsetPanel
                    key={check.id}
                    tone={check.status === "blocked" ? "amber" : "default"}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
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
                        <p className="mt-1 text-sm text-ink-muted" title={check.detail}>
                          {check.detail}
                        </p>
                      </div>
                    </div>
                    <ActionLink href={check.href}>{actionLabelForCheck(check)}</ActionLink>
                  </InsetPanel>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Rocket}
                title="Activation is the next useful step"
                description="New priorities will appear here when setup or review needs attention."
                action={
                  <ActionLink href="/onboarding" variant="primary">
                    Activation guide
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
                <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] gap-3 border-b border-[var(--aa-shell-border)] px-1 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle sm:grid">
                  <span>Creator</span>
                  <span>Event</span>
                  <span className="text-right">Value</span>
                  <span className="text-right">Time</span>
                </div>
                <div className="divide-y divide-[var(--aa-shell-border)]">
                  {latestResults.map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-3 px-1 py-3 text-sm sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto_auto] sm:py-2.5"
                    >
                      <div>
                        <span className="aa-mobile-label sm:hidden">Creator</span>
                        <p className="truncate text-[15px] font-medium text-ink" title={item.partnerName}>
                          {item.partnerName}
                        </p>
                      </div>
                      <div>
                        <span className="aa-mobile-label sm:hidden">Event</span>
                        <p className="truncate text-ink-muted" title={item.eventType}>
                          {item.eventType}
                        </p>
                      </div>
                      <div>
                        <span className="aa-mobile-label sm:hidden">Value</span>
                        <p className="font-medium text-ink sm:text-right">
                        {item.commissionAmountLabel}
                        </p>
                      </div>
                      <div>
                        <span className="aa-mobile-label sm:hidden">Time</span>
                        <p className="text-ink-muted sm:text-right">
                        {formatRelativeTime(item.occurredAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                icon={Activity}
                title="Your first tracked result will appear here"
                description="Results show after app, creator, and code setup."
                action={
                  <ActionLink href="/onboarding" variant="primary">
                    Activation guide
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
                Open queue
              </Link>
            }
          >
            {reviewQueuePreview.length > 0 ? (
              <div className="space-y-2.5">
                {reviewQueuePreview.map((check) => (
                  <InsetPanel
                    key={check.id}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={toneForLaunchStatus(check.status)}>
                          {check.label}
                        </StatusBadge>
                        <p className="text-[15px] font-semibold text-ink">{check.title}</p>
                      </div>
                      <p className="mt-1 text-sm text-ink-muted" title={check.detail}>
                        {check.detail}
                      </p>
                    </div>
                    <ActionLink href={check.href}>Review</ActionLink>
                  </InsetPanel>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title="The next review item will appear here"
                description="Records that need a decision appear here."
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
          <DashboardPanel
            label="Plan and trial"
            action={
              <Link
                href="/settings"
                className="text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
              >
                Open settings
              </Link>
            }
          >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[15px] font-semibold text-ink">
                    {launch.billingSummary.planName ?? "Workspace billing"}
                  </p>
                {launch.billingSummary.billingIntervalLabel ? (
                  <StatusBadge tone="blue">
                    {launch.billingSummary.billingIntervalLabel}
                  </StatusBadge>
                ) : null}
                <StatusBadge tone={billingStatusTone(launch.billingSummary.status)}>
                  {launch.billingSummary.statusLabel}
                </StatusBadge>
              </div>
              <p className="text-sm leading-6 text-ink-muted">
                {launch.billingSummary.detail}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <InsetPanel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                    Trial end
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {launch.billingSummary.trialEndsLabel ?? "Manual contact"}
                  </p>
                </InsetPanel>
                <InsetPanel>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                    Usage
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink">
                    {launch.billingSummary.usage?.apps.used ?? 0} apps ·{" "}
                    {launch.billingSummary.usage?.activeCreators.used ?? 0} active creators
                  </p>
                </InsetPanel>
              </div>
              <div className="space-y-2">
                {launch.billingSummary.notes.slice(0, 2).map((note) => (
                  <p key={note} className="text-sm leading-6 text-ink-muted">
                    {note}
                  </p>
                ))}
              </div>
            </div>
          </DashboardPanel>

          <DashboardPanel label="Utilities">
            <div className="space-y-2">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <QuickActionTile
                    key={action.title}
                    href={action.href}
                    title={action.title}
                    description={action.description}
                    badge={action.badge}
                    icon={<Icon size={16} strokeWidth={1.75} />}
                  />
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
                  Activation guide
                </Link>
              }
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[15px] font-semibold text-ink">Activation is still in progress</p>
                  <p className="mt-1 text-sm text-ink-muted">
                    Keep setup moving.
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
                  Activation guide
                </ActionLink>
              </div>
            </DashboardPanel>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
