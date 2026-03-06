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

type CommissionState = "pending" | "approved" | "held";

type CommissionsPageProps = {
  searchParams: Promise<{
    state?: string;
    entry?: string;
  }>;
};

const commissions = [
  {
    slug: "com-001",
    partner: "Northstar Fitness",
    app: "Northstar Coach",
    code: "NORTHSTAR20",
    period: "Mar 1 - Mar 15",
    grossRevenue: "$480.00",
    rate: "20%",
    commission: "$96.00",
    state: "approved" as CommissionState,
    note: "Gross subscription revenue less refunds already normalized before commission math.",
  },
  {
    slug: "com-002",
    partner: "Motion Daily",
    app: "Motion Daily",
    code: "MOTIONIOS",
    period: "Mar 1 - Mar 15",
    grossRevenue: "$210.00",
    rate: "15%",
    commission: "$31.50",
    state: "pending" as CommissionState,
    note: "Pending until the duplicate active code lane is reviewed.",
  },
  {
    slug: "com-003",
    partner: "Studio Meridian",
    app: "Meridian Studio",
    code: "MERIDIANFIT",
    period: "Feb 16 - Feb 29",
    grossRevenue: "$125.00",
    rate: "18%",
    commission: "$22.50",
    state: "held" as CommissionState,
    note: "Held because evergreen promo resumed after the current payout cutoff.",
  },
];

function commissionTone(state: CommissionState): StatusTone {
  if (state === "approved") {
    return "success";
  }
  if (state === "held") {
    return "danger";
  }
  return "warning";
}

function buildHref(params: { state: string; entry?: string }) {
  const search = new URLSearchParams();
  if (params.state && params.state !== "all") {
    search.set("state", params.state);
  }
  if (params.entry) {
    search.set("entry", params.entry);
  }
  const query = search.toString();
  return query ? `/commissions?${query}` : "/commissions";
}

export default async function CommissionsPage({
  searchParams,
}: CommissionsPageProps) {
  const { state = "all", entry: selectedEntrySlug } = await searchParams;
  const filteredEntries = commissions.filter(
    (entry) => state === "all" || entry.state === state,
  );
  const selectedEntry =
    filteredEntries.find((entry) => entry.slug === selectedEntrySlug) ??
    filteredEntries[0] ??
    null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Commissions"
        description="Review commission entries like a finance ledger: source amounts, calculation basis, approval state, and why an amount is safe or not yet safe for payout."
        actions={
          <>
            <ActionLink href="/partners">Open partners</ActionLink>
            <ActionLink href="/payouts" variant="primary">
              Open payouts
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Ledger-first review</StatusBadge>
          <StatusBadge tone="warning">Approval states explicit</StatusBadge>
          <StatusBadge>Marketing analytics intentionally absent</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Approved ledger"
          value="$96.00"
          detail="Approved amounts are the safest values to carry toward payout preparation."
          tone="success"
        />
        <StatCard
          label="Pending review"
          value="$31.50"
          detail="Pending amounts need operational confirmation before they move into payout batches."
          tone="warning"
        />
        <StatCard
          label="Held"
          value="$22.50"
          detail="Held commissions remain visible with finance-safe explanations rather than disappearing from review."
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Review the ledger by approval posture without leaving the list-and-detail flow."
          >
            <FilterChipLink
              href={buildHref({ state: "all", entry: selectedEntry?.slug })}
              active={state === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "approved", entry: selectedEntry?.slug })}
              active={state === "approved"}
            >
              Approved
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "pending", entry: selectedEntry?.slug })}
              active={state === "pending"}
            >
              Pending
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "held", entry: selectedEntry?.slug })}
              active={state === "held"}
            >
              Held
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Ledger"
            title="Commission register"
            description="Keep the math explainable and approval states explicit. This is a finance review surface, not a marketing dashboard."
          >
            <div className="hidden grid-cols-[minmax(0,1.2fr)_120px_120px_120px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Partner / code</span>
              <span>Gross</span>
              <span>Rate</span>
              <span>Commission</span>
              <span>State</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredEntries.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow="No matches"
                    title="No commissions match this approval state"
                    description="Reset the filter to review the full commission register."
                    action={
                      <ActionLink href="/commissions" variant="primary">
                        Reset filters
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredEntries.map((entry) => (
                <Link
                  key={entry.slug}
                  href={buildHref({ state, entry: entry.slug })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_120px_120px_120px_auto] md:items-center ${
                    entry.slug === selectedEntry?.slug
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">{entry.partner}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {entry.app} / {entry.code}
                    </p>
                  </div>
                  <div className="text-sm text-ink-muted">{entry.grossRevenue}</div>
                  <div className="text-sm text-ink-muted">{entry.rate}</div>
                  <div className="text-sm font-semibold text-ink">{entry.commission}</div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={commissionTone(entry.state)}>
                      {entry.state}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </ListTable>
        </div>

        {selectedEntry ? (
          <DetailPanel
            eyebrow="Ledger inspector"
            title={`${selectedEntry.partner} commission`}
            description={selectedEntry.note}
            status={<StatusBadge tone={commissionTone(selectedEntry.state)}>{selectedEntry.state}</StatusBadge>}
          >
            <SectionCard
              title="Ledger math"
              description="Keep the calculation visible in the same language finance operators would expect."
              items={[
                `Ledger period: ${selectedEntry.period}.`,
                `Gross attributable revenue: ${selectedEntry.grossRevenue}.`,
                `Commission rate: ${selectedEntry.rate}.`,
                `Commission amount: ${selectedEntry.commission}.`,
                `Partner code lane: ${selectedEntry.code}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Finance-safe explanation
              </p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                <InlineActionRow
                  title="Revenue base and rate stay visible"
                  description="This ledger view shows the input amount and rate used for the calculation so operators can defend the math without reading backend code."
                />
                <InlineActionRow
                  title="Approval remains separate from payout"
                  description="An approved commission is safer for payout drafting, but the ledger does not imply money has moved until a payout batch is explicitly reviewed."
                  badge={
                    <StatusBadge tone={commissionTone(selectedEntry.state)}>
                      {selectedEntry.state}
                    </StatusBadge>
                  }
                />
              </div>
            </SurfaceCard>

            <SectionCard
              title="Next operator actions"
              description="Keep the transition from ledger review to payout prep disciplined."
              actions={
                <>
                  <ActionLink href="/events">Review events</ActionLink>
                  <ActionLink href="/payouts" variant="primary">
                    Open payouts
                  </ActionLink>
                </>
              }
              items={[
                "Confirm the commission state before exporting anything downstream.",
                "Use holds to preserve finance trust when the attribution lane is still unclear.",
                "Carry approved amounts into payout drafting only after review is complete.",
              ]}
            />
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Ledger inspector"
            title="No commission selected"
            description="Reset the filters to inspect a commission entry."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="No ledger entry is visible in this view"
              description="The inspector will show finance-safe math and approval context once a commission matches the current filters."
              action={
                <ActionLink href="/commissions" variant="primary">
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
