import {
  ActionLink,
  PageContainer,
  PageHeader,
  SectionCard,
  StatCard,
  SurfaceCard,
} from "@/components/app-shell";

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

function statusClasses(status: string) {
  if (status === "Ready") {
    return "border-success bg-success-soft text-success";
  }

  if (status === "Needs payout setup") {
    return "border-warning bg-warning-soft text-warning";
  }

  return "border-primary bg-primary-soft text-primary";
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
        <SurfaceCard>
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
                Partner list
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
                Relationship coverage at a glance
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-6 text-ink-muted">
              This is intentionally static in Phase 1. The goal is to establish a
              readable list shape inside the shared shell.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {partnerRows.map((partner) => (
              <div
                key={partner.name}
                className="rounded-3xl border border-border bg-surface px-5 py-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-ink">
                      {partner.name}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      {partner.focus}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-medium text-ink-muted">
                      {partner.coverage}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(partner.status)}`}
                    >
                      {partner.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

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
