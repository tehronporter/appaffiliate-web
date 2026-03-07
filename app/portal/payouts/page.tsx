import { PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
import { listPortalPayouts } from "@/lib/services/portal";

function toneForBatchStatus(status: string) {
  if (status === "paid") {
    return "success" as const;
  }

  if (status === "exported" || status === "approved") {
    return "primary" as const;
  }

  if (status === "cancelled") {
    return "danger" as const;
  }

  return "warning" as const;
}

export default async function PartnerPortalPayoutsPage() {
  const data = await listPortalPayouts();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="py-8 lg:py-10">
      <PageHeader
        eyebrow="Partner portal"
        title="Payout history"
        description="Review payout batches that already include your partner items. This remains a read-only history surface and does not expose admin export or remittance controls."
      >
        <div className="flex flex-wrap gap-3">
          {data.viewer.isLinkedToPartner ? (
            <>
              <StatusBadge tone="primary">{data.payouts.length} payout batches visible</StatusBadge>
              <StatusBadge tone="success">{data.stats.paidCount} paid items</StatusBadge>
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
              value={data.stats.approvedValueLabel}
              detail="Approved items are visible even before they are placed into a payout batch."
              tone="primary"
            />
            <StatCard
              label="In payout"
              value={data.stats.includedInPayoutValueLabel}
              detail="These amounts are already inside payout batches but are not yet marked paid."
              tone="warning"
            />
            <StatCard
              label="Paid"
              value={data.stats.paidValueLabel}
              detail="These partner amounts are already marked paid."
              tone="success"
            />
          </div>

          <SectionCard
            title="Batch history"
            description="Only batches that include your partner items appear here."
          >
            {data.payouts.length === 0 ? (
              <EmptyState
                eyebrow="No payouts yet"
                title="No payout batches are visible yet"
                description="Once approved commission items are moved into payout batches, those batches will appear here with their status and amount."
              />
            ) : (
              <div className="space-y-3">
                {data.payouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="rounded-[24px] border border-border bg-surface px-5 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-ink">{payout.name}</p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {payout.periodLabel} • {new Date(payout.createdAt).toLocaleDateString("en-US")}
                        </p>
                      </div>
                      <StatusBadge tone={toneForBatchStatus(payout.status)}>
                        {payout.statusLabel}
                      </StatusBadge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Amount
                        </p>
                        <p className="mt-2 text-sm text-ink">{payout.amountLabel}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Entries
                        </p>
                        <p className="mt-2 text-sm text-ink">{payout.entryCount}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Reference
                        </p>
                        <p className="mt-2 text-sm text-ink">
                          {payout.externalReference ?? "No external reference"}
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
