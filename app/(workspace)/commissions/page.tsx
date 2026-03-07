import Link from "next/link";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailPanel,
  EmptyState,
  FilterBar,
  FilterChipLink,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
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
  if (state === "paid") {
    return "success";
  }

  if (state === "rejected") {
    return "danger";
  }

  if (state === "approved" || state === "payout_ready") {
    return "primary";
  }

  return "warning";
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
  return query ? `/commissions?${query}` : "/commissions";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "commission-approved") {
    return {
      tone: "success" as const,
      title: "Commission approved",
      detail: "The ledger entry now reflects a reviewed commission amount.",
    };
  }

  if (notice === "commission-rejected") {
    return {
      tone: "warning" as const,
      title: "Commission rejected",
      detail: "The item remains visible with an explicit rejected state for auditability.",
    };
  }

  if (notice === "commission-error") {
    return {
      tone: "danger" as const,
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
    filteredItems.find((item) => item.id === selectedEntryId) ??
    filteredItems[0] ??
    null;
  const banner = noticeCopy(notice);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Commissions"
        description="Review attributed events through a finance-safe commission ledger: what was attributed, what amount is being carried, and whether the item is still pending, approved, payout-tracked, or closed."
        actions={
          <>
            <ActionLink href="/unattributed">Open unattributed queue</ActionLink>
            <ActionLink href="/payouts" variant="primary">
              Open payouts
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Real attributed-event review</StatusBadge>
          <StatusBadge tone="warning">Manual approval boundary</StatusBadge>
          <StatusBadge>Audit-safe ledger states</StatusBadge>
        </div>
      </PageHeader>

      {banner ? (
        <SurfaceCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{banner.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{banner.detail}</p>
            </div>
            <StatusBadge tone={banner.tone}>{banner.title}</StatusBadge>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-5">
        <StatCard
          label="Pending review"
          value={String(data.stats.pendingReview)}
          detail="These items still need a finance decision or a manual commission amount."
          tone="warning"
        />
        <StatCard
          label="Approved"
          value={String(data.stats.approved)}
          detail="Approved items are not yet in a payout batch."
          tone="primary"
        />
        <StatCard
          label="Rejected"
          value={String(data.stats.rejected)}
          detail="Rejected items stay visible rather than disappearing from audit review."
          tone="danger"
        />
        <StatCard
          label="Payout-ready"
          value={String(data.stats.payoutReady)}
          detail="These items are already tracked inside a draft or exported batch."
          tone="primary"
        />
        <StatCard
          label="Paid"
          value={String(data.stats.paid)}
          detail="Paid items remain visible for reconciliation history."
          tone="success"
        />
      </div>

      {!data.hasFinanceAccess ? (
        <SurfaceCard>
          <EmptyState
            eyebrow="Finance access required"
            title="You do not have access to commission records"
            description="Commission review is limited to owner, admin, or finance roles because this surface exposes payout-sensitive data."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Return to overview
              </ActionLink>
            }
          />
        </SurfaceCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(340px,0.82fr)]">
          <div className="space-y-4">
            <FilterBar
              title="Sticky filters"
              description="Keep the ledger readable by explicit finance states instead of mixing approval and payout context."
            >
              <FilterChipLink
                href={buildHref({ state: "all", entry: selectedItem?.id })}
                active={state === "all"}
              >
                All items
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({
                  state: "pending_review",
                  entry: selectedItem?.id,
                })}
                active={state === "pending_review"}
              >
                Pending review
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "approved", entry: selectedItem?.id })}
                active={state === "approved"}
              >
                Approved
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "rejected", entry: selectedItem?.id })}
                active={state === "rejected"}
              >
                Rejected
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({
                  state: "payout_ready",
                  entry: selectedItem?.id,
                })}
                active={state === "payout_ready"}
              >
                Payout-ready
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "paid", entry: selectedItem?.id })}
                active={state === "paid"}
              >
                Paid
              </FilterChipLink>
            </FilterBar>

            <ListTable
              eyebrow="Ledger"
              title="Real commission register"
              description="Each row ties directly back to an attributed normalized event and the current payout posture for that event."
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
                      eyebrow="No matches"
                      title="No commission items match this view"
                      description="Reset the filter to review the full finance queue."
                      action={
                        <ActionLink href="/commissions" variant="primary">
                          Reset filters
                        </ActionLink>
                      }
                    />
                  </div>
                ) : null}

                {filteredItems.map((item) => (
                  <Link
                    key={item.id}
                    href={buildHref({ state, entry: item.id })}
                    className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.4fr)_140px_140px_auto] md:items-center ${
                      item.id === selectedItem?.id
                        ? "bg-primary-soft/40"
                        : "hover:bg-surface"
                    }`}
                  >
                    <div>
                      <h3 className="text-base font-semibold text-ink">
                        {item.partnerName}
                      </h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {item.appName}
                        {item.codeLabel ? ` / ${item.codeLabel}` : ""}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.24em] text-ink-subtle">
                        {item.eventType} • {item.environment}
                      </p>
                    </div>
                    <div className="text-sm text-ink-muted">
                      {item.basisAmountLabel}
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      {item.commissionAmountLabel}
                    </div>
                    <div className="flex justify-start md:justify-end">
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
            <DetailPanel
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
              <SectionCard
                title="Finance context"
                description="Keep the linked attribution and payout context visible before changing review state."
                items={[
                  `App: ${selectedItem.appName}.`,
                  `Code: ${selectedItem.codeLabel ?? "No code attached."}`,
                  `Event: ${selectedItem.eventType} (${selectedItem.eventStatus}).`,
                  `Occurred: ${new Date(selectedItem.occurredAt).toLocaleString()}.`,
                  `Received: ${
                    selectedItem.receivedAt
                      ? new Date(selectedItem.receivedAt).toLocaleString()
                      : "Unknown"
                  }.`,
                  `Source lane: ${selectedItem.sourceLabel}.`,
                ]}
              />

              <SurfaceCard className="bg-surface">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Basis and rule context
                </p>
                <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                  <div className="flex flex-col gap-4 border-b border-border px-4 py-4">
                    <p className="text-sm font-semibold text-ink">
                      Basis: {selectedItem.basisAmountLabel}
                    </p>
                    <p className="text-sm leading-6 text-ink-muted">
                      {selectedItem.ruleSummary}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 border-b border-border px-4 py-4">
                    <p className="text-sm font-semibold text-ink">
                      Commission amount: {selectedItem.commissionAmountLabel}
                    </p>
                    <p className="text-sm leading-6 text-ink-muted">
                      {selectedItem.latestDecisionLabel ??
                        "No attribution decision note is attached to this event yet."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 px-4 py-4">
                    <p className="text-sm font-semibold text-ink">
                      Payout tracking:{" "}
                      {selectedItem.payoutBatchName
                        ? `${selectedItem.payoutBatchName} (${selectedItem.payoutBatchStatus})`
                        : "Not yet assigned to a payout batch"}
                    </p>
                  </div>
                </div>
              </SurfaceCard>

              {selectedItem.canApprove ? (
                <SurfaceCard className="bg-surface">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Approve item
                  </p>
                  <form action={approveCommissionAction} className="mt-5 space-y-4">
                    <input type="hidden" name="eventId" value={selectedItem.eventId} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">
                        Commission amount
                      </span>
                      <input
                        name="amount"
                        type="text"
                        required
                        defaultValue={formatDefaultAmount(
                          selectedItem.commissionAmount ?? selectedItem.suggestedAmount,
                        )}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Currency</span>
                      <input
                        name="currency"
                        type="text"
                        defaultValue={selectedItem.currency}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm uppercase text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Internal note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedItem.note ?? ""}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                      >
                        Approve commission
                      </button>
                    </div>
                  </form>
                </SurfaceCard>
              ) : null}

              {selectedItem.canReject ? (
                <SurfaceCard className="bg-surface">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Reject item
                  </p>
                  <form action={rejectCommissionAction} className="mt-5 space-y-4">
                    <input type="hidden" name="eventId" value={selectedItem.eventId} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Review reason</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedItem.note ?? ""}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-full border border-danger bg-danger px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-danger)_88%,black)]"
                      >
                        Reject commission
                      </button>
                    </div>
                  </form>
                </SurfaceCard>
              ) : null}
            </DetailPanel>
          ) : (
            <DetailPanel
              eyebrow="Ledger inspector"
              title="No commission item selected"
              description="Reset the filters to inspect a commission item."
            >
              <EmptyState
                eyebrow="Empty inspector"
                title="No commission item is available"
                description="The inspector will show real attribution, rule, and payout context once an item matches the current view."
                action={
                  <ActionLink href="/commissions" variant="primary">
                    Reset filters
                  </ActionLink>
                }
              />
            </DetailPanel>
          )}
        </div>
      )}
    </PageContainer>
  );
}
