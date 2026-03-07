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
import {
  applyManualAttributionAction,
  markUnattributedReviewAction,
} from "@/app/(workspace)/unattributed/actions";
import { listUnattributedItems } from "@/lib/services/attribution";
import { formatOperationalTimestamp } from "@/lib/services/apple-read-model";

type UnattributedPageProps = {
  searchParams: Promise<{
    reason?: string;
    item?: string;
    notice?: string;
  }>;
};

function queueTone(status: "open" | "in_review" | "resolved" | "ignored"): StatusTone {
  if (status === "in_review") {
    return "primary";
  }

  if (status === "resolved") {
    return "success";
  }

  if (status === "ignored") {
    return "danger";
  }

  return "warning";
}

function buildHref(params: { reason: string; item?: string }) {
  const search = new URLSearchParams();

  if (params.reason !== "all") {
    search.set("reason", params.reason);
  }

  if (params.item) {
    search.set("item", params.item);
  }

  const query = search.toString();
  return query ? `/unattributed?${query}` : "/unattributed";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "queue-reviewed") {
    return {
      tone: "success" as const,
      title: "Queue item marked in review",
      detail: "The unattributed item now reflects active operator review.",
    };
  }

  if (notice === "queue-resolved") {
    return {
      tone: "success" as const,
      title: "Manual attribution saved",
      detail: "The selected event was updated with the reviewed attribution decision.",
    };
  }

  if (notice === "queue-error") {
    return {
      tone: "danger" as const,
      title: "Queue action failed",
      detail: "Review the selected partner/code combination and try the action again.",
    };
  }

  return null;
}

