export const SELF_SERVE_TRIAL_DAYS = 14;

export const PLAN_KEYS = [
  "starter",
  "growth",
  "scale",
  "enterprise",
] as const;

export type PlanKey = (typeof PLAN_KEYS)[number];

export const SELF_SERVE_PLAN_KEYS = [
  "starter",
  "growth",
  "scale",
] as const;

export type SelfServePlanKey = (typeof SELF_SERVE_PLAN_KEYS)[number];

export const BILLING_INTERVALS = [
  "monthly",
  "annual",
  "custom",
] as const;

export type BillingInterval = (typeof BILLING_INTERVALS)[number];

export const SELF_SERVE_BILLING_INTERVALS = [
  "monthly",
  "annual",
] as const;

export type SelfServeBillingInterval = (typeof SELF_SERVE_BILLING_INTERVALS)[number];

export const WORKSPACE_BILLING_STATUSES = [
  "trialing",
  "trial_expired",
  "manual_contact",
] as const;

export type WorkspaceBillingStatus = (typeof WORKSPACE_BILLING_STATUSES)[number];

type PricingPlanDefinition = {
  key: PlanKey;
  name: string;
  badge?: string;
  metaLine: string;
  description: string;
  ctaLabel: string;
  ctaSupportLine: string;
  featuresIntro?: string;
  features: string[];
  priceKind: "self_serve" | "custom";
  prices: {
    monthly?: string;
    annual?: string;
  };
  annualSupportLine?: string;
  limits: {
    apps: number | null;
    activeCreators: number | null;
  };
};

export const PRICING_PLANS: readonly PricingPlanDefinition[] = [
  {
    key: "starter",
    name: "Starter",
    metaLine: "1 app · 10 active creators",
    description:
      "For founders testing creator growth without bloated software costs.",
    ctaLabel: "Start free trial",
    ctaSupportLine: "14-day free trial",
    features: [
      "1 connected app",
      "Up to 10 active creators",
      "Partner management",
      "Offer code and attribution tracking",
      "Commission tracking",
      "Payout prep and export",
      "Creator portal access",
      "Basic reporting",
      "Email support",
    ],
    priceKind: "self_serve",
    prices: {
      monthly: "$29/month",
      annual: "$290/year",
    },
    annualSupportLine: "Equivalent to $24.17/month, billed annually",
    limits: {
      apps: 1,
      activeCreators: 10,
    },
  },
  {
    key: "growth",
    name: "Growth",
    badge: "Most popular",
    metaLine: "3 apps · 50 active creators",
    description:
      "For teams turning creator promotion into a repeatable acquisition channel.",
    ctaLabel: "Start free trial",
    ctaSupportLine: "14-day free trial",
    featuresIntro: "Everything in Starter, plus:",
    features: [
      "Up to 3 connected apps",
      "Up to 50 active creators",
      "More team seats",
      "Stronger payout controls",
      "Richer exports",
      "Better program visibility",
      "Priority support",
    ],
    priceKind: "self_serve",
    prices: {
      monthly: "$79/month",
      annual: "$790/year",
    },
    annualSupportLine: "Equivalent to $65.83/month, billed annually",
    limits: {
      apps: 3,
      activeCreators: 50,
    },
  },
  {
    key: "scale",
    name: "Scale",
    metaLine: "10 apps · 200 active creators",
    description:
      "For multi-app teams running larger creator programs with more operational complexity.",
    ctaLabel: "Start free trial",
    ctaSupportLine: "14-day free trial",
    featuresIntro: "Everything in Growth, plus:",
    features: [
      "Up to 10 connected apps",
      "Up to 200 active creators",
      "Advanced exports",
      "Deeper audit visibility",
      "Advanced permissions",
      "Higher support level",
      "Optional onboarding help",
    ],
    priceKind: "self_serve",
    prices: {
      monthly: "$199/month",
      annual: "$1,990/year",
    },
    annualSupportLine: "Equivalent to $165.83/month, billed annually",
    limits: {
      apps: 10,
      activeCreators: 200,
    },
  },
  {
    key: "enterprise",
    name: "Enterprise",
    metaLine: "Custom apps · custom creator volume",
    description:
      "For larger teams needing tailored onboarding, reporting, support, or implementation help.",
    ctaLabel: "Contact us",
    ctaSupportLine: "Custom pricing for complex teams",
    featuresIntro: "Everything in Scale, plus:",
    features: [
      "Higher app limits",
      "Higher creator limits",
      "Multi-brand or multi-workspace support",
      "Tailored onboarding",
      "Custom reporting needs",
      "Dedicated support path",
      "Custom rollout planning",
    ],
    priceKind: "custom",
    prices: {},
    limits: {
      apps: null,
      activeCreators: null,
    },
  },
] as const;

export function isPlanKey(value: string | null | undefined): value is PlanKey {
  return PLAN_KEYS.some((planKey) => planKey === value);
}

export function isSelfServePlanKey(
  value: string | null | undefined,
): value is SelfServePlanKey {
  return SELF_SERVE_PLAN_KEYS.some((planKey) => planKey === value);
}

export function isBillingInterval(
  value: string | null | undefined,
): value is BillingInterval {
  return BILLING_INTERVALS.some((interval) => interval === value);
}

export function isSelfServeBillingInterval(
  value: string | null | undefined,
): value is SelfServeBillingInterval {
  return SELF_SERVE_BILLING_INTERVALS.some((interval) => interval === value);
}

export function isWorkspaceBillingStatus(
  value: string | null | undefined,
): value is WorkspaceBillingStatus {
  return WORKSPACE_BILLING_STATUSES.some((status) => status === value);
}

export function getPricingPlan(planKey: PlanKey) {
  return PRICING_PLANS.find((plan) => plan.key === planKey) ?? PRICING_PLANS[0];
}

export function getSelfServePlan(planKey: SelfServePlanKey) {
  return getPricingPlan(planKey);
}

export function getBillingIntervalLabel(interval: BillingInterval) {
  if (interval === "annual") {
    return "Annual";
  }

  if (interval === "custom") {
    return "Custom";
  }

  return "Monthly";
}

export function getPlanPriceLabel(
  planKey: PlanKey,
  billingInterval: BillingInterval,
) {
  const plan = getPricingPlan(planKey);

  if (plan.priceKind === "custom") {
    return "Custom";
  }

  return billingInterval === "annual"
    ? plan.prices.annual ?? plan.prices.monthly ?? "Custom"
    : plan.prices.monthly ?? plan.prices.annual ?? "Custom";
}

export function getPlanSelectionHref(
  planKey: SelfServePlanKey,
  billingInterval: SelfServeBillingInterval,
) {
  return `/signup?plan=${planKey}&billing=${billingInterval}`;
}
