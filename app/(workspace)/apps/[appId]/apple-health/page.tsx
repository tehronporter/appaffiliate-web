import type { ReactNode } from "react";
import { Heart } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  InlineActionRow,
  ListTable,
  MetricChip,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
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
        ? "This app has an ingest key, so Apple can target the public notification route for durable receipt intake."
        : "Assign an ingest key to this app before Apple can target the public notification route.",
      tone: readiness.app?.ingest_key ? "green" : "amber",
      statusLabel: readiness.app?.ingest_key ? "Ready" : "Needs ingest key",
      actions: <ActionLink href="/settings">Open settings</ActionLink>,
    },
    {
      title: "Receipt durability",
      description: readiness.latestReceipt
        ? `Latest receipt stored at ${formatOperationalTimestamp(readiness.latestReceipt.received_at)} with ${receiptVerificationStatus} verification state.`
        : "No Apple receipt has been stored yet for this app.",
      tone: readiness.latestReceipt ? "green" : "amber",
      statusLabel: readiness.latestReceipt ? "Receiving receipts" : "Awaiting first receipt",
      actions: <ActionLink href="/events">Open events</ActionLink>,
    },
    {
      title: "Normalized event visibility",
      description: readiness.latestEvent
        ? `Latest normalized event is ${readiness.latestEvent.eventType} with ${readiness.latestEvent.eventStatus} processing and ${readiness.latestEvent.attributionStatus} attribution.`
        : "No normalized event exists yet. Receipt-only storage is still possible in the current product when verification or decode is incomplete.",
      tone: readiness.latestEvent ? "green" : "blue",
      statusLabel: readiness.latestEvent ? "Visible" : "Receipt-only",
      actions: <ActionLink href="/events">Review event log</ActionLink>,
    },
    {
      title: "Operator follow-up",
      description: readiness.warningNote
        ? readiness.warningNote
        : "No current warning note is attached to the latest receipt or event for this app.",
      tone: readiness.warningNote ? "amber" : "blue",
      statusLabel: readiness.warningNote ? "Attention visible" : "Calm",
      actions: <ActionLink href="/unattributed">Open queue</ActionLink>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Apple health"
        title={`${appName} Apple health`}
        description="Confirm Apple intake, latest signals, and blockers before creator results matter."
        actions={
          <>
            <ActionLink href="/onboarding">Open activation guide</ActionLink>
            <ActionLink href="/dashboard" variant="primary">
              Open dashboard
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
          <StatusBadge tone={toneForWorkspaceLabel()}>
            {environmentLabel === "Unknown" ? "Environment unknown" : environmentLabel}
          </StatusBadge>
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
            detail="Derived from the latest receipt or event context."
            tone="blue"
          />
        </div>
      </section>

      {!readiness.app ? (
        <SectionCard
          title="Add this app before you track creator-led results"
          description="The route path exists, but the current workspace does not have a matching app record to attach receipts and normalized results."
        >
          <EmptyState
            icon={Heart}
            eyebrow="App missing"
            title="Add this app so Apple health can track real intake"
            description="Receipt and event signals appear here after the workspace has a matching app record with an ingest path."
            action={
              <ActionLink href="/onboarding" variant="primary">
                Open activation guide
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <>
          <SummaryBar
            items={[
              {
                label: "Readiness",
                value: readiness.readinessDetail,
              },
              {
                label: "Latest signal",
                value: readiness.latestReceipt
                  ? `${formatOperationalTimestamp(readiness.latestReceipt.received_at)} with ${receiptVerificationStatus} verification`
                  : "No Apple receipt has been stored for this app yet",
              },
              {
                label: "Needs attention",
                value:
                  readiness.warningNote ??
                  "No current warning note is attached to the latest receipt or event",
              },
            ]}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <ListTable
              eyebrow="Activation"
              title="App readiness steps"
              description="Keep the path concrete: ingest key, first receipt, first normalized result, and the next follow-up if something is blocked."
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

            <div className="space-y-6">
              <SectionCard
                title="Operational snapshot"
                description="Use this page to answer one question quickly: is this app ready to support the first creator-driven result?"
              >
                <DetailList
                  items={[
                    {
                      label: "Linked creators",
                      value: "Visible through code ownership and portal-linked records",
                    },
                    {
                      label: "Ingestion status",
                      value: readiness.app?.ingest_key ? "Ready" : "Needs ingest key",
                    },
                    {
                      label: "Recent results",
                      value: readiness.latestEvent
                        ? readiness.latestEvent.eventType
                        : "No normalized result yet",
                    },
                    {
                      label: "Open issues",
                      value: readiness.warningNote ?? "No open warning note",
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Latest signal detail"
                description="Keep the last receipt and last normalized event readable without turning this into a diagnostics wall."
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

          <SectionCard
            title="Current product boundary"
            description="Keep the scope honest: receipt capture and readiness visibility are real, while deeper Apple validation remains outside the current product."
          >
            <EmptyState
              eyebrow="Still intentionally limited"
              title="Receipt capture is real; deeper Apple validation is not"
              description="The public Apple endpoint stores the signed payload server-side, records the current verification posture, and creates normalized events only when the payload can be interpreted safely. Full cryptographic validation and historical reconciliation remain out of scope."
              action={
                <ActionLink href="/events" variant="primary">
                  Review events
                </ActionLink>
              }
            />
          </SectionCard>
        </>
      )}
    </PageContainer>
  );
}
