import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  type StatusTone,
} from "@/components/admin-ui";

const partnerRows = [
  {
    name: "Northstar Fitness",
    coverage: "iOS + Android",
    focus: "Creator-led launches",
    status: "Ready",
  },
  {
    name: "Motion Daily",
    coverage: "Apple Health pilots",
    focus: "Health integrations",
    status: "Needs payout setup",
  },
  {
    name: "Studio Meridian",
    coverage: "Referral code growth",
    focus: "Always-on program",
    status: "In onboarding",
  },
];

function statusTone(status: string): StatusTone {
  if (status === "Ready") {
    return "success";
  }

  if (status === "Needs payout setup") {
    return "warning";
  }

  return "primary";
}

export default function PartnersPage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Partners"
        description="The partner directory now reads like an operational list surface instead of a generic placeholder. The rows are still static for Phase 1, but the shell and page shape are ready for real search, detail views, and payout relationships."
        actions={
          <>
            <ActionLink href="/dashboard">Back to overview</ActionLink>
            <ActionLink href="/commissions" variant="primary">
              Review commissions
            </ActionLink>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Directory"
          value="3 sample rows"
          detail="Static partner records keep the list layout concrete without adding persistence."
          tone="primary"
        />
        <StatCard
          label="Coverage"
          value="Program-wide"
          detail="The surface is ready for creators, affiliates, agencies, and app coverage."
          tone="success"
        />
        <StatCard
          label="Next layer"
          value="Search + detail"
          detail="Filtering, partner profiles, and payout settings can attach here later."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <ListTable
          eyebrow="Partner list"
          title="Relationship coverage at a glance"
          description="This is intentionally static in Phase 1. The goal is to establish a readable list shape inside the shared shell."
        >
          <div className="hidden grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
            <span>Partner</span>
            <span>Coverage</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-border bg-surface-elevated">
            {partnerRows.map((partner) => (
              <div
                key={partner.name}
                className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto] md:items-center"
              >
                <div>
                  <h3 className="text-base font-semibold text-ink">
                    {partner.name}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-ink-muted">
                    {partner.focus}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <StatusBadge>{partner.coverage}</StatusBadge>
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  <StatusBadge tone={statusTone(partner.status)}>
                    {partner.status}
                  </StatusBadge>
                </div>
              </div>
            ))}
          </div>
        </ListTable>

        <SectionCard
          title="What comes next"
          description="The route is now shaped for production-minded expansion."
          items={[
            "Add real Supabase-backed partner rows when product work reaches directory persistence.",
            "Attach code ownership, payout preferences, and app coverage to each row.",
            "Split into list and detail routes without changing the workspace shell.",
          ]}
        />
      </div>
    </PageContainer>
  );
}
