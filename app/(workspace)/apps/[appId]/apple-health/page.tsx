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
  SummaryBar,
} from "@/components/admin-ui";
import {
  formatOperationalTimestamp,
  type AppleReadinessCheckStatus,
  getAppleHealthReadinessData,
} from "@/lib/services/apple-read-model";
import { toneForSystemStatus } from "@/lib/status-badges";

type AppleHealthPageProps = {
  params: Promise<{
    appId: string;
  }>;
};

function toneForCheckStatus(status: AppleReadinessCheckStatus) {
  if (status === "ready") {
    return "green" as const;
  }

  if (status === "blocked") {
    return "red" as const;
  }

  return "amber" as const;
}

export default async function AppleHealthPage({
  params,
}: AppleHealthPageProps) {
  const { appId } = await params;
  const formattedAppId = decodeURIComponent(appId);
  const readiness = await getAppleHealthReadinessData(formattedAppId);
  const appName = readiness.app?.name ?? formattedAppId;
  const environmentLabel =
    readiness.environmentLabel === "Unknown"
      ? "Unknown"
      : readiness.environmentLabel.charAt(0).toUpperCase() + readiness.environmentLabel.slice(1);
  const receiptVerificationStatus =
    readiness.latestReceipt?.verification_status ?? "unknown";
  const receiptProcessingStatus =
    readiness.latestReceipt?.processed_status ?? "unknown";
  const receiptNotificationType =
    readiness.latestReceipt?.notification_type ?? "unknown";
  const receiptNotificationSubtype = readiness.latestReceipt?.notification_subtype;

  const recommendedAction = !readiness.webhookSetup.hasConfiguredAppUrl || !readiness.app?.ingest_key
    ? { href: "/settings/organization", label: "Finish app setup" }
    : !readiness.webhookSetup.hasVerificationConfig
      ? { href: `/apps/${formattedAppId}`, label: "Review verification setup" }
    : !readiness.latestReceipt
      ? { href: "/review?view=all", label: "Watch first result" }
      : readiness.warningNote
        ? { href: "/review?view=all", label: "Review latest result" }
        : { href: "/dashboard", label: "Open dashboard" };

  const recommendedDetail = !readiness.webhookSetup.hasConfiguredAppUrl || !readiness.app?.ingest_key
    ? "Finish app setup so Apple can send receipts into a real app lane."
    : !readiness.webhookSetup.hasVerificationConfig
      ? readiness.webhookSetup.verificationDetail
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
        description="Check Apple intake and the next follow-up for this app."
        actions={
          <>
            <ActionLink href="/review?view=all">Open review</ActionLink>
            <ActionLink href={recommendedAction.href} variant="primary">
              {recommendedAction.label}
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForSystemStatus(readiness.readinessLabel)}>
            {readiness.readinessLabel}
          </StatusBadge>
          <StatusBadge tone={readiness.webhookSetup.hasVerificationConfig ? "green" : "amber"}>
            {readiness.webhookSetup.hasVerificationConfig
              ? "Verification configured"
              : "Verification config incomplete"}
          </StatusBadge>
        </div>
      </PageHeader>

      <div className="space-y-3">
        <section>
          <div className="aa-stat-grid">
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
                  : "No Apple receipt stored yet."
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
                  : "Receipt intake can be live before the first normalized result."
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

        <SummaryBar
          items={[
            {
              label: "Environment",
              value: environmentLabel,
            },
            {
              label: "Follow-up",
              value: recommendedAction.label,
            },
          ]}
        />
      </div>

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
            title="Checks"
            description="Review ingest key, receipt flow, and the next step."
          >
            {readiness.readinessChecks.map((step) => (
              <InlineActionRow
                key={step.id}
                title={step.title}
                description={step.detail}
                badge={<StatusBadge tone={toneForCheckStatus(step.status)}>{step.label}</StatusBadge>}
                actions={
                  step.id === "latest-event-normalized" || step.id === "latest-receipt"
                    ? <ActionLink href="/review?view=all">Open review</ActionLink>
                    : step.id === "public-app-url" || step.id === "ingest-key"
                      ? <ActionLink href="/settings/organization">Open app settings</ActionLink>
                      : undefined
                }
              />
            ))}
          </ListTable>

          <div className="space-y-5">
            <SectionCard
              title="Webhook setup"
              description="Keep the exact endpoint, request shape, and verification posture visible."
            >
              <DetailList
                columns={1}
                items={[
                  {
                    label: "Endpoint",
                    value:
                      readiness.webhookSetup.endpointUrl ??
                      "Configure NEXT_PUBLIC_APP_URL and an ingest key to generate the endpoint.",
                  },
                  {
                    label: "Request shape",
                    value: `${readiness.webhookSetup.requestMethod} ${readiness.webhookSetup.requestBodyExample}`,
                  },
                  {
                    label: "Verification config",
                    value: readiness.webhookSetup.verificationDetail,
                  },
                ]}
              />
            </SectionCard>

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
              title="Latest signals"
              description="Keep the last receipt and normalized event readable."
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
