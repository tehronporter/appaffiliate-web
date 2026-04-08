import Link from "next/link";
import { Activity, AlertTriangle } from "lucide-react";

import {
  applyManualAttributionAction,
  markUnattributedReviewAction,
} from "@/app/(workspace)/unattributed/actions";
import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InsetPanel,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  StatusBadge,
  SummaryBar,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import { listUnattributedItems } from "@/lib/services/attribution";
import {
  formatOperationalTimestamp,
  listWorkspaceNormalizedEvents,
  type EventOperationalState,
} from "@/lib/services/apple-read-model";
import {
  toneForEventState,
  toneForUnattributedQueueStatus,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type ReviewPageProps = {
  searchParams: Promise<{
    view?: string;
    event?: string;
    item?: string;
    notice?: string;
  }>;
};

const VIEWS = ["all", "needs-review", "approved", "rejected", "blocked"] as const;
type ReviewView = (typeof VIEWS)[number];

function buildHref(params: { view: ReviewView; event?: string; item?: string }) {
  const search = new URLSearchParams();
  search.set("view", params.view);

  if (params.event) {
    search.set("event", params.event);
  }

  if (params.item) {
    search.set("item", params.item);
  }

  return `/review?${search.toString()}`;
}

function reviewViewLabel(view: ReviewView) {
  if (view === "needs-review") {
    return "Needs review";
  }

  if (view === "approved") {
    return "Approved";
  }

  if (view === "rejected") {
    return "Rejected";
  }

  if (view === "blocked") {
    return "Blocked";
  }

  return "All results";
}

function queueTone(status: "open" | "in_review" | "resolved" | "ignored"): StatusTone {
  return toneForUnattributedQueueStatus(status);
}

function queueLabel(status: "open" | "in_review" | "resolved" | "ignored") {
  if (status === "open") {
    return "Needs decision";
  }

  if (status === "in_review") {
    return "Held";
  }

  if (status === "resolved") {
    return "Resolved";
  }

  return "Ignored";
}

function eventLabel(state: EventOperationalState) {
  if (state === "attributed") {
    return "Approved";
  }

  if (state === "unattributed") {
    return "Needs review";
  }

  if (state === "ignored") {
    return "Rejected";
  }

  return "Blocked";
}

function eventFilter(view: ReviewView, state: EventOperationalState) {
  if (view === "all") {
    return true;
  }

  if (view === "approved") {
    return state === "attributed";
  }

  if (view === "rejected") {
    return state === "ignored";
  }

  if (view === "blocked") {
    return state === "failed";
  }

  return false;
}

function noticeCopy(notice: string | undefined) {
  if (notice === "queue-reviewed") {
    return {
      tone: "green" as const,
      title: "Review state updated",
      detail: "The item now reflects active operator follow-up.",
    };
  }

  if (notice === "queue-resolved") {
    return {
      tone: "green" as const,
      title: "Attribution approved",
      detail: "The selected result now carries an explicit owner decision.",
    };
  }

  if (notice === "queue-error") {
    return {
      tone: "red" as const,
      title: "Review action failed",
      detail: "Check the selected creator and code combination, then try again.",
    };
  }

  return null;
}

function formatMoney(valueMinor: number | null, currency: string | null) {
  if (valueMinor === null || currency === null) {
    return "No value";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(valueMinor / 100);
  } catch {
    return `${(valueMinor / 100).toFixed(2)} ${currency}`;
  }
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const {
    view: rawView = "all",
    event: selectedEventId,
    item: selectedItemId,
    notice,
  } = await searchParams;
  const view = VIEWS.includes(rawView as ReviewView) ? (rawView as ReviewView) : "all";
  const [eventsData, unattributedData] = await Promise.all([
    listWorkspaceNormalizedEvents(),
    listUnattributedItems(),
  ]);
  const banner = noticeCopy(notice);
  const filteredEvents = eventsData.events.filter((event) => eventFilter(view, event.state));
  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ?? null;
  const selectedItem =
    unattributedData.items.find((item) => item.eventId === selectedItemId) ?? null;
  const suggestionCount = unattributedData.items.filter(
    (item) => item.suggestedCodeId || item.suggestedPartnerId,
  ).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Review"
        description="Use one surface for tracked results, attribution decisions, and operator follow-up."
        actions={
          <>
            <ActionLink href="/codes">Open codes</ActionLink>
            <ActionLink href="/earnings" variant="primary">
              Open earnings
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Unified review</StatusBadge>
          {unattributedData.stats.unresolved > 0 ? (
            <StatusBadge tone="amber">Needs review</StatusBadge>
          ) : null}
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <section className="aa-stat-grid">
        <MetricChip
          label="All results"
          value={String(eventsData.events.length)}
          detail="Tracked activity"
          tone="blue"
        />
        <MetricChip
          label="Needs review"
          value={String(unattributedData.stats.unresolved)}
          detail="Manual ownership decisions"
          tone={unattributedData.stats.unresolved > 0 ? "amber" : "green"}
        />
        <MetricChip
          label="Approved"
          value={String(eventsData.stats.attributed)}
          detail="Matched and moving forward"
          tone="green"
        />
        <MetricChip
          label="Blocked"
          value={String(eventsData.stats.failed)}
          detail="Normalization or ingest issue"
          tone={eventsData.stats.failed > 0 ? "red" : "green"}
        />
      </section>

      <SummaryBar
        items={[
          {
            label: "Queue",
            value:
              unattributedData.stats.unresolved > 0
                ? `${unattributedData.stats.unresolved} decisions open`
                : "Queue calm",
          },
          {
            label: "Suggestions",
            value: suggestionCount > 0 ? `${suggestionCount} safe suggestions visible` : "No safe suggestions",
          },
          {
            label: "View",
            value: reviewViewLabel(view),
          },
        ]}
      />

      <FilterBar title="Views">
        <FilterChipLink href={buildHref({ view: "all" })} active={view === "all"}>
          All results
        </FilterChipLink>
        <FilterChipLink
          href={buildHref({ view: "needs-review" })}
          active={view === "needs-review"}
        >
          Needs review
        </FilterChipLink>
        <FilterChipLink href={buildHref({ view: "approved" })} active={view === "approved"}>
          Approved
        </FilterChipLink>
        <FilterChipLink href={buildHref({ view: "rejected" })} active={view === "rejected"}>
          Rejected
        </FilterChipLink>
        <FilterChipLink href={buildHref({ view: "blocked" })} active={view === "blocked"}>
          Blocked
        </FilterChipLink>
      </FilterBar>

      {view === "needs-review" ? (
        <ListTable
          eyebrow="Queue"
          title="Needs review"
          description="Manual attribution decisions live here, but the rest of the result history stays in the same route."
        >
          <div className="hidden grid-cols-[120px_minmax(0,1.35fr)_minmax(0,0.95fr)_130px_150px_110px] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
            <span>State</span>
            <span>Why it is here</span>
            <span>Suggested owner</span>
            <span>Confidence</span>
            <span>Time</span>
            <span>Action</span>
          </div>

          <div className="divide-y divide-border bg-surface-elevated">
            {unattributedData.items.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={AlertTriangle}
                  eyebrow={unattributedData.hasWorkspaceAccess ? "Review queue" : "Access required"}
                  title={
                    unattributedData.hasWorkspaceAccess
                      ? "No results need review"
                      : "Sign in to review attribution decisions"
                  }
                  description={
                    unattributedData.hasWorkspaceAccess
                      ? "Matched and blocked history is still available from the other review tabs."
                      : "An internal workspace membership is required before the review queue can be accessed."
                  }
                />
              </div>
            ) : null}

            {unattributedData.items.map((item) => (
              <Link
                key={item.eventId}
                href={buildHref({ view, item: item.eventId })}
                className={`grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[120px_minmax(0,1.35fr)_minmax(0,0.95fr)_130px_150px_110px] md:items-center md:gap-4 md:px-5 md:py-3 ${
                  item.eventId === selectedItem?.eventId ? "bg-primary-soft/35" : ""
                }`}
              >
                <div className="flex justify-start">
                  <span className="aa-mobile-label mr-2 md:hidden">State</span>
                  <StatusBadge tone={queueTone(item.queueStatus)}>
                    {queueLabel(item.queueStatus)}
                  </StatusBadge>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Why it is here</span>
                  <h3 className="text-[15px] font-semibold text-ink">{item.reasonLabel}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {item.eventType} on {item.appName}
                  </p>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Suggested owner</span>
                  <div className="text-sm text-ink-muted">
                    {(item.suggestedPartnerLabel ?? "No creator") +
                      " / " +
                      (item.suggestedCodeLabel ?? "No code")}
                  </div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Confidence</span>
                  <div className="text-sm font-semibold text-ink">{item.confidenceLabel}</div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Time</span>
                  <div className="text-sm text-ink-muted">
                    {formatOperationalTimestamp(item.receivedAt ?? item.occurredAt)}
                  </div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Action</span>
                  <div className="text-sm font-semibold text-primary">Review</div>
                </div>
              </Link>
            ))}
          </div>
        </ListTable>
      ) : (
        <ListTable
          eyebrow="Results"
          title={reviewViewLabel(view)}
          description="All tracked results, with filters instead of separate jargon-heavy pages."
        >
          <div className="hidden grid-cols-[110px_minmax(0,1.45fr)_minmax(0,0.9fr)_120px_150px_110px] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
            <span>State</span>
            <span>Result</span>
            <span>App</span>
            <span>Value</span>
            <span>Time</span>
            <span>Action</span>
          </div>

          <div className="divide-y divide-border bg-surface-elevated">
            {filteredEvents.length === 0 ? (
              <div className="p-5">
                <EmptyState
                  icon={Activity}
                  eyebrow={eventsData.hasWorkspaceAccess ? "Results" : "Access required"}
                  title={
                    eventsData.hasWorkspaceAccess
                      ? "No tracked results match this view"
                      : "Sign in to inspect tracked results"
                  }
                  description={
                    eventsData.hasWorkspaceAccess
                      ? "Switch filters or wait for the next result to arrive."
                      : "The review surface requires an active internal membership."
                  }
                />
              </div>
            ) : null}

            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                href={buildHref({ view, event: event.id })}
                className={`grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[110px_minmax(0,1.45fr)_minmax(0,0.9fr)_120px_150px_110px] md:items-center md:gap-4 md:px-5 md:py-3 ${
                  event.id === selectedEvent?.id ? "bg-primary-soft/35" : ""
                }`}
              >
                <div className="flex justify-start">
                  <span className="aa-mobile-label mr-2 md:hidden">State</span>
                  <StatusBadge tone={toneForEventState(event.state)}>
                    {eventLabel(event.state)}
                  </StatusBadge>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Result</span>
                  <h3 className="text-sm font-semibold text-ink">
                    {event.eventType.replaceAll("_", " ")}
                  </h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {event.reasonCode ?? `${event.sourceType} • ${event.environment}`}
                  </p>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">App</span>
                  <div className="text-sm text-ink-muted">{event.appName}</div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Value</span>
                  <div className="text-sm font-semibold text-ink">
                    {formatMoney(event.amountMinor, event.currency)}
                  </div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Time</span>
                  <div className="text-sm text-ink-muted">
                    {formatOperationalTimestamp(event.receivedAt ?? event.occurredAt)}
                  </div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Action</span>
                  <div className="text-sm font-semibold text-primary">
                    {event.state === "failed" && event.appSlug
                      ? "Open health"
                      : event.state === "failed"
                        ? "Open apps"
                        : "Inspect"}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ListTable>
      )}

      {selectedEvent ? (
        <WorkspaceDrawer
          closeHref={buildHref({ view })}
          eyebrow="Result detail"
          title={selectedEvent.eventType.replaceAll("_", " ")}
          description="The selected result stays readable here while you move between history views."
          status={
            <StatusBadge tone={toneForEventState(selectedEvent.state)}>
              {eventLabel(selectedEvent.state)}
            </StatusBadge>
          }
        >
          <DetailList
            columns={1}
            items={[
              { label: "App", value: selectedEvent.appName },
              { label: "Event status", value: selectedEvent.eventStatus },
              { label: "Attribution status", value: selectedEvent.attributionStatus },
              { label: "Occurred", value: formatOperationalTimestamp(selectedEvent.occurredAt) },
              { label: "Received", value: formatOperationalTimestamp(selectedEvent.receivedAt) },
              { label: "Source", value: selectedEvent.sourceType },
              { label: "Value", value: formatMoney(selectedEvent.amountMinor, selectedEvent.currency) },
              { label: "Reason", value: selectedEvent.reasonCode ?? "No explicit reason code" },
            ]}
          />

          <div className="flex flex-wrap gap-3">
            {selectedEvent.appSlug ? (
              <ActionLink href={`/apps/${selectedEvent.appSlug}/apple-health`}>
                Open app health
              </ActionLink>
            ) : (
              <ActionLink href="/apps">Open apps</ActionLink>
            )}
            <ActionLink href="/review?view=needs-review" variant="primary">
              Open review queue
            </ActionLink>
          </div>
        </WorkspaceDrawer>
      ) : null}

      {selectedItem ? (
        <WorkspaceDrawer
          closeHref={buildHref({ view })}
          eyebrow="Review item"
          title={selectedItem.eventType}
          description="Resolve the owner decision without leaving the unified review surface."
          status={
            <StatusBadge tone={queueTone(selectedItem.queueStatus)}>
              {queueLabel(selectedItem.queueStatus)}
            </StatusBadge>
          }
        >
          <InsetPanel tone={queueTone(selectedItem.queueStatus)}>
            <p className="text-sm font-semibold text-ink">{selectedItem.reasonLabel}</p>
            <p className="mt-2 text-sm leading-5 text-ink-muted">{selectedItem.reasonDetail}</p>
          </InsetPanel>

          <DetailList
            columns={1}
            items={[
              { label: "App", value: selectedItem.appName },
              { label: "Result", value: selectedItem.eventType },
              { label: "Confidence", value: selectedItem.confidenceLabel },
              {
                label: "Suggested match",
                value:
                  `${selectedItem.suggestedPartnerLabel ?? "No creator"} / ${selectedItem.suggestedCodeLabel ?? "No code"}`,
              },
              {
                label: "Signals",
                value: selectedItem.signalValues.join(", ") || "No code-like signal found",
              },
            ]}
          />

          <form action={applyManualAttributionAction} className="space-y-4 rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white p-4">
            <input type="hidden" name="eventId" value={selectedItem.eventId} />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-ink">Creator</span>
              <select
                name="partnerId"
                defaultValue={selectedItem.suggestedPartnerId ?? "none"}
                className="aa-field"
              >
                <option value="none">No creator selected</option>
                {selectedItem.availablePartnerOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium text-ink">Code</span>
              <select
                name="promoCodeId"
                defaultValue={selectedItem.suggestedCodeId ?? "none"}
                className="aa-field"
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
              <span className="text-sm font-medium text-ink">Operator note</span>
              <textarea
                name="note"
                rows={4}
                defaultValue={selectedItem.note ?? ""}
                className="aa-field"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button type="submit" className="aa-button aa-button-primary">
                Approve owner
              </button>
            </div>
          </form>

          <form action={markUnattributedReviewAction} className="space-y-3 rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white p-4">
            <input type="hidden" name="eventId" value={selectedItem.eventId} />
            <label className="grid gap-2">
              <span className="text-sm font-medium text-ink">Hold note</span>
              <textarea name="note" rows={3} className="aa-field" />
            </label>
            <button type="submit" className="aa-button aa-button-secondary">
              Mark in review
            </button>
          </form>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
