import "server-only";

import {
  listFinanceExportOverview,
  type FinanceExportOverview,
} from "@/lib/services/finance";
import {
  getOrganizationSettingsData,
  getRulesSettingsData,
  getSettingsOverviewData,
  getTeamSettingsData,
  type OrganizationSettingsData,
  type RulesSettingsData,
  type SettingsOverviewData,
  type TeamSettingsData,
} from "@/lib/services/settings";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

export type LaunchReadinessStatus =
  | "ready"
  | "attention"
  | "blocked"
  | "informational";

export type LaunchReadinessCheck = {
  id: string;
  title: string;
  status: LaunchReadinessStatus;
  label: string;
  detail: string;
  href: string;
};

export type BillingReadinessData = {
  status: "planning_only";
  label: string;
  notes: string[];
};

export type LaunchReadinessData = {
  hasWorkspaceAccess: boolean;
  organizationName: string | null;
  workspaceRoleLabel: string | null;
  appleHealthHref: string;
  overallStatus: Exclude<LaunchReadinessStatus, "informational">;
  overallLabel: string;
  overallDetail: string;
  completedChecks: number;
  totalChecks: number;
  overview: SettingsOverviewData;
  organization: OrganizationSettingsData | null;
  team: TeamSettingsData | null;
  rules: RulesSettingsData | null;
  exports: FinanceExportOverview | null;
  billingReadiness: BillingReadinessData;
  checklist: LaunchReadinessCheck[];
};

function statusRank(status: Exclude<LaunchReadinessStatus, "informational">) {
  if (status === "blocked") {
    return 3;
  }

  if (status === "attention") {
    return 2;
  }

  return 1;
}

function overallStatusFromChecks(checks: LaunchReadinessCheck[]) {
  const actionable = checks.filter((check) => check.status !== "informational");

  if (actionable.some((check) => check.status === "blocked")) {
    return "blocked" as const;
  }

  if (actionable.some((check) => check.status === "attention")) {
    return "attention" as const;
  }

  return "ready" as const;
}

function overallLabel(status: Exclude<LaunchReadinessStatus, "informational">) {
  if (status === "blocked") {
    return "Launch blocked";
  }

  if (status === "attention") {
    return "Launch needs attention";
  }

  return "Launch checks calm";
}

function overallDetail(status: Exclude<LaunchReadinessStatus, "informational">) {
  if (status === "blocked") {
    return "One or more core launch controls are missing and should be addressed before internal launch handoff.";
  }

  if (status === "attention") {
    return "Core controls exist, but current queue, finance, or ingest signals still need operator review.";
  }

  return "Core launch controls look present for the current workspace view. Continue with smoke testing and operator runbook review.";
}

function buildBillingReadiness(): BillingReadinessData {
  return {
    status: "planning_only",
    label: "Billing is not active in-product",
    notes: [
      "This MVP does not include Stripe, subscriptions, invoicing, or a customer-facing billing workflow.",
      "Finance exports and payout tracking are live, but charge collection and billing administration remain off-platform.",
      "Treat billing as a launch-planning note only until a durable billing model and operator workflow are added.",
    ],
  };
}

