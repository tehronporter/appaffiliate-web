import Link from "next/link";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailPanel,
  EmptyState,
  FilterBar,
  FilterChipLink,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  type StatusTone,
} from "@/components/admin-ui";

type PartnerStatus = "active" | "paused" | "archived";
type PartnerScope = "all" | "apple-health" | "always-on" | "launch";

type PartnersPageProps = {
  searchParams: Promise<{
    status?: string;
    scope?: string;
    partner?: string;
  }>;
};

const partnerRows = [
  {
    slug: "northstar-fitness",
    name: "Northstar Fitness",
    owner: "Emma Chen",
    focus: "Creator-led launches across two subscription apps.",
    scope: "launch" as PartnerScope,
    coverage: "iOS + Android",
    status: "active" as PartnerStatus,
    assignedCodes: 6,
    apps: ["Northstar Coach", "Northstar Nutrition"],
    payoutReadiness: "Banking verified",
    healthNote: "General wellness campaigns only",
    internalNote: "Primary launch partner for Q2 creator pushes.",
  },
  {
    slug: "motion-daily",
    name: "Motion Daily",
    owner: "Leo Alvarez",
    focus: "Health integrations and Apple Health pilot readiness.",
    scope: "apple-health" as PartnerScope,
    coverage: "Apple Health pilots",
    status: "paused" as PartnerStatus,
    assignedCodes: 3,
    apps: ["Motion Daily"],
    payoutReadiness: "Needs payout setup",
    healthNote: "Awaiting final Apple Health launch checklist.",
    internalNote: "Keep paused until notification routing is finalized.",
  },
  {
    slug: "studio-meridian",
    name: "Studio Meridian",
    owner: "Rina Solis",
    focus: "Always-on partner coverage for evergreen code usage.",
    scope: "always-on" as PartnerScope,
    coverage: "Referral code growth",
    status: "active" as PartnerStatus,
    assignedCodes: 9,
    apps: ["Meridian Studio"],
    payoutReadiness: "Monthly payout review",
    healthNote: "No Apple Health dependency",
    internalNote: "Strong code ownership discipline and low cleanup load.",
  },
  {
    slug: "atlas-run-club",
    name: "Atlas Run Club",
    owner: "Mara James",
    focus: "Seasonal ambassador program that is currently archived.",
    scope: "launch" as PartnerScope,
    coverage: "Event-based promos",
    status: "archived" as PartnerStatus,
    assignedCodes: 2,
    apps: ["Atlas Run"],
    payoutReadiness: "Closed out",
    healthNote: "Campaign ended after spring challenge",
    internalNote: "Keep historical ownership visible for attribution backfill.",
  },
];

function statusTone(status: PartnerStatus): StatusTone {
  if (status === "active") {
    return "success";
  }

  if (status === "paused") {
    return "warning";
  }

  return "danger";
}

function statusLabel(status: PartnerStatus) {
  if (status === "active") {
    return "Active";
  }

  if (status === "paused") {
    return "Paused";
  }

  return "Archived";
}

function buildHref(params: {
  status: string;
  scope: string;
  partner?: string;
}) {
  const search = new URLSearchParams();

  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.scope && params.scope !== "all") {
    search.set("scope", params.scope);
  }

  if (params.partner) {
    search.set("partner", params.partner);
  }

  const query = search.toString();

  return query ? `/partners?${query}` : "/partners";
}

