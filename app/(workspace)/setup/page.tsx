import { CheckCircle2, ListChecks } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  ListTable,
  PageHeader,
  SectionCard,
  StatusBadge,
  SummaryBar,
} from "@/components/admin-ui";
import { getSetupGuideData } from "@/lib/setup-guide";
import { toneForLaunchStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

export default async function SetupPage() {
  const setup = await getSetupGuideData();

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Setup & launch"
        title="Setup"
        description="Keep setup persistent, visible, and reusable as apps, creators, codes, and payouts are added over time."
        actions={
          <>
            <ActionLink href={setup.nextIncompleteStep?.href ?? "/dashboard"}>
              Continue setup
            </ActionLink>
            <ActionLink href="/apps?drawer=create" variant="primary">
              Add app
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Persistent checklist</StatusBadge>
          <StatusBadge tone={toneForLaunchStatus(setup.launch.overallStatus)}>
            {setup.launch.overallLabel}
          </StatusBadge>
        </div>
      </PageHeader>

      <SummaryBar
        items={[
          {
            label: "Workspace progress",
            value: `${setup.completeCount}/${setup.totalCount} complete`,
          },
          {
            label: "Next step",
            value: setup.nextIncompleteStep?.label ?? "Setup complete",
          },
          {
            label: "Launch posture",
            value: setup.launch.overallDetail,
          },
        ]}
      />

      <SectionCard
        eyebrow="Workspace"
        title={`Workspace checklist (${setup.completeCount}/${setup.totalCount})`}
        description="These steps never disappear. Operators can return here whenever a new app, creator, or code is added."
      >
        <ListTable
          title="Checklist"
          description="Each step links to the working surface where the next action happens."
        >
          {setup.workspaceSteps.map((step) => (
            <InlineActionRow
              key={step.id}
              title={step.label}
              description={step.detail}
              badge={
                <StatusBadge tone={step.complete ? "green" : "amber"}>
                  {step.complete ? "Complete" : "Next"}
                </StatusBadge>
              }
              actions={<ActionLink href={step.href}>Open</ActionLink>}
            />
          ))}
        </ListTable>
      </SectionCard>

      <SectionCard
        eyebrow="Apps"
        title="App-specific readiness"
        description="Each app carries its own readiness, coverage, and first-result state."
      >
        {setup.appGuides.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            eyebrow="No apps yet"
            title="Add the first app to start app-specific setup"
            description="App readiness, creator coverage, and Apple health appear here as soon as the first app lane exists."
            action={
              <ActionLink href="/apps?drawer=create" variant="primary">
                Add app
              </ActionLink>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {setup.appGuides.map((app) => (
              <SectionCard
                key={app.id}
                title={`${app.appName} (${app.completeCount}/${app.totalCount})`}
                description={app.healthLabel}
                actions={<ActionLink href={app.href}>Open app</ActionLink>}
                className="shadow-none"
              >
                <div className="space-y-3">
                  {app.steps.map((step) => (
                    <div key={step.id} className="flex items-start gap-3">
                      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white">
                        <CheckCircle2
                          size={14}
                          className={step.complete ? "text-success" : "text-ink-subtle"}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-ink">{step.label}</p>
                          <StatusBadge tone={step.complete ? "green" : "amber"}>
                            {step.complete ? "Done" : "Open"}
                          </StatusBadge>
                        </div>
                        <p className="mt-1 text-sm leading-5 text-ink-muted">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            ))}
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
