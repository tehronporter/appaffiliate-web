import { ActionLink, PageContainer } from "@/components/app-shell";
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
import { getPortalHomeData } from "@/lib/services/portal";

function performanceTone(status: string) {
  if (status === "Paid") {
    return "success" as const;
  }

  if (status === "In payout batch") {
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

  if (status === "Awaiting payout") {
    return "primary" as const;
  }

  return "warning" as const;
}

function nextPayoutMessage(data: Awaited<ReturnType<typeof getPortalHomeData>>) {
  if (data.stats.includedInPayoutCount > 0) {
    return `${data.stats.includedInPayoutValueLabel} is already in payout and waiting for the next payout update.`;
  }

  if (data.recentPayouts[0]) {
    return `${data.recentPayouts[0].amountLabel} was the latest visible payout in your history.`;
  }

  return "Once approved earnings move into payout, the next update will appear here automatically.";
}

export default async function PartnerPortalPage() {
  const data = await getPortalHomeData();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;

  return (
    <PageContainer className="max-w-[var(--portal-max-width)] space-y-5 py-6 lg:py-8">
      <PortalPageHeader
        eyebrow="Creator home"
        title="Your creator performance"
        description="See how your audience is converting, which earnings are approved, and what payout status is visible right now without digging through internal workspace detail."
        actions={
          data.viewer.isLinkedToPartner ? (
            <>
              <ActionLink href="/portal/performance">View results</ActionLink>
              <ActionLink href="/portal/payouts" variant="primary">
                View payout history
              </ActionLink>
            </>
          ) : undefined
        }
      >
        <StatusBadge tone="success">Read-only and reviewed</StatusBadge>
        {data.viewer.isLinkedToPartner ? (
          <>
            <StatusBadge tone="primary">
              {data.stats.activeCodes} active code{data.stats.activeCodes === 1 ? "" : "s"}
            </StatusBadge>
            <StatusBadge>{data.stats.attributedEvents} tracked results</StatusBadge>
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
              label="Approved earnings"
              value={data.stats.approvedValueLabel}
              detail="Reviewed earnings you can rely on today."
              tone="success"
            />
            <PortalMetricCard
              label="Still under review"
              value={String(data.stats.pendingReviewCount)}
              detail="Results still being checked before they become final."
              tone="warning"
            />
            <PortalMetricCard
              label="Recent results"
              value={String(data.stats.attributedEvents)}
              detail="Tracked results already linked to your creator profile."
              tone="primary"
            />
            <PortalMetricCard
              label="Next payout"
              value={
                data.stats.includedInPayoutCount > 0
                  ? data.stats.includedInPayoutValueLabel
                  : data.stats.paidValueLabel
              }
              detail={nextPayoutMessage(data)}
              tone={data.stats.includedInPayoutCount > 0 ? "primary" : "success"}
            />
          </div>

          <SurfaceCard tone="portal" density="compact">
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)]">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                  Current status
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-ink">
                  Your portal reflects reviewed results, approved earnings, and payout updates.
                </h2>
                <p className="mt-3 text-sm leading-7 text-ink-muted">
                  This is a read-only view of the activity already linked to your creator record. If a result is still under review, it may change before it becomes approved.
                </p>
              </div>

              <DetailList
                columns={1}
                items={[
                  {
                    label: "Approved earnings",
                    value: data.stats.approvedValueLabel,
                    tone: "success",
                  },
                  {
                    label: "In payout",
                    value: data.stats.includedInPayoutValueLabel,
                    tone: "primary",
                  },
                  {
                    label: "Paid so far",
                    value: data.stats.paidValueLabel,
                    tone: "neutral",
                  },
                ]}
              />
            </div>
          </SurfaceCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
            <SectionCard
              tone="portal"
              title="What to check next"
              description="Use the portal to answer the questions creators usually care about first."
            >
              <div className="grid gap-3 md:grid-cols-3">
                <InfoPanel
                  title="Codes and links"
                  description="Confirm which codes belong to you and which apps they are connected to."
                />
                <InfoPanel
                  title="Results"
                  description="See how your audience is converting without opening a back-office analytics view."
                />
                <InfoPanel
                  title="Payouts"
                  description="Track which earnings are approved, already in payout, or fully paid."
                />
              </div>
            </SectionCard>

            <SectionCard
              tone="portal"
              title="Read-only by design"
              description="The portal keeps things simple so the information stays easy to trust."
            >
              <div className="grid gap-3">
                <PortalHelpCard
                  title="What you will see"
                  description="Your linked codes, tracked results, approved earnings, and payout history."
                />
                <PortalHelpCard
                  title="What stays out"
                  description="Internal notes, exports, workspace controls, and raw audit detail never show up here."
                />
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <SectionCard
              tone="portal"
              title="Codes and links"
              description="Everything here belongs to your linked creator profile."
              actions={<ActionLink href="/portal/codes">Open codes</ActionLink>}
            >
              {data.recentCodes.length === 0 ? (
                <EmptyState
                  eyebrow="No tracked activity yet"
                  title="No tracked activity yet"
                  description="Once your audience starts converting, results and earnings will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {data.recentCodes.map((code) => (
                    <PortalRecordCard
                      key={code.id}
                      title={code.code}
                      description={`${code.appName} • ${code.codeType}`}
                      badge={
                        <StatusBadge tone={code.status === "Active" ? "success" : "neutral"}>
                          {code.status}
                        </StatusBadge>
                      }
                    >
                      <DetailList
                        columns={2}
                        items={[
                          {
                            label: "Tracked results",
                            value: String(code.attributedEventsCount),
                          },
                          {
                            label: "Approved / paid",
                            value: `${code.approvedCount} / ${code.paidCount}`,
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
              title="Results driven by your audience"
              description="Recent creator-linked performance with plain-language status."
              actions={<ActionLink href="/portal/performance">Open performance</ActionLink>}
            >
              {data.recentPerformance.length === 0 ? (
                <EmptyState
                  eyebrow="No tracked activity yet"
                  title="No tracked activity yet"
                  description="Once your audience starts converting, results and earnings will appear here."
                />
              ) : (
                <div className="space-y-3">
                  {data.recentPerformance.map((item) => (
                    <PortalRecordCard
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
              tone="portal"
              title="Payout history"
              description="Recent payout updates tied to your creator record."
              actions={<ActionLink href="/portal/payouts">Open payout history</ActionLink>}
            >
              {data.recentPayouts.length === 0 ? (
                <EmptyState
                  eyebrow="No payouts yet"
                  title="No payout history yet"
                  description="Once approved earnings move into payout, the history will appear here automatically."
                />
              ) : (
                <div className="space-y-3">
                  {data.recentPayouts.map((payout) => (
                    <PortalRecordCard
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

          <SectionCard
            tone="portal"
            title="How earnings and payouts work"
            description="Short answers to the questions creators usually ask before reaching out for support."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              <PortalHelpCard
                title="Why can earnings change?"
                description="Some results stay under review until they are checked and approved. That means the visible amount can change before it becomes final."
              />
              <PortalHelpCard
                title="When do payouts show up?"
                description="Approved earnings move into payout first, then appear as paid after the payout update is confirmed."
              />
              <PortalHelpCard
                title="Why is this portal read-only?"
                description="A simpler read-only view keeps your codes, results, and payout history easy to understand and easier to trust."
              />
            </div>
          </SectionCard>
        </>
      ) : null}
    </PageContainer>
  );
}
