import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell, SectionCard, StatCard } from "@/components/app-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  return (
    <AppShell
      currentPath="/dashboard"
      eyebrow="Overview"
      title="Dashboard placeholder"
      description="This page is now the first protected route in the app. The business content is still placeholder-level, but access is gated behind a simple Supabase auth check."
      actions={
        <>
          <Link
            href="/partners"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            View partners
          </Link>
          <SignOutButton />
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Signed in as"
          value={user.email ?? "User"}
          detail="This value comes from the verified Supabase user on the server."
        />
        <StatCard
          label="Partners"
          value="0"
          detail="No connected records yet. Real counts will come from Supabase later."
        />
        <StatCard
          label="Payouts"
          value="Draft"
          detail="Batching and approvals are still placeholder-only in Phase 0."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Protected route foundation"
          description="The page remains lightweight, but the access pattern is now in place."
          items={[
            "The server reads an auth cookie and verifies the user before rendering.",
            "Unauthenticated requests are redirected to /login.",
            "Sign out clears both the Supabase browser session and the server cookie.",
          ]}
        />
        <SectionCard
          title="Dashboard modules"
          description="The main product content can still be added gradually on top of this auth layer."
          items={[
            "Top-line partner, code, and revenue metrics.",
            "Recent attribution exceptions that need review.",
            "Quick links into onboarding and payout workflows.",
          ]}
        />
      </div>
    </AppShell>
  );
}
