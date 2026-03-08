import "server-only";

import { buildActivationProgress } from "@/lib/activation-progress";
import type { LaunchReadinessData } from "@/lib/services/launch-readiness";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { listWorkspaceApps } from "@/lib/services/apps";
import { listWorkspacePartners } from "@/lib/services/partners";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { listWorkspaceNormalizedEvents } from "@/lib/services/apple-read-model";

export type SetupGuideStep = {
  id: string;
  label: string;
  detail: string;
  href: string;
  complete: boolean;
};

export type AppSetupGuide = {
  id: string;
  slug: string;
  appName: string;
  completeCount: number;
  totalCount: number;
  ingestReady: boolean;
  healthLabel: string;
  href: string;
  steps: SetupGuideStep[];
};

export type SetupGuideData = {
  launch: LaunchReadinessData;
  workspaceSteps: SetupGuideStep[];
  appGuides: AppSetupGuide[];
  completeCount: number;
  totalCount: number;
  isComplete: boolean;
  nextIncompleteStep: SetupGuideStep | null;
};

export async function getSetupGuideData() {
  const [launch, appsData, partnersData, codesData, eventsData] = await Promise.all([
    getLaunchReadinessData(),
    listWorkspaceApps(),
    listWorkspacePartners(),
    listWorkspacePromoCodes(),
    listWorkspaceNormalizedEvents(),
  ]);

  const progress = buildActivationProgress(launch);
  const readyApps = launch.rules?.appleReadiness.filter((app) => app.ingestReady).length ?? 0;
  const totalApps = launch.rules?.appleReadiness.length ?? 0;
  const hasCreators = partnersData.partners.length > 0;
  const hasCodes = codesData.codes.some((code) => code.ownerAssigned);
  const hasTrackedResults = eventsData.events.length > 0;
  const payoutConfigured =
    launch.billingSummary.status === "trialing" ||
    launch.billingSummary.status === "manual_contact";

  const workspaceSteps: SetupGuideStep[] = [
    {
      id: "workspace-created",
      label: "Workspace created",
      detail: launch.organizationName
        ? `${launch.organizationName} is linked to the current operator workspace.`
        : "Connect the workspace before launch tasks can be assigned.",
      href: "/dashboard",
      complete: Boolean(launch.organizationName),
    },
    {
      id: "first-app-added",
      label: "First app added",
      detail:
        totalApps > 0
          ? `${readyApps}/${totalApps} apps are ingest-ready.`
          : "Add the first app so tracking, health, and codes have a real lane.",
      href: "/apps",
      complete: totalApps > 0,
    },
    {
      id: "first-creator-added",
      label: "First creator added",
      detail: hasCreators
        ? `${partnersData.partners.length} creator records are available in the workspace.`
        : "Add the first creator record so invite, code, and payout workflows have an owner.",
      href: "/creators",
      complete: hasCreators,
    },
    {
      id: "first-code-created",
      label: "First code created",
      detail: hasCodes
        ? `${codesData.codes.filter((code) => code.ownerAssigned).length} linked codes are already active.`
        : "Create the first creator-linked code so attribution can resolve ownership safely.",
      href: "/codes",
      complete: hasCodes,
    },
    {
      id: "first-result-reviewed",
      label: "First result tracked",
      detail: hasTrackedResults
        ? `${eventsData.events.length} tracked results are already visible in review.`
        : "Wait for the first tracked result, then confirm attribution in Review.",
      href: "/review",
      complete: hasTrackedResults,
    },
    {
      id: "payout-path-configured",
      label: "Payout path configured",
      detail: payoutConfigured
        ? launch.billingSummary.detail
        : "Confirm billing and finance posture before operators prepare payouts.",
      href: "/payouts",
      complete: payoutConfigured,
    },
  ];

  const appGuides: AppSetupGuide[] = (launch.rules?.appleReadiness ?? []).map((app) => {
    const linkedCodes = codesData.codes.filter((code) => code.appId === app.id);
    const assignedCreators = new Set(
      linkedCodes
        .map((code) => code.partnerId)
        .filter((partnerId): partnerId is string => Boolean(partnerId)),
    );
    const hasResults = eventsData.events.some((event) => event.appSlug === app.slug);
    const steps: SetupGuideStep[] = [
      {
        id: `${app.id}-ingest`,
        label: "API integrated",
        detail: app.ingestReady
          ? "This app has an ingest key and can receive Apple notifications."
          : "Assign an ingest key before Apple can send notifications into this app lane.",
        href: `/apps/${app.slug}`,
        complete: app.ingestReady,
      },
      {
        id: `${app.id}-result`,
        label: "First result tracked",
        detail: hasResults
          ? "Tracked result activity is already visible for this app."
          : "No tracked result has landed for this app yet.",
        href: `/review?view=all`,
        complete: hasResults,
      },
      {
        id: `${app.id}-creators`,
        label: "Creators assigned",
        detail:
          assignedCreators.size > 0
            ? `${assignedCreators.size} creators are already linked through codes for this app.`
            : "Link at least one creator to this app through the code register.",
        href: `/apps/${app.slug}`,
        complete: assignedCreators.size > 0,
      },
      {
        id: `${app.id}-codes`,
        label: "Codes active",
        detail:
          linkedCodes.length > 0
            ? `${linkedCodes.length} codes are already mapped to this app.`
            : "Create the first code for this app so attribution has an ownership signal.",
        href: "/codes",
        complete: linkedCodes.length > 0,
      },
    ];

    const completeCount = steps.filter((step) => step.complete).length;

    return {
      id: app.id,
      slug: app.slug,
      appName: app.appName,
      completeCount,
      totalCount: steps.length,
      ingestReady: app.ingestReady,
      healthLabel: app.healthLabel,
      href: `/apps/${app.slug}`,
      steps,
    };
  });

  return {
    launch,
    workspaceSteps,
    appGuides,
    completeCount: progress.completeCount,
    totalCount: progress.totalCount,
    isComplete: progress.isComplete,
    nextIncompleteStep: workspaceSteps.find((step) => !step.complete) ?? null,
  } satisfies SetupGuideData;
}