function buildChecklist(params: {
  appleHealthHref: string;
  overview: SettingsOverviewData;
  organization: OrganizationSettingsData;
  team: TeamSettingsData;
  rules: RulesSettingsData;
  exports: FinanceExportOverview;
  billingReadiness: BillingReadinessData;
}) {
  const ingestReadyApps = params.rules.appleReadiness.filter((app) => app.ingestReady).length;
  const totalApps = params.rules.appleReadiness.length;
  const receiptIssues =
    params.overview.monitoring.failedReceiptCount +
    params.overview.monitoring.pendingReceiptCount;
  const financeAttentionCount =
    params.overview.financeSummary.pendingReviewCount +
    params.overview.financeSummary.draftBatchCount +
    params.overview.financeSummary.exportedBatchCount;

  const checklist: LaunchReadinessCheck[] = [
    {
      id: "workspace-identity",
      title: "Organization and team readiness",
      status:
        params.organization.organizationName && params.team.visibleMemberCount > 0
          ? "ready"
          : "blocked",
      label:
        params.organization.organizationName && params.team.visibleMemberCount > 0
          ? "Org and team visible"
          : "Missing org or team context",
      detail:
        params.organization.organizationName && params.team.visibleMemberCount > 0
          ? `${params.organization.organizationName} is configured and ${params.team.visibleMemberCount} workspace members are visible.`
          : "Confirm organization identity and at least one visible internal workspace member before launch review.",
      href: "/settings",
    },
    {
      id: "apple-ingest",
      title: "Apple ingest readiness",
      status:
        totalApps === 0
          ? "blocked"
          : ingestReadyApps === 0
            ? "blocked"
            : receiptIssues > 0 || ingestReadyApps < totalApps
              ? "attention"
              : "ready",
      label:
        totalApps === 0
          ? "No apps configured"
          : `${ingestReadyApps}/${totalApps} apps ingest-ready`,
      detail:
        totalApps === 0
          ? "No app records are available yet for Apple readiness review."
          : receiptIssues > 0
            ? `${receiptIssues} recent Apple receipt rows are failed or pending.`
            : ingestReadyApps < totalApps
              ? "Some apps still need ingest keys before Apple can target them."
              : "All visible app lanes have ingest keys and no current receipt issues in the monitoring window.",
      href: params.appleHealthHref,
    },
    {
      id: "attribution-backlog",
      title: "Attribution queue posture",
      status: params.overview.monitoring.queueVolume > 0 ? "attention" : "ready",
      label:
        params.overview.monitoring.queueVolume > 0
          ? `${params.overview.monitoring.queueVolume} items open`
          : "Queue clear",
      detail:
        params.overview.monitoring.queueVolume > 0
          ? `${params.overview.monitoring.inReviewQueueCount} of those items are already in review.`
          : "No unattributed backlog is visible in the current workspace view.",
      href: "/unattributed",
    },
    {
      id: "finance-review",
      title: "Finance review and payout posture",
      status: !params.overview.financeSummary.hasFinanceAccess
        ? "informational"
        : financeAttentionCount > 0
          ? "attention"
          : "ready",
      label: !params.overview.financeSummary.hasFinanceAccess
        ? "Finance summary hidden for your role"
        : financeAttentionCount > 0
          ? `${financeAttentionCount} finance follow-ups`
          : "Finance review calm",
      detail: !params.overview.financeSummary.hasFinanceAccess
        ? "Open this surface with an owner, admin, or finance role to verify review queues and payout batch posture."
        : `Pending commission review: ${params.overview.financeSummary.pendingReviewCount}. Draft batches: ${params.overview.financeSummary.draftBatchCount}. Exported batches: ${params.overview.financeSummary.exportedBatchCount}.`,
      href: params.overview.financeSummary.hasFinanceAccess
        ? "/payouts"
        : "/settings/audit",
    },
    {
      id: "exports",
      title: "Finance export access",
      status: params.exports.hasFinanceAccess ? "ready" : "informational",
      label: params.exports.hasFinanceAccess
        ? "CSV exports available"
        : "Finance role required",
      detail: params.exports.hasFinanceAccess
        ? `Commission rows: ${params.exports.commissionRows}. Payout rows: ${params.exports.payoutRows}. Download endpoints remain permission-scoped and audited.`
        : "The export surface stays finance-scoped. Verify export access with an owner, admin, or finance role during launch smoke tests.",
      href: "/settings/exports",
    },
    {
      id: "billing",
      title: "Billing readiness",
      status: "informational",
      label: params.billingReadiness.label,
      detail: params.billingReadiness.notes[0],
      href: "/settings",
    },
  ];

  checklist.sort(
    (left, right) =>
      statusRank(
        right.status === "informational" ? "ready" : right.status,
      ) -
      statusRank(left.status === "informational" ? "ready" : left.status),
  );

  return checklist;
}

export async function getLaunchReadinessData() {
  const workspace = await getCurrentWorkspaceContext();
  const overview = await getSettingsOverviewData();
  const billingReadiness = buildBillingReadiness();

  if (!overview.hasWorkspaceAccess) {
    return {
      hasWorkspaceAccess: false,
      organizationName: workspace.organization?.name ?? null,
      workspaceRoleLabel: workspace.role?.name ?? null,
      appleHealthHref: "/settings/rules",
      overallStatus: "blocked",
      overallLabel: overallLabel("blocked"),
      overallDetail:
        "Internal workspace access is required before launch readiness can be reviewed.",
      completedChecks: 0,
      totalChecks: 4,
      overview,
      organization: null,
      team: null,
      rules: null,
      exports: null,
      billingReadiness,
      checklist: [
        {
          id: "workspace-access",
          title: "Internal workspace access",
          status: "blocked",
          label: "Access required",
          detail:
            "Sign in with an internal workspace membership before reviewing launch controls.",
          href: "/dashboard",
        },
        {
          id: "billing",
          title: "Billing readiness",
          status: "informational",
          label: billingReadiness.label,
          detail: billingReadiness.notes[0],
          href: "/settings",
        },
      ],
    } satisfies LaunchReadinessData;
  }

  const [organization, team, rules, exports] = await Promise.all([
    getOrganizationSettingsData(),
    getTeamSettingsData(),
    getRulesSettingsData(),
    listFinanceExportOverview(),
  ]);
  const appleHealthHref =
    rules.appleReadiness[0]?.slug
      ? `/apps/${rules.appleReadiness[0].slug}/apple-health`
      : "/settings/rules";
  const checklist = buildChecklist({
    appleHealthHref,
    overview,
    organization,
    team,
    rules,
    exports,
    billingReadiness,
  });
  const actionableChecks = checklist.filter(
    (check) => check.status !== "informational",
  );
  const completedChecks = actionableChecks.filter(
    (check) => check.status === "ready",
  ).length;
  const overall = overallStatusFromChecks(checklist);

  return {
    hasWorkspaceAccess: true,
    organizationName: workspace.organization?.name ?? null,
    workspaceRoleLabel: workspace.role?.name ?? null,
    appleHealthHref,
    overallStatus: overall,
    overallLabel: overallLabel(overall),
    overallDetail: overallDetail(overall),
    completedChecks,
    totalChecks: actionableChecks.length,
    overview,
    organization,
    team,
    rules,
    exports,
    billingReadiness,
    checklist,
  } satisfies LaunchReadinessData;
}
