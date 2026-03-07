import type { ReactNode } from "react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  InfoPanel,
  InsetPanel,
  InlineActionRow,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import {
  formatOperationalTimestamp,
  getAppleHealthReadinessData,
} from "@/lib/services/apple-read-model";

type AppleHealthPageProps = {
  params: Promise<{
    appId: string;
  }>;
};

type ReadinessStep = {
  title: string;
  description: string;
  tone: "primary" | "success" | "warning";
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
    readiness.environmentLabel === "unknown"
      ? "Unknown"
      : readiness.environmentLabel;
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
      tone: readiness.app?.ingest_key ? "success" : "warning",
      statusLabel: readiness.app?.ingest_key ? "Ready" : "Needs ingest key",
      actions: <ActionLink href="/settings">Open settings</ActionLink>,
    },
    {
      title: "Receipt durability",
      description: readiness.latestReceipt
        ? `Latest receipt stored at ${formatOperationalTimestamp(readiness.latestReceipt.received_at)} with ${receiptVerificationStatus} verification state.`
        : "No Apple receipt has been stored yet for this app.",
      tone: readiness.latestReceipt ? "success" : "warning",
      statusLabel: readiness.latestReceipt ? "Receiving receipts" : "Awaiting first receipt",
      actions: <ActionLink href="/events">Open events</ActionLink>,
    },
    {
      title: "Normalized event visibility",
      description: readiness.latestEvent
        ? `Latest normalized event is ${readiness.latestEvent.eventType} with ${readiness.latestEvent.eventStatus} processing and ${readiness.latestEvent.attributionStatus} attribution.`
        : "No normalized event exists yet. Receipt-only storage is still possible in the current product when verification or decode is incomplete.",
      tone: readiness.latestEvent ? "success" : "primary",
      statusLabel: readiness.latestEvent ? "Visible" : "Receipt-only",
      actions: (
        <ActionLink href="/events" variant="primary">
          Review event log
        </ActionLink>
      ),
    },
    {
      title: "Operator follow-up",
      description: readiness.warningNote
        ? readiness.warningNote
        : "No current warning note is attached to the latest receipt or event for this app.",
      tone: readiness.warningNote ? "warning" : "primary",
      statusLabel: readiness.warningNote ? "Attention visible" : "Calm",
      actions: <ActionLink href="/unattributed">Open queue</ActionLink>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Activation"
        title={`Get ${appName} ready to track creator results`}
        description="Use this page to confirm Apple intake, review the latest result signal, and clear blockers before the first creator-driven result matters."
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
          <StatusBadge tone={readiness.readinessTone}>{readiness.readinessLabel}</StatusBadge>
          <StatusBadge tone={readiness.app?.ingest_key ? "success" : "warning"}>
            {readiness.app?.ingest_key ? "Ingest key assigned" : "Ingest key missing"}
          </StatusBadge>
          <StatusBadge>
            {environmentLabel === "Unknown" ? "Environment unknown" : environmentLabel}
          </StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="App readiness"
          value={readiness.readinessLabel}
          detail={readiness.readinessDetail}
          tone={readiness.readinessTone}
          size="compact"
        />
        <StatCard
          label="Last signal"
          value={
            readiness.latestReceipt
              ? formatOperationalTimestamp(readiness.latestReceipt.received_at)
              : "No receipts"
          }
          detail={
            readiness.latestReceipt
              ? `Stored with ${receiptVerificationStatus} verification and ${receiptProcessingStatus} processing state.`
              : "The app has not stored an Apple receipt yet."
          }
          tone={readiness.latestReceipt ? "success" : "primary"}
          size="compact"
        />
        <StatCard
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
              ? `${readiness.latestEvent.eventType} is visible with ${readiness.latestEvent.state} operational state.`
              : "Receipt intake can be live before the product safely produces a first normalized result."
          }
          tone={readiness.latestEvent ? "success" : "primary"}
          size="compact"
        />
        <StatCard
          label="Environment"
          value={environmentLabel}
          detail="Environment reflects the latest receipt or normalized event when Apple provided it."
          tone="primary"
          size="compact"
        />
      </div>

      {!readiness.app ? (
        <SectionCard
          eyebrow="Current state"
          title="Add this app before you track creator-led results"
          description="The route path exists, but the current workspace does not have a matching app record to attach receipts and normalized results."
        >
          <EmptyState
            eyebrow="App missing"
            title="Create or align the app record first"
            description="Add the app record, assign an ingest key, and then point Apple at the public notification route for this app."
            action={
              <>
                <ActionLink href="/onboarding">Open activation guide</ActionLink>
                <ActionLink href="/settings" variant="primary">
                  Open settings
                </ActionLink>
              </>
            }
          />
        </SectionCard>
      ) : (
        <>
          <SurfaceCard density="compact">
            <div className="grid gap-4 md:grid-cols-3">
              <InfoPanel
                title="Readiness"
                description={readiness.readinessDetail}
              />
              <InfoPanel
                title="Latest signal"
                description={
                  readiness.latestReceipt
                    ? `${formatOperationalTimestamp(readiness.latestReceipt.received_at)} with ${receiptVerificationStatus} verification and ${receiptProcessingStatus} processing.`
                    : "No Apple receipt has been stored for this app yet."
                }
              />
              <InfoPanel
                title="Needs attention"
                description={
                  readiness.warningNote ??
                  "No current warning note is attached to the latest receipt or event for this app."
                }
              />
            </div>
          </SurfaceCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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

            <SectionCard
              eyebrow="Guidance"
              title="What this page helps you confirm"
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
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                First-result signals
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InsetPanel className="p-5">
                  <StatusBadge tone="success">Receipt</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Last receipt received
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.latestReceipt
                      ? `${formatOperationalTimestamp(readiness.latestReceipt.received_at)}. ${receiptNotificationType}${receiptNotificationSubtype ? ` / ${receiptNotificationSubtype}` : ""}.`
                      : "No receipt has been stored for this app yet."}
                  </p>
                </InsetPanel>

                <InsetPanel className="p-5">
                  <StatusBadge tone="primary">Normalization</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Last normalized result
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.latestEvent
                      ? `${readiness.latestEvent.eventType} at ${formatOperationalTimestamp(readiness.latestEvent.receivedAt ?? readiness.latestEvent.occurredAt)} with ${readiness.latestEvent.eventStatus} processing.`
                      : "No normalized event is available yet for this app."}
                  </p>
                </InsetPanel>

                <InsetPanel className="p-5">
                  <StatusBadge tone="warning">Verification</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Verification posture
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.latestReceipt
                      ? `The latest receipt is marked ${receiptVerificationStatus}. This page does not claim full Apple signature verification yet.`
                      : "Verification status becomes meaningful after the first receipt is stored."}
                  </p>
                </InsetPanel>

                <InsetPanel className="p-5">
                  <StatusBadge tone={readiness.warningNote ? "warning" : "success"}>
                    {readiness.warningNote ? "Warning note" : "No warning"}
                  </StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Current operator note
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.warningNote ??
                      "The latest receipt and normalized event do not currently carry a warning note."}
                  </p>
                </InsetPanel>
              </div>
            </SurfaceCard>

            <SectionCard
              eyebrow="Current state"
              title="Current product boundary"
              description="Keep the scope honest: receipt capture and readiness visibility are real, while deeper Apple validation remains outside the current product."
            >
              <EmptyState
                eyebrow="Still intentionally limited"
                title="Receipt capture is real; deeper Apple validation is not"
                description="The public Apple endpoint stores the signed payload server-side, records the current verification posture, and creates normalized events only when the payload can be interpreted safely. Full cryptographic validation and historical reconciliation remain out of scope."
                action={
                  <>
                    <ActionLink href="/events">Review events</ActionLink>
                    <ActionLink href="/settings">Open settings</ActionLink>
                  </>
                }
              />
            </SectionCard>
          </div>
        </>
      )}
    </PageContainer>
  );
}
