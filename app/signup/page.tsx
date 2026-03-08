import { redirect } from "next/navigation";

import { InsetPanel, SectionCard, StatusBadge } from "@/components/admin-ui";
import { SignupForm } from "@/components/auth/signup-form";
import { PublicShell } from "@/components/public-shell";
import { getAuthenticatedUser } from "@/lib/auth";
import {
  getBillingIntervalLabel,
  getPlanPriceLabel,
  getSelfServePlan,
  isSelfServeBillingInterval,
  isSelfServePlanKey,
  type SelfServeBillingInterval,
  type SelfServePlanKey,
} from "@/lib/pricing-catalog";

type SignupPageProps = {
  searchParams: Promise<{
    plan?: string;
    billing?: string;
  }>;
};

function normalizeSelectedPlan(value: string | undefined): SelfServePlanKey {
  return isSelfServePlanKey(value) ? value : "growth";
}

function normalizeSelectedBilling(value: string | undefined): SelfServeBillingInterval {
  return isSelfServeBillingInterval(value) ? value : "monthly";
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const selectedPlanKey = normalizeSelectedPlan(params.plan);
  const selectedBillingInterval = normalizeSelectedBilling(params.billing);
  const selectedPlan = getSelfServePlan(selectedPlanKey);
  const priceLabel = getPlanPriceLabel(selectedPlanKey, selectedBillingInterval);
  const billingLabel = getBillingIntervalLabel(selectedBillingInterval);

  return (
    <PublicShell
      eyebrow="Sign up"
      title="Create your AppAffiliate workspace"
      description="Start with an owner account, create your workspace, and begin a 14-day trial on the plan you selected."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InsetPanel tone="primary">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Plan selected
                </p>
                <StatusBadge tone="primary">Launch path</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                {selectedPlan.name} on {billingLabel.toLowerCase()} billing starts with a 14-day trial and moves straight into activation.
              </p>
            </InsetPanel>

            <InsetPanel tone="success">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  No billing setup yet
                </p>
                <StatusBadge tone="success">Built in</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                The workspace stores your plan and trial state now, while payment collection stays deferred until Stripe is added.
              </p>
            </InsetPanel>
          </div>

          <SectionCard
            tone="public-access"
            title={`${selectedPlan.name} at ${priceLabel}`}
            description="The self-serve path now provisions the workspace, owner account, and pricing state together instead of leaving billing implicit."
            items={[
              "Your auth account is created and confirmed.",
              "A new organization, active owner membership, and workspace billing record are bootstrapped automatically.",
              "A 14-day trial starts immediately and remains soft-state until Stripe billing ships.",
              "You land in activation so the first app, creator, and tracking asset can be created in-product.",
            ]}
          />
        </div>

        <SignupForm
          selectedPlanKey={selectedPlanKey}
          selectedBillingInterval={selectedBillingInterval}
        />
      </div>
    </PublicShell>
  );
}
