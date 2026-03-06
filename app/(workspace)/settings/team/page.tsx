import { ActionLink } from "@/components/app-shell";
import { EmptyState, SectionCard } from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";

export default function SettingsTeamPage() {
  return (
    <SettingsPageFrame
      activeSection="team"
      title="Team settings"
      description="Keep workspace access disciplined: who can operate attribution, who can review finance surfaces, and how invite and review posture stays auditable."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/settings/audit">Open audit</ActionLink>
        </>
      }
      stats={[
        {
          label: "Admins",
          value: "Scoped",
          detail: "The shell makes role and permission expectations explicit even before live editing exists.",
          tone: "primary",
        },
        {
          label: "Pending invites",
          value: "0",
          detail: "Empty invite states should feel intentional, not like a missing page.",
          tone: "success",
        },
        {
          label: "Review cadence",
          value: "Monthly",
          detail: "Finance and operations access should still be reviewed on a predictable rhythm.",
          tone: "warning",
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Access model"
          description="Team settings stay grounded in operational duties instead of generic user management."
          items={[
            "Operators need clear boundaries between attribution review and payout confirmation.",
            "Workspace admins should remain distinct from future read-only partner users.",
            "Invite and removal flows need audit history before they become self-serve.",
          ]}
        />

        <SectionCard
          title="Review-safe roles"
          description="Keep responsibility language consistent with the rest of the product."
          items={[
            "Attribution review should not automatically imply finance approval.",
            "Finance-safe actions like export and mark-as-paid need separate accountability.",
            "Audit access should remain readable without expanding the settings tree further.",
          ]}
        />

        <SectionCard
          title="Pending invites"
          description="Consistent empty states matter here because there may be long stretches with no changes."
        >
          <EmptyState
            eyebrow="Empty state"
            title="No pending invites are waiting for review"
            description="Phase 1 keeps the empty state visible so this route still feels like a real control surface instead of a dead end."
            action={
              <ActionLink href="/settings/organization" variant="primary">
                Review org defaults
              </ActionLink>
            }
          />
        </SectionCard>

        <SectionCard
          title="Phase 2 wires next"
          description="This route is ready for the real membership layer."
          items={[
            "Connect workspace member reads, invite issuance, and revoke actions.",
            "Add role-change confirmation with audit metadata.",
            "Preserve the separation between internal workspace roles and external partner access.",
          ]}
        />
      </div>
    </SettingsPageFrame>
  );
}
