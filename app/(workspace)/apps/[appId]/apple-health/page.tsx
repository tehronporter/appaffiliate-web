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

  const readinessSteps: ReadinessStep[] = [
    {
      title: "Connection readiness",
      description:
        "Confirm the app is prepared for Apple Health permissions, entitlement review, and the first production-grade sync path.",
      tone: "warning",
      statusLabel: "Needs review",
      actions: <ActionLink href="/onboarding">Review onboarding</ActionLink>,
    },
    {
      title: "Notification and webhook framing",
      description:
        "Define how health events, receipt-like confirmations, and operator notifications should be surfaced before implementation work starts.",
      tone: "primary",
      statusLabel: "Designed",
      actions: <ActionLink href="/settings">Open settings</ActionLink>,
    },
    {
      title: "Last sync and receipt monitoring",
      description:
        "Reserve a clear place for last sync time, latest delivery confirmation, and issue escalation so operators know what to watch.",
      tone: "primary",
      statusLabel: "Visible",
      actions: (
        <ActionLink href="/dashboard" variant="primary">
          Open overview
        </ActionLink>
      ),
    },
    {
      title: "Operational follow-up",
      description:
        "Keep a direct path to unattributed review and partner readiness once app traffic begins to move through the program.",
      tone: "warning",
      statusLabel: "Pending",
      actions: <ActionLink href="/unattributed">Open queue</ActionLink>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title={`Apple Health for ${formattedAppId}`}
        description="Treat Apple Health like an operational surface, not a buried integration note. This page frames connection readiness, notification setup, delivery monitoring, and operator guidance in the same calm workspace language as the rest of the admin product."
        actions={
          <>
            <ActionLink href="/onboarding">Back to onboarding</ActionLink>
            <ActionLink href="/dashboard" variant="primary">
              Open overview
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">{formattedAppId}</StatusBadge>
          <StatusBadge tone="warning">Connection not active yet</StatusBadge>
          <StatusBadge>Operational surface</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Integration state"
          value="Planned"
          detail="The route is ready for operational framing even though no live Apple Health connection is wired yet."
          tone="warning"
        />
        <StatCard
          label="Last sync"
          value="Not started"
          detail="Reserve this for the latest successful health-style sync once implementation begins."
          tone="primary"
        />
        <StatCard
          label="Last receipt"
          value="No receipts"
          detail="This future block can hold delivery acknowledgements, payload receipts, or webhook confirmation timestamps."
          tone="primary"
        />
        <StatCard
          label="Notifications"
          value="Draft"
          detail="Operator alerts and escalation routing are still UI-only in this phase."
          tone="success"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <ListTable
          eyebrow="Readiness"
          title="Apple Health operational checklist"
          description="Keep setup concrete: what needs to be confirmed, where operators will monitor it, and what remains intentionally placeholder-level for now."
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
          description="This surface is meant to answer the practical questions an internal operator will ask before and after Apple Health goes live."
          items={[
            "Is the app configured and ready for Apple Health-specific launch work?",
            "Where will notifications, webhook outcomes, and delivery confirmations be monitored?",
            "How quickly can the team tell whether health-related events are flowing normally?",
            "Which adjacent queues should operators review when something looks off?",
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Status blocks
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="warning">Permissions</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Health access review
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Reserve this area for required permissions, environment notes,
                and the checks that must be complete before the first sync is trusted.
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="primary">Delivery</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Receipts and acknowledgements
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Give operators a future home for the latest processed receipt,
                webhook acknowledgement, and alert-worthy failures.
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="success">Monitoring</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Last healthy sync
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Show the last healthy sync timestamp, cadence expectations, and
                whether an operator should investigate drift.
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="warning">Escalation</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Follow-up path
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                When something fails, operators should know whether to review
                settings, unattributed events, or app-specific implementation notes next.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <SectionCard
          eyebrow="Current state"
          title="No live connection is active yet"
          description="Phase 1 Prompt 04 keeps this UI-first. The point is to make the app area feel operational before deeper integration behavior exists."
        >
          <EmptyState
            eyebrow="Still intentionally shallow"
            title="Ready for product work, not engine work"
            description="This page does not add webhook plumbing, sync execution, receipt processing, billing logic, or payout behavior. It only gives Apple Health and related notifications a clearer operational home."
            action={
              <>
                <ActionLink href="/onboarding">Back to setup</ActionLink>
                <ActionLink href="/settings">Review notifications</ActionLink>
              </>
            }
          />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
