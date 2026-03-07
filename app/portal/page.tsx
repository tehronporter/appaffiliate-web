import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
import { getPortalHomeData } from "@/lib/services/portal";

function performanceTone(status: string) {
  if (status === "Paid") {
    return "success" as const;
  }

  if (status === "Included in payout batch") {
    return "primary" as const;
  }

  if (status === "Approved") {
    return "success" as const;
  }

  return "warning" as const;
}

function payoutTone(status: string) {
  if (status === "Paid") {
    return "success" as const;
  }

  if (status === "Awaiting payment") {
    return "primary" as const;
  }

  return "warning" as const;
}

export default async function PartnerPortalPage() {
  const data = await getPortalHomeData();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="max-w-[1180px] py-8 lg:py-10">
      <PageHeader
        eyebrow="Partner portal"
        title={data.viewer.partnerName ?? data.viewer.displayName ?? "Partner home"}
        description="Use this read-only portal to review your linked codes, visible performance, current review status, and payout history without crossing into internal operations."
        actions={
          data.viewer.isLinkedToPartner ? (
            <>
              <ActionLink href="/portal/codes">View codes</ActionLink>
              <ActionLink href="/portal/payouts" variant="primary">
                View payouts
              </ActionLink>
            </>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Read-only</StatusBadge>
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
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              label="Active codes"
              value={String(data.stats.activeCodes)}
              detail="Only codes linked to your partner record appear here."
              tone="success"
            />
            <StatCard
              label="Visible activity"
              value={String(data.stats.attributedEvents)}
              detail="These are attributed events already linked to your partner record."
              tone="primary"
            />
            <StatCard
              label="Under review"
              value={String(data.stats.pendingReviewCount)}
              detail="These items are still under review and may not have finalized amounts yet."
              tone="warning"
            />
            <StatCard
              label="Paid"
              value={data.stats.paidValueLabel}
              detail="Paid items remain visible here for straightforward payout history."
              tone="success"
            />
          </div>

          <SurfaceCard>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
              <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-5 py-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  What you can review here
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  This portal gives you a clear view of your linked codes, attributed activity, commission status, and payout history. It stays read-only so the information remains simple and trustworthy.
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-5 py-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  What to expect
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  Some amounts may stay under review until they are approved internally. Once an item moves into payout or is marked paid, that status appears here automatically.
                </p>
              </div>
            </div>
          </SurfaceCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <SectionCard
              title="Current visibility"
              description="Use this summary to understand what is already visible to you and what may still be moving through review."
              items={[
                `${data.stats.approvedCount} approved items currently total ${data.stats.approvedValueLabel}.`,
                `${data.stats.includedInPayoutCount} items are already included in payout and total ${data.stats.includedInPayoutValueLabel}.`,
                `${data.stats.paidCount} items are marked paid and total ${data.stats.paidValueLabel}.`,
              ]}
              actions={<ActionLink href="/portal/performance">View performance</ActionLink>}
            />

            <SectionCard
              title="Portal scope"
              description="What you see here is intentionally narrow and partner-safe."
              items={[
                "Portal views are scoped to your linked partner record only.",
                "Internal notes, exports, audit history, and admin controls stay out of the portal.",
                "Raw Apple receipts and internal event payloads are never shown here.",
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <SectionCard
              title="Recent codes"
              description="Your most recently created linked codes."
            >
              {data.recentCodes.length === 0 ? (
                <EmptyState
                  eyebrow="No codes yet"
                  title="No linked codes are visible yet"
                  description="Once codes are linked to your partner record, they will appear here automatically."
                />
              ) : (
                <div className="space-y-3">
                  {data.recentCodes.map((code) => (
                    <InlineActionRow
                      key={code.id}
                      title={code.code}
                      description={`${code.appName} • ${code.attributedEventsCount} attributed events`}
                      badge={
                        <StatusBadge tone={code.status === "Active" ? "success" : "neutral"}>
                          {code.status}
                        </StatusBadge>
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Recent performance"
              description="Latest attributed items and where they sit in the current review and payout flow."
            >
              {data.recentPerformance.length === 0 ? (
                <EmptyState
                  eyebrow="No activity yet"
                  title="No attributed performance is visible yet"
                  description="Once activity is attributed to your partner record, it will appear here with a clear status."
                />
              ) : (
                <div className="space-y-3">
                  {data.recentPerformance.map((item) => (
                    <InlineActionRow
                      key={item.id}
                      title={`${item.appName} • ${item.eventTypeLabel}`}
                      description={`${item.codeLabel ?? "No code"} • ${item.commissionAmountLabel}`}
                      badge={
                        <StatusBadge tone={performanceTone(item.statusLabel)}>
                          {item.statusLabel}
                        </StatusBadge>
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard
              title="Recent payouts"
              description="Latest payout batches that already include your partner items."
            >
              {data.recentPayouts.length === 0 ? (
                <EmptyState
                  eyebrow="No payouts yet"
                  title="No payout history is visible yet"
                  description="Once approved items are included in payout batches, they will appear here with their current status."
                />
              ) : (
                <div className="space-y-3">
                  {data.recentPayouts.map((payout) => (
                    <InlineActionRow
                      key={payout.id}
                      title={payout.name}
                      description={`${payout.amountLabel} • ${payout.periodLabel}`}
                      badge={
                        <StatusBadge tone={payoutTone(payout.statusLabel)}>
                          {payout.statusLabel}
                        </StatusBadge>
                      }
                    />
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      ) : null}
    </PageContainer>
  );
}
