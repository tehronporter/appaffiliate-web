import { redirect } from "next/navigation";

import { SectionCard, StatCard } from "@/components/app-shell";
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
      description="This is the current auth foundation: a simple email and password login backed by Supabase, with just enough server protection to support the workspace overview."
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Flow"
          value="Email"
          detail="Supabase email and password sign-in is enabled for the first protected route."
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
          value="Phase 1"
          detail="No roles, billing, org switching, or deep account management are included yet."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <LoginForm redirectTo={safeRedirectTo} />

        <div className="space-y-6">
          <SectionCard
            title="What is implemented"
            description="The auth layer is intentionally narrow and beginner-friendly."
            items={[
              "Client-side Supabase sign-in with basic loading and error handling.",
              "A small route handler keeps a server-readable auth cookie in sync.",
              "The login page redirects authenticated users away from this screen.",
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
