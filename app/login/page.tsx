import { redirect } from "next/navigation";

import { InsetPanel, SectionCard, StatusBadge } from "@/components/admin-ui";
import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/public-shell";
import { getAuthenticatedUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getAuthenticatedUser();
  const { redirectTo } = await searchParams;
  const safeRedirectTo =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (user) {
    redirect(safeRedirectTo);
  }

  return (
    <PublicShell
      eyebrow="Sign in"
      title="Sign in to the right AppAffiliate surface"
      description="Already invited? Sign in to your workspace or creator portal. New teams should use request access first so the rollout path stays clear."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InsetPanel tone="primary">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Internal workspace
                </p>
                <StatusBadge tone="primary">For your team</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Founders, operators, and finance users sign in here to manage tracking, review, commissions, and payouts.
              </p>
            </InsetPanel>

            <InsetPanel tone="success">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Creator portal
                </p>
                <StatusBadge tone="success">Read-only</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Linked creators sign in here to view codes, results, approved earnings, and payout history.
              </p>
            </InsetPanel>
          </div>

          <SectionCard
            tone="public-access"
            title="What to expect after login"
            description="The sign-in flow stays simple because AppAffiliate already knows which experience your account should open."
            items={[
              "Invited internal users land in the workspace built for creator performance operations.",
              "Invited creators land in the lighter read-only portal built for earnings and payout visibility.",
              "If you tried to open a protected route first, AppAffiliate returns you there after sign-in.",
            ]}
          />

          <SectionCard
            tone="public-access"
            title="Need access first?"
            description="Use request access if you are still deciding whether AppAffiliate fits your growth model."
            items={[
              "No public signup or invite acceptance flow yet.",
              "Request access is the right path for new teams exploring the product.",
              "Use sign-in only if your account has already been invited.",
            ]}
          />
        </div>

        <LoginForm redirectTo={safeRedirectTo} />
      </div>
    </PublicShell>
  );
}
