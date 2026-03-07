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
  createDraftPayoutBatchAction,
  markPayoutBatchExportedAction,
  markPayoutBatchPaidAction,
} from "@/app/(workspace)/payouts/actions";
import { listPayoutsData } from "@/lib/services/finance";

type PayoutsPageProps = {
  searchParams: Promise<{
    view?: string;
    group?: string;
    batch?: string;
    notice?: string;
  }>;
};

function batchTone(status: string): StatusTone {
  if (status === "paid") {
    return "success";
  }

  if (status === "exported" || status === "approved") {
    return "primary";
  }

  if (status === "cancelled") {
    return "danger";
  }

  return "warning";
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
      tone: "success" as const,
      title: "Draft batch created",
      detail: "Approved commission items are now tracked inside a real payout batch.",
    };
  }

  if (notice === "batch-exported") {
    return {
      tone: "primary" as const,
      title: "Batch exported",
      detail: "Export status is now recorded without implying remittance is complete.",
    };
  }

  if (notice === "batch-paid") {
    return {
      tone: "success" as const,
      title: "Batch marked paid",
      detail: "Batch items and linked ledger entries now reflect a paid state.",
    };
  }

  if (notice === "batch-error") {
    return {
      tone: "danger" as const,
      title: "Payout action failed",
      detail: "Review the current batch or group state and try again.",
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
    data.readyGroups.find((group) => group.id === selectedGroupId) ??
    data.readyGroups[0] ??
    null;
  const selectedBatch =
    data.batches.find((batch) => batch.id === selectedBatchId) ??
    data.batches[0] ??
    null;

  const showReady = view === "all" || view === "ready";
  const showBatches = view === "all" || view === "batches";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Finance"
        title="Payouts"
        description="Move approved commission items into deliberate payout tracking with clear separation between draft, exported, and paid states."
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
          <StatusBadge tone="warning">Manual batch preparation</StatusBadge>
          <StatusBadge tone="primary">Export and paid stay separate</StatusBadge>
          <StatusBadge>Tracked payout workflow</StatusBadge>
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
          label="Ready groups"
          value={String(data.stats.readyGroups)}
          detail="Partner-grouped approved items that are not yet inside a payout batch."
          tone="warning"
        />
        <StatCard
          label="Ready entries"
          value={String(data.stats.readyEntries)}
          detail="Approved commission entries still waiting for explicit payout tracking."
          tone="warning"
        />
        <StatCard
          label="Draft batches"
          value={String(data.stats.draftBatches)}
          detail="Draft batches remain visible until finance explicitly exports them."
          tone="primary"
        />
        <StatCard
          label="Exported"
          value={String(data.stats.exportedBatches)}
          detail="Exported batches still require a separate remittance confirmation step."
          tone="primary"
        />
        <StatCard
          label="Paid"
          value={String(data.stats.paidBatches)}
          detail="Paid batches remain visible for reconciliation and audit history."
          tone="success"
        />
      </div>

      <SurfaceCard>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              Ready for payout tracking
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {data.stats.readyGroups} partner groups contain {data.stats.readyEntries} approved entries that have not been batched yet.
            </p>
          </div>
          <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              In motion
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {data.stats.draftBatches} draft and {data.stats.exportedBatches} exported batches are still in motion.
            </p>
          </div>
          <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              What this page controls
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              Create draft batches carefully, then confirm export and payment as separate finance actions.
            </p>
          </div>
        </div>
      </SurfaceCard>

      {!data.hasFinanceAccess ? (
        <SurfaceCard>
          <EmptyState
            eyebrow="Finance access required"
            title="You do not have access to payout records"
            description="Payout tracking is limited to owner, admin, or finance roles because it exposes real payout state."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SurfaceCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.22fr)_minmax(320px,0.78fr)]">
          <div className="space-y-4">
            <FilterBar
              title="Payout filters"
              description="Keep ready groups and tracked batches readable without losing the payout sequence."
            >
              <FilterChipLink
                href={buildHref({
                  view: "all",
                  group: selectedGroup?.id,
                  batch: selectedBatch?.id,
                })}
                active={view === "all"}
              >
                All payout work
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({
                  view: "ready",
                  group: selectedGroup?.id,
                })}
                active={view === "ready"}
              >
                Ready groups
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({
                  view: "batches",
                  batch: selectedBatch?.id,
                })}
                active={view === "batches"}
              >
                Tracked batches
              </FilterChipLink>
            </FilterBar>

            {showReady ? (
              <ListTable
                eyebrow="Ready by partner"
                title="Approved items waiting for payout tracking"
                description="Use these groups to create draft batches deliberately, not automatically or invisibly."
              >
                <div className="hidden grid-cols-[minmax(0,1.2fr)_120px_120px] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
                  <span>Partner</span>
                  <span>Entries</span>
                  <span>Total</span>
                </div>

                <div className="divide-y divide-border bg-surface-elevated">
                  {data.readyGroups.length === 0 ? (
                    <div className="p-5">
                      <EmptyState
                        eyebrow="Queue clear"
                        title="No payout-ready partner groups"
                        description="Approved commission items will appear here once they are ready for manual batch creation."
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
                        view: "ready",
                        group: group.id,
                      })}
                      className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_120px_120px] md:items-center ${
                        group.id === selectedGroup?.id
                          ? "bg-primary-soft/40"
                          : "hover:bg-surface"
                      }`}
                    >
                      <div>
                        <h3 className="text-base font-semibold text-ink">
                          {group.partnerName}
                        </h3>
                        <p className="mt-1 text-sm text-ink-muted">
                          {group.appNames.join(", ") || "App context unavailable"}
                        </p>
                      </div>
                      <div className="text-sm text-ink-muted">{group.entryCount}</div>
                      <div className="text-sm font-semibold text-ink">
                        {group.totalAmountLabel}
                      </div>
                    </Link>
                  ))}
                </div>
              </ListTable>
            ) : null}

            {showBatches ? (
              <ListTable
                eyebrow="Tracked batches"
                title="Payout batch register"
                description="Draft, exported, and paid states remain separate and auditable."
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
                        eyebrow="No batches yet"
                        title="No payout batches exist yet"
                        description="Create a draft batch from an approved partner group to start real payout tracking."
                        action={
                          <ActionLink
                            href={buildHref({
                              view: "ready",
                              group: selectedGroup?.id,
                            })}
                            variant="primary"
                          >
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
                        view: "batches",
                        batch: batch.id,
                      })}
                      className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_120px_120px_auto] md:items-center ${
                        batch.id === selectedBatch?.id && view === "batches"
                          ? "bg-primary-soft/40"
                          : "hover:bg-surface"
                      }`}
                    >
                      <div>
                        <h3 className="text-base font-semibold text-ink">{batch.name}</h3>
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
          </div>

          {(view === "batches" || (view === "all" && selectedBatchId && selectedBatch)) &&
          selectedBatch ? (
            <DetailPanel
              eyebrow="Batch inspector"
              title={selectedBatch.name}
              description={
                selectedBatch.note ??
                "Keep export and paid confirmations as separate finance actions, even when the batch is already in motion."
              }
              status={
                <StatusBadge tone={batchTone(selectedBatch.status)}>
                  {selectedBatch.statusLabel}
                </StatusBadge>
              }
            >
              <SectionCard
                title="Batch summary"
                description="Keep the current batch window, payout posture, and export state visible before taking the next action."
                items={[
                  `Window: ${selectedBatch.windowLabel}.`,
                  `Entries: ${selectedBatch.entryCount}.`,
                  `Partners: ${selectedBatch.partnerCount}.`,
                  `Total: ${selectedBatch.totalAmountLabel}.`,
                  `Export status: ${selectedBatch.exportStatusLabel}.`,
                  `Payment status: ${selectedBatch.paymentStatusLabel}.`,
                ]}
              />

              <SurfaceCard className="bg-surface">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Batch item preview
                </p>
                <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                  {selectedBatch.items.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-ink-muted">
                      No tracked items are attached to this batch yet.
                    </div>
                  ) : (
                    selectedBatch.items.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-3 border-b border-border px-4 py-4 last:border-b-0"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-ink">
                            {item.partnerName} • {item.amountLabel}
                          </p>
                          <StatusBadge tone={batchTone(item.status)}>
                            {item.status}
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
                </div>
              </SurfaceCard>

              {selectedBatch.status !== "exported" && selectedBatch.status !== "paid" ? (
                <SurfaceCard className="bg-surface">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Export confirmation
                  </p>
                  <form action={markPayoutBatchExportedAction} className="mt-5 space-y-4">
                    <input type="hidden" name="batchId" value={selectedBatch.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">External reference</span>
                      <input
                        name="externalReference"
                        type="text"
                        defaultValue={selectedBatch.externalReference ?? ""}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Internal note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedBatch.note ?? ""}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                      >
                        Mark exported
                      </button>
                    </div>
                  </form>
                </SurfaceCard>
              ) : null}

              {selectedBatch.status !== "paid" ? (
                <SurfaceCard className="bg-surface">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Payment confirmation
                  </p>
                  <form action={markPayoutBatchPaidAction} className="mt-5 space-y-4">
                    <input type="hidden" name="batchId" value={selectedBatch.id} />

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">Payment note</span>
                      <textarea
                        name="note"
                        rows={3}
                        defaultValue={selectedBatch.note ?? ""}
                        className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                      />
                    </label>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="rounded-full border border-success bg-success px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-success)_88%,black)]"
                      >
                        Mark paid
                      </button>
                    </div>
                  </form>
                </SurfaceCard>
              ) : null}
            </DetailPanel>
          ) : selectedGroup ? (
            <DetailPanel
              eyebrow="Ready group inspector"
              title={selectedGroup.partnerName}
              description="Approved commission items remain outside payout tracking until finance explicitly creates a batch."
              status={<StatusBadge tone="warning">Ready for batch</StatusBadge>}
            >
              <SectionCard
                title="Partner grouping"
                description="Use partner-grouped payout readiness to keep manual payout prep legible."
                items={[
                  `Entries: ${selectedGroup.entryCount}.`,
                  `Total: ${selectedGroup.totalAmountLabel}.`,
                  `Apps: ${selectedGroup.appNames.join(", ") || "No app context"}.`,
                  `Latest activity: ${
                    selectedGroup.latestEffectiveAt
                      ? new Date(selectedGroup.latestEffectiveAt).toLocaleString()
                      : "Unknown"
                  }.`,
                ]}
              />

              <SurfaceCard className="bg-surface">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Create draft batch
                </p>
                <form action={createDraftPayoutBatchAction} className="mt-5 space-y-4">
                  <input type="hidden" name="groupId" value={selectedGroup.id} />

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">Internal note</span>
                    <textarea
                      name="note"
                      rows={3}
                      defaultValue=""
                      className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                    />
                  </label>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                    >
                        Create draft batch
                    </button>
                  </div>
                </form>
              </SurfaceCard>
            </DetailPanel>
          ) : (
            <DetailPanel
              eyebrow="Payout inspector"
              title="No payout context selected"
            description="Choose a ready group or tracked batch to inspect payout context, batch state, and the next finance action."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="No payout item is available"
              description="The inspector shows partner grouping or tracked batch detail once a payout record matches the current view."
              action={
                <ActionLink href="/payouts" variant="primary">
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
