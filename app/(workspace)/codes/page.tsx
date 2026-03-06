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
  SurfaceCard,
  type StatusTone,
} from "@/components/admin-ui";

type CodeStatus = "active" | "paused" | "archived";

type CodesPageProps = {
  searchParams: Promise<{
    status?: string;
    ownership?: string;
    code?: string;
  }>;
};

const codeRows = [
  {
    slug: "northstar-20",
    code: "NORTHSTAR20",
    owner: "Northstar Fitness",
    ownerAssigned: true,
    app: "Northstar Coach",
    channel: "Creator launch",
    status: "active" as CodeStatus,
    shareLink: "appaffiliate.app/northstar20",
    qrStatus: "Ready",
    duplicateActive: false,
    note: "Primary creator code for iOS launch traffic.",
  },
  {
    slug: "motion-health",
    code: "MOTIONHEALTH",
    owner: "Motion Daily",
    ownerAssigned: true,
    app: "Motion Daily",
    channel: "Apple Health pilot",
    status: "active" as CodeStatus,
    shareLink: "appaffiliate.app/motionhealth",
    qrStatus: "Pending refresh",
    duplicateActive: true,
    note: "Overlaps with a newer health pilot code and needs cleanup.",
  },
  {
    slug: "motion-ios",
    code: "MOTIONIOS",
    owner: "Motion Daily",
    ownerAssigned: true,
    app: "Motion Daily",
    channel: "Apple Health pilot",
    status: "active" as CodeStatus,
    shareLink: "appaffiliate.app/motionios",
    qrStatus: "Ready",
    duplicateActive: true,
    note: "Second active code in the same partner/app lane.",
  },
  {
    slug: "meridian-evergreen",
    code: "MERIDIANFIT",
    owner: "Studio Meridian",
    ownerAssigned: true,
    app: "Meridian Studio",
    channel: "Always-on",
    status: "paused" as CodeStatus,
    shareLink: "appaffiliate.app/meridianfit",
    qrStatus: "Ready",
    duplicateActive: false,
    note: "Paused until fall evergreen campaign resumes.",
  },
  {
    slug: "atlas-legacy",
    code: "ATLASRUN",
    owner: "Unassigned history",
    ownerAssigned: false,
    app: "Atlas Run",
    channel: "Archived event",
    status: "archived" as CodeStatus,
    shareLink: "appaffiliate.app/atlasrun",
    qrStatus: "Legacy",
    duplicateActive: false,
    note: "Retained only for attribution history and old QR inventory.",
  },
];

function statusTone(status: CodeStatus): StatusTone {
  if (status === "active") {
    return "success";
  }

  if (status === "paused") {
    return "warning";
  }

  return "danger";
}

function buildHref(params: {
  status: string;
  ownership: string;
  code?: string;
}) {
  const search = new URLSearchParams();

  if (params.status && params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.ownership && params.ownership !== "all") {
    search.set("ownership", params.ownership);
  }

  if (params.code) {
    search.set("code", params.code);
  }

  const query = search.toString();

  return query ? `/codes?${query}` : "/codes";
}

