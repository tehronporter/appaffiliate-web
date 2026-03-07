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
        description="Keep ready, batched, exported, and paid states explicit."
        actions={
          <>
            <ActionLink href="/commissions">Open commissions</ActionLink>
            <ActionLink href="/payout-batches" variant="primary">
              Open payout batches
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="amber">Ready and reserved stay separate</StatusBadge>
          <StatusBadge tone="gray">Export and paid stay separate</StatusBadge>
          <StatusBadge tone={toneForWorkspaceLabel()}>Finance handoff stays explicit</StatusBadge>
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
          detail={`${data.stats.readyGroups} partner groups across ${data.stats.readyEntries} approved entries can be batched next.`}
          tone="amber"
          size="compact"
        />
        <StatCard
          label="Reserved in batch"
          value={formatAggregateAmount(draftLikeBatches, "$0.00")}
          detail={`${draftLikeBatches.length} tracked batches still need export or payment follow-through.`}
          tone="green"
          size="compact"
        />
        <StatCard
          label="Exported"
          value={formatAggregateAmount(exportedBatches, "$0.00")}
          detail={`${exportedBatches.length} batches already have a finance handoff but are not paid yet.`}
          tone="gray"
          size="compact"
        />
        <StatCard
          label="Recently paid"
          value={formatAggregateAmount(paidBatches, "$0.00")}
          detail={`${paidBatches.length} batches remain visible for reconciliation after payment is confirmed.`}
          tone="green"
          size="compact"
        />
      </div>

      <SummaryBar
        items={[
          {
            label: "Ready now",
            value: `${data.stats.readyGroups} partner groups contain approved earnings outside payout tracking`,
          },
          {
            label: "Finance boundary",
            value: "Export stays separate from paid so finance handoff remains explicit",
          },
          {
            label: "Current limit",
            value: "The read model shows included scope but not exclusion rules yet",
          },
        ]}
      />

      {!data.hasFinanceAccess ? (
        <SectionCard
          title="Finance access required"
          description="Payout tracking is limited to finance-safe roles."
        >
          <EmptyState
            icon={Wallet}
            eyebrow="Finance access required"
            title="Open payout records with a finance-safe role"
            description="Payout tracking is limited to owner, admin, or finance roles because it exposes real payout state."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <>
          <FilterBar
            title="Payout views"
            description="Move between ready groups and tracked batches without leaving the register."
          >
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
              title="Ready groups table"
              description="Each row groups approved commissions that can be reserved into a draft batch as the next deliberate finance step."
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
                      title="Your first payout-ready group will appear here"
                      description="Approved commission items show up here when they are ready for a deliberate draft-batch step."
                      action={
                        <ActionLink href="/commissions" variant="primary">
                          Review commission ledger
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
                    className={`grid gap-4 px-5 py-3 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.2fr)_150px_120px_110px] md:items-center ${
                      group.id === selectedGroup?.id ? "bg-primary-soft/35" : ""
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-ink">{group.partnerName}</h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {group.entryCount} approved entries across{" "}
                        {group.appNames.join(", ") || "unknown app context"}
                      </p>
                    </div>
                    <div className="text-sm text-ink-muted">
                      {group.latestEffectiveAt
                        ? formatOperationalTimestamp(group.latestEffectiveAt)
                        : "Timing unavailable"}
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      {group.totalAmountLabel}
                    </div>
                    <div className="text-sm font-semibold text-primary">Build batch</div>
                  </Link>
                ))}
              </div>
            </ListTable>
          ) : null}

          {showBatches ? (
            <ListTable
              className="w-full"
              eyebrow="Tracked batches"
              title="Payout batches table"
              description="Inspect what has already moved into finance workflow and what still needs a handoff step."
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
                      title="Create a draft batch to start payout tracking"
                      description="Batches appear here after finance reserves a payout-ready group into an explicit handoff record."
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
                    className={`grid gap-4 px-5 py-3 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.2fr)_120px_120px_auto] md:items-center ${
                      batch.id === selectedBatch?.id ? "bg-primary-soft/35" : ""
                    }`}
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-ink">{batch.name}</h3>
                      <p className="mt-1 text-sm text-ink-muted">
                        {batch.partnerCount} partners • {batch.windowLabel}
                      </p>
                    </div>
                    <div className="text-sm text-ink-muted">{batch.entryCount}</div>
                    <div className="text-sm font-semibold text-ink">
                      {batch.totalAmountLabel}
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
          ) : null}

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
                      Why this batch is in its current state
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
                description="Keep the tracked amount, included partners, and export posture visible before taking the next finance action."
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
                description="Show when the batch was created, when it cleared internal review, and whether finance handoff or payment is complete."
              >
                <StatusTimeline steps={buildBatchTimeline(selectedBatch)} />
              </SectionCard>

              <SectionCard
                title="Finance handoff"
                description="Make the current export reference and note readable for finance and support without opening raw records."
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
                description="Keep the reserved payout rows readable without leaving the inspector."
              >
                <InsetPanel tone="gray" className="overflow-hidden px-0 py-0">
                  {selectedBatch.items.length === 0 ? (
                    <div className="p-4">
                      <EmptyState
                        icon={Layers}
                        title="Reserved payout items will appear here"
                        description="This panel fills with the batch's payout items after finance reserves approved earnings into the tracked batch."
                        action={
                          <ActionLink href="/commissions" variant="primary">
                            Review commission ledger
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
                  description="Export only reviewed, approved commissions so finance receives a clean batch."
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
                  description="Mark the batch paid only after remittance is complete and the finance handoff has cleared."
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
            </WorkspaceDrawer>
          ) : selectedGroup ? (
            <WorkspaceDrawer
              closeHref={buildHref({ view })}
              eyebrow="Batch builder"
              title={selectedGroup.partnerName}
              description="This group is ready because the included commission entries are already approved and still outside payout tracking."
              status={<StatusBadge tone="green">Ready for payout</StatusBadge>}
            >
              <InsetPanel tone="green">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-3xl">
                    <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                      Why this group is ready
                    </p>
                    <p className="mt-2 text-sm leading-6 text-ink-muted">
                      These earnings have already cleared commission approval, but finance has not reserved them inside a payout batch yet.
                    </p>
                  </div>
                  <StatusBadge tone="green">{selectedGroup.totalAmountLabel}</StatusBadge>
                </div>
              </InsetPanel>

              <SectionCard
                title="Included commissions"
                description="Show what this draft batch would include before you reserve it."
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
                description="Keep the payout sequence obvious before this group becomes a tracked batch."
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
