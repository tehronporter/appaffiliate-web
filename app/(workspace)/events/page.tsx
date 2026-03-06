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

  return "/dashboard";
}

function nextActionLabel(eventState: EventOperationalState) {
  if (eventState === "unattributed") {
    return "Open needs attribution";
  }

  return "Review app readiness";
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

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Events"
        description="Review the real event pipeline as a system of record: what normalized successfully, what still needs attribution, and where operators should investigate without exposing raw Apple payloads in the browser."
        actions={
          <>
            <ActionLink href="/unattributed">Needs attribution</ActionLink>
            <ActionLink href="/dashboard" variant="primary">
              Open overview
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Live normalized rows</StatusBadge>
          <StatusBadge tone="warning">Verification placeholder explicit</StatusBadge>
          <StatusBadge>Receipt references retained server-side</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Attributed"
          value={String(eventData.stats.attributed)}
          detail="These events already carry an attributed ownership state."
          tone="success"
        />
        <StatCard
          label="Unattributed"
          value={String(eventData.stats.unattributed)}
          detail="These normalized rows are waiting on later attribution handling."
          tone="warning"
        />
        <StatCard
          label="Ignored"
          value={String(eventData.stats.ignored)}
          detail="Ignored notifications remain visible so exclusions stay auditable."
          tone="primary"
        />
        <StatCard
          label="Failed"
          value={String(eventData.stats.failed)}
          detail="Invalid normalized rows should stay visible before they become silent loss."
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Review the real pipeline by operational state without leaving the list-and-detail flow."
          >
            <FilterChipLink
              href={buildHref({ state: "all", event: selectedEvent?.id })}
              active={state === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "attributed", event: selectedEvent?.id })}
              active={state === "attributed"}
            >
              Attributed
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "unattributed", event: selectedEvent?.id })}
              active={state === "unattributed"}
            >
              Unattributed
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
              Failed
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Event register"
            title="Latest normalized events"
            description="Use the list to review the current event stream produced by real normalization work."
          >
            <div className="hidden grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Event</span>
              <span>App</span>
              <span>Received</span>
              <span>State</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredEvents.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow={eventData.hasWorkspaceAccess ? "No live rows" : "Access required"}
                    title={
                      eventData.hasWorkspaceAccess
                        ? "No normalized events yet"
                        : "Sign in to review events"
                    }
                    description={
                      eventData.hasWorkspaceAccess
                        ? "Apple receipts that cannot be normalized safely yet will remain receipt-only until later hardening. Once a normalized row exists, it will appear here."
                        : "The workspace event register becomes available after the current user has an active organization membership."
                    }
                    action={
                      eventData.hasWorkspaceAccess ? (
                        <ActionLink href="/apps/demo-app/apple-health" variant="primary">
                          Review app readiness
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
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center ${
                    event.id === selectedEvent?.id
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">
                      {event.eventType.replaceAll("_", " ")}
                    </h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {event.reasonCode ?? `${event.sourceType} • ${event.environment}`}
                    </p>
                  </div>
                  <div className="text-sm text-ink-muted">{event.appName}</div>
                  <div className="text-sm text-ink-muted">
                    {formatOperationalTimestamp(event.receivedAt ?? event.occurredAt)}
                  </div>
                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={stateTone(event.state)}>{event.state}</StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </ListTable>
        </div>

        {selectedEvent ? (
          <DetailPanel
            eyebrow="Inspector"
            title={selectedEvent.eventType.replaceAll("_", " ")}
            description={`${selectedEvent.appName} in ${selectedEvent.environment}. Processing is ${selectedEvent.eventStatus} and attribution is ${selectedEvent.attributionStatus}.`}
            status={
              <StatusBadge tone={stateTone(selectedEvent.state)}>
                {selectedEvent.state}
              </StatusBadge>
            }
          >
            <SectionCard
              title="Pipeline summary"
              description="Keep the operational facts visible before diving into metadata."
              items={[
                `App: ${selectedEvent.appName}.`,
                `Source: ${selectedEvent.sourceType}.`,
                `Occurred at: ${formatOperationalTimestamp(selectedEvent.occurredAt)}.`,
                `Received at: ${formatOperationalTimestamp(selectedEvent.receivedAt ?? selectedEvent.occurredAt)}.`,
                `Environment: ${selectedEvent.environment}.`,
                `Event status: ${selectedEvent.eventStatus}.`,
                `Attribution status: ${selectedEvent.attributionStatus}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Safe record detail
              </p>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-ink">Normalized metadata</p>
                  <pre className="mt-3 overflow-x-auto rounded-[22px] border border-border bg-surface-elevated p-4 text-xs leading-6 text-ink-muted">
                    {JSON.stringify(selectedEvent.payload, null, 2)}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Receipt reference</p>
                  <pre className="mt-3 overflow-x-auto rounded-[22px] border border-border bg-surface-elevated p-4 text-xs leading-6 text-ink-muted">
                    {JSON.stringify(
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
                  </pre>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Conservative next step
              </p>
              <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface-elevated">
                <InlineActionRow
                  title={
                    selectedEvent.reasonCode
                      ? `Review ${selectedEvent.reasonCode} before moving the event downstream.`
                      : "Keep the app readiness and attribution follow-up path visible."
                  }
                  description="This MVP stores and normalizes receipts, but it does not imply attribution, commission approval, or full Apple signature validation."
                  badge={
                    <StatusBadge tone={stateTone(selectedEvent.state)}>
                      {selectedEvent.state}
                    </StatusBadge>
                  }
                  actions={
                    <ActionLink
                      href={nextActionHref(selectedEvent.state, selectedEvent.appSlug)}
                      variant="primary"
                    >
                      {nextActionLabel(selectedEvent.state)}
                    </ActionLink>
                  }
                />
              </div>
            </SurfaceCard>
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Inspector"
            title="No event selected"
            description="Reset the filters to inspect the latest normalized event record."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="Nothing matches the current event view"
              description="The inspector will show normalized metadata and safe receipt references once an event matches the selected filters."
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
