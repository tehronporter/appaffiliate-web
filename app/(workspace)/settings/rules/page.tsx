import { ActionLink } from "@/components/app-shell";
import {
  EmptyState,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import { getRulesSettingsData } from "@/lib/services/settings";

export default async function SettingsRulesPage() {
  const data = await getRulesSettingsData();

  return (
    <SettingsPageFrame
      activeSection="rules"
      title="Rules settings"
      description="Use this page as a read model for the live attribution and finance posture: current queue pressure, stored commission rules, code ownership coverage, and app-level Apple ingest readiness."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/unattributed">Open unattributed</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Live rule context</StatusBadge>
          <StatusBadge tone="warning">Read-only product posture</StatusBadge>
          <StatusBadge>Apple readiness visible</StatusBadge>
        </div>
      }
      stats={[
        {
          label: "Active rules",
          value: String(data.activeRuleCount),
          detail: "Stored commission rules are read directly from the workspace tables.",
          tone: "success",
        },
        {
          label: "Queue open",
          value: String(data.unresolvedQueueCount),
          detail: "Manual attribution review still acts as the conservative backstop for ambiguous events.",
          tone: "warning",
        },
        {
          label: "Active currencies",
          value: data.currencies.length ? data.currencies.join(", ") : "None",
          detail: "Finance defaults come from active rule definitions instead of fake global settings.",
          tone: "primary",
        },
      ]}
    >
      {!data.hasWorkspaceAccess ? (
        <SectionCard
          title="Internal workspace access required"
          description="Rules and review posture remain internal-only because they expose attribution and finance context."
        >
          <EmptyState
            eyebrow="Access required"
            title="No internal rule context is available"
            description="Sign in with an internal workspace role to inspect attribution and finance posture."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Attribution review posture"
            description="Keep the operational context readable before anyone touches manual attribution."
            items={[
              `Unresolved queue items: ${data.unresolvedQueueCount}.`,
              `Items already in review: ${data.inReviewQueueCount}.`,
              `Active partner-owned codes: ${data.activeOwnedCodeCount}.`,
              `Active codes without a partner owner: ${data.activeUnassignedCodeCount}.`,
            ]}
          />

          <SectionCard
            title="Read-only rule boundary"
            description="The current product exposes the stored configuration context here without inventing a new rule-builder surface."
            items={data.readOnlyNotes}
          />

          <SectionCard
            title="Commission rules in storage"
            description="These are the live stored rule definitions the finance review helpers already reference."
          >
            <div className="space-y-3">
              {data.commissionRules.length === 0 ? (
                <EmptyState
                  eyebrow="No stored rules"
                  title="No commission rules are configured yet"
                  description="The commission review flow still stays operational without a broad rule builder by keeping approval manual."
                />
              ) : null}

              {data.commissionRules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{rule.name}</p>
                      <p className="mt-1 text-sm text-ink-muted">{rule.scopeLabel}</p>
                    </div>
                    <StatusBadge tone={rule.status === "Active" ? "success" : "warning"}>
                      {rule.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">
                    {rule.payoutLabel} • Updated {new Date(rule.updatedAt).toLocaleDateString("en-US")}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Apple ingestion readiness"
            description="Operators can confirm which app lanes are ready to receive and process Apple notifications without opening a separate admin IA."
          >
            <div className="space-y-3">
              {data.appleReadiness.length === 0 ? (
                <EmptyState
                  eyebrow="No apps"
                  title="No apps are available for readiness review"
                  description="Create the app records before expecting Apple ingest posture or rule scoping to appear."
                />
              ) : null}

              {data.appleReadiness.map((app) => (
                <div
                  key={app.id}
                  className="rounded-2xl border border-border bg-surface px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{app.appName}</p>
                      <p className="mt-1 text-sm text-ink-muted">{app.healthLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={app.ingestReady ? "success" : "warning"}>
                        {app.ingestReady ? "Ingest key assigned" : "Ingest key missing"}
                      </StatusBadge>
                      <ActionLink href={`/apps/${app.slug}/apple-health`}>
                        Open app health
                      </ActionLink>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">
                    {app.latestReceiptAt
                      ? `Latest receipt seen ${new Date(app.latestReceiptAt).toLocaleString("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "UTC",
                        })} UTC.`
                      : "No Apple receipts have been stored for this app yet."}
                  </p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </SettingsPageFrame>
  );
}
