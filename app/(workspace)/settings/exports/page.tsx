import { ActionLink } from "@/components/app-shell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import { listFinanceExportOverview } from "@/lib/services/finance";

export default async function SettingsExportsPage() {
  const data = await listFinanceExportOverview();

  return (
    <SettingsPageFrame
      activeSection="exports"
      title="Export settings"
      description="Keep finance exports manual, review-safe, and directly tied to real commission and payout records. Downloading a file does not imply remittance is complete."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/payout-batches">Open payout batches</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Real finance exports</StatusBadge>
          <StatusBadge tone="warning">Manual CSV handoff</StatusBadge>
          <StatusBadge>Download and payment stay separate</StatusBadge>
        </div>
      }
      stats={[
        {
          label: "Commission rows",
          value: String(data.commissionRows),
          detail: "The commission register export reflects real attributed-event review records.",
          tone: "primary",
        },
        {
          label: "Payout rows",
          value: String(data.payoutRows),
          detail: "Tracked payout rows come from real payout batches and batch items.",
          tone: "warning",
        },
        {
          label: "Tracked entries",
          value: String(data.payoutTrackedEntries),
          detail: "These rows are already inside payout tracking or marked paid.",
          tone: "success",
        },
      ]}
    >
      {!data.hasFinanceAccess ? (
        <SectionCard
          title="Finance access required"
          description="Exports are limited to owner, admin, or finance roles because they expose payout-sensitive records."
        >
          <EmptyState
            eyebrow="Access required"
            title="You do not have access to finance exports"
            description="The export surface remains internal and finance-first."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Return to overview
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <SectionCard
            title="Download finance-safe CSVs"
            description="Use narrow manual downloads instead of broad reporting exports."
            items={[
              "Commission register includes review state, basis context, and payout linkage.",
              "Payout tracking export reflects real batch, item, and payment posture.",
              "Every download is logged as an internal finance export action.",
            ]}
            actions={
              <>
                <a
                  href="/settings/exports/download?scope=commission-register"
                  className="inline-flex items-center justify-center rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                >
                  Download commission CSV
                </a>
                <a
                  href="/settings/exports/download?scope=payout-tracking"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface"
                >
                  Download payout CSV
                </a>
              </>
            }
          />

          <SectionCard
            title="Current export posture"
            description="Keep the current review and payout context visible before handing data to finance."
            items={[
              `Approved commission entries not yet batched: ${data.approvedEntries}.`,
              `Tracked payout entries: ${data.payoutTrackedEntries}.`,
              `Commission export rows available: ${data.commissionRows}.`,
              `Payout export rows available: ${data.payoutRows}.`,
            ]}
          />

          <SectionCard
            title="Recent payout batches"
            description="Recent batch context helps operators confirm what the current payout export is expected to include."
          >
            {data.recentBatches.length === 0 ? (
              <EmptyState
                eyebrow="No tracked batches"
                title="No payout batches exist yet"
                description="Create a payout batch from approved commission items before exporting payout tracking data."
                action={
                  <ActionLink href="/payouts" variant="primary">
                    Open payouts
                  </ActionLink>
                }
              />
            ) : (
              <div className="space-y-3">
                {data.recentBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="rounded-2xl border border-border bg-surface px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-ink">{batch.name}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {batch.totalAmountLabel} • {batch.status}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Operational boundary"
            description="This slice is intentionally narrow: export the records, then complete remittance outside the product."
            items={[
              "CSV download does not mark a batch paid.",
              "Exported and paid remain separate payout states.",
              "Retained file history and scheduled export jobs are intentionally not part of the current MVP.",
            ]}
          />
        </div>
      )}
    </SettingsPageFrame>
  );
}
