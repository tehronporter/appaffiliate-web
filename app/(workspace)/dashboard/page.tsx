import { redirect } from "next/navigation";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  ListTable,
  PageHeader,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth";
import { getLaunchReadinessData, type LaunchReadinessCheck } from "@/lib/services/launch-readiness";
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
    return "Review finance";
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
  const nextPriority =
    launch.checklist.find(
      (check) => check.status === "blocked" || check.status === "attention",
    ) ?? null;
  const needsReview = launch.checklist.filter(
    (check) => check.status === "blocked" || check.status === "attention",
  );
  const calmChecks = launch.checklist.filter((check) => check.status === "ready").slice(0, 3);
  const recentEntries = audit.recentEntries.slice(0, 4);
  const readyApps = launch.rules?.appleReadiness.filter((app) => app.ingestReady).length ?? 0;
  const totalApps = launch.rules?.appleReadiness.length ?? 0;
  const workspaceRole = workspace.role?.name ?? "No active membership";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Operations overview"
        description="Start here for the current operating posture: what needs attention now, what is healthy, and which surface should be opened next."
        actions={
          <>
            <ActionLink href="/onboarding">Open launch checklist</ActionLink>
            <ActionLink href="/settings" variant="primary">
              Open settings
            </ActionLink>
            <SignOutButton />
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForStatus(launch.overallStatus)}>
            {launch.overallLabel}
          </StatusBadge>
          <StatusBadge>{workspace.organization?.name ?? "No organization linked"}</StatusBadge>
          <StatusBadge tone="primary">{workspaceRole}</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard
          label="Apple health"
          value={totalApps > 0 ? `${readyApps}/${totalApps} ready` : "No apps yet"}
          detail={
            totalApps > 0
              ? `${launch.overview.monitoring.failedReceiptCount} failed and ${launch.overview.monitoring.pendingReceiptCount} pending receipts in the current monitoring window.`
              : "Add the first app and ingest key before relying on Apple health as a live signal."
          }
          tone={totalApps > 0 && readyApps === totalApps ? "success" : "warning"}
        />
        <StatCard
          label="Code coverage"
          value={
            launch.rules
              ? `${launch.rules.activeOwnedCodeCount} linked`
              : "Access required"
          }
          detail={
            launch.rules
              ? launch.rules.activeUnassignedCodeCount > 0
                ? `${launch.rules.activeUnassignedCodeCount} active codes still need partner ownership.`
                : "Active promo code ownership is calm in the current workspace view."
              : "Workspace access is required before program setup can be reviewed."
          }
          tone={
            !launch.rules || launch.rules.activeOwnedCodeCount === 0
              ? "warning"
              : launch.rules.activeUnassignedCodeCount > 0
                ? "warning"
                : "success"
          }
        />
        <StatCard
          label="Unattributed queue"
          value={
            launch.overview.monitoring.queueVolume > 0
              ? `${launch.overview.monitoring.queueVolume} open`
              : "Queue clear"
          }
          detail={
            launch.overview.monitoring.queueVolume > 0
              ? `${launch.overview.monitoring.inReviewQueueCount} items are already in review.`
              : "No unattributed backlog is visible in the current workspace view."
          }
          tone={launch.overview.monitoring.queueVolume > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Finance posture"
          value={
            launch.overview.financeSummary.hasFinanceAccess
              ? `${launch.overview.financeSummary.pendingReviewCount} pending`
              : "Role-limited"
          }
          detail={
            launch.overview.financeSummary.hasFinanceAccess
              ? `${launch.overview.financeSummary.draftBatchCount} draft and ${launch.overview.financeSummary.exportedBatchCount} exported payout batches remain open.`
              : "Finance-sensitive counts are hidden until an owner, admin, or finance role opens the surface."
          }
          tone={
            launch.overview.financeSummary.hasFinanceAccess &&
            launch.overview.financeSummary.pendingReviewCount === 0 &&
            launch.overview.financeSummary.draftBatchCount === 0 &&
            launch.overview.financeSummary.exportedBatchCount === 0
              ? "success"
              : "primary"
          }
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ListTable
          eyebrow="Needs review"
          title="Current priorities"
          description="These are the live checks that still need review or follow-up from an internal operator."
        >
          {needsReview.length > 0 ? (
            needsReview.map((check) => (
              <InlineActionRow
                key={check.id}
                title={check.title}
                description={check.detail}
                badge={
                  <StatusBadge tone={toneForStatus(check.status)}>{check.label}</StatusBadge>
                }
                actions={
                  <ActionLink href={check.href} variant="primary">
                    {actionLabelForCheck(check)}
                  </ActionLink>
                }
              />
            ))
          ) : (
            <div className="p-5">
              <EmptyState
                eyebrow="Current priorities"
                title="No urgent follow-up is visible right now"
                description="Core launch and operational checks are calm in the current workspace view. Continue with routine review and smoke-test verification as needed."
                action={<ActionLink href="/onboarding">Open launch checklist</ActionLink>}
              />
            </div>
          )}
        </ListTable>

        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Next best action
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
            {nextPriority?.title ?? "Stay on top of daily review"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            {nextPriority?.detail ??
              "No blocked or attention-level checks are visible right now. Use the checklist for periodic verification and keep daily workflow routes close by."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {nextPriority ? (
              <ActionLink href={nextPriority.href} variant="primary">
                {actionLabelForCheck(nextPriority)}
              </ActionLink>
            ) : (
              <ActionLink href="/onboarding" variant="primary">
                Open launch checklist
              </ActionLink>
            )}
            <ActionLink href={launch.appleHealthHref}>Apple health</ActionLink>
            <ActionLink href="/unattributed">Review queue</ActionLink>
          </div>

          <div className="mt-6 space-y-3">
            {calmChecks.length > 0 ? (
              calmChecks.map((check) => (
                <div
                  key={check.id}
                  className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                      {check.title}
                    </p>
                    <StatusBadge tone="success">{check.label}</StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-ink-muted">{check.detail}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4 text-sm leading-7 text-ink-muted">
                Calm checks will collect here as launch posture improves.
              </div>
            )}
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Operations posture
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
            Live signals across setup, intake, and finance
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] p-4">
              <StatusBadge tone="primary">Workspace</StatusBadge>
              <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink">
                {workspace.organization?.name ?? "No organization linked"}
              </p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                {workspace.membership
                  ? `${workspaceRole} access is active for this workspace view.`
                  : "Attach an internal membership before relying on the control center."}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] p-4">
              <StatusBadge tone="success">Apple intake</StatusBadge>
              <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink">
                {launch.overview.monitoring.recentReceiptCount} recent receipts
              </p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                {launch.overview.monitoring.failedReceiptCount === 0 &&
                launch.overview.monitoring.pendingReceiptCount === 0
                  ? "No failed or pending receipt rows are visible in the current monitoring window."
                  : `${launch.overview.monitoring.failedReceiptCount} failed and ${launch.overview.monitoring.pendingReceiptCount} pending receipt rows still need review.`}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] p-4">
              <StatusBadge tone="warning">Program setup</StatusBadge>
              <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink">
                {launch.rules
                  ? `${launch.rules.activeOwnedCodeCount} linked codes`
                  : "Access required"}
              </p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                {launch.rules
                  ? launch.rules.activeUnassignedCodeCount > 0
                    ? `${launch.rules.activeUnassignedCodeCount} active codes still need partner ownership.`
                    : "Partner-linked code coverage is already in place for the current workspace view."
                  : "Program setup signals appear after internal workspace access is confirmed."}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] p-4">
              <StatusBadge tone="primary">Finance</StatusBadge>
              <p className="mt-4 text-lg font-semibold tracking-[-0.02em] text-ink">
                {launch.overview.financeSummary.hasFinanceAccess
                  ? `${launch.overview.financeSummary.approvedCount} approved`
                  : "Role-limited"}
              </p>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                {launch.overview.financeSummary.hasFinanceAccess
                  ? `${launch.overview.financeSummary.payoutTrackedCount} payout-tracked and ${launch.overview.financeSummary.paidCount} paid records are visible.`
                  : "Open finance-sensitive surfaces with an owner, admin, or finance role to validate payout posture."}
              </p>
            </div>
          </div>
        </SurfaceCard>

        <ListTable
          eyebrow="Recent activity"
          title="Important internal changes"
          description="Recent audit activity helps operators confirm what changed before moving into deeper review."
        >
          {recentEntries.length > 0 ? (
            recentEntries.map((entry) => (
              <InlineActionRow
                key={entry.id}
                title={entry.actionLabel}
                description={`${entry.summary} • ${formatAuditTime(entry.createdAt)} • ${entry.actorLabel}`}
                badge={<StatusBadge tone={entry.tone}>{entry.entityLabel}</StatusBadge>}
                actions={<ActionLink href="/settings/audit">Open audit</ActionLink>}
              />
            ))
          ) : (
            <div className="p-5">
              <EmptyState
                eyebrow="Audit"
                title="No recent activity is visible yet"
                description="Audit history will appear here as partner, attribution, finance, and settings changes are recorded."
                action={<ActionLink href="/settings/audit">Open audit</ActionLink>}
              />
            </div>
          )}
        </ListTable>
      </div>
    </PageContainer>
  );
}
