import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActivationMilestoneCard,
  ActivationNextAction,
  ActivationProgressCard,
  type ActivationState,
} from "@/components/activation-ui";
import {
  DetailList,
  EmptyState,
  InfoPanel,
  PageHeader,
  SectionCard,
  StatusBadge,
  SurfaceCard,
  type StatusTone,
} from "@/components/admin-ui";
import { getAuthenticatedUser } from "@/lib/auth";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { listWorkspaceNormalizedEvents } from "@/lib/services/apple-read-model";
import { listWorkspacePartners } from "@/lib/services/partners";

function stateTone(state: ActivationState): StatusTone {
  if (state === "completed") {
    return "success";
  }

  if (state === "ready") {
    return "primary";
  }

  if (state === "needs_attention") {
    return "danger";
  }

  if (state === "in_progress") {
    return "warning";
  }

  return "neutral";
}

type Milestone = {
  id: string;
  step: string;
  title: string;
  description: string;
  status: ActivationState;
  helper: string;
  action: ReactNode;
  detail: ReactNode;
};

export default async function OnboardingPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/onboarding");
  }

  const [launch, partnersData, codesData, eventsData] = await Promise.all([
    getLaunchReadinessData(),
    listWorkspacePartners(),
    listWorkspacePromoCodes(),
    listWorkspaceNormalizedEvents(),
  ]);

  const totalApps = launch.rules?.appleReadiness.length ?? 0;
  const readyApps = launch.rules?.appleReadiness.filter((app) => app.ingestReady).length ?? 0;
  const receiptIssues =
    launch.overview.monitoring.failedReceiptCount +
    launch.overview.monitoring.pendingReceiptCount;
  const creatorCount = partnersData.partners.length;
  const activeCreators = partnersData.stats.active;
  const missingCreatorEmailCount = partnersData.partners.filter(
    (partner) => !partner.contactEmail,
  ).length;
  const totalCodes = codesData.codes.length;
  const assignedCodes = codesData.stats.assigned;
  const unassignedCodes = codesData.codes.filter((code) => !code.ownerAssigned).length;
  const totalResults =
    eventsData.stats.attributed +
    eventsData.stats.unattributed +
    eventsData.stats.failed +
    eventsData.stats.ignored;
  const finance = launch.overview.financeSummary;

  const appMilestoneState: ActivationState =
    totalApps === 0
      ? "not_started"
      : readyApps === 0
        ? "needs_attention"
        : receiptIssues > 0 || readyApps < totalApps
          ? "in_progress"
          : "completed";

  const creatorMilestoneState: ActivationState =
    creatorCount === 0
      ? "not_started"
      : activeCreators === 0
        ? "in_progress"
        : "completed";

  const codeMilestoneState: ActivationState =
    totalCodes === 0
      ? "not_started"
      : assignedCodes === 0
        ? "in_progress"
        : unassignedCodes > 0
          ? "needs_attention"
          : "completed";

  const resultMilestoneState: ActivationState =
    launch.overview.monitoring.recentReceiptCount > 0 && totalResults === 0
      ? "in_progress"
      : totalResults === 0
        ? "not_started"
        : eventsData.stats.failed > 0 || eventsData.stats.unattributed > 0
          ? "needs_attention"
          : eventsData.stats.attributed > 0
            ? "completed"
            : "in_progress";

  const payoutMilestoneState: ActivationState = !finance.hasFinanceAccess
    ? totalResults > 0
      ? "ready"
      : "not_started"
    : finance.paidCount > 0 || finance.payoutTrackedCount > 0
      ? "completed"
      : finance.approvedCount > 0
        ? "ready"
        : finance.pendingReviewCount > 0
          ? "in_progress"
          : "not_started";

  const milestones: Milestone[] = [
    {
      id: "app",
      step: "Step 1",
      title: "Add your app",
      description:
        "Connect the app lane that will carry creator-driven subscription results.",
      status: appMilestoneState,
      helper:
        totalApps === 0
          ? "Add your first app and assign an ingest key so AppAffiliate can start receiving Apple events."
          : readyApps === 0
            ? "Your app records exist, but Apple readiness still needs attention before results can be trusted."
            : receiptIssues > 0
              ? "Apple intake is partly live. Clear the current receipt issues before relying on the first result."
              : "Your app lane is ready. Move on to the first creator so you can start testing the channel.",
      action: (
        <ActionLink href={launch.appleHealthHref} variant="primary">
          Open app readiness
        </ActionLink>
      ),
      detail: (
        <DetailList
          items={[
            {
              label: "Apps visible",
              value: totalApps > 0 ? String(totalApps) : "No apps yet",
            },
            {
              label: "Ready now",
              value: totalApps > 0 ? `${readyApps}/${totalApps}` : "0/0",
            },
            {
              label: "Receipt issues",
              value: receiptIssues > 0 ? String(receiptIssues) : "None visible",
            },
          ]}
        />
      ),
    },
    {
      id: "creator",
      step: "Step 2",
      title: "Invite your first creator",
      description:
        "Add the first creator record you want to use to test performance-based growth.",
      status: creatorMilestoneState,
      helper:
        creatorCount === 0
          ? "Create your first creator record so ownership and results have a real person attached to them."
          : activeCreators === 0
            ? "You already started creator setup. Finish the first active creator so code ownership becomes real."
            : "You have creator coverage in place. The next step is to give that creator a code or link.",
      action: (
        <ActionLink href="/partners" variant="primary">
          Invite your first creator
        </ActionLink>
      ),
      detail: (
        <DetailList
          items={[
            {
              label: "Creator records",
              value: creatorCount > 0 ? String(creatorCount) : "None yet",
            },
            {
              label: "Active creators",
              value: activeCreators > 0 ? String(activeCreators) : "None active yet",
            },
            {
              label: "Missing email",
              value:
                missingCreatorEmailCount > 0
                  ? String(missingCreatorEmailCount)
                  : "All visible records have email",
            },
          ]}
        />
      ),
    },
    {
      id: "code",
      step: "Step 3",
      title: "Set up a code or trackable link",
      description:
        "Give the creator a trackable asset so AppAffiliate can connect the result back to the right owner.",
      status: codeMilestoneState,
      helper:
        totalCodes === 0
          ? "Create the first code or link so the creator can start sending traffic through a trackable path."
          : assignedCodes === 0
            ? "You created a code, but it still needs an owner before the first result will feel trustworthy."
            : unassignedCodes > 0
              ? "Some active codes still need an owner. Clean that up before launch gets noisy."
              : "Code ownership looks clear. The next milestone is your first tracked creator-driven result.",
      action: (
        <ActionLink href="/codes" variant="primary">
          Set up first code
        </ActionLink>
      ),
      detail: (
        <DetailList
          items={[
            {
              label: "Codes visible",
              value: totalCodes > 0 ? String(totalCodes) : "None yet",
            },
            {
              label: "Assigned",
              value: totalCodes > 0 ? `${assignedCodes}/${totalCodes}` : "0/0",
            },
            {
              label: "Need owner",
              value: unassignedCodes > 0 ? String(unassignedCodes) : "None visible",
            },
          ]}
        />
      ),
    },
    {
      id: "result",
      step: "Step 4",
      title: "Review your first result",
      description:
        "Use the first tracked result to confirm that attribution, creator ownership, and review state all make sense.",
      status: resultMilestoneState,
      helper:
        totalResults === 0 && launch.overview.monitoring.recentReceiptCount === 0
          ? "No creator-driven result is visible yet. Once the app and creator path are live, your first result will appear here."
          : totalResults === 0
            ? "Apple intake has started. Wait for the first normalized result to appear, then review it here."
            : eventsData.stats.unattributed > 0
              ? "Your first results are landing, but some still need ownership review before earnings can be trusted."
              : eventsData.stats.failed > 0
                ? "A blocked result needs attention before the first result story is fully clean."
                : "You have at least one creator-linked result in the system. Keep moving toward approved earnings.",
      action: (
        <ActionLink
          href={eventsData.stats.unattributed > 0 ? "/unattributed" : "/events"}
          variant="primary"
        >
          {eventsData.stats.unattributed > 0 ? "Review first result" : "Open results"}
        </ActionLink>
      ),
      detail: (
        <DetailList
          items={[
            {
              label: "Tracked results",
              value: totalResults > 0 ? String(totalResults) : "None yet",
            },
            {
              label: "Needs review",
              value:
                eventsData.stats.unattributed > 0
                  ? String(eventsData.stats.unattributed)
                  : "0",
            },
            {
              label: "Matched",
              value:
                eventsData.stats.attributed > 0 ? String(eventsData.stats.attributed) : "0",
            },
          ]}
        />
      ),
    },
    {
      id: "payout",
      step: "Step 5",
      title: "Approve earnings and prepare payout",
      description:
        "Only reviewed results should move into approved earnings, payout prep, and creator-visible payout history.",
      status: payoutMilestoneState,
      helper: !finance.hasFinanceAccess
        ? "This step becomes clearer with an owner, admin, or finance role, but the goal stays the same: only reviewed results move forward."
        : finance.paidCount > 0 || finance.payoutTrackedCount > 0
          ? "You already have approved work moving through payout. Keep the creator-facing payout story easy to trust."
          : finance.approvedCount > 0
            ? "Approved earnings are ready for the next payout step."
            : finance.pendingReviewCount > 0
              ? "Finish the first commission review so payout readiness becomes real."
              : "This milestone unlocks after the first creator-driven result becomes trustworthy enough to approve.",
      action: (
        <ActionLink href={finance.hasFinanceAccess ? "/payouts" : "/commissions"} variant="primary">
          {finance.hasFinanceAccess ? "Open payout readiness" : "Open commissions"}
        </ActionLink>
      ),
      detail: (
        <DetailList
          items={[
            {
              label: "Pending review",
              value: finance.hasFinanceAccess ? String(finance.pendingReviewCount) : "Role-limited",
            },
            {
              label: "Approved",
              value: finance.hasFinanceAccess ? String(finance.approvedCount) : "Role-limited",
            },
            {
              label: "In payout",
              value: finance.hasFinanceAccess ? String(finance.payoutTrackedCount) : "Role-limited",
            },
          ]}
        />
      ),
    },
  ];

  const finishedCount = milestones.filter(
    (milestone) => milestone.status === "completed" || milestone.status === "ready",
  ).length;
  const currentMilestone =
    milestones.find((milestone) => milestone.status === "needs_attention") ??
    milestones.find((milestone) => milestone.status === "not_started") ??
    milestones.find((milestone) => milestone.status === "in_progress") ??
    milestones.find((milestone) => milestone.status === "ready") ??
    null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Activation"
        title="Launch creator-led growth without paying upfront for hype"
        description="Move from app readiness to first creator, first code, first tracked result, and first approved earnings with a guided activation sequence."
        actions={
          <>
            <ActionLink href="/dashboard">Open dashboard</ActionLink>
            <ActionLink href="/codes" variant="primary">
              Set up first code
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={stateTone(currentMilestone?.status ?? "completed")}>
            {currentMilestone
              ? `${currentMilestone.step}: ${currentMilestone.title}`
              : "You are ready to track real creator-driven results"}
          </StatusBadge>
          <StatusBadge tone="primary">{finishedCount}/5 milestones in place</StatusBadge>
          <StatusBadge>{launch.organizationName ?? "Current workspace"}</StatusBadge>
        </div>
      </PageHeader>

      {!launch.hasWorkspaceAccess ? (
        <SurfaceCard>
          <EmptyState
            eyebrow="Access required"
            title="Internal workspace access is required first"
            description="Sign in with an internal workspace membership before you can use the activation guide."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SurfaceCard>
      ) : (
        <>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <ActivationProgressCard
              title="A short path to first value"
              description="The goal is simple: get one creator path live, confirm the first result, then move only reviewed earnings toward payout."
              completeCount={finishedCount}
              totalCount={milestones.length}
            >
              <p className="text-sm leading-6 text-ink-muted">
                Keep the first launch lightweight. You do not need every advanced setting before the first creator-driven result lands.
              </p>
            </ActivationProgressCard>

            <ActivationNextAction
              title={
                currentMilestone
                  ? currentMilestone.title
                  : "You are ready to track real creator-driven results"
              }
              description={
                currentMilestone
                  ? currentMilestone.helper
                  : "App, creator, code, review, and payout readiness are all in place for the current workspace view."
              }
              status={
                currentMilestone ? (
                  <StatusBadge tone={stateTone(currentMilestone.status)}>
                    {currentMilestone.step}
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="success">Activation calm</StatusBadge>
                )
              }
              actions={
                currentMilestone ? (
                  <>
                    {currentMilestone.action}
                    <ActionLink href="/dashboard">Open dashboard</ActionLink>
                  </>
                ) : (
                  <>
                    <ActionLink href="/dashboard" variant="primary">
                      Open dashboard
                    </ActionLink>
                    <ActionLink href="/events">Review results</ActionLink>
                  </>
                )
              }
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <InfoPanel
              title="What success looks like"
              description="App readiness is live, your first creator has a code or link, and the first result is easy to review."
            />
            <InfoPanel
              title="What to ignore for now"
              description="Do not front-load every admin setting. Focus on the few steps that lead to the first creator-driven result."
            />
            <InfoPanel
              title="What stays true"
              description="Only reviewed results should turn into approved earnings and payout progress."
            />
          </div>

          <SectionCard
            eyebrow="Activation path"
            title="Five milestones to first creator-driven value"
            description="Each milestone has one reason, one next action, and one simple state."
          >
            <div className="space-y-4">
              {milestones.map((milestone) => (
                <ActivationMilestoneCard
                  key={milestone.id}
                  step={milestone.step}
                  title={milestone.title}
                  description={milestone.description}
                  status={milestone.status}
                  helper={milestone.helper}
                  action={milestone.action}
                  detail={milestone.detail}
                />
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <SectionCard
              eyebrow="First-run guidance"
              title="If you are just getting started"
              description="These reminders keep the first launch focused and reduce the chance of getting stuck between setup surfaces."
            >
              <div className="grid gap-3">
                <InfoPanel
                  title="First creator"
                  description="Start with one creator you already plan to test. You can expand the directory after the first tracked result proves the flow."
                />
                <InfoPanel
                  title="First code or link"
                  description="Ownership matters more than volume at the beginning. One correctly assigned code is better than many ambiguous assets."
                />
                <InfoPanel
                  title="First result"
                  description="Treat the first result as a confidence check: can your team explain who drove it, what happened, and whether earnings should move forward?"
                />
              </div>
            </SectionCard>

            <SectionCard
              eyebrow="Readiness notes"
              title="Current workspace signals"
              description="Use these signals to decide whether to keep setting up or move into the first review workflow."
            >
              <DetailList
                items={[
                  {
                    label: "Apple intake",
                    value:
                      totalApps === 0
                        ? "No apps yet"
                        : `${readyApps}/${totalApps} app lanes ready`,
                  },
                  {
                    label: "Creator coverage",
                    value:
                      activeCreators > 0
                        ? `${activeCreators} active creator records`
                        : creatorCount > 0
                          ? `${creatorCount} creator records started`
                          : "No creator records yet",
                  },
                  {
                    label: "Code ownership",
                    value:
                      totalCodes > 0
                        ? `${assignedCodes}/${totalCodes} codes assigned`
                        : "No codes yet",
                  },
                  {
                    label: "First-result momentum",
                    value:
                      totalResults > 0
                        ? `${totalResults} tracked results visible`
                        : launch.overview.monitoring.recentReceiptCount > 0
                          ? "Apple intake has started"
                          : "Waiting for first result",
                  },
                ]}
              />
            </SectionCard>
          </div>
        </>
      )}
    </PageContainer>
  );
}
