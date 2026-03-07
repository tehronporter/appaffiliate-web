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
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { getCurrentWorkspaceContext } from "@/lib/workspace";

function toneForStatus(status: "ready" | "attention" | "blocked" | "informational") {
  if (status === "ready") {
    return "success" as const;
  }

  if (status === "blocked") {
    return "danger" as const;
  }

  if (status === "attention") {
    return "warning" as const;
  }

  return "primary" as const;
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const [workspace, launch] = await Promise.all([
    getCurrentWorkspaceContext(),
    getLaunchReadinessData(),
  ]);
  const workspaceTitle = workspace.organization?.name ?? "No organization linked";
  const workspaceRole = workspace.role?.name ?? "No active membership";
  const workspaceSourceLabel =
    workspace.source === "database" ? "Database-backed" : "Workspace setup required";

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Operational overview"
        description="Use the dashboard as the internal launch-control summary: current workspace identity, the most important ops queues, and the next surface that needs operator attention."
        actions={
          <>
            <ActionLink href="/onboarding">Open launch checklist</ActionLink>
            <ActionLink href="/settings" variant="primary">
              Open settings
            </ActionLink>
            <SignOutButton />
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForStatus(launch.overallStatus)}>
            {launch.overallLabel}
          </StatusBadge>
          <Link
            href={launch.appleHealthHref}
            className="rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs font-medium text-primary transition hover:border-border-strong hover:bg-surface"
          >
            Review Apple readiness
          </Link>
          <StatusBadge>
            {launch.overview.financeSummary.hasFinanceAccess
              ? "Finance summary visible"
              : "Finance summary hidden for this role"}
          </StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Workspace"
          value={workspaceTitle}
          detail="The dashboard reads the current organization tied to the active membership."
          tone="primary"
        />
        <StatCard
          label="Current role"
          value={workspaceRole}
          detail="Role checks stay explicit across settings, finance, and manual review actions."
          tone="warning"
        />
        <StatCard
          label="Launch status"
          value={launch.overallLabel}
          detail={launch.overallDetail}
          tone={toneForStatus(launch.overallStatus)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <ListTable
          eyebrow="Focus areas"
          title="Current launch-readiness checks"
          description="Each row points to a live internal surface that an operator can review immediately."
        >
          {launch.checklist.slice(0, 5).map((check) => (
            <InlineActionRow
              key={check.id}
              title={check.title}
              description={check.detail}
              badge={
                <StatusBadge tone={toneForStatus(check.status)}>{check.label}</StatusBadge>
              }
              actions={<ActionLink href={check.href}>Open</ActionLink>}
            />
          ))}
        </ListTable>

        <SectionCard
          title="Current signals"
          description="Keep the most useful internal counts visible before opening deeper workflow routes."
          items={[
            `Workspace lookup: ${workspaceSourceLabel}.`,
            `Recent Apple receipts: ${launch.overview.monitoring.recentReceiptCount}.`,
            `Unattributed backlog: ${launch.overview.monitoring.queueVolume}.`,
            launch.overview.financeSummary.hasFinanceAccess
              ? `Pending finance review: ${launch.overview.financeSummary.pendingReviewCount}.`
              : "Finance-specific counts stay hidden until an owner, admin, or finance role opens the surface.",
          ]}
        />

        <SectionCard
          title="Workspace context"
          description="The access model remains simple but it is now carrying real operator state."
          items={
            workspace.organization
              ? [
                  `Organization slug: ${workspace.organization.slug}.`,
                  `Membership status: ${workspace.membership?.status ?? "unknown"}.`,
                  `Partner user profile: ${workspace.partnerUser?.partner_name ?? "not linked"}.`,
                ]
              : undefined
          }
        >
          {workspace.organization ? null : (
            <EmptyState
              eyebrow="Workspace"
              title="No organization membership yet"
              description="Attach an auth user to an organization before relying on launch-readiness checks or internal settings."
              action={<ActionLink href="/settings">Open settings</ActionLink>}
            />
          )}
        </SectionCard>

        <SectionCard
          title="Billing posture"
          description="Billing readiness stays honest and internal-only in this MVP."
          items={launch.billingReadiness.notes}
        />
      </div>
    </PageContainer>
  );
}
