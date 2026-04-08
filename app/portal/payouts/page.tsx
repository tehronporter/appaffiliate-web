import { PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  InfoPanel,
  SectionCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
import {
  PortalHelpCard,
  PortalMetricCard,
  PortalPageHeader,
  PortalRecordCard,
} from "@/components/portal-ui";
import { listPortalPayouts } from "@/lib/services/portal";

function toneForBatchStatus(status: string) {
  if (status === "Paid") {
    return "success" as const;
  }

  if (status === "Awaiting payout" || status === "Approved") {
    return "primary" as const;
  }

  if (status === "Cancelled") {
    return "danger" as const;
  }

  return "warning" as const;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PartnerPortalPayoutsPage() {
  const data = await listPortalPayouts();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="max-w-[var(--portal-max-width)] space-y-5 py-6 lg:py-8">
      <PortalPageHeader
        eyebrow="Earnings"
        title="Payout history"
        description="Track approved earnings, see what is already in payout, and review paid history in a simpler creator-safe ledger."
      >
        {data.viewer.isLinkedToPartner ? (
          <>
            <StatusBadge tone="primary">{data.payouts.length} visible payout record{data.payouts.length === 1 ? "" : "s"}</StatusBadge>
            <StatusBadge tone="success">{data.stats.paidCount} paid result{data.stats.paidCount === 1 ? "" : "s"}</StatusBadge>
          </>
        ) : data.viewer.hasPortalRole ? (
          <StatusBadge tone="warning">Creator link required</StatusBadge>
        ) : data.viewer.isAuthenticated ? (
          <StatusBadge tone="warning">Portal access required</StatusBadge>
        ) : (
          <StatusBadge tone="primary">Sign in required</StatusBadge>
        )}
      </PortalPageHeader>

      {boundary}

      {data.viewer.isLinkedToPartner ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PortalMetricCard
              label="Still under review"
              value={String(data.stats.pendingReviewCount)}
              detail="Visible results that have not reached a final earnings state yet."
              tone="warning"
            />
            <PortalMetricCard
              label="Approved earnings"
              value={data.stats.approvedValueLabel}
              detail="Reviewed earnings that are not paid yet."
              tone="primary"
            />
            <PortalMetricCard
              label="In payout"
              value={data.stats.includedInPayoutValueLabel}
              detail="Approved earnings already included in a payout run."
              tone="primary"
            />
            <PortalMetricCard
              label="Paid"
              value={data.stats.paidValueLabel}
              detail="Earnings already reflected in paid history."
              tone="success"
            />
          </div>

          <SurfaceCard tone="portal" density="compact">
            <div className="grid gap-4 lg:grid-cols-3">
              <InfoPanel
                title="What payout status means"
                description="Approved means the earning is reviewed. Awaiting payout means it is already in a payout run. Paid means the payout update is complete."
              />
              <InfoPanel
                title="Read-only by design"
                description="This page is for visibility only. It does not expose internal finance steps, exports, or remittance controls."
              />
              <InfoPanel
                title="Safe references"
                description="Reference details only appear when there is a safe payout reference available for your visible record."
              />
            </div>
          </SurfaceCard>

          <SectionCard
            tone="portal"
            title="Payout records"
            description="A dependable history of the payout runs that already include your creator-linked earnings."
          >
            {data.payouts.length === 0 ? (
              <EmptyState
                eyebrow="No payouts yet"
                title="No payout history yet"
                description="Once approved earnings move into payout, the history will appear here automatically."
              />
            ) : (
              <div className="space-y-3">
                {data.payouts.map((payout) => (
                  <PortalRecordCard
                    key={payout.id}
                    title={payout.name}
                    description={`${payout.periodLabel} • ${formatDateLabel(payout.createdAt)}`}
                    badge={
                      <StatusBadge tone={toneForBatchStatus(payout.statusLabel)}>
                        {payout.statusLabel}
                      </StatusBadge>
                    }
                  >
                    <DetailList
                      columns={3}
                      items={[
                        {
                          label: "Amount",
                          value: payout.amountLabel,
                        },
                        {
                          label: "Entries",
                          value: String(payout.entryCount),
                        },
                        {
                          label: "Reference",
                          value: payout.externalReference ?? "Not available",
                        },
                      ]}
                    />
                  </PortalRecordCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            tone="portal"
            title="How earnings and payouts work"
            description="A short guide to the payout labels you can see in the portal."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              <PortalHelpCard
                title="Still under review"
                description="The result is visible, but the earning is not final yet."
              />
              <PortalHelpCard
                title="Approved"
                description="The earning has been reviewed and is ready for the next payout step."
              />
              <PortalHelpCard
                title="Awaiting payout"
                description="The earning is already included in a payout run and will move to paid once that update is confirmed."
              />
            </div>
          </SectionCard>
        </>
      ) : null}
    </PageContainer>
  );
}
