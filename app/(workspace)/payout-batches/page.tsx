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
  markPayoutBatchExportedAction,
  markPayoutBatchPaidAction,
} from "@/app/(workspace)/payouts/actions";
import { listPayoutsData } from "@/lib/services/finance";

type PayoutBatchesPageProps = {
  searchParams: Promise<{
    state?: string;
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
      tone: "primary" as const,
      title: "Batch exported",
      detail: "The batch now carries an explicit exported state and reference context.",
    };
  }

  if (notice === "batch-paid") {
    return {
      tone: "success" as const,
      title: "Batch marked paid",
      detail: "The batch and linked commission records now reflect payment completion.",
    };
  }

  if (notice === "batch-error") {
    return {
      tone: "danger" as const,
      title: "Batch action failed",
      detail: "Review the current batch state and try again.",
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
    filteredBatches.find((batch) => batch.id === selectedBatchId) ??
    filteredBatches[0] ??
    null;
  const banner = noticeCopy(notice);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Payout batches"
        description="Use the batch register as the finance-safe record of what has been drafted, exported, and marked paid. This stays separate from commission review."
        actions={
          <>
            <ActionLink href="/payouts">Open payouts</ActionLink>
            <ActionLink href="/settings/exports" variant="primary">
              Open exports
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Real batch register</StatusBadge>
          <StatusBadge tone="warning">Manual export confirmation</StatusBadge>
          <StatusBadge>Paid state remains explicit</StatusBadge>
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

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Draft"
          value={String(data.batches.filter((batch) => batch.status === "draft").length)}
          detail="Draft batches are still editable payout shells."
          tone="warning"
        />
        <StatCard
          label="Exported"
          value={String(
            data.batches.filter((batch) => batch.status === "exported").length,
          )}
          detail="Exported batches stay open until payment is confirmed separately."
          tone="primary"
        />
        <StatCard
          label="Paid"
          value={String(data.batches.filter((batch) => batch.status === "paid").length)}
          detail="Paid batches remain visible for reconciliation history."
          tone="success"
        />
      </div>

      {!data.hasFinanceAccess ? (
        <SurfaceCard>
          <EmptyState
            eyebrow="Finance access required"
            title="You do not have access to payout batch records"
            description="Payout batch visibility is limited to owner, admin, or finance roles."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Return to overview
              </ActionLink>
            }
          />
        </SurfaceCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <div className="space-y-4">
            <FilterBar
              title="Sticky filters"
              description="Read the payout register by batch state without leaving the list-and-detail flow."
            >
              <FilterChipLink
                href={buildHref({ state: "all", batch: selectedBatch?.id })}
                active={state === "all"}
              >
                All batches
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "draft", batch: selectedBatch?.id })}
                active={state === "draft"}
              >
                Draft
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "exported", batch: selectedBatch?.id })}
                active={state === "exported"}
              >
                Exported
              </FilterChipLink>
              <FilterChipLink
                href={buildHref({ state: "paid", batch: selectedBatch?.id })}
                active={state === "paid"}
              >
                Paid
              </FilterChipLink>
            </FilterBar>

            <ListTable
              eyebrow="Batch register"
              title="Real payout batches"
              description="Every row here reflects a real batch, its current tracking state, and the amount carried inside it."
            >
              <div className="hidden grid-cols-[minmax(0,1.2fr)_120px_120px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
                <span>Batch</span>
                <span>Entries</span>
                <span>Total</span>
                <span>Status</span>
              </div>

              <div className="divide-y divide-border bg-surface-elevated">
                {filteredBatches.length === 0 ? (
                  <div className="p-5">
                    <EmptyState
                      eyebrow="No matches"
                      title="No payout batches match this state"
                      description="Reset the filter to return to the full payout register."
                      action={
                        <ActionLink href="/payout-batches" variant="primary">
                          Reset filters
                        </ActionLink>
                      }
                    />
                  </div>
                ) : null}

                {filteredBatches.map((batch) => (
                  <Link
                    key={batch.id}
                    href={buildHref({ state, batch: batch.id })}
                    className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_120px_120px_auto] md:items-center ${
                      batch.id === selectedBatch?.id
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
          </div>

          {selectedBatch ? (
            <DetailPanel
              eyebrow="Batch inspector"
              title={selectedBatch.name}
              description={
                selectedBatch.note ??
                "Inspect the tracked amount, export status, and payment confirmation without losing the item-level context."
              }
              status={
                <StatusBadge tone={batchTone(selectedBatch.status)}>
                  {selectedBatch.statusLabel}
                </StatusBadge>
              }
            >
              <SectionCard
                title="Batch summary"
                description="Keep the batch window and payout posture explicit."
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
                  Batch item register
                </p>
                <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                  {selectedBatch.items.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-ink-muted">
                      No batch items are attached to this record yet.
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
                    Mark exported
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
                    Mark paid
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
          ) : (
            <DetailPanel
              eyebrow="Batch inspector"
              title="No batch selected"
              description="Reset the filters to inspect a payout batch."
            >
              <EmptyState
                eyebrow="Empty inspector"
                title="No payout batch is visible"
                description="The inspector will show tracked batch detail once a real payout batch matches the current view."
                action={
                  <ActionLink href="/payout-batches" variant="primary">
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
