import { ActionLink } from "@/components/app-shell";
import { EmptyState, SectionCard } from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";

export default function SettingsOrganizationPage() {
  return (
    <SettingsPageFrame
      activeSection="organization"
      title="Organization settings"
      description="Reserve a trustworthy home for workspace identity, operator defaults, and the internal-versus-external boundary decisions that should stay stable as the product grows."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/settings/team">Open team</ActionLink>
        </>
      }
      stats={[
        {
          label: "Workspace profile",
          value: "Scoped",
          detail: "Name, entity posture, and workspace-level defaults have a clear future home.",
          tone: "primary",
        },
        {
          label: "Notification mode",
          value: "Manual",
          detail: "Phase 1 documents operator expectations without wiring delivery settings yet.",
          tone: "warning",
        },
        {
          label: "Portal boundary",
          value: "Internal",
          detail: "Organization decisions remain admin-only and do not spill into partner views.",
          tone: "success",
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Workspace identity"
          description="Keep the core organization record calm and operational."
          items={[
            "Workspace display name and legal entity posture belong here.",
            "Default timezone, reporting assumptions, and contact channels should stay explicit.",
            "Partner-facing branding can reuse these values later without exposing admin-only controls.",
          ]}
        />

        <SectionCard
          title="Default operating posture"
          description="Document the defaults operators expect before the product starts persisting them."
          items={[
            "Health-related notifications should be reviewable before they become automatic.",
            "Export naming and retention preferences should remain controlled and audit-safe.",
            "Payout and rules boundaries should be described here, but enforced elsewhere.",
          ]}
        />

        <SectionCard
          title="Mock-only state"
          description="Phase 1 intentionally avoids live persistence on this screen."
        >
          <EmptyState
            eyebrow="No live editor"
            title="Organization profile editing lands in Phase 2"
            description="The shell exists now so real profile settings can plug in without reworking the information architecture."
            action={
              <ActionLink href="/settings/rules" variant="primary">
                Review rules boundary
              </ActionLink>
            }
          />
        </SectionCard>

        <SectionCard
          title="Phase 2 wires next"
          description="The next implementation pass can stay narrow because the shell is already stable."
          items={[
            "Connect real workspace profile reads and writes.",
            "Persist notification and export defaults with audit logging.",
            "Surface partner-facing branding values without merging partner tools into admin settings.",
          ]}
        />
      </div>
    </SettingsPageFrame>
  );
}
