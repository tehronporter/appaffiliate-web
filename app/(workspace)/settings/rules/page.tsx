import { ActionLink } from "@/components/app-shell";
import { EmptyState, SectionCard } from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";

export default function SettingsRulesPage() {
  return (
    <SettingsPageFrame
      activeSection="rules"
      title="Rules settings"
      description="Keep attribution and review rules legible. This should read like operating policy for a system of record, not like a growth experiment control panel."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/unattributed">Open needs attribution</ActionLink>
        </>
      }
      stats={[
        {
          label: "Ownership order",
          value: "Codes first",
          detail: "Promo code ownership remains the clearest MVP source of truth for attribution.",
          tone: "success",
        },
        {
          label: "Custom overrides",
          value: "0",
          detail: "No persisted exceptions are wired yet, but the empty state is deliberate.",
          tone: "primary",
        },
        {
          label: "Review posture",
          value: "Conservative",
          detail: "Ambiguous records should stay visible for operator review rather than auto-resolving.",
          tone: "warning",
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Attribution precedence"
          description="Rules should stay visible in the same plain language operators already see in codes and needs-attribution."
          items={[
            "Active code ownership should outrank looser campaign signals whenever possible.",
            "Archived programs can remain match candidates, but they require explicit operator confirmation.",
            "Duplicate active code lanes should stay reviewable rather than silently breaking ties.",
          ]}
        />

        <SectionCard
          title="Exclusions and holds"
          description="Operational rules should preserve trust by showing why records are ignored, held, or escalated."
          items={[
            "Ignored events remain visible for audit and reconciliation context.",
            "Held commissions should stay in the ledger with finance-safe explanations.",
            "Export and payout steps should only see records that have passed the review boundary.",
          ]}
        />

        <SectionCard
          title="Custom overrides"
          description="Phase 1 intentionally avoids a sprawling rules builder."
        >
          <EmptyState
            eyebrow="No overrides"
            title="No custom attribution overrides are configured"
            description="The shell makes room for exceptions later without forcing policy logic into page-local copy or ad hoc forms."
            action={
              <ActionLink href="/codes" variant="primary">
                Review code ownership
              </ActionLink>
            }
          />
        </SectionCard>

        <SectionCard
          title="Phase 2 wires next"
          description="The shell is ready for persisted policy controls."
          items={[
            "Connect stored attribution precedence and exclusion settings.",
            "Record override actor, timestamp, and rationale in audit history.",
            "Feed rule changes back into needs-attribution and ledger review safely.",
          ]}
        />
      </div>
    </SettingsPageFrame>
  );
}
