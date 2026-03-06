import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";

export default function PartnerPortalPage() {
  return (
    <PageContainer className="py-8 lg:py-10">
      <PageHeader
        eyebrow="Partner Portal"
        title="Read-only partner placeholder"
        description="Phase 1 reserves a clean, separate home for future partner-facing reporting and payout visibility. It stays intentionally read-only so no admin controls leak into the external workflow."
        actions={
          <>
            <ActionLink href="/login">Partner login path</ActionLink>
            <ActionLink href="/dashboard" variant="primary">
              Back to admin workspace
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="warning">Mock only in Phase 1</StatusBadge>
          <StatusBadge tone="success">Separate from admin shell</StatusBadge>
          <StatusBadge>Read-only boundary</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Access"
          value="Read-only"
          detail="Partners should eventually review their own performance without gaining admin tooling."
          tone="success"
        />
        <StatCard
          label="Data"
          value="Placeholder"
          detail="No partner-specific reporting or payout data is wired yet in Phase 1."
          tone="warning"
        />
        <StatCard
          label="Boundary"
          value="Separate"
          detail="This route uses the token system but avoids the internal workspace chrome entirely."
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-success">
            Phase 2 wires next
          </p>
          <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface">
            <InlineActionRow
              title="Partner-specific authentication"
              description="Partners need a dedicated sign-in path that does not overlap with admin roles or workspace membership."
            />
            <InlineActionRow
              title="Read-only reporting"
              description="Future portal screens can expose performance, codes, and payout visibility without exposing internal review controls."
            />
            <InlineActionRow
              title="Payout visibility"
              description="Partners should eventually see payout status and remittance history, but not finance-only export or mark-as-paid actions."
            />
          </div>
        </SurfaceCard>

        <SectionCard
          title="What stays in admin"
          description="The boundary matters more than feature volume at this phase."
          items={[
            "Needs attribution review, commission approval, and payout confirmation stay in the internal workspace.",
            "Settings, exports, and audit tools remain admin-only.",
            "Partner-facing routes can evolve later without inheriting operational language or controls.",
          ]}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard
          title="Future partner views"
          description="This placeholder already defines the intended shape of the portal."
          items={[
            "Partner summary and code ownership review.",
            "Read-only event, commission, and payout status snapshots.",
            "Notification and support links that respect the external boundary.",
          ]}
        />

        <SectionCard
          title="Current state"
          description="Read-only placeholders should still feel deliberate."
        >
          <EmptyState
            eyebrow="No partner data yet"
            title="Partner reporting lands in Phase 2"
            description="Phase 1 only establishes the route, shell, and product boundary so the portal can grow without mixing into the admin workspace."
            action={
              <ActionLink href="/settings" variant="primary">
                Review settings boundary
              </ActionLink>
            }
          />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
