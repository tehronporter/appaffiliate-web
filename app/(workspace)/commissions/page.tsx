import Link from "next/link";
import { DollarSign } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActionButton,
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InsetPanel,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import {
  approveCommissionAction,
  rejectCommissionAction,
} from "@/app/(workspace)/commissions/actions";
import {
  listCommissionItems,
  type CommissionReviewState,
} from "@/lib/services/finance";
import {
  toneForCommissionState,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type CommissionsPageProps = {
  searchParams: Promise<{
    state?: string;
    entry?: string;
    notice?: string;
  }>;
};

const VALID_STATES = new Set<CommissionReviewState>([
  "pending_review",
  "approved",
  "rejected",
  "payout_ready",
  "paid",
]);

function stateTone(state: CommissionReviewState): StatusTone {
  return toneForCommissionState(state);
}

function buildHref(params: {
  state: string;
  entry?: string;
}) {
  const search = new URLSearchParams();

  if (params.state !== "all") {
    search.set("state", params.state);
  }

  if (params.entry) {
    search.set("entry", params.entry);
  }

  const query = search.toString();
  return query ? `/earnings?${query}` : "/earnings";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "commission-approved") {
    return {
      tone: "green" as const,
      title: "Commission approved",
      detail: "The ledger entry now reflects a reviewed commission amount.",
    };
  }

  if (notice === "commission-rejected") {
    return {
      tone: "gray" as const,
      title: "Commission rejected",
      detail: "The item remains visible with an explicit rejected state for auditability.",
    };
  }

  if (notice === "commission-error") {
    return {
      tone: "red" as const,
      title: "Commission review failed",
      detail: "Review the amount, note, and current state, then try again.",
    };
  }

  return null;
}

function formatDefaultAmount(value: number | null) {
  if (value === null) {
    return "";
  }

  return value.toFixed(2);
}

