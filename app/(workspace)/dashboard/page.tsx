import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ActionLink,
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  SurfaceCard,
  SurfaceList,
} from "@/components/app-shell";
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
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Operational overview"
        description="The first protected workspace route now sits inside a shared admin shell. The business data is still intentionally light, but the navigation, layout, and extension points are ready for Phase 1 product work."
        actions={
          <>
            <ActionLink href="/unattributed">Needs attribution</ActionLink>
            <ActionLink href="/partners" variant="primary">
              View partners
            </ActionLink>
            <SignOutButton />
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted">
            Apple Health has a first-class route under Program
          </span>
          <Link
            href="/apps/demo-app/apple-health"
            className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-primary transition hover:border-border-strong hover:bg-surface"
          >
            Open Apple Health
          </Link>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Signed in as"
          value={user.email ?? "User"}
          detail="This value comes from the verified Supabase user on the server."
          tone="primary"
        />
        <StatCard
          label="Workspace"
          value={workspaceTitle}
          detail="The dashboard now looks for the current organization tied to your membership."
          tone="success"
        />
        <StatCard
          label="Current role"
          value={workspaceRole}
          detail="Roles are part of the new Phase 0 organization foundation."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Focus areas
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            Keep the operator view shallow and decisive
          </h2>
          <p className="mt-3 text-sm leading-6 text-ink-muted">
            Overview, program setup, operations, and settings are now grouped in
            the shell so the product story reads clearly before deeper workflow
            logic is added.
          </p>

          <SurfaceList className="mt-5">
            <li className="rounded-2xl border border-border bg-surface px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Needs Attribution
                  </p>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">
                    Keep unattributed events visible as a first-class operational
                    queue.
                  </p>
                </div>
                <ActionLink href="/unattributed">Open queue</ActionLink>
              </div>
            </li>
            <li className="rounded-2xl border border-border bg-surface px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Apple Health</p>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">
                    Preserve a first-class place for app-specific setup and
                    support notes.
                  </p>
                </div>
                <ActionLink href="/apps/demo-app/apple-health">
                  Review setup
                </ActionLink>
              </div>
            </li>
          </SurfaceList>
        </SurfaceCard>

        <SectionCard
          title="Protected route foundation"
          description="The page remains lightweight, but the access and workspace pattern are already carrying real structure."
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
    </PageContainer>
  );
}
