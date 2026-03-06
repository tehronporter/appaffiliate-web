import Link from "next/link";
import { redirect } from "next/navigation";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui";
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
          <StatusBadge>
            Apple Health has a first-class route under Program
          </StatusBadge>
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
        <ListTable
          eyebrow="Focus areas"
          title="Keep the operator view shallow and decisive"
          description="Overview, program setup, operations, and settings are now grouped in the shell so the product story reads clearly before deeper workflow logic is added."
        >
          <InlineActionRow
            title="Needs Attribution"
            description="Keep unattributed events visible as a first-class operational queue."
            badge={<StatusBadge tone="warning">Operations</StatusBadge>}
            actions={<ActionLink href="/unattributed">Open queue</ActionLink>}
          />
          <InlineActionRow
            title="Apple Health"
            description="Preserve a first-class place for app-specific setup and support notes."
            badge={<StatusBadge tone="primary">Program</StatusBadge>}
            actions={
              <ActionLink href="/apps/demo-app/apple-health">
                Review setup
              </ActionLink>
            }
          />
        </ListTable>

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
              : undefined
          }
        >
          {workspace.organization ? null : (
            <EmptyState
              eyebrow="Workspace"
              title="No organization membership yet"
              description="Run the Phase 0 workspace migration and attach your first auth user as the demo owner. Once that exists, this dashboard can show organization-specific placeholders."
              action={<ActionLink href="/settings">Open settings</ActionLink>}
            />
          )}
        </SectionCard>
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
