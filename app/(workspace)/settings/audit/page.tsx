import { ActionLink } from "@/components/app-shell";
import {
  EmptyState,
  InsetPanel,
  InlineActionRow,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import { getAuditSettingsData } from "@/lib/services/settings";
import { toneForSystemStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

export default async function SettingsAuditPage() {
  const data = await getAuditSettingsData();

  return (
    <SettingsPageFrame
      activeSection="audit"
      title="Audit and monitoring"
      description="Read the real operator trail beside the lightweight operational health view: partner and code changes, manual review actions, finance approvals, payout lifecycle events, export downloads, recent receipt health, and failed jobs."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/review?view=all">Open review</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="green">Audit trail</StatusBadge>
          <StatusBadge tone={toneForWorkspaceLabel()}>Operational monitoring</StatusBadge>
          <StatusBadge tone="amber">Lightweight jobs view</StatusBadge>
        </div>
      }
      stats={[
        {
          label: "Recent entries",
          value: String(data.totalEntries),
          detail: "Audit keeps the current manual and finance workflow history readable in one place.",
          tone: "blue",
        },
        {
          label: "Manual review actions",
          value: String(data.manualReviewCount),
          detail: "Queue review and manual attribution changes stay visible instead of becoming silent state transitions.",
          tone: "amber",
        },
        {
          label: "Finance actions",
          value: String(data.financeActionCount),
          detail: "Commission approvals, payout lifecycle changes, and export downloads remain distinct.",
          tone: "green",
        },
      ]}
    >
      {!data.hasWorkspaceAccess ? (
        <SectionCard
          title="Internal workspace access required"
          description="Audit and monitoring are internal-only because they expose operator history and finance-safe signals."
        >
          <EmptyState
            eyebrow="Access required"
            title="No internal audit view is available"
            description="Sign in with an internal workspace role to review activity and operational health."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
            <SectionCard
              title="Recent audit history"
              description="Keep the timeline readable and operational instead of turning it into a generic event firehose."
            >
              <div className="space-y-3">
                {data.recentEntries.length === 0 ? (
                  <EmptyState
                    eyebrow="No activity yet"
                    title="No audit entries are visible yet"
                    description="Audit history appears here as operators change partner, code, attribution, commission, payout, export, organization, or team state."
                  />
                ) : null}

                {data.recentEntries.map((entry) => (
                  <InsetPanel key={entry.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-ink">{entry.summary}</p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {entry.actorLabel}
                          {entry.actorRoleLabel ? ` • ${entry.actorRoleLabel}` : ""}
                        </p>
                      </div>
                      <StatusBadge tone={entry.tone}>{entry.actionLabel}</StatusBadge>
                    </div>
                    <p className="mt-3 text-sm text-ink-muted">
                      {entry.entityLabel} •{" "}
                      {new Date(entry.createdAt).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "UTC",
                      })}{" "}
                      UTC
                    </p>
                  </InsetPanel>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Coverage summary"
              description="These counts help operators judge whether the main internal workflows are leaving the expected trail."
              items={[
                `Partner and code change entries in view: ${data.partnerChangeCount}.`,
                `Manual review and attribution entries in view: ${data.manualReviewCount}.`,
                `Finance workflow entries in view: ${data.financeActionCount}.`,
                `Explicit export download entries in view: ${data.exportEventCount}.`,
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <SectionCard
              title="Operational health"
              description="Keep recent Apple ingest, queue, finance, and job signals visible without creating a separate jobs product."
              items={[
                `Recent Apple receipts in view: ${data.monitoring.recentReceiptCount}.`,
                `Receipts failed in this window: ${data.monitoring.failedReceiptCount}.`,
                `Receipts still pending processing: ${data.monitoring.pendingReceiptCount}.`,
                `Queue items still open: ${data.monitoring.queueVolume}.`,
                data.monitoring.financeSummary.hasFinanceAccess
                  ? `Commission review pending: ${data.monitoring.financeSummary.pendingReviewCount}.`
                  : "Finance-sensitive monitoring stays hidden until a finance-safe role opens the route.",
                data.monitoring.financeSummary.hasFinanceAccess
                  ? `Payout batches in motion: ${data.monitoring.financeSummary.draftBatchCount} draft and ${data.monitoring.financeSummary.exportedBatchCount} exported.`
                  : "Draft and exported payout batch counts remain part of the finance-safe monitoring subset.",
              ]}
            />

            <SectionCard
              title="Recent jobs and receipts"
              description="Show the newest operational rows only, then send operators back to the source workflow when action is needed."
            >
              <div className="space-y-3">
                {data.monitoring.recentJobs.slice(0, 3).map((job) => (
                  <InlineActionRow
                    key={job.id}
                    title={job.jobName}
                    description={
                      job.errorMessage
                        ? job.errorMessage
                        : `${job.scope} job created ${new Date(job.createdAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                            timeZone: "UTC",
                          })} UTC.`
                    }
                    badge={
                      <StatusBadge tone={toneForSystemStatus(job.status)}>{job.status}</StatusBadge>
                    }
                  />
                ))}

                {data.monitoring.recentReceipts.slice(0, 3).map((receipt) => (
                  <InlineActionRow
                    key={receipt.id}
                    title={receipt.appName}
                    description={
                      receipt.errorMessage
                        ? receipt.errorMessage
                        : `${receipt.notificationType} with ${receipt.verificationStatus} verification posture.`
                    }
                    badge={
                      <StatusBadge tone={toneForSystemStatus(receipt.processedStatus)}>
                        {receipt.processedStatus}
                      </StatusBadge>
                    }
                    actions={<ActionLink href="/review?view=all">Open review</ActionLink>}
                  />
                ))}

                {data.monitoring.recentJobs.length === 0 &&
                data.monitoring.recentReceipts.length === 0 ? (
                  <EmptyState
                    eyebrow="Calm window"
                    title="No recent job or receipt rows are visible"
                    description="That may be normal. Use Apple health or the event log if you need to confirm whether intake is simply quiet."
                  />
                ) : null}
              </div>
            </SectionCard>
          </div>
        </>
      )}
    </SettingsPageFrame>
  );
}
