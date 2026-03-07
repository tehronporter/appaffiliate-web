import type { ReactNode } from "react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
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
        : "No normalized event exists yet. Receipt-only storage is still possible in this MVP when verification or decode is incomplete.",
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
        eyebrow="Program"
        title={`Apple Health for ${appName}`}
        description="Treat Apple notification intake like an operational surface. This page shows real receipt and normalized-event readiness without overstating verification or downstream automation."
        actions={
          <>
            <ActionLink href="/events">Open events</ActionLink>
            <ActionLink href="/dashboard" variant="primary">
              Open overview
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={readiness.readinessTone}>{readiness.readinessLabel}</StatusBadge>
          <StatusBadge tone={readiness.app?.ingest_key ? "success" : "warning"}>
            {readiness.app?.ingest_key ? "Ingest key assigned" : "Ingest key missing"}
          </StatusBadge>
          <StatusBadge>{environmentLabel === "Unknown" ? "Environment unknown" : environmentLabel}</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Readiness"
          value={readiness.readinessLabel}
          detail={readiness.readinessDetail}
          tone={readiness.readinessTone}
        />
        <StatCard
          label="Last receipt"
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
        />
        <StatCard
          label="Last normalized event"
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
              : "Receipt intake can be live before the MVP safely produces a normalized event."
          }
          tone={readiness.latestEvent ? "success" : "primary"}
        />
        <StatCard
          label="Environment"
          value={environmentLabel}
          detail="Environment reflects the latest receipt or normalized event when Apple provided it."
          tone="primary"
        />
      </div>

      {!readiness.app ? (
        <SectionCard
          eyebrow="Current state"
          title="This app is not ready for Apple intake yet"
          description="The route path exists, but the current workspace does not have a matching app record to attach receipts and normalized events."
        >
          <EmptyState
            eyebrow="App missing"
            title="Create or align the app record first"
            description="Add the app row in the workspace database, assign an ingest key, and then point Apple at the public notification route for this app."
            action={
              <>
                <ActionLink href="/settings">Open settings</ActionLink>
                <ActionLink href="/events" variant="primary">
                  Review events
                </ActionLink>
              </>
            }
          />
        </SectionCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <ListTable
              eyebrow="Readiness"
              title="Apple intake operational checklist"
              description="Keep the readiness picture concrete: where receipts land, how normalization looks, and what remains deliberately placeholder-level for now."
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
              title="What operators should expect here"
              description="This surface should answer the practical questions an internal operator will ask while Apple notification work is still maturing."
              items={[
                "Has this app started receiving Apple receipts yet?",
                "Did the latest receipt normalize into an internal event row?",
                "What environment did the latest activity indicate?",
                "Is the latest warning about missing verification, failed processing, or app setup?",
              ]}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <SurfaceCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Latest activity
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="success">Receipt</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Last receipt received
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.latestReceipt
                      ? `${formatOperationalTimestamp(readiness.latestReceipt.received_at)}. ${receiptNotificationType}${receiptNotificationSubtype ? ` / ${receiptNotificationSubtype}` : ""}.`
                      : "No receipt has been stored for this app yet."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="primary">Normalization</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    Last normalized event
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.latestEvent
                      ? `${readiness.latestEvent.eventType} at ${formatOperationalTimestamp(readiness.latestEvent.receivedAt ?? readiness.latestEvent.occurredAt)} with ${readiness.latestEvent.eventStatus} processing.`
                      : "No normalized event is available yet for this app."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface p-5">
                  <StatusBadge tone="warning">Verification</StatusBadge>
                  <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                    MVP verification status
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">
                    {readiness.latestReceipt
                      ? `The latest receipt is marked ${receiptVerificationStatus}. This page does not claim full Apple signature verification yet.`
                      : "Verification status becomes meaningful after the first receipt is stored."}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-surface p-5">
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
                </div>
              </div>
            </SurfaceCard>

            <SectionCard
              eyebrow="Current state"
              title="What is real versus placeholder"
              description="This MVP intentionally stops at receipt capture, best-effort normalization, and honest readiness visibility."
            >
              <EmptyState
                eyebrow="Still intentionally limited"
                title="Receipt capture is real; full verification is not"
                description="The public Apple endpoint now stores the raw signed payload, records placeholder verification state, and creates normalized events only when the unverified payload can be interpreted safely. Full cryptographic validation, historical reconciliation, attribution actions, and payout behavior remain out of scope."
                action={
                  <>
                    <ActionLink href="/events">Review event log</ActionLink>
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
