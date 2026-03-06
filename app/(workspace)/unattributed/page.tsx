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

type QueueState = "new" | "reviewing" | "escalated";

type UnattributedPageProps = {
  searchParams: Promise<{
    reason?: string;
    item?: string;
  }>;
};

const queueItems = [
  {
    slug: "ua-001",
    event: "Promo redirect without owner",
    app: "Northstar Coach",
    reason: "missing_owner",
    queueState: "new" as QueueState,
    impact: "Install candidate",
    suggestedPartner: "Northstar Fitness",
    suggestedCode: "NORTHSTAR20",
    confidence: "82%",
    whyFlagged: "Redirect path normalized, but the active owner mapping is missing.",
    reasonLabel: "Missing owner mapping",
    reasonDetail: "The code path resolved, but there is no current partner owner mapped to the normalized code lane.",
  },
  {
    slug: "ua-002",
    event: "Apple Health trial event",
    app: "Motion Daily",
    reason: "duplicate_active_code",
    queueState: "reviewing" as QueueState,
    impact: "Trial started",
    suggestedPartner: "Motion Daily",
    suggestedCode: "MOTIONIOS",
    confidence: "64%",
    whyFlagged: "Two active Motion Daily pilot codes could both explain this event.",
    reasonLabel: "Duplicate active code",
    reasonDetail: "Two active codes overlap in the same app and partner lane, so automatic ownership would be unsafe.",
  },
  {
    slug: "ua-003",
    event: "Legacy receipt import",
    app: "Atlas Run",
    reason: "archived_program",
    queueState: "escalated" as QueueState,
    impact: "Historical purchase",
    suggestedPartner: "Atlas Run Club",
    suggestedCode: "ATLASRUN",
    confidence: "71%",
    whyFlagged: "Program is archived, so the match needs operator confirmation before backfill.",
    reasonLabel: "Archived program coverage",
    reasonDetail: "The likely owner is historical, which means this record needs an explicit confirmation path before it is trusted.",
  },
];

function queueTone(state: QueueState): StatusTone {
  if (state === "reviewing") {
    return "primary";
  }
  if (state === "escalated") {
    return "danger";
  }
  return "warning";
}

function buildHref(params: { reason: string; item?: string }) {
  const search = new URLSearchParams();
  if (params.reason && params.reason !== "all") {
    search.set("reason", params.reason);
  }
  if (params.item) {
    search.set("item", params.item);
  }
  const query = search.toString();
  return query ? `/unattributed?${query}` : "/unattributed";
}

