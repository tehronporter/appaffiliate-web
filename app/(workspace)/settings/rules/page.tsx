import { ActionLink } from "@/components/app-shell";
import {
  ActionButton,
  EmptyState,
  InsetPanel,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import {
  createCommissionRuleAction,
  updateCommissionRuleAction,
} from "@/app/(workspace)/settings/actions";
import { listWorkspaceApps } from "@/lib/services/apps";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { listWorkspacePartners } from "@/lib/services/partners";
import { listEditableCommissionRules } from "@/lib/services/rules";
import { getRulesSettingsData } from "@/lib/services/settings";
import { toneForWorkspaceLabel } from "@/lib/status-badges";

function RuleFormFields(props: {
  apps: Awaited<ReturnType<typeof listWorkspaceApps>>["apps"];
  partners: Awaited<ReturnType<typeof listWorkspacePartners>>["partners"];
  codes: Awaited<ReturnType<typeof listWorkspacePromoCodes>>["codes"];
  defaults?: {
    name?: string;
    status?: string;
    ruleType?: string;
    basisMode?: string;
    currency?: string;
    rate?: string;
    flatAmount?: string;
    priority?: string;
    appId?: string | null;
    partnerId?: string | null;
    promoCodeId?: string | null;
  };
}) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Rule name</span>
        <input
          name="name"
          type="text"
          defaultValue={props.defaults?.name ?? ""}
          className="aa-field"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Rule type</span>
          <select
            name="ruleType"
            defaultValue={props.defaults?.ruleType ?? "revenue_share"}
            className="aa-field"
          >
            <option value="revenue_share">Revenue share</option>
            <option value="flat_fee">Flat fee</option>
            <option value="cpa">CPA</option>
            <option value="hybrid">Hybrid</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Basis mode</span>
          <select
            name="basisMode"
            defaultValue={props.defaults?.basisMode ?? "gross_revenue"}
            className="aa-field"
          >
            <option value="gross_revenue">Gross revenue</option>
            <option value="net_revenue">Net revenue</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Currency</span>
          <input
            name="currency"
            type="text"
            defaultValue={props.defaults?.currency ?? "USD"}
            className="aa-field"
            required
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Priority</span>
          <input
            name="priority"
            type="number"
            defaultValue={props.defaults?.priority ?? "100"}
            className="aa-field"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Revenue-share rate</span>
          <input
            name="rate"
            type="text"
            defaultValue={props.defaults?.rate ?? ""}
            className="aa-field"
            placeholder="0.20"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Flat amount</span>
          <input
            name="flatAmount"
            type="text"
            defaultValue={props.defaults?.flatAmount ?? ""}
            className="aa-field"
            placeholder="25.00"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue={props.defaults?.status ?? "active"} className="aa-field">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">App scope</span>
          <select name="appId" defaultValue={props.defaults?.appId ?? ""} className="aa-field">
            <option value="">All apps</option>
            {props.apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Partner scope</span>
          <select
            name="partnerId"
            defaultValue={props.defaults?.partnerId ?? ""}
            className="aa-field"
          >
            <option value="">All partners</option>
            {props.partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Code scope</span>
          <select
            name="promoCodeId"
            defaultValue={props.defaults?.promoCodeId ?? ""}
            className="aa-field"
          >
            <option value="">All codes</option>
            {props.codes.map((code) => (
              <option key={code.id} value={code.id}>
                {code.code}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

export default async function SettingsRulesPage() {
  const [data, appsData, partnersData, codesData, editableRules] = await Promise.all([
    getRulesSettingsData(),
    listWorkspaceApps(),
    listWorkspacePartners(),
    listWorkspacePromoCodes(),
    listEditableCommissionRules(),
  ]);

  return (
    <SettingsPageFrame
      activeSection="rules"
      title="Rules settings"
      description="Use this page as a read model for the live attribution and finance posture: current queue pressure, stored commission rules, code ownership coverage, and app-level Apple ingest readiness."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/review?view=needs-review">Open review</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="green">Live rule context</StatusBadge>
          <StatusBadge tone="blue">Rule editing enabled</StatusBadge>
          <StatusBadge tone={toneForWorkspaceLabel()}>Apple readiness visible</StatusBadge>
        </div>
      }
      stats={[
        {
          label: "Active rules",
          value: String(data.activeRuleCount),
          detail: "Stored commission rules are read directly from the workspace tables.",
          tone: "green",
        },
        {
          label: "Queue open",
          value: String(data.unresolvedQueueCount),
          detail: "Manual attribution review still acts as the conservative backstop for ambiguous events.",
          tone: "amber",
        },
        {
          label: "Active currencies",
          value: data.currencies.length ? data.currencies.join(", ") : "None",
          detail: "Finance defaults come from active rule definitions instead of fake global settings.",
          tone: "blue",
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
            title="Create commission rule"
            description="Rules now persist here so setup does not depend on seeded database rows."
          >
            <form action={createCommissionRuleAction} className="space-y-4">
              <RuleFormFields
                apps={appsData.apps}
                partners={partnersData.partners}
                codes={codesData.codes}
              />

              <div className="flex justify-end">
                <ActionButton type="submit" variant="primary">
                  Save rule
                </ActionButton>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Rule editing posture"
            description="Keep rule scope explicit and finance-safe."
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

              {editableRules.map((rule) => (
                <InsetPanel key={rule.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{rule.name}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {rule.ruleType.replaceAll("_", " ")} • {rule.basisMode === "net_revenue" ? "Net revenue" : "Gross revenue"}
                      </p>
                    </div>
                    <StatusBadge tone={rule.status === "active" ? "green" : "gray"}>
                      {rule.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-3 text-sm text-ink-muted">
                    Updated {new Date(rule.updatedAt).toLocaleDateString("en-US")}
                  </p>

                  <form action={updateCommissionRuleAction} className="mt-4 space-y-4">
                    <input type="hidden" name="ruleId" value={rule.id} />
                    <RuleFormFields
                      apps={appsData.apps}
                      partners={partnersData.partners}
                      codes={codesData.codes}
                      defaults={{
                        name: rule.name,
                        status: rule.status,
                        ruleType: rule.ruleType,
                        basisMode: rule.basisMode,
                        currency: rule.currency,
                        rate: rule.rate === null ? "" : String(rule.rate),
                        flatAmount: rule.flatAmount === null ? "" : String(rule.flatAmount),
                        priority: String(rule.priority),
                        appId: rule.appId,
                        partnerId: rule.partnerId,
                        promoCodeId: rule.promoCodeId,
                      }}
                    />
                    <div className="flex justify-end">
                      <ActionButton type="submit">Update rule</ActionButton>
                    </div>
                  </form>
                </InsetPanel>
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
                <InsetPanel key={app.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">{app.appName}</p>
                      <p className="mt-1 text-sm text-ink-muted">{app.healthLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={app.ingestReady ? "green" : "amber"}>
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
                </InsetPanel>
              ))}
            </div>
          </SectionCard>
        </div>
      )}
    </SettingsPageFrame>
  );
}
