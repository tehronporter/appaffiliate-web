import type { LaunchReadinessData } from "@/lib/services/launch-readiness";

export type ActivationProgressStep = {
  label: string;
  complete: boolean;
};

export type ActivationProgress = {
  steps: ActivationProgressStep[];
  completeCount: number;
  totalCount: number;
  isComplete: boolean;
};

export function buildActivationProgress(
  launch: LaunchReadinessData,
): ActivationProgress {
  const readyApps = launch.rules?.appleReadiness.filter((app) => app.ingestReady).length ?? 0;
  const totalApps = launch.rules?.appleReadiness.length ?? 0;
  const activeCreators = launch.team?.partnerUserCount ?? 0;
  const ownedCodes = launch.rules?.activeOwnedCodeCount ?? 0;
  const monitoring = launch.overview.monitoring;
  const finance = launch.overview.financeSummary;
  const payoutFlowVisible =
    finance.hasFinanceAccess &&
    (finance.approvedCount > 0 ||
      finance.payoutTrackedCount > 0 ||
      finance.draftBatchCount > 0 ||
      finance.exportedBatchCount > 0 ||
      finance.paidBatchCount > 0);

  const steps: ActivationProgressStep[] = [
    {
      label: "Workspace",
      complete: Boolean(launch.organizationName),
    },
    {
      label: "App",
      complete: totalApps > 0 && readyApps > 0,
    },
    {
      label: "Creator",
      complete: activeCreators > 0,
    },
    {
      label: "Code",
      complete: ownedCodes > 0,
    },
    {
      label: "Review",
      complete: monitoring.recentReceiptCount > 0,
    },
    {
      label: "Payout",
      complete: payoutFlowVisible || finance.paidCount > 0,
    },
  ];

  const completeCount = steps.filter((step) => step.complete).length;

  return {
    steps,
    completeCount,
    totalCount: steps.length,
    isComplete: completeCount === steps.length,
  };
}
