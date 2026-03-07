import Link from "next/link";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  CodeBlockPanel,
  DetailList,
  DetailPanel,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InfoPanel,
  InsetPanel,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  StatusTimeline,
  SurfaceCard,
  type StatusTone,
} from "@/components/admin-ui";
import {
  formatOperationalTimestamp,
  listWorkspaceNormalizedEvents,
  type EventOperationalState,
} from "@/lib/services/apple-read-model";

type EventsPageProps = {
  searchParams: Promise<{
    state?: string;
    event?: string;
  }>;
};

const VALID_STATES = new Set<EventOperationalState>([
  "attributed",
  "unattributed",
  "ignored",
  "failed",
]);

function stateTone(state: EventOperationalState): StatusTone {
  if (state === "attributed") {
    return "success";
  }

  if (state === "failed") {
    return "danger";
  }

  if (state === "ignored") {
    return "primary";
  }

  return "warning";
}

function stateLabel(state: EventOperationalState) {
  if (state === "attributed") {
    return "Matched";
  }

  if (state === "unattributed") {
    return "Needs review";
  }

  if (state === "failed") {
    return "Blocked";
  }

  return "Ignored";
}

function stateMeaning(state: EventOperationalState) {
  if (state === "attributed") {
    return "Ownership data is present, so this result can keep moving toward commission review.";
  }

  if (state === "unattributed") {
    return "Ownership is incomplete, so this result needs manual review before earnings can be trusted.";
  }

  if (state === "failed") {
    return "Normalization or intake blocked a clean result state. Review app health before relying on this record.";
  }

  return "This result was intentionally excluded from earning logic but stays visible for audit.";
}

function buildHref(params: { state: string; event?: string }) {
  const search = new URLSearchParams();

  if (params.state && params.state !== "all") {
    search.set("state", params.state);
  }

  if (params.event) {
    search.set("event", params.event);
  }

  const query = search.toString();
  return query ? `/events?${query}` : "/events";
}

function nextActionHref(eventState: EventOperationalState, appSlug: string | null) {
  if (eventState === "unattributed") {
    return "/unattributed";
  }

  if (appSlug) {
    return `/apps/${appSlug}/apple-health`;
  }

  return "/settings/rules";
}

