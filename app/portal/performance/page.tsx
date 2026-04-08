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
import { listPortalPerformance } from "@/lib/services/portal";

function toneForStatus(status: string) {
  if (status === "Paid") {
    return "success" as const;
  }

  if (status === "In payout batch") {
    return "primary" as const;
  }

  if (status === "Approved") {
    return "success" as const;
  }

  if (status === "Not approved") {
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

export default async function PartnerPortalPerformancePage() {
  const data = await listPortalPerformance();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="max-w-[var(--portal-max-width)] space-y-5 py-6 lg:py-8">
      <PortalPageHeader
        eyebrow="Performance"
        title="Results driven by your audience"
        description="See the results already linked to your creator profile, which earnings are still being checked, and which ones are approved or already in payout."
      >
        {data.viewer.isLinkedToPartner ? (
          <>
            <StatusBadge tone="warning">
              {data.stats.pendingReviewCount} still under review
            </StatusBadge>
            <StatusBadge tone="primary">
              {data.stats.includedInPayoutCount} in payout
            </StatusBadge>
            <StatusBadge tone="success">{data.stats.paidCount} paid</StatusBadge>
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
              detail="Visible results that are not final yet."
              tone="warning"
            />
            <PortalMetricCard
              label="Approved earnings"
              value={data.stats.approvedValueLabel}
              detail="Results that have already cleared review."
              tone="success"
            />
            <PortalMetricCard
              label="In payout batch"
              value={data.stats.includedInPayoutValueLabel}
              detail="Approved earnings already moving toward payout."
              tone="primary"
            />
            <PortalMetricCard
              label="Paid"
              value={data.stats.paidValueLabel}
              detail="Results that are already reflected in paid history."
              tone="success"
            />
          </div>

          <SurfaceCard tone="portal" density="compact">
            <div className="grid gap-4 lg:grid-cols-3">
              <InfoPanel
                title="How to read status"
                description="Still under review means the result is visible, but the earning can still change. Approved, in payout batch, and paid are progressively more final."
              />
              <InfoPanel
                title="Amounts"
                description="If a result is still under review, the amount may stay provisional or hidden until review is complete."
              />
              <InfoPanel
                title="What stays out"
                description="Internal finance notes, audit reasoning, and workspace-only controls stay outside the portal."
              />
            </div>
          </SurfaceCard>

          <SectionCard
            tone="portal"
            title="Performance activity"
            description="A simple read-only stream of the results already tied to your audience."
          >
            {data.items.length === 0 ? (
              <EmptyState
                eyebrow="No tracked activity yet"
                title="No tracked activity yet"
                description="Once your audience starts converting, results and earnings will appear here."
              />
            ) : (
              <div className="space-y-3">
                {data.items.map((item) => (
                  <PortalRecordCard
                    key={item.id}
                    title={`${item.appName} • ${item.eventTypeLabel}`}
                    description={`${item.codeLabel ?? "No code"} • ${formatDateLabel(item.occurredAt)}`}
                    badge={
                      <StatusBadge tone={toneForStatus(item.statusLabel)}>
                        {item.statusLabel}
                      </StatusBadge>
                    }
                  >
                    <DetailList
                      columns={3}
                      items={[
                        {
                          label: "Earnings",
                          value: item.commissionAmountLabel,
                        },
                        {
                          label: "Payout batch",
                          value: item.payoutBatchName ?? "Not included yet",
                        },
                        {
                          label: "Payout status",
                          value: item.payoutBatchStatusLabel ?? "Not available yet",
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
            description="Short explanations for the status labels visible in your performance stream."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              <PortalHelpCard
                title="Still under review"
                description="We can see the result, but the earning is not final yet."
              />
              <PortalHelpCard
                title="Approved"
                description="The result has cleared review and now counts toward approved earnings."
              />
              <PortalHelpCard
                title="In payout batch"
                description="The earning is already grouped into an upcoming payout."
              />
            </div>
          </SectionCard>
        </>
      ) : null}
    </PageContainer>
  );
}
