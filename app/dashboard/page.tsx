import Link from "next/link";
import { redirect } from "next/navigation";

import { AppShell, SectionCard, StatCard } from "@/components/app-shell";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getAuthenticatedUser } from "@/lib/auth";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const workspace = await getCurrentWorkspaceContext();
  const workspaceTitle = workspace.organization?.name ?? "No organization linked";
  const workspaceRole = workspace.role?.name ?? "No active membership";
  const workspaceSourceLabel =
    workspace.source === "database" ? "Database-backed" : "Phase 0 setup pending";

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
          label="Workspace"
          value={workspaceTitle}
          detail="The dashboard now looks for the current organization tied to your membership."
        />
        <StatCard
          label="Current role"
          value={workspaceRole}
          detail="Roles are part of the new Phase 0 organization foundation."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Protected route foundation"
          description="The page remains lightweight, but the access and workspace pattern are now in place."
          items={[
            "The server reads an auth cookie and verifies the user before rendering.",
            "Unauthenticated requests are redirected to /login.",
            "Sign out clears both the Supabase browser session and the server cookie.",
            `Workspace lookup: ${workspaceSourceLabel}.`,
          ]}
        />
        <SectionCard
          title="Organization-aware placeholder"
          description="This section reflects the Phase 0 workspace structure without adding real business logic yet."
          items={
            workspace.organization
              ? [
                  `Organization slug: ${workspace.organization.slug}.`,
                  `Membership status: ${workspace.membership?.status ?? "unknown"}.`,
                  `Partner user profile: ${workspace.partnerUser?.partner_name ?? "not linked yet"}.`,
                ]
              : [
                  "No organization membership was found for this user yet.",
                  "Run the Phase 0 workspace migration and attach your first auth user as the demo owner.",
                  "Once that exists, this dashboard can show organization-specific placeholders.",
                ]
          }
        />
        <SectionCard
          title="Supported Phase 0 roles"
          description="These are the roles the workspace foundation is prepared to recognize."
          items={workspace.roles.map(
            (role) => `${role.name}: ${role.description}`,
          )}
        />
      </div>
    </AppShell>
  );
}
