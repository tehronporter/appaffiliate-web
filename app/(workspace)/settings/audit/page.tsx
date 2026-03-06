import { ActionLink } from "@/components/app-shell";
import { EmptyState, SectionCard } from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";

export default function SettingsAuditPage() {
  return (
    <SettingsPageFrame
      activeSection="audit"
      title="Audit settings"
      description="Reserve a clean review surface for operator history, policy changes, and finance-safe confirmation trails so trust can scale with the product."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/events">Open events</ActionLink>
        </>
      }
      stats={[
        {
          label: "Trail coverage",
          value: "Planned",
          detail: "The shell defines where operator history will live before the event stream is wired.",
          tone: "primary",
        },
        {
          label: "Exceptions",
          value: "0",
          detail: "Empty exception states should remain readable and useful.",
          tone: "success",
        },
        {
          label: "Payment proofs",
          value: "Separate",
          detail: "Export and mark-as-paid confirmations should remain distinct in audit history too.",
          tone: "warning",
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Audit lanes"
          description="The trail should match the product story that already exists in Phase 1."
          items={[
            "Track operator review across events, needs attribution, commissions, and payouts.",
            "Keep settings changes visible beside operational review history, not buried elsewhere.",
            "Preserve the difference between export preparation and payment confirmation in the audit trail.",
          ]}
        />

        <SectionCard
          title="Exception review"
          description="Audit surfaces should make empty and warning states feel intentional, not neglected."
          items={[
            "Escalated attribution items should leave a visible review trail.",
            "Held commissions and archived-program matches should remain explainable after the fact.",
            "Route-level copy should stay operational and specific rather than generic or promotional.",
          ]}
        />

        <SectionCard
          title="Recent exceptions"
          description="Phase 1 keeps this view stable even when there is nothing to show yet."
        >
          <EmptyState
            eyebrow="No exceptions"
            title="No audit exceptions are surfaced in this mock window"
            description="Real activity history comes later, but the empty state is already shaped like a trustworthy review surface."
            action={
              <ActionLink href="/settings/exports" variant="primary">
                Review export boundary
              </ActionLink>
            }
          />
        </SectionCard>

        <SectionCard
          title="Phase 2 wires next"
          description="The route is ready for live history without reworking the shell."
          items={[
            "Connect actor, timestamp, and before-or-after metadata for settings and operations changes.",
            "Add audit filtering by route, action type, and review outcome.",
            "Tie payout confirmations and export actions back to the underlying batch and ledger records.",
          ]}
        />
      </div>
    </SettingsPageFrame>
  );
}
