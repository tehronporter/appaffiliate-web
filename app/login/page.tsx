import { redirect } from "next/navigation";

import { SectionCard, StatCard } from "@/components/admin-ui";
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
      eyebrow="Access"
      title="Sign in to AppAffiliate"
      description="Invited internal users and linked partners use the same sign-in page. After sign-in, AppAffiliate routes each account into the right workspace or portal."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Flow"
          value="Invited access"
          detail="Sign-in is available for existing internal and partner-linked accounts only."
          tone="primary"
        />
        <StatCard
          label="Protection"
          value="Server checked"
          detail="Protected routes redirect back here when there is no valid session."
          tone="success"
        />
        <StatCard
          label="Scope"
          value="Separate surfaces"
          detail="Internal workspace access and partner portal access stay distinct even though they share one sign-in page."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <LoginForm redirectTo={safeRedirectTo} />

        <div className="space-y-6">
          <SectionCard
            title="What to expect"
            description="The access flow stays intentionally narrow and predictable."
            items={[
              "Sign in with the invited email and password already provisioned for your account.",
              "A synced server-side session keeps protected routes readable after login.",
              "After sign-in, AppAffiliate sends you back to the route you were trying to open.",
            ]}
          />
          <SectionCard
            title="Not yet available"
            description="Access is still rollout-led rather than self-serve."
            items={[
              "No public signup or self-serve invite acceptance yet.",
              "No password reset, invites, or magic links yet.",
              "No deep account, billing, or profile management yet.",
            ]}
          />
        </div>
      </div>
    </PublicShell>
  );
}
