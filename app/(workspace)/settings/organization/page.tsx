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
import { updateOrganizationSettingsAction } from "@/app/(workspace)/settings/actions";
import { getOrganizationSettingsData } from "@/lib/services/settings";

type SettingsOrganizationPageProps = {
  searchParams: Promise<{
    notice?: string;
  }>;
};

function noticeBadge(notice: string | undefined) {
  if (notice === "organization-saved") {
    return <StatusBadge tone="success">Organization settings saved</StatusBadge>;
  }

  if (notice === "organization-error") {
    return <StatusBadge tone="danger">Organization update failed</StatusBadge>;
  }

  return null;
}

export default async function SettingsOrganizationPage({
  searchParams,
}: SettingsOrganizationPageProps) {
  const { notice } = await searchParams;
  const data = await getOrganizationSettingsData();
  const noticeChip = noticeBadge(notice);

  return (
    <SettingsPageFrame
      activeSection="organization"
      title="Organization settings"
      description="Keep the organization layer narrow and trustworthy: edit the real display name, show the current ops defaults that are only derived elsewhere, and be explicit about what the current product still does not store."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/settings/team">Open team</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Live organization profile</StatusBadge>
          <StatusBadge tone={data.canManageOrganization ? "primary" : "warning"}>
            {data.canManageOrganization ? "Owner/admin edit access" : "Read-only for your role"}
          </StatusBadge>
          {noticeChip}
        </div>
      }
      stats={[
        {
          label: "Display name",
          value: data.organizationName ?? "Access required",
          detail: "This is the real organization record backing the current workspace.",
          tone: "primary",
        },
        {
          label: "Managed apps",
          value: String(data.managedAppCount),
          detail: "App-level timezone and Apple ingest posture still stay with each app rather than a global org setting.",
          tone: "success",
        },
        {
          label: "Active currencies",
          value: data.activeCurrencyLabels.length
            ? data.activeCurrencyLabels.join(", ")
            : "None",
          detail: "Finance defaults shown here are derived from active commission rules, not a fake org-level save.",
          tone: "warning",
        },
      ]}
    >
      {!data.hasWorkspaceAccess ? (
        <SectionCard
          title="Internal workspace access required"
          description="Organization settings remain part of the internal workspace."
        >
          <EmptyState
            eyebrow="Access required"
            title="No internal organization settings are available"
            description="Sign in with an internal workspace role to read or manage the organization profile."
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
            title="Workspace identity"
            description="The organization display name is live and persisted. Keep this surface intentionally smaller than app, partner, or payout setup."
          >
            <form action={updateOrganizationSettingsAction} className="space-y-4">
              <label className="grid gap-2">
                <span className="text-sm font-medium text-ink">
                  Organization display name
                </span>
                <input
                  name="displayName"
                  type="text"
                  defaultValue={data.organizationName ?? ""}
                  disabled={!data.canManageOrganization}
                  className="aa-field disabled:cursor-not-allowed disabled:opacity-70"
                />
              </label>

              <InsetPanel tone="neutral" className="text-sm text-ink-muted">
                Workspace slug: <span className="font-medium text-ink">{data.organizationSlug}</span>
              </InsetPanel>

              <div className="flex justify-end">
                <ActionButton
                  type="submit"
                  variant="primary"
                  disabled={!data.canManageOrganization}
                  className="disabled:cursor-not-allowed disabled:border-border disabled:bg-surface-muted disabled:text-ink-muted"
                >
                  Save organization settings
                </ActionButton>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Current derived defaults"
            description="These settings are real signals from other backed models, but they are not yet configurable here."
            items={[
              `App timezones currently in use: ${data.appTimezoneLabels.length ? data.appTimezoneLabels.join(", ") : "No app timezones configured yet"}.`,
              `Active finance currencies currently in use: ${data.activeCurrencyLabels.length ? data.activeCurrencyLabels.join(", ") : "No active commission rule currencies yet"}.`,
              "Operational contact details are still intentionally not modeled at the organization level, so this screen does not fake-save them.",
            ]}
          />

          <SectionCard
            title="What remains read-only"
            description="Be explicit about missing backing models rather than pretending these fields persist."
            items={data.readOnlyNotes}
          />

          <SectionCard
            title="Operator boundary"
            description="This page should clarify what belongs here versus elsewhere."
            items={[
              "Change the workspace display name here.",
              "Change app-specific timezone or Apple ingest posture from app-level product records, not from a fake global toggle.",
              "Change commission payout logic from rules and finance surfaces, not from organization copy fields.",
            ]}
          />
        </div>
      )}
    </SettingsPageFrame>
  );
}