export default async function UnattributedPage({
  searchParams,
}: UnattributedPageProps) {
  const { reason = "all", item: selectedItemSlug } = await searchParams;

  const filteredItems = queueItems.filter(
    (item) => reason === "all" || item.reason === reason,
  );
  const selectedItem =
    filteredItems.find((item) => item.slug === selectedItemSlug) ??
    filteredItems[0] ??
    null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Needs attribution"
        description="Treat the unattributed queue like a first-class operational surface: what needs review, why it failed automatic ownership, and what the system thinks the best next match might be."
        actions={
          <>
            <ActionLink href="/events">Open events</ActionLink>
            <ActionLink href="/codes" variant="primary">
              Review codes
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="warning">Reason codes drive review</StatusBadge>
          <StatusBadge tone="primary">Suggested matches visible</StatusBadge>
          <StatusBadge>Bulk actions stay conservative</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Queue size"
          value={String(queueItems.length)}
          detail="Keep unresolved operational work visible before it spills into finance review."
          tone="warning"
        />
        <StatCard
          label="Escalated"
          value={String(queueItems.filter((item) => item.queueState === "escalated").length)}
          detail="Escalations need human confirmation before the record can be trusted."
          tone="danger"
        />
        <StatCard
          label="Suggested match"
          value="Visible"
          detail="Each queue item should make it clear what the system thinks is most likely."
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Review the queue by reason code so operators can stay disciplined about why an item is unresolved."
          >
            <FilterChipLink
              href={buildHref({ reason: "all", item: selectedItem?.slug })}
              active={reason === "all"}
            >
              All reasons
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ reason: "missing_owner", item: selectedItem?.slug })}
              active={reason === "missing_owner"}
            >
              Missing owner
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                reason: "duplicate_active_code",
                item: selectedItem?.slug,
              })}
              active={reason === "duplicate_active_code"}
            >
              Duplicate active code
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ reason: "archived_program", item: selectedItem?.slug })}
              active={reason === "archived_program"}
            >
              Archived program
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Queue"
            title="Reason-coded attribution review"
            description="Use reason codes and suggested matches to keep this queue operational instead of vague."
          >
            <div className="hidden grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Event</span>
              <span>Reason</span>
              <span>Suggested match</span>
              <span>Queue state</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredItems.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow="No matches"
                    title="No queue items match this reason code"
                    description="Reset the reason filter to return to the full unattributed queue."
                    action={
                      <ActionLink href="/unattributed" variant="primary">
                        Reset filters
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredItems.map((item) => (
                <Link
                  key={item.slug}
                  href={buildHref({ reason, item: item.slug })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center ${
                    item.slug === selectedItem?.slug
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">{item.event}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{item.app}</p>
                  </div>
                  <div className="text-sm text-ink-muted">{item.reason}</div>
                  <div className="text-sm text-ink-muted">
                    {item.suggestedPartner} / {item.suggestedCode}
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={queueTone(item.queueState)}>
                      {item.queueState}
                    </StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </ListTable>
        </div>

        {selectedItem ? (
          <DetailPanel
            eyebrow="Suggested match inspector"
            title={selectedItem.event}
            description={selectedItem.whyFlagged}
            status={<StatusBadge tone={queueTone(selectedItem.queueState)}>{selectedItem.queueState}</StatusBadge>}
          >
            <SectionCard
              title="Queue summary"
              description="Keep the operator context practical and review-safe."
              items={[
                `App: ${selectedItem.app}.`,
                `Reason code: ${selectedItem.reason}.`,
                `Impact: ${selectedItem.impact}.`,
                `Suggested confidence: ${selectedItem.confidence}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Reason code
              </p>
              <div className="mt-4 rounded-[22px] border border-border bg-surface-elevated p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-semibold text-ink">
                    {selectedItem.reasonLabel}
                  </p>
                  <StatusBadge tone={queueTone(selectedItem.queueState)}>
                    {selectedItem.reason}
                  </StatusBadge>
                </div>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  {selectedItem.reasonDetail}
                </p>
              </div>
            </SurfaceCard>

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Suggested match
              </p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                <InlineActionRow
                  title={`Partner: ${selectedItem.suggestedPartner}`}
                  description="The system suggests this partner based on the surviving app, route, and program signals."
                  badge={<StatusBadge tone="primary">{selectedItem.confidence}</StatusBadge>}
                />
                <InlineActionRow
                  title={`Code: ${selectedItem.suggestedCode}`}
                  description="Keep the proposed owner lane visible before any human review changes attribution state."
                  actions={
                    <ActionLink href="/codes" variant="primary">
                      Review code ownership
                    </ActionLink>
                  }
                />
              </div>
            </SurfaceCard>

            <SectionCard
              title="Conservative next actions"
              description="Bulk resolution should stay conservative until real attribution logic exists."
              actions={
                <>
                  <ActionLink href="/codes">Review codes</ActionLink>
                  <ActionLink href="/partners" variant="primary">
                    Review partner
                  </ActionLink>
                </>
              }
              items={[
                "Review the suggested match before changing ownership assumptions.",
                "Prefer analyst confirmation over automatic queue resolution.",
                "Keep escalated items visible to finance and operations leaders.",
              ]}
            />
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Suggested match inspector"
            title="No queue item selected"
            description="Reset the filters to inspect a queued attribution issue."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="No unattributed records are visible in this view"
              description="The inspector will show reason codes and suggested matches once a queue item matches the current filters."
              action={
                <ActionLink href="/unattributed" variant="primary">
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
