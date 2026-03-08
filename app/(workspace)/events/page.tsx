import Link from "next/link";
import { Activity } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  CodeBlockPanel,
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InsetPanel,
  ListTable,
  MetricChip,
  PageHeader,
  SectionCard,
  StatusBadge,
  StatusTimeline,
  SummaryBar,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import {
  formatOperationalTimestamp,
  listWorkspaceNormalizedEvents,
  type EventOperationalState,
} from "@/lib/services/apple-read-model";
import {
  toneForEventState,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

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
  return toneForEventState(state);
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

  return "/apple-health";
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
    filteredEvents.find((event) => event.id === selectedEventId) ?? null;
  const valueVisibleCount = eventData.events.filter((event) => event.amountMinor !== null).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Attribution"
        title="Events"
        description="Inspect tracked results."
        actions={
          <>
            <ActionLink href="/apple-health">Open app health</ActionLink>
            <ActionLink href="/unattributed" variant="primary">
              Review queue
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Reason-first</StatusBadge>
          {eventData.stats.unattributed > 0 ? <StatusBadge tone="amber">Needs review</StatusBadge> : null}
        </div>
      </PageHeader>

      <section>
        <div className="aa-stat-grid">
          <MetricChip
            label="Needs review"
            value={String(eventData.stats.unattributed)}
            detail="Ownership missing"
            tone="amber"
          />
          <MetricChip
            label="Matched"
            value={String(eventData.stats.attributed)}
            detail="Ready"
            tone="green"
          />
          <MetricChip
            label="Blocked"
            value={String(eventData.stats.failed)}
            detail="Intake issue"
            tone="red"
          />
          <MetricChip
            label="Value visible"
            value={String(valueVisibleCount)}
            detail="Value fields present"
            tone="blue"
          />
        </div>
      </section>

      <div className="space-y-3">
        <SummaryBar
          items={[
            {
              label: "Review",
              value:
                eventData.stats.unattributed > 0
                  ? `${eventData.stats.unattributed} need review`
                  : "Queue calm",
            },
            {
              label: "Blocked",
              value:
                eventData.stats.failed > 0 ? `${eventData.stats.failed} blocked` : "No blockers",
            },
          ]}
        />

        <FilterBar title="States">
          <FilterChipLink href={buildHref({ state: "all" })} active={state === "all"}>
            All records
          </FilterChipLink>
          <FilterChipLink
            href={buildHref({ state: "unattributed" })}
            active={state === "unattributed"}
          >
            Needs review
          </FilterChipLink>
          <FilterChipLink
            href={buildHref({ state: "attributed" })}
            active={state === "attributed"}
          >
            Matched
          </FilterChipLink>
          <FilterChipLink href={buildHref({ state: "ignored" })} active={state === "ignored"}>
            Ignored
          </FilterChipLink>
          <FilterChipLink href={buildHref({ state: "failed" })} active={state === "failed"}>
            Blocked
          </FilterChipLink>
        </FilterBar>

        <ListTable
          className="w-full"
          eyebrow="Register"
          title="Events"
          description="Select a row to inspect the result."
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
                eyebrow={eventData.hasWorkspaceAccess ? "Register" : "Access required"}
                title={
                  eventData.hasWorkspaceAccess
                    ? "Your first tracked result will appear here"
                    : "Sign in to review tracked activity"
                }
                description={
                  eventData.hasWorkspaceAccess
                    ? "Tracked results appear after creator-linked activity is stored."
                    : "The event register requires an active internal membership."
                }
                action={
                  eventData.hasWorkspaceAccess ? (
                    <ActionLink href="/onboarding" variant="primary">
                      Activation guide
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
              className={`grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[110px_minmax(0,1.45fr)_minmax(0,0.9fr)_120px_150px_110px] md:items-center md:gap-4 md:px-5 md:py-3 ${
                event.id === selectedEvent?.id ? "bg-primary-soft/35" : ""
              }`}
            >
              <div className="flex justify-start">
                <span className="aa-mobile-label mr-2 md:hidden">State</span>
                <StatusBadge tone={stateTone(event.state)}>{stateLabel(event.state)}</StatusBadge>
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
                  {nextActionLabel(event.state)}
                </div>
              </div>
            </Link>
          ))}
        </div>
        </ListTable>
      </div>

      {selectedEvent ? (
        <WorkspaceDrawer
          closeHref={buildHref({ state })}
          eyebrow="Record detail"
          title={selectedEvent.eventType.replaceAll("_", " ")}
          description={stateMeaning(selectedEvent.state)}
          status={
            <StatusBadge tone={stateTone(selectedEvent.state)}>
              {stateLabel(selectedEvent.state)}
            </StatusBadge>
          }
        >
          <InsetPanel tone={selectedEvent.state === "failed" ? "red" : stateTone(selectedEvent.state)}>
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
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
