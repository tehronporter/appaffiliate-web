import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";

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

export default async function OnboardingPage() {
  const launch = await getLaunchReadinessData();
  const completionPercent =
    launch.totalChecks > 0
      ? Math.round((launch.completedChecks / launch.totalChecks) * 100)
      : 0;
  const nextPriority =
    launch.checklist.find(
      (check) => check.status === "blocked" || check.status === "attention",
    ) ?? null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Launch checklist"
        description="Treat onboarding as the internal MVP launch checklist: confirm org and team context, verify Apple intake and queue posture, review finance state, and keep billing scoped honestly as launch planning only."
        actions={
          <>
            <ActionLink href="/dashboard">Back to overview</ActionLink>
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
          <StatusBadge tone="primary">
            {launch.totalChecks} launch checks
          </StatusBadge>
          <StatusBadge>{launch.billingReadiness.label}</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Completion"
          value={`${completionPercent}%`}
          detail={`${launch.completedChecks} of ${launch.totalChecks} actionable launch checks are currently calm.`}
          tone={toneForStatus(launch.overallStatus)}
        />
        <StatCard
          label="Organization"
          value={launch.organizationName ?? "Access required"}
          detail="Launch readiness stays org-scoped and internal-only."
          tone="primary"
        />
        <StatCard
          label="Next priority"
          value={nextPriority?.title ?? "Smoke test docs"}
          detail={nextPriority?.detail ?? "Core launch checks are calm. Finish the smoke pass and runbook review."}
          tone={nextPriority ? toneForStatus(nextPriority.status) : "success"}
        />
      </div>

      {!launch.hasWorkspaceAccess ? (
        <SectionCard
          title="Internal workspace access required"
          description="Launch readiness remains an internal operator surface."
        >
          <EmptyState
            eyebrow="Access required"
            title="Sign in with an internal workspace membership"
            description="Launch checks cannot be evaluated until the current user has internal workspace access."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Return to overview
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <ListTable
              eyebrow="Launch checklist"
              title="Move from internal setup to launch readiness"
              description="Each checklist row is backed by current data and points to the route where the operator can verify or fix the issue."
            >
              {launch.checklist.map((check) => (
                <InlineActionRow
                  key={check.id}
                  title={check.title}
                  description={check.detail}
                  badge={
                    <StatusBadge tone={toneForStatus(check.status)}>{check.label}</StatusBadge>
                  }
                  actions={
                    <ActionLink
                      href={check.href}
                      variant={check.status === "ready" ? "secondary" : "primary"}
                    >
                      Open
                    </ActionLink>
                  }
                />
              ))}
            </ListTable>

            <SectionCard
              eyebrow="Operator notes"
              title="Keep launch review calm"
              description="The checklist should help an operator finish launch prep, not turn into a wizard."
              items={[
                "Use settings and audit to confirm org, team, and current operational health.",
                "Use Apple health, events, and the unattributed queue to confirm intake is readable and exceptions are manageable.",
                "Use commissions, payouts, payout batches, and exports to confirm finance posture before handoff.",
                "Treat billing as an internal planning note only until a real billing model exists.",
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Launch signals
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="success">Apple intake</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Recent receipts
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {launch.overview.monitoring.recentReceiptCount} recent receipt rows are visible, with{" "}
                    {launch.overview.monitoring.failedReceiptCount} failed and{" "}
                    {launch.overview.monitoring.pendingReceiptCount} still pending.
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="warning">Queue posture</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Unattributed backlog
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {launch.overview.monitoring.queueVolume} items remain open and{" "}
                    {launch.overview.monitoring.inReviewQueueCount} are already in review.
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="primary">Finance</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Review and payout state
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {launch.overview.financeSummary.hasFinanceAccess
                      ? `${launch.overview.financeSummary.pendingReviewCount} commission reviews remain pending, with ${launch.overview.financeSummary.draftBatchCount} draft batches and ${launch.overview.financeSummary.exportedBatchCount} exported batches still open.`
                      : "Finance-sensitive counts are hidden for the current role. Validate them with an owner, admin, or finance account during launch smoke testing."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="primary">Billing</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Billing planning only
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    In-product billing is not active. Launch planning should assume billing and collection remain off-platform for this MVP.
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <SectionCard
              eyebrow="Runbook reminders"
              title="Keep the launch sequence explicit"
              description="Short reminders help operators stay consistent without turning the UI into a documentation center."
              items={[
                "Apply database migrations in filename order before smoke testing the app.",
                "Confirm at least one app has an ingest key and that recent receipt health is readable before accepting live Apple traffic.",
                "Review unattributed backlog before finance review so queue growth does not surprise operators after launch.",
                "Export finance CSVs only after reviewing commission state and payout batch posture, then confirm remittance separately.",
              ]}
            />
          </div>
        </>
      )}
    </PageContainer>
  );
}
