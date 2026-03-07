import { PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
import { listPortalPerformance } from "@/lib/services/portal";

function toneForStatus(status: string) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "included_in_payout") {
    return "primary" as const;
  }

  if (status === "approved") {
    return "success" as const;
  }

  if (status === "not_approved") {
    return "danger" as const;
  }

  return "warning" as const;
}

export default async function PartnerPortalPerformancePage() {
  const data = await listPortalPerformance();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="py-8 lg:py-10">
      <PageHeader
        eyebrow="Partner portal"
        title="Performance and earnings"
        description="This view shows attributed events and the current commission status for your partner account. Amounts remain status-led so pending items do not look final."
      >
        <div className="flex flex-wrap gap-3">
          {data.viewer.isLinkedToPartner ? (
            <>
              <StatusBadge tone="warning">
                {data.stats.pendingReviewCount} under review
              </StatusBadge>
              <StatusBadge tone="primary">
                {data.stats.includedInPayoutCount} in payout batches
              </StatusBadge>
              <StatusBadge tone="success">{data.stats.paidCount} paid</StatusBadge>
            </>
          ) : data.viewer.hasPortalRole ? (
            <StatusBadge tone="warning">Partner link required</StatusBadge>
          ) : data.viewer.isAuthenticated ? (
            <StatusBadge tone="warning">Portal role required</StatusBadge>
          ) : (
            <StatusBadge tone="primary">Sign in required</StatusBadge>
          )}
        </div>
      </PageHeader>

      {boundary}

      {data.viewer.isLinkedToPartner ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Approved"
              value={String(data.stats.approvedCount)}
              detail={`Current approved value: ${data.stats.approvedValueLabel}.`}
              tone="success"
            />
            <StatCard
              label="In payout"
              value={String(data.stats.includedInPayoutCount)}
              detail={`Current payout-batch value: ${data.stats.includedInPayoutValueLabel}.`}
              tone="primary"
            />
            <StatCard
              label="Paid"
              value={String(data.stats.paidCount)}
              detail={`Current paid value: ${data.stats.paidValueLabel}.`}
              tone="warning"
            />
          </div>

          <SectionCard
            title="Attributed activity"
            description="Statuses stay intentionally simple: under review, approved, included in payout batch, or paid."
          >
            {data.items.length === 0 ? (
              <EmptyState
                eyebrow="No performance yet"
                title="No attributed events are visible yet"
                description="Once events are attributed to your partner record, they will appear here with their commission and payout status."
              />
            ) : (
              <div className="space-y-3">
                {data.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-border bg-surface px-5 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-ink">
                          {item.appName} • {item.eventTypeLabel}
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {item.codeLabel ?? "No code"} • {new Date(item.occurredAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <StatusBadge tone={toneForStatus(item.status)}>{item.statusLabel}</StatusBadge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Commission
                        </p>
                        <p className="mt-2 text-sm text-ink">{item.commissionAmountLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Batch
                        </p>
                        <p className="mt-2 text-sm text-ink">
                          {item.payoutBatchName ?? "Not batched"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Batch status
                        </p>
                        <p className="mt-2 text-sm text-ink">
                          {item.payoutBatchStatusLabel ?? "Not in payout"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : null}
    </PageContainer>
  );
}
