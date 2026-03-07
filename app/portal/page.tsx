import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  InlineActionRow,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
import { getPortalHomeData } from "@/lib/services/portal";

export default async function PartnerPortalPage() {
  const data = await getPortalHomeData();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="py-8 lg:py-10">
      <PageHeader
        eyebrow="Partner portal"
        title={data.viewer.partnerName ?? data.viewer.displayName ?? "Partner overview"}
        description="Use the portal to review your own linked codes, attributed performance, commission status, and payout history. This surface stays read-only by design."
        actions={
          data.viewer.isLinkedToPartner ? (
            <>
              <ActionLink href="/portal/codes">View codes</ActionLink>
              <ActionLink href="/portal/performance" variant="primary">
                View performance
              </ActionLink>
            </>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Read-only portal</StatusBadge>
          {data.viewer.isLinkedToPartner ? (
            <>
              <StatusBadge tone="primary">
                {data.viewer.organizationName ?? "No organization linked"}
              </StatusBadge>
              <StatusBadge>
                {data.viewer.partnerStatus ?? "Partner status unavailable"}
              </StatusBadge>
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
              label="Active codes"
              value={String(data.stats.activeCodes)}
              detail="Only codes assigned to your partner record appear in the portal."
              tone="success"
            />
            <StatCard
              label="Attributed events"
              value={String(data.stats.attributedEvents)}
              detail="These are attributed events already linked to your partner record."
              tone="primary"
            />
            <StatCard
              label="Pending review"
              value={String(data.stats.pendingReviewCount)}
              detail="These items are still under internal commission review and may not have finalized amounts yet."
              tone="warning"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <SectionCard
              title="Current earnings posture"
              description="Amounts remain read-only and status-led so the portal stays honest when commissions are still under review or already inside payout processing."
              items={[
                `${data.stats.approvedCount} approved items currently total ${data.stats.approvedValueLabel}.`,
                `${data.stats.includedInPayoutCount} items are already included in payout batches totaling ${data.stats.includedInPayoutValueLabel}.`,
                `${data.stats.paidCount} items are marked paid totaling ${data.stats.paidValueLabel}.`,
              ]}
              actions={<ActionLink href="/portal/payouts">Review payout history</ActionLink>}
            />

            <SectionCard
              title="Portal boundary"
              description="What you see here is intentionally narrow and partner-safe."
              items={[
                "Portal views are scoped to your linked partner record only.",
                "Internal notes, audit history, exports, and admin controls stay out of the portal.",
                "Apple receipts and raw event payloads are not exposed here.",
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <SectionCard
              title="Recent codes"
              description="The most recently created partner-linked codes."
            >
              <div className="space-y-3">
                {data.recentCodes.map((code) => (
                  <InlineActionRow
                    key={code.id}
                    title={code.code}
                    description={`${code.appName} • ${code.attributedEventsCount} attributed events`}
                    badge={<StatusBadge tone="primary">{code.status}</StatusBadge>}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Recent performance"
              description="Latest attributed items and where they sit in the current commission flow."
            >
              <div className="space-y-3">
                {data.recentPerformance.map((item) => (
                  <InlineActionRow
                    key={item.id}
                    title={`${item.appName} • ${item.eventTypeLabel}`}
                    description={`${item.codeLabel ?? "No code"} • ${item.commissionAmountLabel}`}
                    badge={<StatusBadge tone="success">{item.statusLabel}</StatusBadge>}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="Recent payouts"
              description="Latest payout batches that already include your partner items."
            >
              <div className="space-y-3">
                {data.recentPayouts.map((payout) => (
                  <InlineActionRow
                    key={payout.id}
                    title={payout.name}
                    description={`${payout.amountLabel} • ${payout.periodLabel}`}
                    badge={<StatusBadge tone="primary">{payout.statusLabel}</StatusBadge>}
                  />
                ))}
              </div>
            </SectionCard>
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