export default async function CommissionsPage({
  searchParams,
}: CommissionsPageProps) {
  const { state: rawState = "all", entry: selectedEntryId, notice } =
    await searchParams;
  const state = VALID_STATES.has(rawState as CommissionReviewState)
    ? (rawState as CommissionReviewState)
    : "all";
  const data = await listCommissionItems();
  const filteredItems = data.items.filter(
    (item) => state === "all" || item.reviewState === state,
  );
  const selectedItem =
    filteredItems.find((item) => item.id === selectedEntryId) ?? null;
  const banner = noticeCopy(notice);
  const reviewableCount = data.stats.pendingReview + data.stats.approved;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Finance"
        title="Earnings"
        description="Review earnings before payout."
        actions={
          <>
            <ActionLink href="/review?view=needs-review">Open queue</ActionLink>
            <ActionLink href="/payouts" variant="primary">
              Open payouts
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Earnings ledger</StatusBadge>
          {data.stats.pendingReview > 0 ? <StatusBadge tone="amber">Needs review</StatusBadge> : null}
        </div>
      </PageHeader>

      {banner ? (
        <NoticeBanner
          title={banner.title}
          detail={banner.detail}
          tone={banner.tone}
        />
      ) : null}

      <section>
        <div className="aa-stat-grid">
          <MetricChip
            label="Pending review"
            value={String(data.stats.pendingReview)}
            detail="Finance decision"
            tone="amber"
          />
          <MetricChip
            label="Approved"
            value={String(data.stats.approved)}
            detail="Not batched"
            tone="green"
          />
          <MetricChip
            label="Rejected"
            value={String(data.stats.rejected)}
            detail="Held for audit history"
            tone="gray"
          />
          <MetricChip
            label="Payout-ready"
            value={String(data.stats.payoutReady)}
            detail="In payout flow"
            tone="green"
          />
          <MetricChip
            label="Paid"
            value={String(data.stats.paid)}
            detail="History"
            tone="green"
          />
        </div>
      </section>

      {!data.hasFinanceAccess ? (
        <SectionCard
          title="Finance access required"
          description="Commission review is limited to finance-safe roles."
        >
          <EmptyState
            eyebrow="Finance access required"
            title="You do not have access to commission records"
            description="Commission review is limited to owner, admin, or finance roles because this surface exposes payout-sensitive data."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <>
          <div className="space-y-3">
            <SummaryBar
              items={[
                {
                  label: "Review",
                  value:
                    data.stats.pendingReview > 0
                      ? `${data.stats.pendingReview} pending`
                      : "Queue calm",
                },
                {
                  label: "In payout flow",
                  value:
                    reviewableCount > 0
                      ? `${reviewableCount} in motion`
                      : "No approved items yet",
                },
              ]}
            />

            <FilterBar title="Filters">
              <FilterChipLink href={buildHref({ state: "all" })} active={state === "all"}>
                All items
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "pending_review" })}
                active={state === "pending_review"}
              >
                Pending review
              </FilterChipLink>
              <FilterChipLink href={buildHref({ state: "approved" })} active={state === "approved"}>
                Approved
              </FilterChipLink>
              <FilterChipLink href={buildHref({ state: "rejected" })} active={state === "rejected"}>
                Rejected
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "payout_ready" })}
                active={state === "payout_ready"}
              >
                Payout-ready
              </FilterChipLink>
              <FilterChipLink href={buildHref({ state: "paid" })} active={state === "paid"}>
                Paid
              </FilterChipLink>
            </FilterBar>

            <ListTable
              className="w-full"
              eyebrow="Ledger"
              title="Earnings"
              description="Select a row to review."
            >
            <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_140px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Partner / event</span>
              <span>Basis</span>
              <span>Commission</span>
              <span>State</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredItems.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={DollarSign}
                    eyebrow="Ledger"
                    title="Commission items appear here"
                    description="The register fills after tracked results are ready for finance review."
                    action={
                      <ActionLink href="/review?view=all" variant="primary">
                        Review results
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={buildHref({ state, entry: item.id })}
                  className={`grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.4fr)_140px_140px_auto] md:items-center md:gap-4 md:px-5 md:py-3 ${
                    item.id === selectedItem?.id ? "bg-primary-soft/35" : ""
                  }`}
                >
                  <div>
                    <span className="aa-mobile-label md:hidden">Partner / event</span>
                    <h3 className="text-sm font-semibold text-ink">{item.partnerName}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {item.appName}
                      {item.codeLabel ? ` / ${item.codeLabel}` : ""}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.24em] text-ink-subtle">
                      {item.eventType} • {item.environment}
                    </p>
                  </div>
                  <div>
                    <span className="aa-mobile-label md:hidden">Basis</span>
                    <div className="text-sm text-ink-muted">{item.basisAmountLabel}</div>
                  </div>
                  <div>
                    <span className="aa-mobile-label md:hidden">Commission</span>
                    <div className="text-sm font-semibold text-ink">
                      {item.commissionAmountLabel}
                    </div>
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <span className="aa-mobile-label mr-2 md:hidden">State</span>
                    <StatusBadge tone={stateTone(item.reviewState)}>
                      {item.reviewStateLabel}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
            </ListTable>
          </div>

          {selectedItem ? (
            <WorkspaceDrawer
              closeHref={buildHref({ state })}
              eyebrow="Ledger inspector"
              title={`${selectedItem.partnerName} commission item`}
              description={
                selectedItem.note ??
                "Review the event source, current finance posture, and whether the amount is safe to approve."
              }
              status={
                <StatusBadge tone={stateTone(selectedItem.reviewState)}>
                  {selectedItem.reviewStateLabel}
                </StatusBadge>
              }
            >
              <InsetPanel tone={stateTone(selectedItem.reviewState)}>
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Finance context
                </p>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  Keep the event source, rule summary, and payout state visible.
                </p>
              </InsetPanel>

              <SectionCard
                title="Context"
                description="Keep attribution and payout state visible."
              >
                <DetailList
                  items={[
                    { label: "App", value: selectedItem.appName },
                    {
                      label: "Code",
                      value: selectedItem.codeLabel ?? "No code attached",
                    },
                    {
                      label: "Event",
                      value: `${selectedItem.eventType} (${selectedItem.eventStatus})`,
                    },
                    {
                      label: "Occurred",
                      value: new Date(selectedItem.occurredAt).toLocaleString(),
                    },
                    {
                      label: "Received",
                      value: selectedItem.receivedAt
                        ? new Date(selectedItem.receivedAt).toLocaleString()
                        : "Unknown",
                    },
                    {
                      label: "Source lane",
                      value: selectedItem.sourceLabel,
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Basis and rule"
                description="Keep the event basis and latest decision together."
              >
                <DetailList
                  items={[
                    { label: "Basis", value: selectedItem.basisAmountLabel },
                    {
                      label: "Rule summary",
                      value: selectedItem.ruleSummary,
                    },
                    {
                      label: "Commission amount",
                      value: selectedItem.commissionAmountLabel,
                    },
                    {
                      label: "Latest decision",
                      value:
                        selectedItem.latestDecisionLabel ??
                        "No attribution decision note is attached to this event yet.",
                    },
                    {
                      label: "Payout tracking",
                      value: selectedItem.payoutBatchName
                        ? `${selectedItem.payoutBatchName} (${selectedItem.payoutBatchStatus})`
                        : "Not yet assigned to a payout batch",
                    },
                  ]}
                />
              </SectionCard>

              {selectedItem.canApprove ? (
                <SectionCard
                  title="Approve commission"
                  description="Approve when the amount and note are ready."
                >
                  <form action={approveCommissionAction} className="space-y-4">
                    <input type="hidden" name="eventId" value={selectedItem.eventId} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Commission amount</span>
                      <input
                        name="amount"
                        type="text"
                        required
                        defaultValue={formatDefaultAmount(
                          selectedItem.commissionAmount ?? selectedItem.suggestedAmount,
                        )}
                        className="aa-field"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Currency</span>
                      <input
                        name="currency"
                        type="text"
                        defaultValue={selectedItem.currency}
                        className="aa-field uppercase"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Internal note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedItem.note ?? ""}
                        className="aa-field"
                      />
                    </label>

                    <div className="flex justify-end">
                      <ActionButton type="submit" variant="primary">
                        Approve commission
                      </ActionButton>
                    </div>
                  </form>
                </SectionCard>
              ) : null}

              {selectedItem.canReject ? (
                <SectionCard
                  title="Reject commission"
                  description="Keep a clear review reason."
                >
                  <form action={rejectCommissionAction} className="space-y-4">
                    <input type="hidden" name="eventId" value={selectedItem.eventId} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Review reason</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedItem.note ?? ""}
                        className="aa-field"
                      />
                    </label>

                    <div className="flex justify-end">
                      <ActionButton type="submit" variant="destructive">
                        Reject commission
                      </ActionButton>
                    </div>
                  </form>
                </SectionCard>
              ) : null}
            </WorkspaceDrawer>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
