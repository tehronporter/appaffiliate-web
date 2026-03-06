import { ActionLink } from "@/components/app-shell";
import { EmptyState, SectionCard } from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";

export default function SettingsExportsPage() {
  return (
    <SettingsPageFrame
      activeSection="exports"
      title="Export settings"
      description="Keep export behavior review-safe and finance-first: file handoff conventions, retention posture, and the difference between preparing data and confirming payment."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/payouts">Open payouts</ActionLink>
        </>
      }
      stats={[
        {
          label: "Export mode",
          value: "Manual",
          detail: "Phase 1 keeps exports intentionally operator-led and conservative.",
          tone: "warning",
        },
        {
          label: "Retention",
          value: "Defined",
          detail: "The shell reserves a place for file history and retention expectations.",
          tone: "primary",
        },
        {
          label: "Finance handoff",
          value: "Separate",
          detail: "Export completion still does not imply remittance or payout completion.",
          tone: "success",
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Export conventions"
          description="Operators need a stable place to document how payout exports should look before jobs are automated."
          items={[
            "File naming, period labels, and batch identifiers belong here.",
            "Exports should reflect reviewed commission states only.",
            "CSV handoff and downstream payment confirmation remain separate operational steps.",
          ]}
        />

        <SectionCard
          title="Retention and review"
          description="Export history should stay auditable without turning this surface into a generic file browser."
          items={[
            "Retained exports need timestamps, actor context, and batch linkage.",
            "Re-export behavior should remain explicit when finance asks for a correction.",
            "Readability matters more than volume because operators are checking trust boundaries here.",
          ]}
        />

        <SectionCard
          title="Scheduled exports"
          description="Empty-state treatment matters until real export jobs exist."
        >
          <EmptyState
            eyebrow="No schedules"
            title="No export automation is configured yet"
            description="Phase 1 keeps exports manual and review-safe. Phase 2 can add scheduled jobs without changing the route structure."
            action={
              <ActionLink href="/commissions" variant="primary">
                Review commission ledger
              </ActionLink>
            }
          />
        </SectionCard>

        <SectionCard
          title="Phase 2 wires next"
          description="This route is ready for real export infrastructure."
          items={[
            "Connect retained export history and downloadable files.",
            "Add export confirmation records and error reporting.",
            "Keep payout mark-as-paid controls separate even after export jobs exist.",
          ]}
        />
      </div>
    </SettingsPageFrame>
  );
}
