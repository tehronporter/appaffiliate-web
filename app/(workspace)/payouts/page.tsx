import Link from "next/link";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailPanel,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InlineActionRow,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
  type StatusTone,
} from "@/components/admin-ui";

type BatchState = "draft" | "exported" | "paid";

type PayoutsPageProps = {
  searchParams: Promise<{
    state?: string;
    batch?: string;
  }>;
};

const batches = [
  {
    slug: "batch-mar-draft",
    name: "March draft batch",
    window: "Mar 1 - Mar 15",
    partners: 3,
    entries: 8,
    total: "$96.00",
    state: "draft" as BatchState,
    exportStatus: "Not exported",
    paidStatus: "Not paid",
    note: "Draft scope is ready for finance review but not yet exported.",
  },
  {
    slug: "batch-feb-exported",
    name: "February exported batch",
    window: "Feb 1 - Feb 29",
    partners: 5,
    entries: 14,
    total: "$412.50",
    state: "exported" as BatchState,
    exportStatus: "CSV exported",
    paidStatus: "Awaiting remittance",
    note: "Export completed. Mark-as-paid should remain a clearly separate step.",
  },
  {
    slug: "batch-jan-paid",
    name: "January paid batch",
    window: "Jan 1 - Jan 31",
    partners: 4,
    entries: 12,
    total: "$388.20",
    state: "paid" as BatchState,
    exportStatus: "CSV exported",
    paidStatus: "Paid",
    note: "Closed batch retained for reconciliation history.",
  },
];

function batchTone(state: BatchState): StatusTone {
  if (state === "paid") {
    return "success";
  }
  if (state === "draft") {
    return "warning";
  }
  return "primary";
}

function paidStatusTone(state: BatchState): StatusTone {
  if (state === "paid") {
    return "success";
  }

  if (state === "draft") {
    return "warning";
  }

  return "primary";
}

function buildHref(params: { state: string; batch?: string }) {
  const search = new URLSearchParams();
  if (params.state && params.state !== "all") {
    search.set("state", params.state);
  }
  if (params.batch) {
    search.set("batch", params.batch);
  }
  const query = search.toString();
  return query ? `/payouts?${query}` : "/payouts";
}

export default async function PayoutsPage({ searchParams }: PayoutsPageProps) {
  const { state = "all", batch: selectedBatchSlug } = await searchParams;
  const filteredBatches = batches.filter(
    (batch) => state === "all" || batch.state === state,
  );
  const selectedBatch =
    filteredBatches.find((batch) => batch.slug === selectedBatchSlug) ??
    filteredBatches[0] ??
    null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Payouts"
        description="Prepare payout batches with finance-safe separation between drafting, exporting, and marking as paid. This should read like a controlled back-office flow, not a loose action list."
        actions={
          <>
            <ActionLink href="/commissions">Open commissions</ActionLink>
            <ActionLink href="/dashboard" variant="primary">
              Open overview
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="warning">Draft review stays visible</StatusBadge>
          <StatusBadge tone="primary">Export and payment are separate</StatusBadge>
          <StatusBadge>Closed batches retained for audit</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Draft batches"
          value={String(batches.filter((batch) => batch.state === "draft").length)}
          detail="Drafts should remain reviewable before any export action happens."
          tone="warning"
        />
        <StatCard
          label="Exported"
          value={String(batches.filter((batch) => batch.state === "exported").length)}
          detail="Exported batches still need a clearly separate payment confirmation step."
          tone="primary"
        />
        <StatCard
          label="Paid"
          value={String(batches.filter((batch) => batch.state === "paid").length)}
          detail="Paid batches remain visible for reconciliation and audit history."
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Keep payout review disciplined by batch state."
          >
            <FilterChipLink
              href={buildHref({ state: "all", batch: selectedBatch?.slug })}
              active={state === "all"}
            >
              All batches
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "draft", batch: selectedBatch?.slug })}
              active={state === "draft"}
            >
              Draft
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "exported", batch: selectedBatch?.slug })}
              active={state === "exported"}
            >
              Exported
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "paid", batch: selectedBatch?.slug })}
              active={state === "paid"}
            >
              Paid
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Batch register"
            title="Controlled payout review"
            description="Use the batch register as the operational source of truth for draft preparation, export shell, and final payment confirmation."
          >
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Batch</span>
              <span>Window</span>
              <span>Total</span>
              <span>State</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredBatches.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow="No matches"
                    title="No payout batches match this state"
                    description="Reset the filter to return to the full payout register."
                    action={
                      <ActionLink href="/payouts" variant="primary">
                        Reset filters
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredBatches.map((batch) => (
                <Link
                  key={batch.slug}
                  href={buildHref({ state, batch: batch.slug })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_120px_auto] md:items-center ${
                    batch.slug === selectedBatch?.slug
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">{batch.name}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {batch.partners} partners
                    </p>
                  </div>
                  <div className="text-sm text-ink-muted">{batch.window}</div>
                  <div className="text-sm font-semibold text-ink">{batch.total}</div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={batchTone(batch.state)}>{batch.state}</StatusBadge>
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
            description={selectedBatch.note}
            status={<StatusBadge tone={batchTone(selectedBatch.state)}>{selectedBatch.state}</StatusBadge>}
          >
            <SectionCard
              title="Batch summary"
              description="Keep the payout scope explicit before any action shell is used."
              items={[
                `Window: ${selectedBatch.window}.`,
                `Partner count: ${selectedBatch.partners}.`,
                `Commission entries: ${selectedBatch.entries}.`,
                `Total scheduled value: ${selectedBatch.total}.`,
                `Export status: ${selectedBatch.exportStatus}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Action shell
              </p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                <InlineActionRow
                  title="Export batch"
                  description="Export is the handoff shell for finance operations. It should never imply the remittance is complete."
                  badge={<StatusBadge tone="primary">{selectedBatch.exportStatus}</StatusBadge>}
                  actions={
                    <ActionLink href="/commissions" variant="primary">
                      Export shell
                    </ActionLink>
                  }
                />
                <InlineActionRow
                  title="Mark as paid"
                  description="Payment confirmation remains a separate operator action after finance confirms remittance."
                  badge={
                    <StatusBadge tone={paidStatusTone(selectedBatch.state)}>
                      {selectedBatch.paidStatus}
                    </StatusBadge>
                  }
                  actions={<ActionLink href="/dashboard">Mark paid shell</ActionLink>}
                />
              </div>
            </SurfaceCard>

            <SectionCard
              title="Operational boundary"
              description="Keep the mocked UI conservative and review-oriented."
              items={[
                "Draft review should happen before export is offered to finance.",
                "Export completion should not silently flip a batch to paid.",
                "Paid status should remain visible for reconciliation and audit history.",
              ]}
            />
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Batch inspector"
            title="No batch selected"
            description="Reset the filters to inspect a payout batch."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="No payout batch is visible in this view"
              description="The inspector will show draft, export, and paid-state separation once a batch matches the current filters."
              action={
                <ActionLink href="/payouts" variant="primary">
                  Reset filters
                </ActionLink>
              }
            />
          </DetailPanel>
        )}
      </div>
    </PageContainer>
  );
}
