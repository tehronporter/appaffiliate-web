import { redirect } from "next/navigation";

import { InsetPanel, SectionCard, StatusBadge } from "@/components/admin-ui";
import { SignupForm } from "@/components/auth/signup-form";
import { PublicShell } from "@/components/public-shell";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function SignupPage() {
  const user = await getAuthenticatedUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <PublicShell
      eyebrow="Sign up"
      title="Create your AppAffiliate workspace"
      description="Start with an owner account, create your workspace, and move straight into activation."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InsetPanel tone="primary">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Owner self-serve
                </p>
                <StatusBadge tone="primary">Launch path</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Create the first owner account, bootstrap the workspace, and land directly in activation.
              </p>
            </InsetPanel>

            <InsetPanel tone="success">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Invite teammates later
                </p>
                <StatusBadge tone="success">Built in</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Once the workspace exists, invite internal teammates and creators from the product.
              </p>
            </InsetPanel>
          </div>

          <SectionCard
            tone="public-access"
            title="What gets created"
            description="The launch-ready path now provisions the real starting records instead of sending new teams into manual setup."
            items={[
              "Your auth account is created and confirmed.",
              "A new organization and active owner membership are bootstrapped automatically.",
              "You land in activation so the first app, creator, and tracking asset can be created in-product.",
            ]}
          />
        </div>

        <SignupForm />
      </div>
    </PublicShell>
  );
}
