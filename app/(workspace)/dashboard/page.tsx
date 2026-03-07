import { redirect } from "next/navigation";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InsetPanel,
  InlineActionRow,
  ListTable,
  PageHeader,
  QuickActionTile,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getLaunchReadinessData,
  type LaunchReadinessCheck,
} from "@/lib/services/launch-readiness";
import { getAuditSettingsData } from "@/lib/services/settings";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

function toneForStatus(status: "ready" | "attention" | "blocked" | "informational") {
  if (status === "ready") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "danger" as const;
  }

  if (status === "attention") {
    return "warning" as const;
  }

  return "primary" as const;
}

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

function formatAuditTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const [workspace, launch, audit] = await Promise.all([
    getCurrentWorkspaceContext(),
    getLaunchReadinessData(),
    getAuditSettingsData(),
  ]);

  const financeSummary = launch.overview.financeSummary;
  const monitoring = launch.overview.monitoring;
  const actionableChecks = launch.checklist.filter(
    (check) => check.status === "blocked" || check.status === "attention",
  );
  const topPriority = actionableChecks[0] ?? null;
  const secondaryPriorities = actionableChecks.slice(1, 4);
  const latestResults = audit.recentEntries.slice(0, 4);
  const reviewQueuePreview = actionableChecks.slice(0, 4);
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

  const performanceSnapshot = [
    {
      label: "Tracked results",
      value: String(monitoring.recentReceiptCount),
      detail:
        monitoring.recentReceiptCount > 0
          ? "Recent Apple receipt rows are flowing into the current monitoring window."
          : "No recent tracked results are visible in the current monitoring window.",
      tone:
        monitoring.recentReceiptCount > 0 ? ("primary" as const) : ("warning" as const),
    },
    {
      label: "Needs review",
      value: needsReviewCount > 0 ? String(needsReviewCount) : "Calm",
      detail: financeSummary.hasFinanceAccess
        ? `${monitoring.queueVolume} attribution items and ${financeSummary.pendingReviewCount} commission reviews are still open.`
        : `${monitoring.queueVolume} attribution items are open. Finance review stays hidden for your role.`,
      tone:
        needsReviewCount > 0 ? ("warning" as const) : ("success" as const),
    },
    {
      label: "Approved earnings",
      value: financeSummary.hasFinanceAccess
        ? String(financeSummary.approvedCount)
        : "Hidden",
      detail: financeSummary.hasFinanceAccess
        ? "Approved commissions are ready for payout prep but not yet inside active batch tracking."
        : "Approved earning counts are only visible to owner, admin, or finance roles.",
      tone:
        financeSummary.hasFinanceAccess && financeSummary.approvedCount > 0
          ? ("primary" as const)
          : ("success" as const),
    },
    {
      label: "Payout ready",
      value: financeSummary.hasFinanceAccess
        ? String(financeSummary.payoutTrackedCount)
        : "Hidden",
      detail: financeSummary.hasFinanceAccess
        ? `${financeSummary.draftBatchCount} draft and ${financeSummary.exportedBatchCount} exported batches are in motion.`
        : "Payout tracking stays hidden until a finance-safe role opens the workspace.",
      tone:
        financeSummary.hasFinanceAccess && financeSummary.payoutTrackedCount > 0
          ? ("primary" as const)
          : ("success" as const),
    },
    {
      label: "Active creators",
      value: String(activeCreators),
      detail:
        activeCreators > 0
          ? "Creator-linked identities are active in the current workspace."
          : "No creator-linked identities are visible yet in the workspace.",
      tone: activeCreators > 0 ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Apple health",
      value: totalApps > 0 ? `${readyApps}/${totalApps} ready` : "No apps yet",
      detail:
        totalApps === 0
          ? "Add the first app and ingest key before relying on Apple health as a live signal."
          : monitoring.failedReceiptCount > 0 || monitoring.pendingReceiptCount > 0
            ? `${monitoring.failedReceiptCount} failed and ${monitoring.pendingReceiptCount} pending receipts still need review.`
            : "Apple intake looks calm for the current monitoring window.",
      tone:
        totalApps > 0 && readyApps === totalApps && monitoring.failedReceiptCount === 0 &&
        monitoring.pendingReceiptCount === 0
          ? ("success" as const)
          : ("warning" as const),
    },
  ];

  const quickActions = [
    {
      href: "/onboarding",
      title: "Invite creator",
      description: "Open the guided setup flow and issue the next creator-facing setup step.",
      badge: <StatusBadge tone="primary">Setup</StatusBadge>,
    },
    {
      href: "/codes",
      title: "Add code",
      description: "Create or assign the next promo code without leaving the workspace.",
      badge: <StatusBadge tone="success">Program</StatusBadge>,
    },
    {
      href: "/events",
      title: "Review activity",
      description: "Inspect the newest tracked events and operator-safe event detail.",
      badge: <StatusBadge tone="primary">Activity</StatusBadge>,
    },
    {
      href: "/payouts",
      title: "Open payouts",
      description: "Move approved commissions into batch tracking and finance follow-up.",
      badge: <StatusBadge tone="warning">Finance</StatusBadge>,
    },
    {
      href: "/settings/exports",
      title: "Export batch",
      description: "Download the current finance-safe export when a handoff is ready.",
      badge: <StatusBadge tone="warning">Export</StatusBadge>,
    },
    {
      href: launch.appleHealthHref,
      title: "Open Apple health",
      description: "Check ingest readiness and receipt posture for the active app lanes.",
      badge: <StatusBadge tone="primary">Apps</StatusBadge>,
    },
  ];

  const programHealth = [
    {
      label: "Creator coverage",
      value: activeCreators > 0 ? `${activeCreators} linked` : "Needs setup",
      detail:
        activeCreators > 0
          ? "Creator-linked identities are visible in the current workspace."
          : "Invite or link the first creator identity to make portal coverage real.",
      tone: activeCreators > 0 ? ("success" as const) : ("warning" as const),
      panelTone: activeCreators > 0 ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Code coverage",
      value: launch.rules
        ? `${launch.rules.activeOwnedCodeCount} linked`
        : "Access required",
      detail: launch.rules
        ? launch.rules.activeUnassignedCodeCount > 0
          ? `${launch.rules.activeUnassignedCodeCount} active codes still need creator ownership.`
          : "Active code ownership looks calm in the current workspace."
        : "Program setup signals appear after internal workspace access is confirmed.",
      tone:
        launch.rules && launch.rules.activeUnassignedCodeCount === 0
          ? ("success" as const)
          : ("warning" as const),
      panelTone:
        launch.rules && launch.rules.activeUnassignedCodeCount === 0
          ? ("success" as const)
          : ("warning" as const),
    },
    {
      label: "App readiness",
      value: totalApps > 0 ? `${readyApps}/${totalApps} ready` : "No apps yet",
      detail:
        totalApps === 0
          ? "Apple health becomes useful after the first app lane is configured."
          : "Use Apple health to confirm ingest keys, receipt flow, and current intake issues.",
      tone:
        totalApps > 0 && readyApps === totalApps ? ("success" as const) : ("warning" as const),
      panelTone:
        totalApps > 0 && readyApps === totalApps ? ("success" as const) : ("warning" as const),
    },
    {
      label: "Payout progress",
      value: financeSummary.hasFinanceAccess
        ? `${financeSummary.payoutTrackedCount} tracked`
        : "Role-limited",
      detail: financeSummary.hasFinanceAccess
        ? `${financeSummary.paidCount} paid records are already reconciled in history.`
        : "Finance-safe payout progress is only visible to owner, admin, or finance roles.",
      tone:
        financeSummary.hasFinanceAccess && financeSummary.payoutTrackedCount > 0
          ? ("primary" as const)
          : ("warning" as const),
      panelTone:
        financeSummary.hasFinanceAccess && financeSummary.payoutTrackedCount > 0
          ? ("primary" as const)
          : ("neutral" as const),
    },
    {
      label: "Workspace readiness",
      value: `${launch.completedChecks}/${launch.totalChecks} calm`,
      detail: launch.overallDetail,
      tone: toneForStatus(launch.overallStatus),
      panelTone: toneForStatus(launch.overallStatus),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Workspace"
        title="Dashboard"
        description="Track creator-driven growth, review what needs attention, and keep payouts moving with confidence."
        actions={
          <>
            {topPriority ? (
              <ActionLink href={topPriority.href} variant="primary">
                {actionLabelForCheck(topPriority)}
              </ActionLink>
            ) : (
              <ActionLink href="/unattributed" variant="primary">
                Review queue
              </ActionLink>
            )}
            <ActionLink href="/payouts">Open payouts</ActionLink>
            <ActionLink href="/settings">Open settings</ActionLink>
            <SignOutButton />
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForStatus(launch.overallStatus)}>
            {launch.overallLabel}
          </StatusBadge>
          <StatusBadge>{workspaceName}</StatusBadge>
          <StatusBadge tone="primary">{workspaceRole}</StatusBadge>
          <StatusBadge tone="neutral">
            {launch.completedChecks}/{launch.totalChecks} checks calm
          </StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {performanceSnapshot.map((metric) => (
          <StatCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            detail={metric.detail}
            tone={metric.tone}
            size="compact"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <SurfaceCard
          density="compact"
          className="border-[color:color-mix(in_srgb,var(--color-warning)_16%,var(--color-border))]"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-4">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-warning">
                Needs attention
              </p>
              <h2 className="mt-2 text-[1.55rem] font-semibold tracking-[-0.04em] text-ink">
                What needs attention now
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Prioritize unresolved attribution, finance follow-up, and intake blockers before deeper admin work.
              </p>
            </div>
            <StatusBadge tone={actionableChecks.length > 0 ? "warning" : "success"}>
              {actionableChecks.length > 0
                ? `${actionableChecks.length} active priorities`
                : "Nothing urgent open"}
            </StatusBadge>
          </div>

          <div className="mt-5">
            {topPriority ? (
              <div className="space-y-4">
                <InsetPanel tone={toneForStatus(topPriority.status)}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="max-w-3xl">
                      <p className="text-base font-semibold tracking-[-0.02em] text-ink">
                        {topPriority.title}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-ink-muted">
                        {topPriority.detail}
                      </p>
                    </div>
                    <StatusBadge tone={toneForStatus(topPriority.status)}>
                      {topPriority.label}
                    </StatusBadge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <ActionLink href={topPriority.href} variant="primary">
                      {actionLabelForCheck(topPriority)}
                    </ActionLink>
                    <ActionLink href="/onboarding">Open activation guide</ActionLink>
                  </div>
                </InsetPanel>

                {secondaryPriorities.length > 0 ? (
                  <div className="overflow-hidden rounded-[var(--radius-soft)] border border-border bg-[rgba(248,250,252,0.95)]">
                    {secondaryPriorities.map((check) => (
                      <InlineActionRow
                        key={check.id}
                        title={check.title}
                        description={check.detail}
                        badge={
                          <StatusBadge tone={toneForStatus(check.status)}>
                            {check.label}
                          </StatusBadge>
                        }
                        actions={
                          <ActionLink href={check.href}>
                            {actionLabelForCheck(check)}
                          </ActionLink>
                        }
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <EmptyState
                eyebrow="Needs attention"
                title="Nothing urgent is open right now"
                description="Queue, payout, and launch checks look calm in the current workspace view. Keep routine review close, but there is no immediate blocker."
                tone="success"
                action={
                  <ActionLink href="/onboarding" variant="primary">
                    Open activation guide
                  </ActionLink>
                }
              />
            )}
          </div>
        </SurfaceCard>

        <SectionCard
          eyebrow="Quick actions"
          title="Quick actions"
          description="Jump straight into the next workflow without scanning the whole workspace."
          className="h-full"
        >
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {quickActions.map((action) => (
              <QuickActionTile
                key={action.title}
                href={action.href}
                title={action.title}
                description={action.description}
                badge={action.badge}
              />
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ListTable
          eyebrow="Latest results"
          title="Latest results"
          description="The newest tracked changes and operator activity visible in the workspace."
          actions={<ActionLink href="/settings/audit">Open audit</ActionLink>}
        >
          {latestResults.length > 0 ? (
            latestResults.map((entry) => (
              <InlineActionRow
                key={entry.id}
                title={entry.summary}
                description={`${entry.entityLabel} • ${formatAuditTime(entry.createdAt)} • ${entry.actorLabel}`}
                badge={<StatusBadge tone={entry.tone}>{entry.actionLabel}</StatusBadge>}
                actions={<ActionLink href="/settings/audit">Open audit</ActionLink>}
              />
            ))
          ) : (
            <div className="p-5">
              <EmptyState
                eyebrow="Latest results"
                title="No recent activity is visible yet"
                description="Tracked results and internal workflow changes will collect here as the workspace gets used."
                action={<ActionLink href="/events">Open events</ActionLink>}
              />
            </div>
          )}
        </ListTable>

        <ListTable
          eyebrow="Review queue"
          title="Review queue"
          description="The next workflow checks waiting for action across attribution, finance, and setup."
          actions={<ActionLink href="/unattributed">Open queue</ActionLink>}
        >
          {reviewQueuePreview.length > 0 ? (
            reviewQueuePreview.map((check) => (
              <InlineActionRow
                key={check.id}
                title={check.title}
                description={check.detail}
                badge={
                  <StatusBadge tone={toneForStatus(check.status)}>{check.label}</StatusBadge>
                }
                actions={
                  <ActionLink href={check.href}>
                    {actionLabelForCheck(check)}
                  </ActionLink>
                }
              />
            ))
          ) : (
            <div className="p-5">
              <EmptyState
                eyebrow="Review queue"
                title="No review work is queued right now"
                description="Attribution and finance follow-up look calm in the current workspace view."
                action={<ActionLink href="/onboarding">Open activation guide</ActionLink>}
              />
            </div>
          )}
        </ListTable>
      </div>

      <SectionCard
        eyebrow="Program health"
        title="Program health"
        description="Coverage and readiness across creators, codes, apps, payouts, and the current launch posture."
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {programHealth.map((item) => (
            <InsetPanel key={item.label} tone={item.panelTone}>
              <StatusBadge tone={item.tone}>{item.label}</StatusBadge>
              <p className="mt-4 text-lg font-semibold tracking-[-0.03em] text-ink">
                {item.value}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{item.detail}</p>
            </InsetPanel>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
