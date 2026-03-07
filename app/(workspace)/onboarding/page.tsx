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
import { getAuthenticatedUser } from "@/lib/auth";
import { getLaunchReadinessData, type LaunchReadinessCheck } from "@/lib/services/launch-readiness";

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

  if (check.href === "/codes") {
    return "Review codes";
  }

  if (check.href === "/unattributed") {
    return "Review queue";
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

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/onboarding");
  }

  const launch = await getLaunchReadinessData();
  const completionPercent =
    launch.totalChecks > 0
      ? Math.round((launch.completedChecks / launch.totalChecks) * 100)
      : 0;
  const nextPriority =
    launch.checklist.find(
      (check) => check.status === "blocked" || check.status === "attention",
    ) ?? null;
  const needsAction = launch.checklist.filter(
    (check) => check.status === "blocked" || check.status === "attention",
  );
  const readyChecks = launch.checklist.filter((check) => check.status === "ready");
  const planningChecks = launch.checklist.filter(
    (check) => check.status === "informational",
  );
  const readyApps = launch.rules?.appleReadiness.filter((app) => app.ingestReady).length ?? 0;
  const totalApps = launch.rules?.appleReadiness.length ?? 0;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Launch checklist"
        description="Use this page to move from workspace setup into live operating readiness. Each step is backed by current state and points to the next surface that should be reviewed."
        actions={
          <>
            <ActionLink href="/dashboard">Open dashboard</ActionLink>
            <ActionLink href="/settings" variant="primary">
              Open settings
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForStatus(launch.overallStatus)}>
            {launch.overallLabel}
          </StatusBadge>
          <StatusBadge tone="primary">{completionPercent}% complete</StatusBadge>
          <StatusBadge>{launch.billingReadiness.label}</StatusBadge>
        </div>
      </PageHeader>

      {!launch.hasWorkspaceAccess ? (
        <SurfaceCard>
          <EmptyState
            eyebrow="Access required"
            title="Internal workspace access is required first"
            description="Launch readiness can only be reviewed from an internal workspace membership. Sign in with the correct role before using this checklist."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SurfaceCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Progress
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                Move from setup into launch-ready operations
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
                The checklist favors the few items that actually affect launch posture: workspace basics, app and Apple readiness, partner and code coverage, queue health, finance review, and export access.
              </p>

              <div className="mt-6 rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                    Checklist progress
                  </p>
                  <p className="text-sm font-medium text-primary">
                    {launch.completedChecks} of {launch.totalChecks} complete
                  </p>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-ink-muted">
                  {launch.overallDetail}
                </p>
              </div>
            </SurfaceCard>

            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Next step
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                {nextPriority?.title ?? "Checklist is calm"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-muted">
                {nextPriority?.detail ??
                  "No blocked or attention-level checks are visible right now. Finish smoke testing and keep the checklist available as a periodic launch-readiness review."}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                {nextPriority ? (
                  <ActionLink href={nextPriority.href} variant="primary">
                    {actionLabelForCheck(nextPriority)}
                  </ActionLink>
                ) : (
                  <ActionLink href="/dashboard" variant="primary">
                    Open dashboard
                  </ActionLink>
                )}
                <ActionLink href={launch.appleHealthHref}>Apple health</ActionLink>
              </div>
              <div className="mt-6 space-y-3">
                {planningChecks.map((check) => (
                  <div
                    key={check.id}
                    className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                        {check.title}
                      </p>
                      <StatusBadge tone="primary">{check.label}</StatusBadge>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">{check.detail}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <StatCard
              label="Apps"
              value={totalApps > 0 ? `${readyApps}/${totalApps} ready` : "No apps yet"}
              detail={
                totalApps > 0
                  ? "Visible app lanes are checked against ingest-key coverage and recent receipt health."
                  : "Add the first app before launch readiness can move past intake setup."
              }
              tone={totalApps > 0 && readyApps === totalApps ? "success" : "warning"}
            />
            <StatCard
              label="Codes"
              value={
                launch.rules
                  ? `${launch.rules.activeOwnedCodeCount} linked`
                  : "Access required"
              }
              detail={
                launch.rules
                  ? launch.rules.activeUnassignedCodeCount > 0
                    ? `${launch.rules.activeUnassignedCodeCount} active codes still need partner ownership.`
                    : "Partner-linked code coverage is already in place."
                  : "Code coverage appears once workspace access is available."
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
              label="Finance"
              value={
                launch.overview.financeSummary.hasFinanceAccess
                  ? `${launch.overview.financeSummary.pendingReviewCount} pending`
                  : "Role-limited"
              }
              detail={
                launch.overview.financeSummary.hasFinanceAccess
                  ? `${launch.overview.financeSummary.draftBatchCount} draft and ${launch.overview.financeSummary.exportedBatchCount} exported payout batches remain open.`
                  : "Use an owner, admin, or finance role to validate final finance posture before launch."
              }
              tone="primary"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <ListTable
              eyebrow="Required before launch"
              title="Items that still need action"
              description="Focus here first. These checks are blocked or still need review before the workspace is fully calm."
            >
              {needsAction.length > 0 ? (
                needsAction.map((check) => (
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
                    eyebrow="Required before launch"
                    title="No blocking setup items are visible"
                    description="The checklist is calm for the current workspace view. Keep this page for verification and continue with routine review from the dashboard."
                    action={<ActionLink href="/dashboard">Open dashboard</ActionLink>}
                  />
                </div>
              )}
            </ListTable>

            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Setup sequence
              </p>
              <div className="mt-5 space-y-3">
                {[
                  {
                    title: "Workspace basics",
                    detail: launch.organization?.organizationName
                      ? `${launch.organization.organizationName} is visible and ${launch.team?.visibleMemberCount ?? 0} workspace members are in view.`
                      : "Confirm organization details and internal team access first.",
                  },
                  {
                    title: "App and Apple readiness",
                    detail:
                      totalApps > 0
                        ? `${readyApps} of ${totalApps} visible apps are ingest-ready. Open Apple health to review recent receipts.`
                        : "Add the first app and ingest key before launch review.",
                  },
                  {
                    title: "Partners and codes",
                    detail: launch.rules
                      ? `${launch.rules.activeOwnedCodeCount} active codes are linked to partners, with ${launch.rules.activeUnassignedCodeCount} still unassigned.`
                      : "Partner and code coverage appears once workspace access is confirmed.",
                  },
                  {
                    title: "Finance verification",
                    detail: launch.overview.financeSummary.hasFinanceAccess
                      ? `${launch.overview.financeSummary.pendingReviewCount} commission reviews remain pending before payout prep is fully calm.`
                      : "Run the final finance check with an owner, admin, or finance role.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4"
                  >
                    <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                      {item.title}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-ink-muted">{item.detail}</p>
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <ListTable
              eyebrow="Already in place"
              title="Checks that are already calm"
              description="These areas are currently configured or operating without active follow-up in the visible workspace view."
            >
              {readyChecks.length > 0 ? (
                readyChecks.map((check) => (
                  <InlineActionRow
                    key={check.id}
                    title={check.title}
                    description={check.detail}
                    badge={<StatusBadge tone="success">{check.label}</StatusBadge>}
                    actions={<ActionLink href={check.href}>Open</ActionLink>}
                  />
                ))
              ) : (
                <div className="p-5">
                  <EmptyState
                    eyebrow="Already in place"
                    title="No checks have reached a calm state yet"
                    description="Work through the required items first. Completed checks will collect here as launch posture improves."
                  />
                </div>
              )}
            </ListTable>

            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Launch planning
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
                Keep the rollout sequence explicit
              </h2>
              <div className="mt-5 space-y-3">
                {[
                  "Confirm Apple ingest visibility before relying on live receipt flow.",
                  "Review unattributed backlog before final finance review so open queue work is visible.",
                  "Use payout batches and exports only after commission state is reviewed.",
                  "Treat billing as planning only until a real in-product billing model exists.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4 text-sm leading-7 text-ink-muted"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </>
      )}
    </PageContainer>
  );
}