export default async function PartnersPage({
  searchParams,
}: PartnersPageProps) {
  const { status = "all", scope = "all", partner: selectedPartnerSlug } =
    await searchParams;

  const filteredPartners = partnerRows.filter((partner) => {
    const matchesStatus = status === "all" || partner.status === status;
    const matchesScope = scope === "all" || partner.scope === scope;

    return matchesStatus && matchesScope;
  });

  const selectedPartner =
    filteredPartners.find((partner) => partner.slug === selectedPartnerSlug) ??
    filteredPartners[0] ??
    null;

  const activeCount = partnerRows.filter((partner) => partner.status === "active").length;
  const pausedCount = partnerRows.filter((partner) => partner.status === "paused").length;
  const archivedCount = partnerRows.filter(
    (partner) => partner.status === "archived",
  ).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Partners"
        description="Manage partner relationships as an operational source of truth: who owns coverage, which codes are assigned, what is active or paused, and what still needs operator attention."
        actions={
          <>
            <ActionLink href="/dashboard">Back to overview</ActionLink>
            <ActionLink href="/codes" variant="primary">
              Review codes
            </ActionLink>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active partners"
          value={String(activeCount)}
          detail="Live partners should stay reviewable at a glance, with clear owners and current program focus."
          tone="success"
        />
        <StatCard
          label="Paused"
          value={String(pausedCount)}
          detail="Paused partners remain visible so operators can see why a relationship is held back."
          tone="warning"
        />
        <StatCard
          label="Archived"
          value={String(archivedCount)}
          detail="Archived partners still matter for attribution history and cleanup review."
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Narrow by lifecycle or program scope without leaving the list-and-detail review flow."
          >
            <FilterChipLink
              href={buildHref({ status: "all", scope, partner: selectedPartner?.slug })}
              active={status === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status: "active",
                scope,
                partner: selectedPartner?.slug,
              })}
              active={status === "active"}
            >
              Active
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status: "paused",
                scope,
                partner: selectedPartner?.slug,
              })}
              active={status === "paused"}
            >
              Paused
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status: "archived",
                scope,
                partner: selectedPartner?.slug,
              })}
              active={status === "archived"}
            >
              Archived
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status, scope: "all", partner: selectedPartner?.slug })}
              active={scope === "all"}
            >
              All programs
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status,
                scope: "apple-health",
                partner: selectedPartner?.slug,
              })}
              active={scope === "apple-health"}
            >
              Apple Health
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status,
                scope: "always-on",
                partner: selectedPartner?.slug,
              })}
              active={scope === "always-on"}
            >
              Always-on
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status,
                scope: "launch",
                partner: selectedPartner?.slug,
              })}
              active={scope === "launch"}
            >
              Launch
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Directory"
            title="Operational partner review"
            description="Use the list as the source of truth for lifecycle state, code ownership coverage, and who is responsible for the relationship."
          >
            <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_90px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Partner</span>
              <span>Owner</span>
              <span>Codes</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredPartners.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow="No matches"
                    title="No partners match these filters"
                    description="Clear one of the sticky filters to return to the broader directory view."
                    action={
                      <ActionLink href="/partners" variant="primary">
                        Reset filters
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredPartners.map((partner) => {
                const isSelected = partner.slug === selectedPartner?.slug;

                return (
                  <Link
                    key={partner.slug}
                    href={buildHref({ status, scope, partner: partner.slug })}
                    className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_90px_auto] md:items-center ${
                      isSelected
                        ? "bg-primary-soft/40"
                        : "hover:bg-surface"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-ink">
                          {partner.name}
                        </h3>
                        <StatusBadge>{partner.coverage}</StatusBadge>
                      </div>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        {partner.focus}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink">{partner.owner}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {partner.apps.join(", ")}
                      </p>
                    </div>

                    <div className="text-sm font-semibold text-ink">
                      {partner.assignedCodes}
                    </div>

                    <div className="flex justify-start md:justify-end">
                      <StatusBadge tone={statusTone(partner.status)}>
                        {statusLabel(partner.status)}
                      </StatusBadge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ListTable>
        </div>

        {selectedPartner ? (
          <DetailPanel
            eyebrow="Detail inspection"
            title={selectedPartner.name}
            description={selectedPartner.focus}
            status={
              <StatusBadge tone={statusTone(selectedPartner.status)}>
                {statusLabel(selectedPartner.status)}
              </StatusBadge>
            }
          >
            <SectionCard
              title="Relationship overview"
              description="Keep the right-hand panel focused on the facts an operator needs during review."
              items={[
                `Internal owner: ${selectedPartner.owner}.`,
                `Assigned codes: ${selectedPartner.assignedCodes}.`,
                `Coverage: ${selectedPartner.coverage}.`,
                `Payout readiness: ${selectedPartner.payoutReadiness}.`,
              ]}
            />

            <SectionCard
              title="App and launch context"
              description="Use this area to understand how the partner fits into app setup and attribution coverage."
              items={[
                `Apps covered: ${selectedPartner.apps.join(", ")}.`,
                `Apple Health note: ${selectedPartner.healthNote}.`,
                `Internal note: ${selectedPartner.internalNote}.`,
              ]}
            />

            <SectionCard
              title="Next operator actions"
              description="Keep the path shallow so review work does not sprawl into disconnected edit pages."
              actions={
                <>
                  <ActionLink href="/codes">Open codes</ActionLink>
                  <ActionLink href="/commissions" variant="primary">
                    Review commissions
                  </ActionLink>
                </>
              }
              items={[
                "Confirm code coverage and lifecycle alignment.",
                "Review whether payout setup matches current partner status.",
                "Keep archived partners visible when historical attribution still matters.",
              ]}
            />
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Detail inspection"
            title="No partner selected"
            description="Adjust the sticky filters or reset the directory to inspect a partner record."
          >
            <EmptyState
              eyebrow="Empty detail panel"
              title="Nothing matches the current directory view"
              description="This detail panel will show ownership, payout readiness, and app coverage once a partner matches the selected filters."
              action={
                <ActionLink href="/partners" variant="primary">
                  Reset filters
                </ActionLink>
              }
            />
          </DetailPanel>
        )}
      </div>
    </PageContainer>
  );
}
