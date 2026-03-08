import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActionButton,
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InsetPanel,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  SectionCard,
  StatusBadge,
  StatusTimeline,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import {
  applyManualAttributionAction,
  markUnattributedReviewAction,
} from "@/app/(workspace)/unattributed/actions";
import { listUnattributedItems } from "@/lib/services/attribution";
import { formatOperationalTimestamp } from "@/lib/services/apple-read-model";
import {
  toneForUnattributedQueueStatus,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type UnattributedPageProps = {
  searchParams: Promise<{
    reason?: string;
    item?: string;
    notice?: string;
  }>;
};

function queueTone(status: "open" | "in_review" | "resolved" | "ignored"): StatusTone {
  return toneForUnattributedQueueStatus(status);
}

function queueLabel(status: "open" | "in_review" | "resolved" | "ignored") {
  if (status === "open") {
    return "Needs decision";
  }

  if (status === "in_review") {
    return "Held for follow-up";
  }

  if (status === "resolved") {
    return "Approved";
  }

  return "Ignored";
}

function queueMeaning(status: "open" | "in_review" | "resolved" | "ignored") {
  if (status === "open") {
    return "Ownership is still unclear, so this record needs a manual decision before earnings can be trusted.";
  }

  if (status === "in_review") {
    return "The record has been held while the reviewer confirms the evidence or waits on more context.";
  }

  if (status === "resolved") {
    return "The attribution decision has been reviewed and saved explicitly.";
  }

  return "The record was intentionally excluded from follow-up and remains visible for audit.";
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
      tone: "green" as const,
      title: "Record held for follow-up",
      detail: "The review queue now reflects an active follow-up state for this record.",
    };
  }

  if (notice === "queue-resolved") {
    return {
      tone: "green" as const,
      title: "Attribution approved",
      detail: "The selected result now carries an explicit creator and code decision.",
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

export default async function UnattributedPage({
  searchParams,
}: UnattributedPageProps) {
  const { reason = "all", item: selectedItemId, notice } = await searchParams;
  const data = await listUnattributedItems();
  const filteredItems = data.items.filter(
    (item) => reason === "all" || item.reason === reason,
  );
  const selectedItem =
    filteredItems.find((item) => item.eventId === selectedItemId) ?? null;
  const banner = noticeCopy(notice);
  const suggestionCount = data.items.filter(
    (item) => item.suggestedPartnerId || item.suggestedCodeId,
  ).length;
  const noSafeMatchCount = data.items.filter(
    (item) => !item.suggestedPartnerId && !item.suggestedCodeId,
  ).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Attribution"
        title="Unattributed"
        description="Review unresolved results and approve ownership safely."
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
          <StatusBadge tone="amber">Needs decision stays explicit</StatusBadge>
          <StatusBadge tone={toneForWorkspaceLabel()}>Hold and approve stay separate</StatusBadge>
        </div>
      </PageHeader>

      {banner ? (
        <NoticeBanner
          title={banner.title}
          detail={banner.detail}
          tone={banner.tone}
        />
      ) : null}

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          <MetricChip
            label="Needs decision"
            value={String(data.stats.unresolved)}
            detail="Open manual reviews"
            tone="amber"
          />
          <MetricChip
            label="Held"
            value={String(data.stats.inReview)}
            detail="Waiting on follow-up"
            tone="amber"
          />
          <MetricChip
            label="Safe suggestions"
            value={String(suggestionCount)}
            detail="Creator or code candidate visible"
            tone="green"
          />
          <MetricChip
            label="No safe match"
            value={String(noSafeMatchCount)}
            detail="Manual decision required"
            tone={noSafeMatchCount > 0 ? "red" : "green"}
          />
        </div>
      </section>

      <FilterBar
        title="Review filters"
        description={`${data.stats.unresolved} records are open and ${data.stats.inReview} are already held.`}
      >
        <FilterChipLink href={buildHref({ reason: "all" })} active={reason === "all"}>
          All records
        </FilterChipLink>
        {data.reasonOptions.map((option) => (
          <FilterChipLink
            key={option}
            href={buildHref({ reason: option })}
            active={reason === option}
          >
            {option.replaceAll("_", " ")}
          </FilterChipLink>
        ))}
      </FilterBar>

      <ListTable
        className="w-full"
        eyebrow="Manual review"
        title="Unattributed queue table"
        description="Lead with why the result is unresolved and the safest next action."
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
          {filteredItems.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={AlertTriangle}
                eyebrow={data.hasWorkspaceAccess ? "Manual review" : "Access required"}
                title={
                  data.hasWorkspaceAccess
                    ? "Your next unresolved result will appear here"
                    : "Sign in to review unattributed results"
                }
                description={
                  data.hasWorkspaceAccess
                    ? "Results that still need a creator or code decision fill this queue when a human review is required."
                    : "An internal workspace membership is required before the attribution queue can be reviewed."
                }
                action={
                  data.hasWorkspaceAccess ? (
                    <ActionLink href="/events" variant="primary">
                      Open events
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
              className={`grid gap-4 px-5 py-3 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[120px_minmax(0,1.35fr)_minmax(0,0.95fr)_130px_150px_110px] md:items-center ${
                item.eventId === selectedItem?.eventId ? "bg-primary-soft/35" : ""
              }`}
            >
              <div className="flex justify-start">
                <StatusBadge tone={queueTone(item.queueStatus)}>
                  {queueLabel(item.queueStatus)}
                </StatusBadge>
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-ink">{item.reasonLabel}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {item.eventType} on {item.appName}
                </p>
              </div>
              <div className="text-sm text-ink-muted">
                {(item.suggestedPartnerLabel ?? "No creator") +
                  " / " +
                  (item.suggestedCodeLabel ?? "No code")}
              </div>
              <div className="text-sm font-semibold text-ink">{item.confidenceLabel}</div>
              <div className="text-sm text-ink-muted">
                {formatOperationalTimestamp(item.receivedAt ?? item.occurredAt)}
              </div>
              <div className="text-sm font-semibold text-primary">Review record</div>
            </Link>
          ))}
        </div>
      </ListTable>

      {selectedItem ? (
        <WorkspaceDrawer
          closeHref={buildHref({ reason })}
          eyebrow="Record inspector"
          title={selectedItem.eventType}
          description={queueMeaning(selectedItem.queueStatus)}
          status={
            <StatusBadge tone={queueTone(selectedItem.queueStatus)}>
              {queueLabel(selectedItem.queueStatus)}
            </StatusBadge>
          }
        >
          <InsetPanel tone={queueTone(selectedItem.queueStatus)}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Why this result needs review
                </p>
                <p className="mt-2 text-sm leading-5 text-ink-muted">
                  {selectedItem.reasonDetail}
                </p>
              </div>
              <StatusBadge tone={queueTone(selectedItem.queueStatus)}>
                {selectedItem.reasonLabel}
              </StatusBadge>
            </div>
          </InsetPanel>

          <SectionCard
            title="Record summary"
            description="Keep the current review state, app context, and confidence visible before changing anything."
          >
            <DetailList
              items={[
                { label: "App", value: selectedItem.appName },
                { label: "Result", value: selectedItem.eventType },
                { label: "Review state", value: queueLabel(selectedItem.queueStatus) },
                { label: "Reason", value: selectedItem.reasonLabel },
                {
                  label: "Received",
                  value: formatOperationalTimestamp(
                    selectedItem.receivedAt ?? selectedItem.occurredAt,
                  ),
                },
                { label: "Confidence", value: selectedItem.confidenceLabel },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Visible evidence"
            description="Use the strongest visible ownership clues first and fall back to manual selection only when needed."
          >
            <DetailList
              items={[
                {
                  label: "Signals found",
                  value:
                    selectedItem.signalValues.length > 0
                      ? selectedItem.signalValues.join(", ")
                      : "No code-like signal survived normalization",
                },
                {
                  label: "Suggested creator",
                  value: selectedItem.suggestedPartnerLabel ?? "No creator suggestion",
                },
                {
                  label: "Suggested code",
                  value: selectedItem.suggestedCodeLabel ?? "No code suggestion",
                },
                {
                  label: "Next best action",
                  value:
                    selectedItem.suggestedPartnerId || selectedItem.suggestedCodeId
                      ? "Confirm the strongest suggestion or hold the record for follow-up."
                      : "Choose a creator and code manually or hold the record while evidence is gathered.",
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Decision path"
            description="Show what happened, why the record paused, and what the current state means."
          >
            <StatusTimeline
              steps={[
                {
                  label: "Result received",
                  detail: "The conversion entered the workspace review stream.",
                  meta: formatOperationalTimestamp(
                    selectedItem.receivedAt ?? selectedItem.occurredAt,
                  ),
                  status: "complete",
                },
                {
                  label: "Ownership check",
                  detail: selectedItem.reasonDetail,
                  meta: selectedItem.confidenceLabel,
                  status: "complete",
                },
                {
                  label: queueLabel(selectedItem.queueStatus),
                  detail: queueMeaning(selectedItem.queueStatus),
                  meta: selectedItem.note ?? undefined,
                  status: "current",
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Hold for follow-up"
            description="Use this when the reviewer needs more evidence before trusting the attribution."
          >
            <form action={markUnattributedReviewAction} className="space-y-4">
              <input type="hidden" name="eventId" value={selectedItem.eventId} />
              <label className="grid gap-2">
                <span className="text-sm font-medium text-ink">Hold note</span>
                <textarea
                  name="note"
                  rows={3}
                  defaultValue={selectedItem.note ?? ""}
                  className="aa-field"
                />
              </label>
              <div className="flex justify-end">
                <ActionButton type="submit">Hold for follow-up</ActionButton>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Approve attribution"
            description="Save the creator and code decision only when the ownership story is strong enough to trust later."
          >
            <form action={applyManualAttributionAction} className="space-y-4">
              <input type="hidden" name="eventId" value={selectedItem.eventId} />

              <label className="grid gap-2">
                <span className="text-sm font-medium text-ink">Approve code</span>
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
                <span className="text-sm font-medium text-ink">Approve creator</span>
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
                <span className="text-sm font-medium text-ink">Decision note</span>
                <textarea
                  name="note"
                  rows={3}
                  defaultValue={selectedItem.note ?? ""}
                  className="aa-field"
                />
              </label>

              <div className="flex justify-end">
                <ActionButton type="submit" variant="primary">
                  Approve attribution
                </ActionButton>
              </div>
            </form>
          </SectionCard>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
