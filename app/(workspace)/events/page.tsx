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

type EventState = "attributed" | "unattributed" | "ignored" | "failed";

type EventsPageProps = {
  searchParams: Promise<{
    state?: string;
    event?: string;
  }>;
};

const events = [
  {
    slug: "evt-apple-001",
    label: "Health receipt sync",
    eventType: "trial_started",
    app: "Motion Daily",
    appId: "motion-daily",
    source: "apple_health_webhook",
    state: "attributed" as EventState,
    receivedAt: "2026-03-06 08:42 UTC",
    normalizedAt: "2026-03-06 08:43 UTC",
    summary: "Mapped to Motion Daily / MOTIONIOS / trial_started.",
    nextLane: "Finance-safe and ready for downstream review.",
    rawPayload:
      '{ "source": "apple_health_webhook", "external_id": "ah_001", "status": "delivered", "event_name": "trial_started" }',
    normalizedRecord:
      '{ "event_type": "trial_started", "partner": "Motion Daily", "code": "MOTIONIOS", "pipeline_state": "attributed" }',
  },
  {
    slug: "evt-app-redirect-002",
    label: "Promo redirect",
    eventType: "install_started",
    app: "Northstar Coach",
    appId: "northstar-coach",
    source: "promo_redirect",
    state: "unattributed" as EventState,
    receivedAt: "2026-03-06 09:15 UTC",
    normalizedAt: "2026-03-06 09:16 UTC",
    summary: "Normalized event exists but no code owner was confirmed.",
    nextLane: "Route into the needs attribution queue before ledger review.",
    rawPayload:
      '{ "source": "promo_redirect", "path": "/go/northstar", "campaign": "creator_launch", "device": "ios" }',
    normalizedRecord:
      '{ "event_type": "install_started", "partner": null, "code": null, "pipeline_state": "unattributed" }',
  },
  {
    slug: "evt-import-003",
    label: "Legacy backfill receipt",
    eventType: "purchase",
    app: "Atlas Run",
    appId: "atlas-run",
    source: "receipt_import",
    state: "ignored" as EventState,
    receivedAt: "2026-03-05 22:10 UTC",
    normalizedAt: "2026-03-05 22:11 UTC",
    summary: "Ignored because this source was archived before current attribution rules.",
    nextLane: "Retain for audit history without pushing it into active review.",
    rawPayload:
      '{ "source": "receipt_import", "batch": "legacy_q1", "status": "duplicate", "campaign": "spring_event" }',
    normalizedRecord:
      '{ "event_type": "purchase", "partner": "Atlas Run Club", "code": "ATLASRUN", "pipeline_state": "ignored" }',
  },
  {
    slug: "evt-apple-004",
    label: "Health notification failure",
    eventType: "unknown",
    app: "Motion Daily",
    appId: "motion-daily",
    source: "apple_health_webhook",
    state: "failed" as EventState,
    receivedAt: "2026-03-06 10:04 UTC",
    normalizedAt: "Not normalized",
    summary: "Payload could not be normalized because the health event type was missing.",
    nextLane: "Investigate the payload contract before retrying downstream handling.",
    rawPayload:
      '{ "source": "apple_health_webhook", "external_id": "ah_004", "status": "delivered", "event_name": null }',
    normalizedRecord:
      '{ "event_type": null, "partner": null, "code": null, "pipeline_state": "failed", "error": "missing_event_name" }',
  },
];

