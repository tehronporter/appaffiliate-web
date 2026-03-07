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
  const missingEmailCount = data.partners.filter((partner) => !partner.contactEmail).length;
  const withoutCodesCount = data.partners.filter((partner) => partner.assignedCodes === 0).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Partners"
        description="Keep the partner directory clear enough to support attribution review, code ownership, and everyday program operations without turning it into a loose contact list."
        actions={
          <>
            <ActionLink href="/dashboard">Open dashboard</ActionLink>
            <ActionLink href="/codes" variant="primary">
              Review codes
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Partner directory</StatusBadge>
          <StatusBadge tone="warning">Manual updates stay explicit</StatusBadge>
          <StatusBadge>Organization-scoped records</StatusBadge>
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
          label="Total"
          value={String(data.partners.length)}
          detail="Every partner record stays visible as part of the program source of truth."
          tone="primary"
        />
        <StatCard
          label="Active"
          value={String(data.stats.active)}
          detail="These relationships are currently live and should have clear code ownership where relevant."
          tone="success"
        />
        <StatCard
          label="Pending"
          value={String(data.stats.pending)}
          detail="Use pending status while a relationship is being prepared or verified."
          tone="warning"
        />
        <StatCard
          label="Coverage gaps"
          value={String(withoutCodesCount)}
          detail={`${missingEmailCount} partners are also missing a contact email in the current view.`}
          tone={withoutCodesCount > 0 || missingEmailCount > 0 ? "warning" : "success"}
        />
      </div>

      <SurfaceCard>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              Current partner posture
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {data.stats.active} active, {data.stats.pending} pending, {data.stats.inactive} inactive, and {data.stats.archived} archived partner records are visible in this workspace.
            </p>
          </div>
          <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              Coverage to review
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {withoutCodesCount > 0
                ? `${withoutCodesCount} partner records still have no assigned codes.`
                : "Every visible partner already has at least one assigned code."}
            </p>
          </div>
          <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              Contact detail
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              {missingEmailCount > 0
                ? `${missingEmailCount} partner records still need a contact email.`
                : "Every visible partner has a contact email on file."}
            </p>
          </div>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <SectionCard
            eyebrow="Create"
            title="Add partner"
            description="Add the minimum partner detail needed for code ownership and day-to-day program review."
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
            title="Directory filters"
            description="Keep lifecycle review narrow without leaving the list-and-detail flow."
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
            description="Review partner coverage, contact detail, and assigned code volume in one place."
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
                        ? "Create the first partner or widen the current lifecycle filter to return to the full directory."
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
              "No internal note has been added yet. Use this space for the minimal context operators need during review."
            }
            status={
              <StatusBadge tone={statusTone(selectedPartner.status)}>
                {statusLabel(selectedPartner.status)}
              </StatusBadge>
            }
          >
            <SectionCard
              title="Operational context"
              description="Keep the current relationship context visible before changing lifecycle or contact detail."
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
              description="Update lifecycle, contact detail, or internal notes without expanding this page into portal or payout setup."
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
            description="Select a partner from the directory to review contact coverage, lifecycle, and linked code context."
          >
            <EmptyState
              eyebrow="Empty detail"
              title="No partner record is available"
              description="The detail panel shows contact, lifecycle, and assigned code context once a partner matches the current view."
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