export default async function UnattributedPage({
  searchParams,
}: UnattributedPageProps) {
  const {
    reason = "all",
    item: selectedItemId,
    notice,
  } = await searchParams;
  const data = await listUnattributedItems();
  const filteredItems = data.items.filter(
    (item) => reason === "all" || item.reason === reason,
  );
  const selectedItem =
    filteredItems.find((item) => item.eventId === selectedItemId) ??
    filteredItems[0] ??
    null;
  const banner = noticeCopy(notice);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Needs attribution"
        description="Treat unattributed events like a first-class operational queue: show the real event context, the safest candidate match, and the minimum manual actions needed to resolve or review them."
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
          <StatusBadge tone="warning">Reason-coded review</StatusBadge>
          <StatusBadge tone="primary">Candidate matches visible</StatusBadge>
          <StatusBadge>Manual-first attribution</StatusBadge>
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
          label="Queue size"
          value={String(data.stats.queueSize)}
          detail="Keep unresolved operational work visible before it drifts into finance review."
          tone="warning"
        />
        <StatCard
          label="In review"
          value={String(data.stats.inReview)}
          detail="Items already under active operator review stay explicit."
          tone="primary"
        />
        <StatCard
          label="Unresolved"
          value={String(data.stats.unresolved)}
          detail="Manual resolution remains honest until enough context exists to attribute safely."
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Review the unattributed queue by reason code without leaving the list-and-detail flow."
          >
            <FilterChipLink
              href={buildHref({ reason: "all", item: selectedItem?.eventId })}
              active={reason === "all"}
            >
              All reasons
            </FilterChipLink>
            {data.reasonOptions.map((option) => (
              <FilterChipLink
                key={option}
                href={buildHref({ reason: option, item: selectedItem?.eventId })}
                active={reason === option}
              >
                {option.replaceAll("_", " ")}
              </FilterChipLink>
            ))}
          </FilterBar>

          <ListTable
            eyebrow="Queue"
            title="Real unattributed items"
            description="Use the queue to review real unattributed normalized events and the safest candidate match available."
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
                    eyebrow={data.hasWorkspaceAccess ? "Queue clear" : "Access required"}
                    title={
                      data.hasWorkspaceAccess
                        ? "No unattributed items match this view"
                        : "Sign in to review unattributed items"
                    }
                    description={
                      data.hasWorkspaceAccess
                        ? "No current normalized event needs manual attribution review for the selected reason filter."
                        : "An internal workspace membership is required before the unattributed queue can be read."
                    }
                    action={
                      data.hasWorkspaceAccess ? (
                        <ActionLink href="/unattributed" variant="primary">
                          Reset filters
                        </ActionLink>
                      ) : null
                    }
                  />
                </div>
              ) : null}

              {filteredItems.map((item) => (
                <Link
                  key={item.eventId}
                  href={buildHref({ reason, item: item.eventId })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center ${
                    item.eventId === selectedItem?.eventId
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      {item.eventType}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">{item.appName}</p>
                  </div>
                  <div className="text-sm text-ink-muted">{item.reasonLabel}</div>
                  <div className="text-sm text-ink-muted">
                    {item.suggestedPartnerLabel ?? "No partner"} /{" "}
                    {item.suggestedCodeLabel ?? "No code"}
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={queueTone(item.queueStatus)}>
                      {item.queueStatus}
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
            title={selectedItem.eventType}
            description={selectedItem.reasonDetail}
            status={
              <StatusBadge tone={queueTone(selectedItem.queueStatus)}>
                {selectedItem.queueStatus}
              </StatusBadge>
            }
          >
            <SectionCard
              title="Queue summary"
              description="Keep the operator context practical and review-safe."
              items={[
                `App: ${selectedItem.appName}.`,
                `Reason code: ${selectedItem.reason}.`,
                `Received at: ${formatOperationalTimestamp(selectedItem.receivedAt ?? selectedItem.occurredAt)}.`,
                `Confidence: ${selectedItem.confidenceLabel}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Suggested match
              </p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                <InlineActionRow
                  title={`Partner: ${selectedItem.suggestedPartnerLabel ?? "No partner candidate"}`}
                  description="The suggested partner reflects the safest candidate derived from current app/code relationships."
                  badge={<StatusBadge tone="primary">{selectedItem.confidenceLabel}</StatusBadge>}
                />
                <InlineActionRow
                  title={`Code: ${selectedItem.suggestedCodeLabel ?? "No code candidate"}`}
                  description={
                    selectedItem.signalValues.length > 0
                      ? `Observed signals: ${selectedItem.signalValues.join(", ")}`
                      : "No code-like signal survived normalization for this event."
                  }
                />
              </div>
            </SurfaceCard>

            <SectionCard
              title="Review actions"
              description="Keep actions conservative: start review, then resolve only when the selected match is credible."
            >
              <form action={markUnattributedReviewAction} className="space-y-4">
                <input type="hidden" name="eventId" value={selectedItem.eventId} />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Review note</span>
                  <textarea
                    name="note"
                    rows={3}
                    defaultValue={selectedItem.note ?? ""}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
                  />
                </label>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface"
                  >
                    Mark in review
                  </button>
                </div>
              </form>

              <form action={applyManualAttributionAction} className="space-y-4">
                <input type="hidden" name="eventId" value={selectedItem.eventId} />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Code</span>
                  <select
                    name="promoCodeId"
                    defaultValue={selectedItem.suggestedCodeId ?? "none"}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
                  >
                    <option value="none">No code selected</option>
                    {selectedItem.availableCodeOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Partner</span>
                  <select
                    name="partnerId"
                    defaultValue={selectedItem.suggestedPartnerId ?? "none"}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
                  >
                    <option value="none">No partner selected</option>
                    {selectedItem.availablePartnerOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Decision note</span>
                  <textarea
                    name="note"
                    rows={3}
                    defaultValue={selectedItem.note ?? ""}
                    className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
                  />
                </label>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                  >
                    Save manual attribution
                  </button>
                </div>
              </form>
            </SectionCard>
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Suggested match inspector"
            title="No queue item selected"
            description="Reset the filters to inspect an unattributed event."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="No unattributed item is available"
              description="The inspector will show real queue context and manual review actions once an item is available in the current view."
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