function stateTone(state: EventState): StatusTone {
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

function nextActionHref(event: (typeof events)[number]) {
  if (event.state === "unattributed") {
    return "/unattributed";
  }

  if (event.state === "failed") {
    return `/apps/${event.appId}/apple-health`;
  }

  return "/commissions";
}

function nextActionLabel(state: EventState) {
  if (state === "unattributed") {
    return "Open needs attribution";
  }

  if (state === "failed") {
    return "Review app readiness";
  }

  return "Open ledger";
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

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const { state = "all", event: selectedEventSlug } = await searchParams;

  const filteredEvents = events.filter(
    (event) => state === "all" || event.state === state,
  );

  const selectedEvent =
    filteredEvents.find((event) => event.slug === selectedEventSlug) ??
    filteredEvents[0] ??
    null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operations"
        title="Events"
        description="Review the event pipeline like a system of record: what arrived, how it normalized, what state it ended in, and where operators should investigate next."
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
          <StatusBadge tone="primary">Raw and normalized visible</StatusBadge>
          <StatusBadge tone="warning">Operational states explicit</StatusBadge>
          <StatusBadge>Audit-safe exclusions stay visible</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Attributed"
          value={String(events.filter((event) => event.state === "attributed").length)}
          detail="Attributed events are normalized and linked cleanly to ownership."
          tone="success"
        />
        <StatCard
          label="Unattributed"
          value={String(events.filter((event) => event.state === "unattributed").length)}
          detail="These are the events that need operational follow-up."
          tone="warning"
        />
        <StatCard
          label="Ignored"
          value={String(events.filter((event) => event.state === "ignored").length)}
          detail="Ignored states stay visible so exclusions remain auditable."
          tone="primary"
        />
        <StatCard
          label="Failed"
          value={String(events.filter((event) => event.state === "failed").length)}
          detail="Failed normalization should stand out before it becomes silent data loss."
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Review the pipeline by outcome without leaving the list-and-detail flow."
          >
            <FilterChipLink
              href={buildHref({ state: "all", event: selectedEvent?.slug })}
              active={state === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "attributed", event: selectedEvent?.slug })}
              active={state === "attributed"}
            >
              Attributed
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "unattributed", event: selectedEvent?.slug })}
              active={state === "unattributed"}
            >
              Unattributed
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "ignored", event: selectedEvent?.slug })}
              active={state === "ignored"}
            >
              Ignored
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ state: "failed", event: selectedEvent?.slug })}
              active={state === "failed"}
            >
              Failed
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Event register"
            title="Raw intake versus normalized state"
            description="Use the list to see what the system received and how each event landed in the pipeline."
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
                    eyebrow="No matches"
                    title="No events match these filters"
                    description="Reset the state filter to review the full pipeline again."
                    action={
                      <ActionLink href="/events" variant="primary">
                        Reset filters
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredEvents.map((event) => (
                <Link
                  key={event.slug}
                  href={buildHref({ state, event: event.slug })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center ${
                    event.slug === selectedEvent?.slug
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">{event.label}</h3>
                    <p className="mt-1 text-sm text-ink-muted">{event.source}</p>
                  </div>
                  <div className="text-sm text-ink-muted">{event.app}</div>
                  <div className="text-sm text-ink-muted">{event.receivedAt}</div>
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
            title={selectedEvent.label}
            description={selectedEvent.summary}
            status={<StatusBadge tone={stateTone(selectedEvent.state)}>{selectedEvent.state}</StatusBadge>}
          >
            <SectionCard
              title="Pipeline summary"
              description="Keep the high-level event facts visible before diving into payload detail."
              items={[
                `Event type: ${selectedEvent.eventType}.`,
                `App: ${selectedEvent.app}.`,
                `Source: ${selectedEvent.source}.`,
                `Received at: ${selectedEvent.receivedAt}.`,
                `Normalized at: ${selectedEvent.normalizedAt}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Raw versus normalized
              </p>
              <div className="mt-4 grid gap-4 xl:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-ink">Raw intake</p>
                  <pre className="mt-3 overflow-x-auto rounded-[22px] border border-border bg-surface-elevated p-4 text-xs leading-6 text-ink-muted">
                    {selectedEvent.rawPayload}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink">Normalized record</p>
                  <pre className="mt-3 overflow-x-auto rounded-[22px] border border-border bg-surface-elevated p-4 text-xs leading-6 text-ink-muted">
                    {selectedEvent.normalizedRecord}
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
                  title={selectedEvent.nextLane}
                  description="Move from event review into the next operational lane without implying that the system has already fixed or approved anything."
                  badge={
                    <StatusBadge tone={stateTone(selectedEvent.state)}>
                      {selectedEvent.state}
                    </StatusBadge>
                  }
                  actions={
                    <ActionLink
                      href={nextActionHref(selectedEvent)}
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
            description="Reset the filters to inspect an event record."
          >
            <EmptyState
              eyebrow="Empty inspector"
              title="Nothing matches the current event view"
              description="The inspector will show raw intake and normalized detail once an event matches the selected filters."
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
