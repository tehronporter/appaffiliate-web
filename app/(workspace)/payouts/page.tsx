import Link from "next/link";
import { Layers, Wallet } from "lucide-react";

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
  createDraftPayoutBatchAction,
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

type PayoutsPageProps = {
  searchParams: Promise<{
    view?: string;
    group?: string;
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
    return "Payment is marked complete and the batch remains visible for reconciliation.";
  }

  if (status === "exported") {
    return "Finance has an exported handoff, but payment still needs a separate confirmation step.";
  }

  if (status === "approved") {
    return "The batch is approved internally and is waiting on export handoff.";
  }

  if (status === "reviewing") {
    return "The batch is still being checked before finance handoff.";
  }

  if (status === "cancelled") {
    return "The batch was stopped and should not be treated as payable.";
  }

  return "The batch is drafted but still needs explicit export confirmation.";
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
      detail: "Approved commissions were pulled into a tracked payout batch.",
      meta: formatOperationalTimestamp(batch.createdAt),
      status: "complete" as const,
    },
    {
      label: "Ready for export",
      detail:
        batch.status === "draft"
          ? "The batch is still waiting for export confirmation."
          : "The batch cleared internal review and is ready for finance handoff.",
      meta: batch.approvedAt ? formatOperationalTimestamp(batch.approvedAt) : undefined,
      status:
        batch.status === "draft" ? ("current" as const) : ("complete" as const),
    },
    {
      label: "Exported",
      detail:
        exportComplete
          ? "Finance handoff has been recorded explicitly."
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
          : "Payment should only be confirmed after remittance completes.",
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
  view: string;
  group?: string;
  batch?: string;
}) {
  const search = new URLSearchParams();

  if (params.view !== "all") {
    search.set("view", params.view);
  }

  if (params.group) {
    search.set("group", params.group);
  }

  if (params.batch) {
    search.set("batch", params.batch);
  }

  const query = search.toString();
  return query ? `/payouts?${query}` : "/payouts";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "batch-created") {
    return {
      tone: "amber" as const,
      title: "Draft batch created",
      detail: "Approved commission entries are now reserved inside a tracked payout batch.",
    };
  }

  if (notice === "batch-exported") {
    return {
      tone: "gray" as const,
      title: "Batch exported",
      detail: "Finance handoff is now recorded without implying payment is complete.",
    };
  }

  if (notice === "batch-paid") {
    return {
      tone: "green" as const,
      title: "Batch marked paid",
      detail: "The batch and its linked payout items now reflect payment completion.",
    };
  }

  if (notice === "batch-cancelled") {
    return {
      tone: "amber" as const,
      title: "Batch cancelled",
      detail: "Reserved earnings were released and can be batched again.",
    };
  }

  if (notice === "batch-error") {
    return {
      tone: "red" as const,
      title: "Payout action failed",
      detail: "Review the current batch or ready group state and try again.",
    };
  }

  return null;
}

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const {
    view = "all",
    group: selectedGroupId,
    batch: selectedBatchId,
    notice,
  } = await searchParams;
  const data = await listPayoutsData();
  const banner = noticeCopy(notice);
  const selectedGroup =
    data.readyGroups.find((group) => group.id === selectedGroupId) ?? null;
  const selectedBatch =
    data.batches.find((batch) => batch.id === selectedBatchId) ?? null;
  const draftLikeBatches = data.batches.filter(
    (batch) =>
      batch.status === "draft" ||
      batch.status === "reviewing" ||
      batch.status === "approved",
  );
  const exportedBatches = data.batches.filter((batch) => batch.status === "exported");
  const paidBatches = data.batches.filter((batch) => batch.status === "paid");
  const showReady = view === "all" || view === "ready";
  const showBatches = view === "all" || view === "batches";
  const showBatchInspector =
    view === "batches" || (view === "all" && Boolean(selectedBatchId && selectedBatch));

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Finance"
        title="Payouts"
        description="Move approved earnings into tracked payout work."
        actions={
          <>
            <ActionLink href="/commissions">Open commissions</ActionLink>
            <ActionLink href="/payout-batches" variant="primary">
              Open payout batches
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Tracked payout work</StatusBadge>
          {data.stats.readyGroups > 0 ? <StatusBadge tone="amber">Ready groups</StatusBadge> : null}
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
          label="Ready to batch"
          value={formatAggregateAmount(data.readyGroups, "$0.00")}
          detail={`${data.stats.readyGroups} groups across ${data.stats.readyEntries} approved entries.`}
          tone="amber"
          size="compact"
        />
        <StatCard
          label="Reserved in batch"
          value={formatAggregateAmount(draftLikeBatches, "$0.00")}
          detail={`${draftLikeBatches.length} batches still need export or payment.`}
          tone="blue"
          size="compact"
        />
        <StatCard
          label="Exported"
          value={formatAggregateAmount(exportedBatches, "$0.00")}
          detail={`${exportedBatches.length} batches have a finance handoff.`}
          tone="gray"
          size="compact"
        />
        <StatCard
          label="Recently paid"
          value={formatAggregateAmount(paidBatches, "$0.00")}
          detail={`${paidBatches.length} batches remain visible for reconciliation.`}
          tone="green"
          size="compact"
        />
      </div>

      {!data.hasFinanceAccess ? (
        <SectionCard
          title="Finance access required"
          description="Payout tracking is limited to finance-safe roles."
        >
          <EmptyState
            icon={Wallet}
            eyebrow="Finance access required"
            title="Open payout records with a finance-safe role"
            description="Payout tracking is limited to owner, admin, or finance roles."
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
                  label: "Ready",
                  value:
                    data.stats.readyGroups > 0
                      ? `${data.stats.readyGroups} groups`
                      : "No ready groups",
                },
                {
                  label: "In motion",
                  value:
                    draftLikeBatches.length > 0
                      ? `${draftLikeBatches.length} batches`
                      : "No tracked batches",
                },
              ]}
            />

            <FilterBar title="Views">
              <FilterChipLink href={buildHref({ view: "all" })} active={view === "all"}>
                All payout work
              </FilterChipLink>
              <FilterChipLink href={buildHref({ view: "ready" })} active={view === "ready"}>
                Ready for payout
              </FilterChipLink>
              <FilterChipLink href={buildHref({ view: "batches" })} active={view === "batches"}>
                Tracked batches
              </FilterChipLink>
            </FilterBar>

          {showReady ? (
            <ListTable
              className="w-full"
              eyebrow="Ready for payout"
              title="Ready groups"
              description="Select a row to build the next batch."
            >
              <div className="hidden grid-cols-[minmax(0,1.2fr)_150px_120px_110px] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
                <span>Partner</span>
                <span>Readiness</span>
                <span>Total</span>
                <span>Action</span>
              </div>

              <div className="divide-y divide-border bg-surface-elevated">
                {data.readyGroups.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={Wallet}
                      eyebrow="Ready for payout"
                      title="Next payout-ready group appears here"
                      description="Approved commission items show up here when they are ready to batch."
                      action={
                        <ActionLink href="/commissions" variant="primary">
                          Review commissions
                        </ActionLink>
                      }
                    />
                  </div>
                ) : null}

                {data.readyGroups.map((group) => (
                  <Link
                    key={group.id}
                    href={buildHref({
                      view: view === "all" ? "all" : "ready",
                      group: group.id,
                    })}
                    className={`grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.2fr)_150px_120px_110px] md:items-center md:gap-4 md:px-5 md:py-3 ${
                      group.id === selectedGroup?.id ? "bg-primary-soft/35" : ""
                    }`}
                  >
                    <div>
                      <span className="aa-mobile-label md:hidden">Partner</span>
                      <h3 className="text-sm font-semibold text-ink">{group.partnerName}</h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {group.entryCount} approved entries across{" "}
                        {group.appNames.join(", ") || "unknown app context"}
                      </p>
                    </div>
                    <div>
                      <span className="aa-mobile-label md:hidden">Readiness</span>
                      <div className="text-sm text-ink-muted">
                        {group.latestEffectiveAt
                          ? formatOperationalTimestamp(group.latestEffectiveAt)
                          : "Timing unavailable"}
                      </div>
                    </div>
                    <div>
                      <span className="aa-mobile-label md:hidden">Total</span>
                      <div className="text-sm font-semibold text-ink">
                        {group.totalAmountLabel}
                      </div>
                    </div>
                    <div>
                      <span className="aa-mobile-label md:hidden">Action</span>
                      <div className="text-sm font-semibold text-primary">Build batch</div>
                    </div>
                  </Link>
                ))}
              </div>
            </ListTable>
          ) : null}

          {showBatches ? (
            <ListTable
              className="w-full"
              eyebrow="Tracked batches"
              title="Batches"
              description="Select a row to inspect handoff state."
            >
              <div className="hidden grid-cols-[minmax(0,1.2fr)_120px_120px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
                <span>Batch</span>
                <span>Entries</span>
                <span>Total</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-border bg-surface-elevated">
                {data.batches.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      icon={Layers}
                      eyebrow="Tracked batches"
                      title="Create a draft batch to start tracking"
                      description="Batches appear here after finance reserves a ready group."
                      action={
                        <ActionLink href={buildHref({ view: "ready" })} variant="primary">
                          Review ready groups
                        </ActionLink>
                      }
                    />
                  </div>
                ) : null}

                {data.batches.map((batch) => (
                  <Link
                    key={batch.id}
                    href={buildHref({
                      view: view === "all" ? "all" : "batches",
                      batch: batch.id,
                    })}
                    className={`grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.2fr)_120px_120px_auto] md:items-center md:gap-4 md:px-5 md:py-3 ${
                      batch.id === selectedBatch?.id ? "bg-primary-soft/35" : ""
                    }`}
                  >
                    <div>
                      <span className="aa-mobile-label md:hidden">Batch</span>
                      <h3 className="text-sm font-semibold text-ink">{batch.name}</h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {batch.partnerCount} partners • {batch.windowLabel}
                      </p>
                    </div>
                    <div>
                      <span className="aa-mobile-label md:hidden">Entries</span>
                      <div className="text-sm text-ink-muted">{batch.entryCount}</div>
                    </div>
                    <div>
                      <span className="aa-mobile-label md:hidden">Total</span>
                      <div className="text-sm font-semibold text-ink">
                        {batch.totalAmountLabel}
                      </div>
                    </div>
                    <div className="flex justify-start md:justify-end">
                      <span className="aa-mobile-label mr-2 md:hidden">Status</span>
                      <StatusBadge tone={batchTone(batch.status)}>
                        {batch.statusLabel}
                      </StatusBadge>
                    </div>
                  </Link>
                ))}
              </div>
            </ListTable>
          ) : null}
          </div>

          {showBatchInspector && selectedBatch ? (
            <WorkspaceDrawer
              closeHref={buildHref({ view })}
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
                    <p className="mt-2 text-sm leading-6 text-ink-muted">
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
                description="Keep amount, partner scope, and export posture visible."
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
                description="Show draft, export, and payment state."
              >
                <StatusTimeline steps={buildBatchTimeline(selectedBatch)} />
              </SectionCard>

              <SectionCard
                title="Finance handoff"
                description="Keep the export reference and note readable."
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
                description="Keep reserved payout rows readable."
              >
                <InsetPanel tone="gray" className="overflow-hidden px-0 py-0">
                  {selectedBatch.items.length === 0 ? (
                    <div className="p-4">
                      <EmptyState
                        icon={Layers}
                        title="Reserved payout items will appear here"
                        description="This panel fills after finance reserves approved earnings into the batch."
                        action={
                          <ActionLink href="/commissions" variant="primary">
                            Review commissions
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
                          <p className="text-sm font-semibold text-ink">
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
                      <ActionButton
                        type="submit"
                        variant="primary"
                        className="aa-button-success"
                      >
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
          ) : selectedGroup ? (
            <WorkspaceDrawer
              closeHref={buildHref({ view })}
              eyebrow="Batch builder"
              title={selectedGroup.partnerName}
              description="This group is approved and still outside payout tracking."
              status={<StatusBadge tone="green">Ready for payout</StatusBadge>}
            >
              <InsetPanel tone="green">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                      Why this group is ready
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">
                      These earnings cleared commission approval but are not in a payout batch yet.
                    </p>
                  </div>
                  <StatusBadge tone="green">{selectedGroup.totalAmountLabel}</StatusBadge>
                </div>
              </InsetPanel>

              <SectionCard
                title="Included commissions"
                description="Show what this draft batch would include."
              >
                <DetailList
                  items={[
                    { label: "Entries", value: String(selectedGroup.entryCount) },
                    { label: "Total", value: selectedGroup.totalAmountLabel },
                    {
                      label: "Apps",
                      value: selectedGroup.appNames.join(", ") || "No app context available",
                    },
                    {
                      label: "Latest approved activity",
                      value: selectedGroup.latestEffectiveAt
                        ? formatOperationalTimestamp(selectedGroup.latestEffectiveAt)
                        : "Unknown",
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="State progression"
                description="Keep the payout sequence obvious before this becomes a tracked batch."
              >
                <StatusTimeline
                  steps={[
                    {
                      label: "Approved earnings",
                      detail: "Commission review is complete for the items in this group.",
                      meta: `${selectedGroup.entryCount} entries`,
                      status: "complete",
                    },
                    {
                      label: "Ready for payout",
                      detail:
                        "The group is waiting for a deliberate draft-batch step so payout tracking becomes explicit.",
                      meta: selectedGroup.totalAmountLabel,
                      status: "current",
                    },
                    {
                      label: "Exported to finance",
                      detail:
                        "Export only happens after a draft batch exists and finance confirms the handoff.",
                      status: "upcoming",
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Export readiness"
                description="Keep the handoff boundaries plain so finance and support can explain what is included."
              >
                <DetailList
                  items={[
                    {
                      label: "Included scope",
                      value: "Only the approved commissions already grouped here will enter the new batch.",
                    },
                    {
                      label: "Exclusions visible",
                      value:
                        "Exclusions are not exposed in the current read model, so the UI keeps that limit explicit.",
                    },
                    {
                      label: "Next action",
                      value: "Create a draft batch to reserve these earnings for payout tracking.",
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Create draft batch"
                description="Reserve these approved earnings inside a tracked batch before any export or payment step happens."
              >
                <form action={createDraftPayoutBatchAction} className="space-y-4">
                  <input type="hidden" name="groupId" value={selectedGroup.id} />

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">Internal note</span>
                    <textarea name="note" rows={3} defaultValue="" className="aa-field" />
                  </label>

                  <div className="flex justify-end">
                    <ActionButton type="submit" variant="primary">
                      Create draft batch
                    </ActionButton>
                  </div>
                </form>
              </SectionCard>
            </WorkspaceDrawer>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
