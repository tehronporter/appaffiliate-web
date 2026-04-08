import { ActionLink } from "@/components/app-shell";
import {
  EmptyState,
  InsetPanel,
  InlineActionRow,
  SectionCard,
  SurfaceCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import { settingsSections } from "@/lib/settings-navigation";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { toneForLaunchStatus, toneForSystemStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

function sectionStatus(
  sectionId: string,
  data: Awaited<ReturnType<typeof getLaunchReadinessData>>["overview"],
) {
  if (sectionId === "organization") {
    return {
      label: "Editable + honest read-only",
      tone: "green" as const,
    };
  }

  if (sectionId === "team") {
    return {
      label: data.visibleMemberCount > 0 ? "Live membership context" : "No visible members",
      tone: data.visibleMemberCount > 0 ? ("green" as const) : ("amber" as const),
    };
  }

  if (sectionId === "rules") {
    return {
      label: data.activeRuleCount > 0 ? "Live config context" : "Read-only posture",
      tone: data.activeRuleCount > 0 ? ("green" as const) : ("amber" as const),
    };
  }

  if (sectionId === "exports") {
    return {
      label: data.financeSummary.hasFinanceAccess ? "Finance-gated live" : "Finance role required",
      tone: data.financeSummary.hasFinanceAccess
        ? ("green" as const)
        : ("amber" as const),
    };
  }

  return {
    label: data.auditEntryCount > 0 ? "Live history" : "Ready for first entries",
    tone: data.auditEntryCount > 0 ? ("blue" as const) : ("amber" as const),
  };
}

export default async function SettingsPage() {
  const launch = await getLaunchReadinessData();
  const data = launch.overview;

  return (
    <SettingsPageFrame
      activeSection="overview"
      title="Settings"
      description="Manage organization, team, rules, exports, and audit controls."
      actions={<SettingsHubActions />}
      stats={[
        {
          label: "Organization",
          value: data.organizationName ?? "Access required",
          detail: "Live organization identity.",
          tone: toneForWorkspaceLabel(),
        },
        {
          label: "Launch status",
          value: launch.overallLabel,
          detail: launch.overallDetail,
          tone: toneForLaunchStatus(launch.overallStatus),
        },
        {
          label: "Visible members",
          value: String(data.visibleMemberCount),
          detail: "Visible in the current workspace.",
          tone: "green",
        },
      ]}
    >
      {!data.hasWorkspaceAccess ? (
        <SectionCard
          title="Internal workspace access required"
          description="These controls remain internal-only."
        >
          <EmptyState
            eyebrow="Access required"
            title="Sign in with an internal workspace membership"
            description="Internal settings, audit, and monitoring require a workspace membership."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Settings map
              </p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface">
                {settingsSections.map((section) => {
                  const status = sectionStatus(section.id, data);

                  return (
                    <InlineActionRow
                      key={section.id}
                      title={section.title}
                      description={section.description}
                      badge={<StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
                      actions={
                        <ActionLink href={section.href} variant="primary">
                          Open
                        </ActionLink>
                      }
                    />
                  );
                })}
              </div>
            </SurfaceCard>

            <SectionCard
              title="Current state"
              description="Keep the key operational signals close to settings."
              items={[
                `Overall launch posture: ${launch.overallLabel}.`,
                `Recent Apple receipts in view: ${data.monitoring.recentReceiptCount}.`,
                `Receipts currently failed or pending: ${data.monitoring.failedReceiptCount + data.monitoring.pendingReceiptCount}.`,
                `Unattributed queue still open: ${data.monitoring.queueVolume}.`,
                data.financeSummary.hasFinanceAccess
                  ? `Finance review still pending: ${data.financeSummary.pendingReviewCount}.`
                  : "Finance-only counts stay hidden until an owner, admin, or finance role opens the surface.",
                data.financeSummary.hasFinanceAccess
                  ? `Draft and exported payout batches: ${data.financeSummary.draftBatchCount} draft, ${data.financeSummary.exportedBatchCount} exported.`
                  : "Payout batch counts stay on the finance side of the current role boundary.",
              ]}
              actions={<ActionLink href="/settings/audit">Open audit and monitoring</ActionLink>}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Next actions"
              description="Use these checks to decide what needs attention next."
            >
              <div className="space-y-3">
                {launch.checklist.map((check) => (
                  <InlineActionRow
                    key={check.id}
                    title={check.title}
                    description={check.detail}
                    badge={
                      <StatusBadge tone={toneForLaunchStatus(check.status)}>{check.label}</StatusBadge>
                    }
                    actions={<ActionLink href={check.href}>Open</ActionLink>}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Plan and trial"
              description="Workspace billing state is persisted before Stripe is active."
              items={[
                launch.billingSummary.planName && launch.billingSummary.billingIntervalLabel
                  ? `${launch.billingSummary.planName} · ${launch.billingSummary.billingIntervalLabel}.`
                  : launch.billingSummary.statusLabel,
                launch.billingSummary.detail,
                launch.billingSummary.usage?.apps.summary ?? "App usage is not available.",
                launch.billingSummary.usage?.activeCreators.summary ?? "Creator usage is not available.",
                ...launch.billingSummary.notes,
              ]}
              actions={<ActionLink href="/pricing">Open pricing</ActionLink>}
            />

            <SectionCard
              title="Recent operational signals"
              description="Enough to spot work that needs attention fast."
            >
              <div className="space-y-3">
                {data.monitoring.recentReceipts.slice(0, 3).map((receipt) => (
                  <InsetPanel key={receipt.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{receipt.appName}</p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {receipt.notificationType} • {receipt.verificationStatus}
                        </p>
                      </div>
                      <StatusBadge tone={toneForSystemStatus(receipt.processedStatus)}>
                        {receipt.processedStatus}
                      </StatusBadge>
                    </div>
                  </InsetPanel>
                ))}

                {data.monitoring.recentReceipts.length === 0 ? (
                  <EmptyState
                    eyebrow="No receipt traffic"
                    title="No Apple receipts are visible in the current window"
                    description="This may be normal for a quiet app. Confirm ingest readiness on rules or app health."
                    action={
                      <ActionLink href="/settings/rules" variant="primary">
                        Review rules
                      </ActionLink>
                    }
                  />
                ) : null}
              </div>
            </SectionCard>

            <SectionCard
              title="Runbook boundary"
              description="Keep the launch sequence explicit while payment collection and billing administration remain off-platform."
              items={[
                "Stripe, invoices, and charge collection are still deferred.",
                "Trial expiry is tracked in-product, but workspace access remains soft until billing ships.",
                "Apply database migrations in filename order before launch smoke testing.",
                "Confirm Apple ingest, unattributed backlog, finance review, and export access before calling the workspace launch-ready.",
              ]}
            />
          </div>
        </>
      )}
    </SettingsPageFrame>
  );
}