export default async function CodesPage({ searchParams }: CodesPageProps) {
  const { status = "all", ownership = "all", code: selectedCodeSlug } =
    await searchParams;

  const filteredCodes = codeRows.filter((code) => {
    const matchesStatus = status === "all" || code.status === status;
    const matchesOwnership =
      ownership === "all" ||
      (ownership === "assigned" && code.ownerAssigned) ||
      (ownership === "unassigned" && !code.ownerAssigned);

    return matchesStatus && matchesOwnership;
  });

  const selectedCode =
    filteredCodes.find((code) => code.slug === selectedCodeSlug) ??
    filteredCodes[0] ??
    null;

  const activeCount = codeRows.filter((code) => code.status === "active").length;
  const assignedCount = codeRows.filter((code) => code.ownerAssigned).length;
  const duplicateCount = codeRows.filter((code) => code.duplicateActive).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Codes"
        description="Treat promo codes as the MVP source of truth for attribution: who owns each code, where it routes, whether it is active, and where duplicate or stale coverage needs operator review."
        actions={
          <>
            <ActionLink href="/partners">Open partners</ActionLink>
            <ActionLink href="/unattributed" variant="primary">
              Open needs attribution
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Ownership-first review</StatusBadge>
          <StatusBadge tone="warning">Duplicate active checks visible</StatusBadge>
          <StatusBadge>Share helpers included</StatusBadge>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active codes"
          value={String(activeCount)}
          detail="Active codes should remain easy to audit because they anchor attribution coverage."
          tone="success"
        />
        <StatCard
          label="Assigned ownership"
          value={`${assignedCount}/${codeRows.length}`}
          detail="Every assigned code should map cleanly to a partner and an app-level operating lane."
          tone="primary"
        />
        <StatCard
          label="Duplicate warnings"
          value={String(duplicateCount)}
          detail="Duplicate active coverage should stand out before it creates attribution ambiguity."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="space-y-4">
          <FilterBar
            title="Sticky filters"
            description="Keep code review anchored around status and ownership without leaving the list surface."
          >
            <FilterChipLink
              href={buildHref({
                status: "all",
                ownership,
                code: selectedCode?.slug,
              })}
              active={status === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status: "active",
                ownership,
                code: selectedCode?.slug,
              })}
              active={status === "active"}
            >
              Active
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status: "paused",
                ownership,
                code: selectedCode?.slug,
              })}
              active={status === "paused"}
            >
              Paused
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status: "archived",
                ownership,
                code: selectedCode?.slug,
              })}
              active={status === "archived"}
            >
              Archived
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status, ownership: "all", code: selectedCode?.slug })}
              active={ownership === "all"}
            >
              All ownership
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status,
                ownership: "assigned",
                code: selectedCode?.slug,
              })}
              active={ownership === "assigned"}
            >
              Assigned
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({
                status,
                ownership: "unassigned",
                code: selectedCode?.slug,
              })}
              active={ownership === "unassigned"}
            >
              Unassigned
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Code register"
            title="Ownership and status review"
            description="Use the code register as the first operational source of truth for attribution coverage, partner assignment, and share-ready distribution."
          >
            <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Code</span>
              <span>Owner</span>
              <span>App</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredCodes.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow="No matches"
                    title="No codes match these filters"
                    description="Clear one of the sticky filters to return to the broader register view."
                    action={
                      <ActionLink href="/codes" variant="primary">
                        Reset filters
                      </ActionLink>
                    }
                  />
                </div>
              ) : null}

              {filteredCodes.map((code) => {
                const isSelected = code.slug === selectedCode?.slug;

                return (
                  <Link
                    key={code.slug}
                    href={buildHref({ status, ownership, code: code.slug })}
                    className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] md:items-center ${
                      isSelected
                        ? "bg-primary-soft/40"
                        : "hover:bg-surface"
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-ink">{code.code}</h3>
                        {code.duplicateActive ? (
                          <StatusBadge tone="danger">Duplicate active</StatusBadge>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm leading-6 text-ink-muted">
                        {code.channel}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-ink">{code.owner}</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {code.ownerAssigned ? "Partner assigned" : "Needs owner"}
                      </p>
                    </div>

                    <div className="text-sm text-ink-muted">{code.app}</div>

                    <div className="flex justify-start gap-2 md:justify-end">
                      <StatusBadge tone={statusTone(code.status)}>
                        {code.status}
                      </StatusBadge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </ListTable>
        </div>

        {selectedCode ? (
          <DetailPanel
            eyebrow="Detail inspection"
            title={selectedCode.code}
            description={selectedCode.note}
            status={
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={statusTone(selectedCode.status)}>
                  {selectedCode.status}
                </StatusBadge>
                {selectedCode.duplicateActive ? (
                  <StatusBadge tone="danger">Duplicate active</StatusBadge>
                ) : null}
              </div>
            }
          >
            <SectionCard
              title="Ownership and routing"
              description="Keep the operator view grounded in the core attribution facts."
              items={[
                `Owner: ${selectedCode.owner}.`,
                `Assignment state: ${selectedCode.ownerAssigned ? "Assigned" : "Needs assignment"}.`,
                `App: ${selectedCode.app}.`,
                `Channel: ${selectedCode.channel}.`,
              ]}
            />

            <SurfaceCard className="bg-surface">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Share helpers
              </p>
              <div className="mt-4 space-y-4">
                <div className="rounded-[22px] border border-border bg-surface-elevated p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">Share link</p>
                      <p className="mt-1 text-sm text-ink-muted">{selectedCode.shareLink}</p>
                    </div>
                    <StatusBadge tone="primary">Ready to copy</StatusBadge>
                  </div>
                </div>

                <div className="rounded-[22px] border border-border bg-surface-elevated p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-ink">QR helper</p>
                      <p className="mt-1 text-sm text-ink-muted">
                        Keep QR assets and destination validation close to the code record.
                      </p>
                    </div>
                    <StatusBadge
                      tone={
                        selectedCode.qrStatus === "Ready"
                          ? "success"
                          : selectedCode.qrStatus === "Pending refresh"
                            ? "warning"
                            : "primary"
                      }
                    >
                      {selectedCode.qrStatus}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            </SurfaceCard>

            {selectedCode.duplicateActive ? (
              <SectionCard
                title="Duplicate active warning"
                description="Active overlaps should be visible before they blur attribution ownership."
              >
                <EmptyState
                  eyebrow="Operator warning"
                  title="Another active code overlaps this lane"
                  description="Review Motion Daily's active Apple Health pilot codes and decide which one should remain active. Duplicate live coverage can create uncertainty around source-of-truth ownership."
                  action={
                    <>
                      <ActionLink href="/partners">Review partner</ActionLink>
                      <ActionLink href="/unattributed">Open needs attribution</ActionLink>
                    </>
                  }
                />
              </SectionCard>
            ) : (
              <SectionCard
                title="Review posture"
                description="This code currently reads as clean from an operational review perspective."
                items={[
                  "Ownership is visible in the list and detail view.",
                  "Share and QR helper blocks stay attached to the code record.",
                  "The detail panel keeps cleanup actions close without creating edit-page sprawl.",
                ]}
              />
            )}
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Detail inspection"
            title="No code selected"
            description="Adjust the sticky filters or reset the register to inspect a code record."
          >
            <EmptyState
              eyebrow="Empty detail panel"
              title="Nothing matches the current register view"
              description="This detail panel will show ownership, share helpers, and duplicate warning states once a code matches the selected filters."
              action={
                <ActionLink href="/codes" variant="primary">
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
