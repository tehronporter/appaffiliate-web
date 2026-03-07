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
import { createPartnerAction, updatePartnerAction } from "@/app/(workspace)/partners/actions";
import {
  listWorkspacePartners,
  type PartnerStatus,
} from "@/lib/services/partners";

type PartnersPageProps = {
  searchParams: Promise<{
    status?: string;
    partner?: string;
    notice?: string;
  }>;
};

const VALID_STATUSES = new Set<PartnerStatus>([
  "pending",
  "active",
  "inactive",
  "archived",
]);

function statusTone(status: PartnerStatus): StatusTone {
  if (status === "active") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  if (status === "inactive") {
    return "primary";
  }

  return "danger";
}

function statusLabel(status: PartnerStatus) {
  if (status === "inactive") {
    return "Inactive";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function buildHref(params: { status: string; partner?: string }) {
  const search = new URLSearchParams();

  if (params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.partner) {
    search.set("partner", params.partner);
  }

  const query = search.toString();
  return query ? `/partners?${query}` : "/partners";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "partner-created") {
    return {
      tone: "success" as const,
      title: "Partner created",
      detail: "The partner directory now includes the new workspace record.",
    };
  }

  if (notice === "partner-updated") {
    return {
      tone: "success" as const,
      title: "Partner updated",
      detail: "The latest partner details were saved successfully.",
    };
  }

  if (notice === "partner-error") {
    return {
      tone: "danger" as const,
      title: "Partner change failed",
      detail: "Review the submitted fields and try the update again.",
    };
  }

  return null;
}

function PartnerFormFields(props: {
  defaultName?: string;
  defaultEmail?: string | null;
  defaultStatus?: PartnerStatus;
  defaultNotes?: string | null;
}) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Name</span>
        <input
          name="name"
          type="text"
          required
          defaultValue={props.defaultName ?? ""}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Email</span>
        <input
          name="contactEmail"
          type="email"
          defaultValue={props.defaultEmail ?? ""}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Status</span>
        <select
          name="status"
          defaultValue={props.defaultStatus ?? "active"}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={props.defaultNotes ?? ""}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        />
      </label>
    </div>
  );
}

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  const {
    status: rawStatus = "all",
    partner: selectedPartnerId,
    notice,
  } = await searchParams;
  const status = VALID_STATUSES.has(rawStatus as PartnerStatus)
    ? (rawStatus as PartnerStatus)
    : "all";
  const data = await listWorkspacePartners();
  const filteredPartners = data.partners.filter(
    (partner) => status === "all" || partner.status === status,
  );
  const selectedPartner =
    filteredPartners.find((partner) => partner.id === selectedPartnerId) ??
    filteredPartners[0] ??
    null;
  const banner = noticeCopy(notice);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Partners"
        description="Manage real workspace partners as an operational source of truth: lifecycle, contact coverage, code ownership, and the notes operators need to keep attribution review grounded."
        actions={
          <>
            <ActionLink href="/dashboard">Back to overview</ActionLink>
            <ActionLink href="/codes" variant="primary">
              Review codes
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Real workspace directory</StatusBadge>
          <StatusBadge tone="warning">Manual-first updates</StatusBadge>
          <StatusBadge>Org-scoped partner records</StatusBadge>
        </div>
      </PageHeader>

      {banner ? (
        <SurfaceCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{banner.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{banner.detail}</p>
            </div>
            <StatusBadge tone={banner.tone}>{banner.title}</StatusBadge>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Active"
          value={String(data.stats.active)}
          detail="Live partners remain easy to review alongside their current code coverage."
          tone="success"
        />
        <StatCard
          label="Pending"
          value={String(data.stats.pending)}
          detail="Pending records stay visible until operators are ready to move them live."
          tone="warning"
        />
        <StatCard
          label="Inactive"
          value={String(data.stats.inactive)}
          detail="Inactive relationships remain available for historical attribution context."
          tone="primary"
        />
        <StatCard
          label="Archived"
          value={String(data.stats.archived)}
          detail="Archived partner history remains visible without implying active ownership."
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <SectionCard
            eyebrow="Create"
            title="Add partner"
            description="Keep partner creation narrow: basic contact detail, lifecycle state, and internal notes."
          >
            <form action={createPartnerAction} className="space-y-4">
              <PartnerFormFields />
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                >
                  Create partner
                </button>
              </div>
            </form>
          </SectionCard>

          <FilterBar
            title="Sticky filters"
            description="Review partners by lifecycle state without leaving the directory flow."
          >
            <FilterChipLink
              href={buildHref({ status: "all", partner: selectedPartner?.id })}
              active={status === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "pending", partner: selectedPartner?.id })}
              active={status === "pending"}
            >
              Pending
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "active", partner: selectedPartner?.id })}
              active={status === "active"}
            >
              Active
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "inactive", partner: selectedPartner?.id })}
              active={status === "inactive"}
            >
              Inactive
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "archived", partner: selectedPartner?.id })}
              active={status === "archived"}
            >
              Archived
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Directory"
            title="Workspace partner records"
            description="Use the directory to review the current state of partner coverage and assigned code volume."
          >
            <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_90px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Partner</span>
              <span>Contact</span>
              <span>Codes</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredPartners.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow={data.hasWorkspaceAccess ? "No partners yet" : "Access required"}
                    title={
                      data.hasWorkspaceAccess
                        ? "No partner records match this view"
                        : "Sign in to review partners"
                    }
                    description={
                      data.hasWorkspaceAccess
                        ? "Create the first partner or reset the lifecycle filter to widen the directory."
                        : "An internal workspace membership is required before partner records can be read."
                    }
                    action={
                      data.hasWorkspaceAccess ? (
                        <ActionLink href="/partners" variant="primary">
                          Reset filters
                        </ActionLink>
                      ) : null
                    }
                  />
                </div>
              ) : null}

              {filteredPartners.map((partner) => (
                <Link
                  key={partner.id}
                  href={buildHref({ status, partner: partner.id })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_90px_auto] md:items-center ${
                    partner.id === selectedPartner?.id
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <h3 className="text-base font-semibold text-ink">{partner.name}</h3>
                    <p className="mt-1 text-sm text-ink-muted">
                      {partner.notes ?? "No internal note yet."}
                    </p>
                  </div>
                  <div className="text-sm text-ink-muted">
                    {partner.contactEmail ?? "No email on file"}
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
              ))}
            </div>
          </ListTable>
        </div>

        {selectedPartner ? (
          <DetailPanel
            eyebrow="Partner detail"
            title={selectedPartner.name}
            description={
              selectedPartner.notes ??
              "No internal note has been added for this partner yet."
            }
            status={
              <StatusBadge tone={statusTone(selectedPartner.status)}>
                {statusLabel(selectedPartner.status)}
              </StatusBadge>
            }
          >
            <SectionCard
              title="Operational context"
              description="Keep the real partner context visible before any change is made."
              items={[
                `Contact email: ${selectedPartner.contactEmail ?? "No email on file"}.`,
                `Partner type: ${selectedPartner.partnerType}.`,
                `Assigned codes: ${selectedPartner.assignedCodes}.`,
                `Apps linked through codes: ${
                  selectedPartner.appNames.length > 0
                    ? selectedPartner.appNames.join(", ")
                    : "No app coverage yet"
                }.`,
              ]}
            />

            <SectionCard
              title="Update partner"
              description="Make narrow lifecycle or contact updates without expanding into portal or payout setup."
            >
              <form action={updatePartnerAction} className="space-y-4">
                <input type="hidden" name="partnerId" value={selectedPartner.id} />
                <PartnerFormFields
                  defaultName={selectedPartner.name}
                  defaultEmail={selectedPartner.contactEmail}
                  defaultStatus={selectedPartner.status}
                  defaultNotes={selectedPartner.notes}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </SectionCard>
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Partner detail"
            title="No partner selected"
            description="Create a partner or reset filters to inspect a record."
          >
            <EmptyState
              eyebrow="Empty detail"
              title="No partner record is available"
              description="The detail panel will show contact, lifecycle, and code coverage once a partner is available in the current view."
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
