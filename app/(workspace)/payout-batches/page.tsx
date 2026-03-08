import Link from "next/link";
import { Layers } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActionButton,
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InsetPanel,
  ListTable,
  NoticeBanner,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  StatusTimeline,
  SummaryBar,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import {
  cancelPayoutBatchAction,
  markPayoutBatchExportedAction,
  markPayoutBatchPaidAction,
} from "@/app/(workspace)/payouts/actions";
import { formatOperationalTimestamp } from "@/lib/services/apple-read-model";
import { listPayoutsData } from "@/lib/services/finance";
import {
  toneForPayoutBatchItemStatus,
  toneForPayoutBatchStatus,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type PayoutBatchesPageProps = {
  searchParams: Promise<{
    state?: string;
    batch?: string;
    notice?: string;
  }>;
};

function batchTone(status: string): StatusTone {
  return toneForPayoutBatchStatus(status);
}

function batchItemTone(status: string): StatusTone {
  return toneForPayoutBatchItemStatus(status);
}

function batchItemLabel(status: string) {
  if (status === "pending") {
    return "Reserved";
  }

  if (status === "failed") {
    return "Blocked";
  }

  if (status === "cancelled") {
    return "Removed";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function batchStateMeaning(status: string) {
  if (status === "paid") {
    return "This batch is fully paid and should now be treated as reconciliation history.";
  }

  if (status === "exported") {
    return "This batch has a recorded finance handoff and is waiting on payment confirmation.";
  }

  if (status === "approved") {
    return "This batch is internally approved but still needs an explicit export handoff.";
  }

  if (status === "reviewing") {
    return "This batch is still being checked before it is handed to finance.";
  }

  if (status === "cancelled") {
    return "This batch was stopped and should not be treated as a payable record.";
  }

  return "This batch is drafted and still waiting for an export decision.";
}

function buildBatchTimeline(batch: {
  status: string;
  createdAt: string;
  approvedAt: string | null;
  updatedAt: string;
}) {
  const exportComplete = batch.status === "exported" || batch.status === "paid";
  const paidComplete = batch.status === "paid";

  return [
    {
      label: "Draft created",
      detail: "Approved commissions were reserved inside a tracked payout batch.",
      meta: formatOperationalTimestamp(batch.createdAt),
      status: "complete" as const,
    },
    {
      label: "Internal review",
      detail:
        batch.status === "draft"
          ? "The batch is still waiting for internal sign-off."
          : "The batch has cleared internal review and is ready for finance handoff.",
      meta: batch.approvedAt ? formatOperationalTimestamp(batch.approvedAt) : undefined,
      status:
        batch.status === "draft" ? ("current" as const) : ("complete" as const),
    },
    {
      label: "Exported",
      detail:
        exportComplete
          ? "The finance handoff has been recorded explicitly."
          : "Export has not been confirmed yet.",
      meta: exportComplete ? formatOperationalTimestamp(batch.updatedAt) : undefined,
      status: exportComplete
        ? ("complete" as const)
        : batch.status === "approved" || batch.status === "reviewing"
          ? ("current" as const)
          : ("upcoming" as const),
    },
    {
      label: "Paid",
      detail:
        paidComplete
          ? "Payment completion is recorded on the batch and its linked items."
          : "Payment should only be confirmed after remittance is complete.",
      meta: paidComplete ? formatOperationalTimestamp(batch.updatedAt) : undefined,
      status: paidComplete ? ("current" as const) : ("upcoming" as const),
    },
  ];
}

function formatAggregateAmount(
  items: Array<{ totalAmount: number; currency: string }>,
  emptyLabel: string,
) {
  if (items.length === 0) {
    return emptyLabel;
  }

  const currencies = Array.from(new Set(items.map((item) => item.currency)));

  if (currencies.length !== 1) {
    return "Mixed";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencies[0],
  }).format(items.reduce((sum, item) => sum + item.totalAmount, 0) / 100);
}

function buildHref(params: {
  state: string;
  batch?: string;
}) {
  const search = new URLSearchParams();

  if (params.state !== "all") {
    search.set("state", params.state);
  }

  if (params.batch) {
    search.set("batch", params.batch);
  }

  const query = search.toString();
  return query ? `/payout-batches?${query}` : "/payout-batches";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "batch-exported") {
    return {
      tone: "gray" as const,
      title: "Batch exported",
      detail: "The finance handoff is now recorded with explicit export state and reference context.",
    };
  }

  if (notice === "batch-paid") {
    return {
      tone: "green" as const,
      title: "Batch marked paid",
      detail: "The batch and linked payout items now reflect a completed payment state.",
    };
  }

  if (notice === "batch-cancelled") {
    return {
      tone: "amber" as const,
      title: "Batch cancelled",
      detail: "Reserved earnings were released back into payout-ready state.",
    };
  }

  if (notice === "batch-error") {
    return {
      tone: "red" as const,
      title: "Batch action failed",
      detail: "Review the current batch status and try again.",
    };
  }

  return null;
}

export default async function PayoutBatchesPage({
  searchParams,
}: PayoutBatchesPageProps) {
  const { state = "all", batch: selectedBatchId, notice } = await searchParams;
  const data = await listPayoutsData();
  const filteredBatches = data.batches.filter(
    (batch) => state === "all" || batch.status === state,
  );
  const selectedBatch =
    filteredBatches.find((batch) => batch.id === selectedBatchId) ?? null;
  const banner = noticeCopy(notice);
  const draftLikeBatches = data.batches.filter(
    (batch) =>
      batch.status === "draft" ||
      batch.status === "reviewing" ||
      batch.status === "approved",
  );
  const exportedBatches = data.batches.filter((batch) => batch.status === "exported");
  const paidBatches = data.batches.filter((batch) => batch.status === "paid");

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Finance"
        title="Payout batches"
        description="Track draft, export, and payment handoff."
        actions={
          <>
            <ActionLink href="/payouts">Open payouts</ActionLink>
            <ActionLink href="/settings/exports" variant="primary">
              Open exports
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Audit-safe register</StatusBadge>
          {draftLikeBatches.length > 0 ? <StatusBadge tone="amber">In review</StatusBadge> : null}
        </div>
      </PageHeader>

      {banner ? (
        <NoticeBanner
          title={banner.title}
          detail={banner.detail}
          tone={banner.tone}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="In review"
          value={formatAggregateAmount(draftLikeBatches, "$0.00")}
          detail={`${draftLikeBatches.length} batches are still being drafted or prepared for export.`}
          tone="amber"
          size="compact"
        />
        <StatCard
          label="Exported"
          value={formatAggregateAmount(exportedBatches, "$0.00")}
          detail={`${exportedBatches.length} batches already have a finance handoff recorded.`}
          tone="gray"
          size="compact"
        />
        <StatCard
          label="Paid"
          value={formatAggregateAmount(paidBatches, "$0.00")}
          detail={`${paidBatches.length} batches remain visible as payment history.`}
          tone="green"
          size="compact"
        />
        <StatCard
          label="Tracked entries"
          value={String(data.batches.reduce((sum, batch) => sum + batch.entryCount, 0))}
          detail="Every entry in this register is already reserved in a payout batch."
          tone="gray"
          size="compact"
        />
      </div>

      {!data.hasFinanceAccess ? (
        <SectionCard
          title="Finance access required"
          description="Payout batch visibility is limited to finance-safe roles."
        >
          <EmptyState
            icon={Layers}
            eyebrow="Finance access required"
            title="Open payout batch records with a finance-safe role"
            description="Payout batch visibility is limited to owner, admin, or finance roles."
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
                  label: "In motion",
                  value:
                    draftLikeBatches.length > 0
                      ? `${draftLikeBatches.length} batches`
                      : "No active batches",
                },
                {
                  label: "Awaiting payment",
                  value:
                    exportedBatches.length > 0
                      ? `${exportedBatches.length} exported`
                      : "No exported batches",
                },
              ]}
            />

            <FilterBar title="Filters">
              <FilterChipLink href={buildHref({ state: "all" })} active={state === "all"}>
                All batches
              </FilterChipLink>
              <FilterChipLink href={buildHref({ state: "draft" })} active={state === "draft"}>
                Draft
              </FilterChipLink>
              <FilterChipLink href={buildHref({ state: "exported" })} active={state === "exported"}>
                Exported
              </FilterChipLink>
              <FilterChipLink href={buildHref({ state: "paid" })} active={state === "paid"}>
                Paid
              </FilterChipLink>
            </FilterBar>

            <ListTable
              className="w-full"
              eyebrow="Batch register"
              title="Batches"
              description="Select a row to inspect handoff state."
            >
            <div className="hidden grid-cols-[minmax(0,1.15fr)_150px_120px_120px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Batch</span>
              <span>Window</span>
              <span>Total</span>
              <span>Handoff</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredBatches.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={Layers}
                    eyebrow="Batch register"
                    title="Next payout batch appears here"
                    description="The register fills after finance creates or exports a batch."
                    action={
                      <ActionLink href="/payouts" variant="primary">
                        Open payouts
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredBatches.map((batch) => (
                <Link
                  key={batch.id}
                  href={buildHref({ state, batch: batch.id })}
                  className={`grid gap-4 px-5 py-3 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.15fr)_150px_120px_120px_auto] md:items-center ${
                    batch.id === selectedBatch?.id ? "bg-primary-soft/35" : ""
                  }`}
                >
                  <div>
                    <h3 className="text-[15px] font-semibold text-ink">{batch.name}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {batch.entryCount} entries • {batch.partnerCount} partners
                    </p>
                  </div>
                  <div className="text-sm text-ink-muted">{batch.windowLabel}</div>
                  <div className="text-sm font-semibold text-ink">
                    {batch.totalAmountLabel}
                  </div>
                  <div className="text-sm text-ink-muted">
                    {batch.externalReference ?? batch.exportStatusLabel}
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={batchTone(batch.status)}>
                      {batch.statusLabel}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
            </ListTable>
          </div>

          {selectedBatch ? (
            <WorkspaceDrawer
              closeHref={buildHref({ state })}
              eyebrow="Batch inspector"
              title={selectedBatch.name}
              description={batchStateMeaning(selectedBatch.status)}
              status={
                <StatusBadge tone={batchTone(selectedBatch.status)}>
                  {selectedBatch.statusLabel}
                </StatusBadge>
              }
            >
              <InsetPanel tone={batchTone(selectedBatch.status)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                      Why this batch is here
                    </p>
                    <p className="mt-2 text-sm leading-5 text-ink-muted">
                      {batchStateMeaning(selectedBatch.status)}
                    </p>
                  </div>
                  <StatusBadge tone={batchTone(selectedBatch.status)}>
                    {selectedBatch.paymentStatusLabel}
                  </StatusBadge>
                </div>
              </InsetPanel>

              <SectionCard
                title="Batch summary"
                description="Keep amount, partner scope, and export posture easy to inspect."
              >
                <DetailList
                  items={[
                    { label: "Window", value: selectedBatch.windowLabel },
                    { label: "Entries", value: String(selectedBatch.entryCount) },
                    { label: "Partners", value: String(selectedBatch.partnerCount) },
                    { label: "Total", value: selectedBatch.totalAmountLabel },
                    { label: "Export", value: selectedBatch.exportStatusLabel },
                    { label: "Payment", value: selectedBatch.paymentStatusLabel },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="State progression"
                description="Keep the draft, export, and payment path visible."
              >
                <StatusTimeline steps={buildBatchTimeline(selectedBatch)} />
              </SectionCard>

              <SectionCard
                title="Handoff detail"
                description="Keep the finance reference and latest note visible."
              >
                <DetailList
                  items={[
                    {
                      label: "External reference",
                      value: selectedBatch.externalReference ?? "No export reference recorded",
                    },
                    {
                      label: "Internal note",
                      value: selectedBatch.note ?? "No finance note recorded",
                    },
                    {
                      label: "Partner scope",
                      value:
                        selectedBatch.partnerNames.join(", ") || "Partner scope unavailable",
                    },
                    {
                      label: "Last update",
                      value: formatOperationalTimestamp(selectedBatch.updatedAt),
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Included payout items"
                description="Included payout items stay visible here."
              >
                <InsetPanel tone="gray" className="overflow-hidden px-0 py-0">
                  {selectedBatch.items.length === 0 ? (
                    <div className="p-4">
                      <EmptyState
                        icon={Layers}
                        title="Batch items appear here after finance reserves earnings"
                        description="Included payout items show up once approved commissions are attached to the selected batch."
                        action={
                          <ActionLink href="/payouts" variant="primary">
                            Open payouts
                          </ActionLink>
                        }
                      />
                    </div>
                  ) : (
                    selectedBatch.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-b-0"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-[15px] font-semibold text-ink">
                            {item.partnerName} • {item.amountLabel}
                          </p>
                          <StatusBadge tone={batchItemTone(item.status)}>
                            {batchItemLabel(item.status)}
                          </StatusBadge>
                        </div>
                        <p className="text-sm text-ink-muted">
                          {item.appName}
                          {item.codeLabel ? ` / ${item.codeLabel}` : ""}
                          {item.eventType ? ` • ${item.eventType}` : ""}
                        </p>
                      </div>
                    ))
                  )}
                </InsetPanel>
              </SectionCard>

              {selectedBatch.status !== "exported" && selectedBatch.status !== "paid" ? (
                <SectionCard
                  title="Export confirmation"
                  description="Record the finance handoff explicitly."
                >
                  <form action={markPayoutBatchExportedAction} className="space-y-4">
                    <input type="hidden" name="batchId" value={selectedBatch.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">External reference</span>
                      <input
                        name="externalReference"
                        type="text"
                        defaultValue={selectedBatch.externalReference ?? ""}
                        className="aa-field"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Internal note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedBatch.note ?? ""}
                        className="aa-field"
                      />
                    </label>

                    <div className="flex justify-end">
                      <ActionButton type="submit" variant="primary">
                        Export batch
                      </ActionButton>
                    </div>
                  </form>
                </SectionCard>
              ) : null}

              {selectedBatch.status !== "paid" ? (
                <SectionCard
                  title="Payment confirmation"
                  description="Confirm payment after remittance is complete."
                >
                  <form action={markPayoutBatchPaidAction} className="space-y-4">
                    <input type="hidden" name="batchId" value={selectedBatch.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Payment note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedBatch.note ?? ""}
                        className="aa-field"
                      />
                    </label>

                    <div className="flex justify-end">
                      <ActionButton type="submit" className="aa-button-success">
                        Mark paid
                      </ActionButton>
                    </div>
                  </form>
                </SectionCard>
              ) : null}

              {selectedBatch.status !== "paid" && selectedBatch.status !== "cancelled" ? (
                <SectionCard
                  title="Cancel batch"
                  description="Release reserved earnings if this batch should stop."
                >
                  <form action={cancelPayoutBatchAction} className="space-y-4">
                    <input type="hidden" name="batchId" value={selectedBatch.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Cancellation note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedBatch.note ?? ""}
                        className="aa-field"
                      />
                    </label>

                    <div className="flex justify-end">
                      <ActionButton type="submit" variant="secondary">
                        Cancel batch
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
