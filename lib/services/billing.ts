import "server-only";

import { createServiceContext } from "@/lib/services/context";
import { ServiceError } from "@/lib/services/errors";
import {
  getBillingIntervalLabel,
  getPricingPlan,
  isBillingInterval,
  isPlanKey,
  isWorkspaceBillingStatus,
  type BillingInterval,
  type PlanKey,
  type WorkspaceBillingStatus,
} from "@/lib/pricing-catalog";

type WorkspaceBillingStateRow = {
  organization_id: string;
  plan_key: string;
  billing_interval: string;
  status: string;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceBillingUsage = {
  used: number;
  limit: number | null;
  summary: string;
};

export type WorkspaceBillingSummary = {
  hasWorkspaceAccess: boolean;
  organizationId: string | null;
  planKey: PlanKey | null;
  planName: string | null;
  billingInterval: BillingInterval | null;
  billingIntervalLabel: string | null;
  status: WorkspaceBillingStatus | "missing";
  statusLabel: string;
  detail: string;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialEndsLabel: string | null;
  trialDaysRemaining: number | null;
  usage: {
    apps: WorkspaceBillingUsage;
    activeCreators: WorkspaceBillingUsage;
  } | null;
  notes: string[];
};

function formatDateLabel(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function calculateTrialDaysRemaining(trialEndsAt: string | null) {
  if (!trialEndsAt) {
    return null;
  }

  const trialEndsDate = new Date(trialEndsAt);

  if (Number.isNaN(trialEndsDate.getTime())) {
    return null;
  }

  const diffMs = trialEndsDate.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function formatUsageSummary(label: string, used: number, limit: number | null) {
  const noun = used === 1 ? label : `${label}s`;

  if (limit === null) {
    return `${used} ${noun} in the workspace now.`;
  }

  return `${used} of ${limit} ${noun} in use.`;
}

function normalizeSummaryStatus(
  rawStatus: WorkspaceBillingStatus,
  trialEndsAt: string | null,
): WorkspaceBillingStatus {
  if (rawStatus !== "trialing") {
    return rawStatus;
  }

  const daysRemaining = calculateTrialDaysRemaining(trialEndsAt);
  return daysRemaining !== null && daysRemaining < 0 ? "trial_expired" : "trialing";
}

export async function getWorkspaceBillingSummary(): Promise<WorkspaceBillingSummary> {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      organizationId: null,
      planKey: null,
      planName: null,
      billingInterval: null,
      billingIntervalLabel: null,
      status: "missing",
      statusLabel: "Billing state unavailable",
      detail: "Sign in with an internal workspace membership to review plan and trial state.",
      trialStartedAt: null,
      trialEndsAt: null,
      trialEndsLabel: null,
      trialDaysRemaining: null,
      usage: null,
      notes: [],
    };
  }

  const organizationId = context.workspace.organization.id;
  const [
    { data: billingRow, error: billingError },
    { count: appCount, error: appCountError },
    { count: activeCreatorCount, error: activeCreatorCountError },
  ] = await Promise.all([
    context.supabase
      .from("workspace_billing_states")
      .select(
        "organization_id, plan_key, billing_interval, status, trial_started_at, trial_ends_at, created_at, updated_at",
      )
      .eq("organization_id", organizationId)
      .maybeSingle<WorkspaceBillingStateRow>(),
    context.supabase
      .from("apps")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId),
    context.supabase
      .from("partners")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "active"),
  ]);

  if (billingError || appCountError || activeCreatorCountError) {
    throw new ServiceError("internal_error", "Failed to load workspace billing state.", {
      status: 500,
      details: {
        billingMessage: billingError?.message,
        appCountMessage: appCountError?.message,
        creatorCountMessage: activeCreatorCountError?.message,
      },
    });
  }

  if (
    !billingRow ||
    !isPlanKey(billingRow.plan_key) ||
    !isBillingInterval(billingRow.billing_interval) ||
    !isWorkspaceBillingStatus(billingRow.status)
  ) {
    return {
      hasWorkspaceAccess: true,
      organizationId,
      planKey: null,
      planName: null,
      billingInterval: null,
      billingIntervalLabel: null,
      status: "missing",
      statusLabel: "Billing profile missing",
      detail:
        "This workspace does not have a persisted pricing profile yet. Add one before using billing state for launch checks.",
      trialStartedAt: null,
      trialEndsAt: null,
      trialEndsLabel: null,
      trialDaysRemaining: null,
      usage: {
        apps: {
          used: appCount ?? 0,
          limit: null,
          summary: formatUsageSummary("app", appCount ?? 0, null),
        },
        activeCreators: {
          used: activeCreatorCount ?? 0,
          limit: null,
          summary: formatUsageSummary("active creator", activeCreatorCount ?? 0, null),
        },
      },
      notes: [
        "Workspace billing state is missing.",
        "No in-product payment collection exists yet.",
      ],
    };
  }

  const plan = getPricingPlan(billingRow.plan_key);
  const status = normalizeSummaryStatus(billingRow.status, billingRow.trial_ends_at);
  const trialEndsLabel = formatDateLabel(billingRow.trial_ends_at);
  const trialDaysRemaining = calculateTrialDaysRemaining(billingRow.trial_ends_at);
  const usage = {
    apps: {
      used: appCount ?? 0,
      limit: plan.limits.apps,
      summary: formatUsageSummary("app", appCount ?? 0, plan.limits.apps),
    },
    activeCreators: {
      used: activeCreatorCount ?? 0,
      limit: plan.limits.activeCreators,
      summary: formatUsageSummary(
        "active creator",
        activeCreatorCount ?? 0,
        plan.limits.activeCreators,
      ),
    },
  };

  const billingIntervalLabel = getBillingIntervalLabel(billingRow.billing_interval);
  const statusLabel =
    status === "manual_contact"
      ? "Manual contact path"
      : status === "trial_expired"
        ? "Trial expired"
        : trialDaysRemaining !== null && trialDaysRemaining <= 3
          ? "Trial ends soon"
          : "Trial active";

  const detail =
    status === "manual_contact"
      ? `${plan.name} stays on a custom contact path until a tailored rollout is arranged.`
      : status === "trial_expired"
        ? `${plan.name} on ${billingIntervalLabel.toLowerCase()} billing is still active in-product while Stripe remains offline.`
        : `${plan.name} on ${billingIntervalLabel.toLowerCase()} billing is trialing${trialEndsLabel ? ` through ${trialEndsLabel}` : ""}.`;

  const notes =
    status === "manual_contact"
      ? [
          `${plan.name} uses custom pricing and rollout handling for now.`,
          usage.apps.summary,
          usage.activeCreators.summary,
        ]
      : [
          trialEndsLabel
            ? `Trial ends ${trialEndsLabel}.`
            : "Trial end date has not been recorded.",
          usage.apps.summary,
          usage.activeCreators.summary,
          "Workspace access remains soft even after trial expiry until Stripe billing ships.",
        ];

  return {
    hasWorkspaceAccess: true,
    organizationId,
    planKey: billingRow.plan_key,
    planName: plan.name,
    billingInterval: billingRow.billing_interval,
    billingIntervalLabel,
    status,
    statusLabel,
    detail,
    trialStartedAt: billingRow.trial_started_at,
    trialEndsAt: billingRow.trial_ends_at,
    trialEndsLabel,
    trialDaysRemaining,
    usage,
    notes,
  };
}
