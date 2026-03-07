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
      description="Use the current AppAffiliate sign-in flow: Supabase email and password auth, a synced server cookie, and route protection for both the internal workspace and the partner portal."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Flow"
          value="Email"
          detail="Supabase email and password sign-in is the current access path for both internal and partner-linked accounts."
          tone="primary"
        />
        <StatCard
          label="Protection"
          value="Server checked"
          detail="The dashboard now redirects back here when there is no valid auth cookie."
          tone="success"
        />
        <StatCard
          label="Scope"
          value="Internal MVP"
          detail="Roles exist for both workspace and partner access, but signup, invites, billing, org switching, and deep account management still stay out of scope."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <LoginForm redirectTo={safeRedirectTo} />

        <div className="space-y-6">
          <SectionCard
            title="What is implemented"
            description="The auth layer stays intentionally narrow and predictable for internal and partner-facing access."
            items={[
              "Client-side Supabase sign-in with basic loading and error handling.",
              "A small route handler keeps a server-readable auth cookie in sync.",
              "Authenticated users are redirected back to the route they were trying to open.",
            ]}
          />
          <SectionCard
            title="What is still out of scope"
            description="The rest of the auth model can be added later without rewriting this page."
            items={[
              "No signup flow or email confirmation UI yet.",
              "No password reset, invites, or magic links yet.",
              "No deep account, billing, or profile management yet.",
            ]}
          />
        </div>
      </div>
    </PublicShell>
  );
}
