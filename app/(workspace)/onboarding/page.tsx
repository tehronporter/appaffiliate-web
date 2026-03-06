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
import { getCurrentWorkspaceContext } from "@/lib/workspace";

type SetupStep = {
  title: string;
  description: string;
  statusLabel: string;
  tone: "primary" | "success" | "warning";
  actions: ReactNode;
};

export default async function OnboardingPage() {
  const workspace = await getCurrentWorkspaceContext();
  const hasWorkspaceContext = Boolean(workspace.organization);
  const completedSteps = hasWorkspaceContext ? 1 : 0;
  const totalSteps = 6;
  const completionPercent = Math.round((completedSteps / totalSteps) * 100);

  const workspaceLabel = workspace.organization?.name ?? "Workspace context needed";
  const nextPriority = hasWorkspaceContext
    ? "Add the first app"
    : "Confirm workspace context";

  const setupSteps: SetupStep[] = [
    {
      title: "Create or confirm workspace context",
      description: hasWorkspaceContext
        ? `Workspace ready for ${workspace.organization?.name}. Role: ${workspace.role?.name ?? "unassigned"}.`
        : "Confirm the organization, owner role, and baseline workspace settings before inviting anyone else in.",
      statusLabel: hasWorkspaceContext ? "Complete" : "Start here",
      tone: hasWorkspaceContext ? "success" : "warning",
      actions: <ActionLink href="/settings">Review workspace</ActionLink>,
    },
    {
      title: "Add first app",
      description:
        "Create the first app record and establish the operating path that later setup and attribution work will attach to.",
      statusLabel: "Next",
      tone: "primary",
      actions: (
        <ActionLink href="/apps/demo-app/apple-health" variant="primary">
          Open app setup
        </ActionLink>
      ),
    },
    {
      title: "Configure Apple Health and notifications",
      description:
        "Prepare app-specific implementation notes, Apple Health readiness, and internal notifications without building deep config yet.",
      statusLabel: "Pending",
      tone: "warning",
      actions: (
        <>
          <ActionLink href="/apps/demo-app/apple-health">
            Apple Health
          </ActionLink>
          <ActionLink href="/settings">Notifications</ActionLink>
        </>
      ),
    },
    {
      title: "Add first partner",
      description:
        "Create the first creator, affiliate, or agency relationship so the program has an operational owner from day one.",
      statusLabel: "Pending",
      tone: "primary",
      actions: <ActionLink href="/partners">Open partners</ActionLink>,
    },
    {
      title: "Create first promo code",
      description:
        "Establish the first referral code so ownership and attribution coverage have a clear starting point.",
      statusLabel: "Pending",
      tone: "primary",
      actions: <ActionLink href="/codes">Open codes</ActionLink>,
    },
    {
      title: "Review unattributed readiness",
      description:
        "Keep an operator eye on unattributed events early so the future exception queue already has a clear home.",
      statusLabel: "Pending",
      tone: "warning",
      actions: <ActionLink href="/unattributed">Open queue</ActionLink>,
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Onboarding setup"
        description="Set up the first operational surfaces for AppAffiliate: workspace context, app readiness, partner coverage, promo codes, and attribution review. This stays intentionally UI-first in Phase 1, but it should already feel like a real operator setup surface."
        actions={
          <>
            <ActionLink href="/dashboard">Back to overview</ActionLink>
            <ActionLink href="/apps/demo-app/apple-health" variant="primary">
              Open app setup
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={hasWorkspaceContext ? "success" : "warning"}>
            {workspaceLabel}
          </StatusBadge>
          <StatusBadge tone="primary">6-step setup path</StatusBadge>
          <StatusBadge>UI-first Phase 1</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Completion"
          value={`${completionPercent}%`}
          detail={`${completedSteps} of ${totalSteps} first-use setup steps are marked complete from current workspace context.`}
          tone={hasWorkspaceContext ? "success" : "warning"}
        />
        <StatCard
          label="Workspace"
          value={workspaceLabel}
          detail="This is the anchor for the rest of onboarding and helps the setup flow feel tied to a real operator environment."
          tone="primary"
        />
        <StatCard
          label="Next priority"
          value={nextPriority}
          detail="The page keeps the most important next move shallow and one click away."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <ListTable
          eyebrow="Setup checklist"
          title="Move from workspace setup to operational readiness"
          description="Treat onboarding like an operator checklist, not a wizard. Each milestone has a clear destination and a deliberately lightweight next action."
        >
          {setupSteps.map((step) => (
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
          eyebrow="Operator notes"
          title="Keep the setup surface calm"
          description="This onboarding view is meant to guide an internal operator through the first meaningful actions without turning into a heavy wizard."
          items={[
            "Keep Overview, Program, Operations, and Settings one click away while setup is in progress.",
            "Use app setup and Apple Health notes as first-class onboarding destinations.",
            "Treat partners, promo codes, and unattributed review as part of initial readiness, not later cleanup.",
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            First-use milestones
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone={hasWorkspaceContext ? "success" : "warning"}>
                {hasWorkspaceContext ? "Context ready" : "Needs confirmation"}
              </StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Workspace context
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                {hasWorkspaceContext
                  ? `Organization ${workspace.organization?.slug ?? "unknown"} is available for first-use setup.`
                  : "No active organization context is visible yet, so onboarding should begin with workspace confirmation."}
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="primary">App path ready</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Apple Health and app setup
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                The nested app route already exists, so onboarding can point operators
                toward implementation readiness instead of waiting for full persistence.
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="primary">Program launch</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Partner and code coverage
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                First partner and first promo code should feel like launch-critical
                setup, not disconnected later tasks.
              </p>
            </div>

            <div className="rounded-[24px] border border-border bg-surface p-5">
              <StatusBadge tone="warning">Operational review</StatusBadge>
              <h2 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                Attribution readiness
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                Unattributed review belongs in onboarding because operators need to
                know where exceptions will be managed before traffic starts flowing.
              </p>
            </div>
          </div>
        </SurfaceCard>

        <SectionCard
          eyebrow="Phase boundary"
          title="What stays out of scope here"
          description="Phase 1 Prompt 03 is about the shape and confidence of onboarding, not deep system behavior."
        >
          <EmptyState
            eyebrow="Still intentionally shallow"
            title="No persistence-heavy setup wizard yet"
            description="This page does not add deep backend logic, full step persistence, billing setup, commission behavior, or payout engine work. It only gives those future steps a clearer operational home."
            action={<ActionLink href="/settings">Review setup boundary</ActionLink>}
          />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
