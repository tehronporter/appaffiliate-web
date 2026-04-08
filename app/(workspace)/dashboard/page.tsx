import Link from "next/link";
import { redirect } from "next/navigation";
import { AppWindow, Code2, ReceiptText, Users } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  InlineActionRow,
  InsetPanel,
  ListTable,
  PageHeader,
  QuickActionTile,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui";
import { getAuthenticatedUser } from "@/lib/auth";
import { listUnattributedItems } from "@/lib/services/attribution";
import { listWorkspaceNormalizedEvents } from "@/lib/services/apple-read-model";
import { listWorkspaceApps } from "@/lib/services/apps";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { listCommissionItems } from "@/lib/services/finance";
import { listWorkspacePartners } from "@/lib/services/partners";
import { getSetupGuideData } from "@/lib/setup-guide";
import { toneForLaunchStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

function formatRelativeTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffMinutes = Math.round((date.getTime() - Date.now()) / (1000 * 60));
  const formatter = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" });

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, "hour");
  }

  return formatter.format(Math.round(diffHours / 24), "day");
}

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/dashboard");
  }

  const [setup, appsData, creatorsData, codesData, eventsData, unattributedData, commissions] =
    await Promise.all([
      getSetupGuideData(),
      listWorkspaceApps(),
      listWorkspacePartners(),
      listWorkspacePromoCodes(),
      listWorkspaceNormalizedEvents(),
      listUnattributedItems(),
      listCommissionItems(),
    ]);

  const financeReadyCount = commissions.items.filter(
    (item) =>
      item.reviewState === "approved" ||
      item.reviewState === "payout_ready" ||
      item.reviewState === "paid",
  ).length;
  const openPriorities = setup.launch.checklist.filter(
    (check) => check.status === "blocked" || check.status === "attention",
  );
  const primaryActions = [
    {
      href: "/apps?drawer=create",
      title: "Add app",
      description: "Create the next app lane and move it into readiness review.",
      icon: <AppWindow size={18} strokeWidth={1.8} />,
    },
    {
      href: "/creators?drawer=create",
      title: "Add creator",
      description: "Create a creator record and optionally send the invite immediately.",
      icon: <Users size={18} strokeWidth={1.8} />,
    },
    {
      href: "/codes?drawer=create",
      title: "Create code",
      description: "Add the next creator-linked code so attribution can resolve ownership.",
      icon: <Code2 size={18} strokeWidth={1.8} />,
    },
    {
      href: "/review?view=needs-review",
      title: "Review results",
      description: "Resolve ownership decisions and inspect tracked results in one place.",
      icon: <ReceiptText size={18} strokeWidth={1.8} />,
    },
  ];
  const recentActivity = [
    ...eventsData.events.slice(0, 3).map((event) => ({
      id: `event-${event.id}`,
      title: `${event.eventType.replaceAll("_", " ")} on ${event.appName}`,
      detail: `${event.state} • ${formatRelativeTime(event.receivedAt ?? event.occurredAt)}`,
      href: `/review?view=all&event=${event.id}`,
    })),
    ...creatorsData.partners.slice(0, 2).map((creator) => ({
      id: `creator-${creator.id}`,
      title: `Creator ${creator.name} updated`,
      detail: `${creator.status} • ${formatRelativeTime(creator.updatedAt)}`,
      href: `/creators/${creator.slug}`,
    })),
  ].slice(0, 5);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description="Lead with setup, active priorities, and the next operator action."
        actions={
          <>
            <ActionLink href={setup.nextIncompleteStep?.href ?? "/review?view=needs-review"}>
              {setup.nextIncompleteStep ? "Continue setup" : "Open review"}
            </ActionLink>
            <ActionLink href="/review?view=needs-review" variant="primary">
              Review queue
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Workspace home</StatusBadge>
          <StatusBadge tone={toneForLaunchStatus(setup.launch.overallStatus)}>
            {setup.launch.overallLabel}
          </StatusBadge>
        </div>
      </PageHeader>

      <SectionCard
        eyebrow="Setup"
        title={`Setup progress (${setup.completeCount}/${setup.totalCount})`}
        description={
          setup.nextIncompleteStep
            ? `${setup.nextIncompleteStep.label} is the next best step for this workspace.`
            : "Core workspace setup is complete. Keep using Apps, Creators, Codes, and Review as the program grows."
        }
        actions={
          <ActionLink href={setup.nextIncompleteStep?.href ?? "/setup"} variant="primary">
            {setup.nextIncompleteStep ? "Continue setup" : "Open setup"}
          </ActionLink>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {setup.workspaceSteps.map((step) => (
            <InsetPanel key={step.id} tone={step.complete ? "green" : "amber"}>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-ink">{step.label}</p>
                <StatusBadge tone={step.complete ? "green" : "amber"}>
                  {step.complete ? "Complete" : "Next"}
                </StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-5 text-ink-muted">{step.detail}</p>
              <div className="mt-3">
                <ActionLink href={step.href}>Open</ActionLink>
              </div>
            </InsetPanel>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Priorities"
        title="Critical alerts"
        description="The most urgent issues should sit above generic status cards."
      >
        {openPriorities.length === 0 ? (
          <InsetPanel tone="green">
            <p className="text-sm font-semibold text-ink">No active priorities</p>
            <p className="mt-2 text-sm leading-5 text-ink-muted">
              Setup, review, and payout posture are calm for the current workspace view.
            </p>
          </InsetPanel>
        ) : (
          <div className="space-y-3">
            {openPriorities.slice(0, 3).map((priority) => (
              <InlineActionRow
                key={priority.id}
                title={priority.title}
                description={priority.detail}
                badge={<StatusBadge tone={priority.status === "blocked" ? "red" : "amber"}>{priority.label}</StatusBadge>}
                actions={<ActionLink href={priority.href}>Open</ActionLink>}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          <SectionCard
            eyebrow="Actions"
            title="Primary actions"
            description="Give operators a clear set of top-level jobs instead of forcing them to infer the flow from metrics."
          >
            <div className="grid gap-3 md:grid-cols-2">
              {primaryActions.map((action) => (
                <QuickActionTile
                  key={action.href}
                  href={action.href}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                />
              ))}
            </div>
          </SectionCard>

          <section className="aa-stat-grid">
            <StatCard
              label="Apps"
              value={String(appsData.apps.length)}
              detail={`${appsData.apps.filter((app) => app.status === "active").length} active app lanes.`}
              tone="blue"
            />
            <StatCard
              label="Creators"
              value={String(creatorsData.partners.length)}
              detail={`${creatorsData.stats.active} active creator records.`}
              tone="green"
            />
            <StatCard
              label="Codes"
              value={String(codesData.codes.length)}
              detail={`${codesData.codes.filter((code) => code.ownerAssigned).length} linked ownership signals.`}
              tone={codesData.codes.some((code) => !code.ownerAssigned) ? "amber" : "green"}
            />
            <StatCard
              label="Results"
              value={String(eventsData.events.length)}
              detail={`${unattributedData.stats.unresolved} currently need review.`}
              tone={unattributedData.stats.unresolved > 0 ? "amber" : "blue"}
            />
          </section>

          <ListTable
            eyebrow="Attention"
            title="Attention queue"
            description="Group the work that still needs action in one scanning surface."
          >
            <InlineActionRow
              title="Needs review"
              description={
                unattributedData.stats.unresolved > 0
                  ? `${unattributedData.stats.unresolved} result decisions are open.`
                  : "No result is currently waiting for an owner decision."
              }
              badge={
                <StatusBadge tone={unattributedData.stats.unresolved > 0 ? "amber" : "green"}>
                  {unattributedData.stats.unresolved > 0 ? "Open" : "Clear"}
                </StatusBadge>
              }
              actions={<ActionLink href="/review?view=needs-review">Review</ActionLink>}
            />
            <InlineActionRow
              title="Codes without owners"
              description={
                codesData.codes.some((code) => !code.ownerAssigned)
                  ? `${codesData.codes.filter((code) => !code.ownerAssigned).length} codes still need a creator owner.`
                  : "All active codes are linked to creators."
              }
              badge={
                <StatusBadge tone={codesData.codes.some((code) => !code.ownerAssigned) ? "amber" : "green"}>
                  {codesData.codes.filter((code) => !code.ownerAssigned).length}
                </StatusBadge>
              }
              actions={<ActionLink href="/codes">Open codes</ActionLink>}
            />
            <InlineActionRow
              title="Finance follow-up"
              description={
                commissions.hasFinanceAccess
                  ? `${financeReadyCount} earning rows are approved, payout-ready, or already paid.`
                  : "Finance details are hidden for this role."
              }
              badge={
                <StatusBadge tone={commissions.hasFinanceAccess ? "blue" : "gray"}>
                  {commissions.hasFinanceAccess ? "Visible" : "Role-limited"}
                </StatusBadge>
              }
              actions={<ActionLink href="/payouts">Open payouts</ActionLink>}
            />
          </ListTable>

          <ListTable
            eyebrow="Recent activity"
            title="Latest activity"
            description="Keep the most recent result and creator changes easy to scan."
          >
            {recentActivity.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="Recent activity will appear here"
                  description="As soon as creators, codes, or tracked results change, this panel becomes the fastest way to catch up."
                />
              </div>
            ) : (
              recentActivity.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center justify-between gap-3 border-b border-[var(--aa-shell-border)] px-4 py-3 last:border-b-0 hover:bg-[var(--aa-shell-panel-muted)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-1 text-sm text-ink-muted">{item.detail}</p>
                  </div>
                  <p className="text-sm font-semibold text-primary">Open</p>
                </Link>
              ))
            )}
          </ListTable>
        </div>

        <div className="space-y-5">
          <SectionCard
            eyebrow="Finance"
            title="Plan and payout posture"
            description="Finance remains secondary on the dashboard, but should still be readable."
          >
            <DetailList
              columns={1}
              items={[
                {
                  label: "Plan state",
                  value: setup.launch.billingSummary.statusLabel,
                },
                {
                  label: "Billing detail",
                  value: setup.launch.billingSummary.detail,
                },
                {
                  label: "Finance access",
                  value: commissions.hasFinanceAccess ? "Visible for this role" : "Read-only summary",
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            eyebrow="At a glance"
            title="Program snapshot"
            description="Read-only summaries for operators who want a quick pulse before drilling in."
          >
            <DetailList
              columns={1}
              items={[
                {
                  label: "Apps with ingest ready",
                  value: `${setup.appGuides.filter((app) => app.ingestReady).length}/${setup.appGuides.length || 0}`,
                },
                {
                  label: "Creators needing setup",
                  value: String(creatorsData.partners.filter((creator) => creator.assignedCodes === 0).length),
                },
                {
                  label: "Approved earning rows",
                  value: commissions.hasFinanceAccess ? String(financeReadyCount) : "Finance-only",
                },
              ]}
            />
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
