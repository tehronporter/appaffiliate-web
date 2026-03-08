import type { ReactNode } from "react";
import { Heart } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  InsetPanel,
  InlineActionRow,
  ListTable,
  MetricChip,
  PageHeader,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  formatOperationalTimestamp,
  getAppleHealthReadinessData,
} from "@/lib/services/apple-read-model";
import { toneForSystemStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

type AppleHealthPageProps = {
  params: Promise<{
    appId: string;
  }>;
};

type ReadinessStep = {
  title: string;
  description: string;
  tone: "blue" | "green" | "amber" | "red";
  statusLabel: string;
  actions?: ReactNode;
};

export default async function AppleHealthPage({
  params,
}: AppleHealthPageProps) {
  const { appId } = await params;
  const formattedAppId = decodeURIComponent(appId);
  const readiness = await getAppleHealthReadinessData(formattedAppId);
  const appName = readiness.app?.name ?? formattedAppId;
  const environmentLabel =
    readiness.environmentLabel === "unknown" ? "Unknown" : readiness.environmentLabel;
  const receiptVerificationStatus =
    readiness.latestReceipt?.verification_status ?? "unknown";
  const receiptProcessingStatus =
    readiness.latestReceipt?.processed_status ?? "unknown";
  const receiptNotificationType =
    readiness.latestReceipt?.notification_type ?? "unknown";
  const receiptNotificationSubtype = readiness.latestReceipt?.notification_subtype;

  const readinessSteps: ReadinessStep[] = [
    {
      title: "Public ingestion endpoint",
      description: readiness.app?.ingest_key
        ? "Apple can target the public notification route for durable receipt intake."
        : "Assign an ingest key before Apple can target the public notification route.",
      tone: readiness.app?.ingest_key ? "green" : "amber",
      statusLabel: readiness.app?.ingest_key ? "Ready" : "Needs ingest key",
      actions: <ActionLink href="/settings/organization">Open app settings</ActionLink>,
    },
    {
      title: "Receipt durability",
      description: readiness.latestReceipt
        ? `Latest receipt stored at ${formatOperationalTimestamp(readiness.latestReceipt.received_at)} with ${receiptVerificationStatus} verification state.`
        : "No Apple receipt has been stored for this app yet.",
      tone: readiness.latestReceipt ? "green" : "amber",
      statusLabel: readiness.latestReceipt ? "Receiving receipts" : "Awaiting first receipt",
      actions: <ActionLink href="/events">Open events</ActionLink>,
    },
    {
      title: "Normalized event visibility",
      description: readiness.latestEvent
        ? `Latest normalized event is ${readiness.latestEvent.eventType} with ${readiness.latestEvent.eventStatus} processing and ${readiness.latestEvent.attributionStatus} attribution.`
        : "No normalized event exists yet. Receipt-only storage is still possible when verification or decode is incomplete.",
      tone: readiness.latestEvent ? "green" : "blue",
      statusLabel: readiness.latestEvent ? "Visible" : "Receipt-only",
      actions: <ActionLink href="/events">Review event log</ActionLink>,
    },
    {
      title: "Operator follow-up",
      description: readiness.warningNote
        ? readiness.warningNote
        : "No current warning note is attached to the latest receipt or event.",
      tone: readiness.warningNote ? "amber" : "blue",
      statusLabel: readiness.warningNote ? "Attention visible" : "Calm",
      actions: <ActionLink href="/unattributed">Open queue</ActionLink>,
    },
  ];

  const recommendedAction = !readiness.app?.ingest_key
    ? { href: "/settings/organization", label: "Finish app setup" }
    : !readiness.latestReceipt
      ? { href: "/events", label: "Watch first receipt" }
      : readiness.warningNote
        ? { href: "/events", label: "Review latest event" }
        : { href: "/dashboard", label: "Open dashboard" };

  const recommendedDetail = !readiness.app?.ingest_key
    ? "Finish app setup so Apple can send receipts into a real app lane."
    : !readiness.latestReceipt
      ? "Wait for the first receipt, then verify that it lands here with the expected verification state."
      : readiness.warningNote
        ? readiness.warningNote
        : "No immediate Apple intake issue is visible for this app.";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Apple health"
        title={appName}
        description="Check Apple intake, latest signals, and blockers for this app."
        actions={
          <>
            <ActionLink href="/events">Open events</ActionLink>
            <ActionLink href={recommendedAction.href} variant="primary">
              {recommendedAction.label}
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForSystemStatus(readiness.readinessLabel)}>
            {readiness.readinessLabel}
          </StatusBadge>
          <StatusBadge tone={readiness.app?.ingest_key ? "green" : "amber"}>
            {readiness.app?.ingest_key ? "Ingest key assigned" : "Ingest key missing"}
          </StatusBadge>
          <StatusBadge tone={toneForWorkspaceLabel()}>{environmentLabel}</StatusBadge>
        </div>
      </PageHeader>

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          <MetricChip
            label="App readiness"
            value={readiness.readinessLabel}
            detail={readiness.readinessDetail}
            tone={toneForSystemStatus(readiness.readinessLabel)}
          />
          <MetricChip
            label="Last signal"
            value={
              readiness.latestReceipt
                ? formatOperationalTimestamp(readiness.latestReceipt.received_at)
                : "No receipts"
            }
            detail={
              readiness.latestReceipt
                ? `${receiptVerificationStatus} verification and ${receiptProcessingStatus} processing.`
                : "The app has not stored an Apple receipt yet."
            }
            tone={readiness.latestReceipt ? "green" : "blue"}
          />
          <MetricChip
            label="First result path"
            value={
              readiness.latestEvent
                ? formatOperationalTimestamp(
                    readiness.latestEvent.receivedAt ?? readiness.latestEvent.occurredAt,
                  )
                : "No normalized rows"
            }
            detail={
              readiness.latestEvent
                ? `${readiness.latestEvent.eventType} is visible with ${readiness.latestEvent.state} state.`
                : "Receipt intake can be live before a first normalized result."
            }
            tone={readiness.latestEvent ? "green" : "blue"}
          />
          <MetricChip
            label="Environment"
            value={environmentLabel}
            detail="Derived from the latest receipt or event."
            tone="blue"
          />
        </div>
      </section>

      {!readiness.app ? (
        <SectionCard
          title="Add this app before you track creator-led results"
          description="The current workspace does not have a matching app record for this route yet."
        >
          <EmptyState
            icon={Heart}
            eyebrow="App missing"
            title="Add this app so Apple health can track intake"
            description="Receipt and event signals appear here after the workspace has a matching app record."
            action={
              <ActionLink href="/settings/organization" variant="primary">
                Finish app setup
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <ListTable
            eyebrow="Checks"
            title="Apple health checks"
            description="Keep the path concrete: ingest key, first receipt, first normalized result, and the next follow-up."
          >
            {readinessSteps.map((step) => (
              <InlineActionRow
                key={step.title}
                title={step.title}
                description={step.description}
                badge={<StatusBadge tone={step.tone}>{step.statusLabel}</StatusBadge>}
                actions={step.actions}
              />
            ))}
          </ListTable>

          <div className="space-y-5">
            <InsetPanel>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                Recommended next step
              </p>
              <p className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
                {recommendedAction.label}
              </p>
              <p className="mt-1.5 text-sm leading-5 text-ink-muted">{recommendedDetail}</p>
              <div className="mt-3">
                <ActionLink href={recommendedAction.href} variant="primary">
                  {recommendedAction.label}
                </ActionLink>
              </div>
            </InsetPanel>

            <SectionCard
              title="Latest signal detail"
              description="Keep the last receipt and last normalized event readable."
            >
              <DetailList
                items={[
                  {
                    label: "Last receipt",
                    value: readiness.latestReceipt
                      ? `${formatOperationalTimestamp(readiness.latestReceipt.received_at)} · ${receiptNotificationType}${receiptNotificationSubtype ? ` / ${receiptNotificationSubtype}` : ""}`
                      : "No receipt has been stored for this app yet",
                  },
                  {
                    label: "Last normalized result",
                    value: readiness.latestEvent
                      ? `${readiness.latestEvent.eventType} at ${formatOperationalTimestamp(readiness.latestEvent.receivedAt ?? readiness.latestEvent.occurredAt)}`
                      : "No normalized event is available yet for this app",
                  },
                  {
                    label: "Verification posture",
                    value: readiness.latestReceipt
                      ? `Latest receipt is marked ${receiptVerificationStatus}`
                      : "Verification posture becomes meaningful after the first receipt",
                  },
                  {
                    label: "Operator note",
                    value:
                      readiness.warningNote ??
                      "The latest receipt and normalized event do not currently carry a warning note",
                  },
                ]}
              />
            </SectionCard>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