function nextActionLabel(eventState: EventOperationalState) {
  if (eventState === "unattributed") {
    return "Review record";
  }

  return "Check app health";
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

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { state: rawState = "all", event: selectedEventId } = await searchParams;
  const state = VALID_STATES.has(rawState as EventOperationalState)
    ? (rawState as EventOperationalState)
    : "all";
  const eventData = await listWorkspaceNormalizedEvents();
  const filteredEvents = eventData.events.filter(
    (event) => state === "all" || event.state === state,
  );
  const selectedEvent =
    filteredEvents.find((event) => event.id === selectedEventId) ??
    filteredEvents[0] ??
    null;
  const valueVisibleCount = eventData.events.filter((event) => event.amountMinor !== null).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Attribution"
        title="Review activity that affects earnings"
        description="Review the results stream, see why a record needs attention, and move trusted activity toward earnings safely."
        actions={
          <>
            <ActionLink href="/unattributed">Open review queue</ActionLink>
            <ActionLink href="/apps/demo-app/apple-health" variant="primary">
              Open app health
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="warning">Needs review visible</StatusBadge>
          <StatusBadge tone="primary">Reason-first inspection</StatusBadge>
          <StatusBadge>Advanced payloads stay collapsed</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Needs review"
          value={String(eventData.stats.unattributed)}
          detail="These results still need ownership review before earnings can be trusted."
          tone="warning"
          size="compact"
        />
        <StatCard
          label="Matched"
          value={String(eventData.stats.attributed)}
          detail="These results already carry usable ownership context."
          tone="success"
          size="compact"
        />
        <StatCard
          label="Blocked"
          value={String(eventData.stats.failed)}
          detail="These rows need app-health or normalization follow-up before they are reliable."
          tone="danger"
          size="compact"
        />
        <StatCard
          label="Value visible"
          value={String(valueVisibleCount)}
          detail="These results currently expose customer value or subscription value in the safe browser view."
          tone="primary"
          size="compact"
        />
      </div>

      <SurfaceCard density="compact">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoPanel
            title="What needs attention"
            description={`${eventData.stats.unattributed} results still need ownership review and ${eventData.stats.failed} are blocked by normalization or intake issues.`}
          />
          <InfoPanel
            title="Why this matters"
            description="The result stream should explain whether activity can move toward earnings, not just store event rows."
          />
          <InfoPanel
            title="Trust boundary"
            description="The browser shows safe operational metadata only. Raw signed payload detail stays hidden behind advanced disclosure."
          />
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.28fr)_minmax(340px,0.72fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Review command bar"
            description="Filter the results stream by current state and keep the selected record open while you review."
          >
            <FilterChipLink
              href={buildHref({ state: "all", event: selectedEvent?.id })}
              active={state === "all"}
            >
              All records
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "unattributed", event: selectedEvent?.id })}
              active={state === "unattributed"}
            >
              Needs review
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "attributed", event: selectedEvent?.id })}
              active={state === "attributed"}
            >
              Matched
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "ignored", event: selectedEvent?.id })}
              active={state === "ignored"}
            >
              Ignored
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "failed", event: selectedEvent?.id })}
              active={state === "failed"}
            >
              Blocked
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Review queue"
            title="Results stream"
            description="Lead with state, value, and next action so operators can understand the record before opening the inspector."
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
                    eyebrow={eventData.hasWorkspaceAccess ? "Queue clear" : "Access required"}
                    title={
                      eventData.hasWorkspaceAccess
                        ? "No records need attention right now"
                        : "Sign in to review activity"
                    }
                    description={
                      eventData.hasWorkspaceAccess
                        ? "New creator-driven conversions and edge cases will appear here when review is needed."
                        : "The activity review stream becomes available after the current user has an active organization membership."
                    }
                    action={
                      eventData.hasWorkspaceAccess ? (
                        <ActionLink href="/events" variant="primary">
                          Reset filters
                        </ActionLink>
                      ) : null
                    }
                  />
                </div>
              ) : null}

              {filteredEvents.map((event) => (
                <Link
                  key={event.id}
                  href={buildHref({ state, event: event.id })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[110px_minmax(0,1.45fr)_minmax(0,0.9fr)_120px_150px_110px] md:items-center ${
                    event.id === selectedEvent?.id ? "bg-primary-soft/40" : "hover:bg-surface"
                  }`}
                >
                  <div className="flex justify-start">
                    <StatusBadge tone={stateTone(event.state)}>{stateLabel(event.state)}</StatusBadge>
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      {event.eventType.replaceAll("_", " ")}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {event.reasonCode ?? `${event.sourceType} • ${event.environment}`}
                    </p>
                  </div>
                  <div className="text-sm text-ink-muted">{event.appName}</div>
                  <div className="text-sm font-semibold text-ink">
                    {formatMoney(event.amountMinor, event.currency)}
                  </div>
                  <div className="text-sm text-ink-muted">
                    {formatOperationalTimestamp(event.receivedAt ?? event.occurredAt)}
                  </div>
                  <div className="text-sm font-semibold text-primary">
                    {nextActionLabel(event.state)}
                  </div>
                </Link>
              ))}
            </div>
          </ListTable>
        </div>

        {selectedEvent ? (
          <DetailPanel
            eyebrow="Record detail"
            title={selectedEvent.eventType.replaceAll("_", " ")}
            description={stateMeaning(selectedEvent.state)}
            status={
              <StatusBadge tone={stateTone(selectedEvent.state)}>
                {stateLabel(selectedEvent.state)}
              </StatusBadge>
            }
          >
            <InsetPanel tone={selectedEvent.state === "failed" ? "danger" : stateTone(selectedEvent.state)}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                    Why this record matters
                  </p>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {selectedEvent.reasonCode
                      ? `${selectedEvent.reasonCode} is attached to this record. ${stateMeaning(selectedEvent.state)}`
                      : stateMeaning(selectedEvent.state)}
                  </p>
                </div>
                <ActionLink
                  href={nextActionHref(selectedEvent.state, selectedEvent.appSlug)}
                  variant="primary"
                >
                  {nextActionLabel(selectedEvent.state)}
                </ActionLink>
              </div>
            </InsetPanel>

            <SectionCard
              title="Result summary"
              description="Keep the practical context visible before drilling into advanced metadata."
            >
              <DetailList
                items={[
                  { label: "State", value: stateLabel(selectedEvent.state) },
                  { label: "App", value: selectedEvent.appName },
                  { label: "Source", value: selectedEvent.sourceType },
                  { label: "Value", value: formatMoney(selectedEvent.amountMinor, selectedEvent.currency) },
                  { label: "Environment", value: selectedEvent.environment },
                  { label: "Attribution", value: selectedEvent.attributionStatus },
                ]}
              />
            </SectionCard>

            <SectionCard
              title="State history"
              description="Show how the record moved into its current review state without exposing raw payload material."
            >
              <StatusTimeline
                steps={[
                  {
                    label: "Conversion captured",
                    detail: "The source result was recorded and stored for normalization.",
                    meta: formatOperationalTimestamp(selectedEvent.occurredAt),
                    status: "complete",
                  },
                  {
                    label: "Added to review stream",
                    detail: "The safe browser view received enough metadata to show this record in the workspace.",
                    meta: formatOperationalTimestamp(
                      selectedEvent.receivedAt ?? selectedEvent.occurredAt,
                    ),
                    status: "complete",
                  },
                  {
                    label: stateLabel(selectedEvent.state),
                    detail: stateMeaning(selectedEvent.state),
                    meta: selectedEvent.eventStatus,
                    status: "current",
                  },
                ]}
              />
            </SectionCard>

            <SectionCard
              title="Advanced record detail"
              description="Use this only when support or engineering needs the safe technical summary."
            >
              <details className="rounded-[var(--radius-soft)] border border-border bg-surface">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-ink">
                  Show advanced record detail
                </summary>
                <div className="grid gap-4 border-t border-border px-4 py-4 xl:grid-cols-2">
                  <CodeBlockPanel
                    title="Operational metadata summary"
                    code={JSON.stringify(selectedEvent.payloadSummary, null, 2)}
                  />
                  <CodeBlockPanel
                    title="Receipt reference"
                    code={JSON.stringify(
                      {
                        receiptId: selectedEvent.appleNotificationReceiptId,
                        sourceEventKey: selectedEvent.sourceEventKey,
                        transactionId: selectedEvent.transactionId,
                        originalTransactionId: selectedEvent.originalTransactionId,
                        webOrderLineItemId: selectedEvent.webOrderLineItemId,
                        productId: selectedEvent.productId,
                        offerIdentifier: selectedEvent.offerIdentifier,
                        reasonCode: selectedEvent.reasonCode,
                        currency: selectedEvent.currency,
                        amountMinor: selectedEvent.amountMinor,
                      },
                      null,
                      2,
                    )}
                  />
                </div>
              </details>
            </SectionCard>
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Record detail"
            title="No record selected"
            description="Select a record from the results stream to review why it matters and what should happen next."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="Nothing matches the current review view"
              description="The detail panel shows reason-first inspection once a record matches the current filters."
              action={
                <ActionLink href="/events" variant="primary">
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
