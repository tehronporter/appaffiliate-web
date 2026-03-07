import Link from "next/link";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActionButton,
  DetailList,
  DetailPanel,
  EmptyState,
  FilterBar,
  FilterChipLink,
  InfoPanel,
  ListTable,
  NoticeBanner,
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
        <span className="text-sm font-medium text-ink">Creator name</span>
        <input
          name="name"
          type="text"
          required
          defaultValue={props.defaultName ?? ""}
          className="aa-field"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator email</span>
        <input
          name="contactEmail"
          type="email"
          defaultValue={props.defaultEmail ?? ""}
          className="aa-field"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Setup state</span>
        <select
          name="status"
          defaultValue={props.defaultStatus ?? "active"}
          className="aa-field"
        >
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Setup note</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={props.defaultNotes ?? ""}
          className="aa-field"
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
        title="Creators"
        description="Track creator relationships, coverage, and code ownership without turning the workspace into a generic CRM."
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
          <StatusBadge tone="primary">Creator directory</StatusBadge>
          <StatusBadge tone="warning">Manual relationship updates</StatusBadge>
          <StatusBadge>Partner records stay org-scoped</StatusBadge>
        </div>
      </PageHeader>

      {banner ? (
        <NoticeBanner
          title={banner.title}
          detail={banner.detail}
          tone={banner.tone}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Creators"
          value={String(data.partners.length)}
          detail="Every visible creator record stays in the workspace source of truth."
          tone="primary"
          size="compact"
        />
        <StatCard
          label="Active"
          value={String(data.stats.active)}
          detail="These creator relationships are live and should have clear code ownership."
          tone="success"
          size="compact"
        />
        <StatCard
          label="Needs setup"
          value={String(withoutCodesCount)}
          detail={`${missingEmailCount} visible creator records are also missing a contact email.`}
          tone="warning"
          size="compact"
        />
        <StatCard
          label="Pending"
          value={String(data.stats.pending)}
          detail="Use pending while a creator relationship is being prepared or verified."
          tone={data.stats.pending > 0 ? "warning" : "success"}
          size="compact"
        />
      </div>

      <SurfaceCard density="compact">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoPanel
            title="Relationship state"
            description={`${data.stats.active} active, ${data.stats.pending} pending, and ${data.stats.inactive + data.stats.archived} inactive or archived creator records are visible.`}
          />
          <InfoPanel
            title="Ownership gaps"
            description={
              withoutCodesCount > 0
                ? `${withoutCodesCount} creator records still have no assigned code coverage.`
                : "Every visible creator already has at least one assigned code."
            }
          />
          <InfoPanel
            title="Linked apps"
            description={
              data.partners.some((partner) => partner.appNames.length > 0)
                ? "Linked app coverage is visible in the detail rail for each creator record."
                : "No linked app coverage is visible yet in the current creator directory."
            }
          />
        </div>
      </SurfaceCard>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <SectionCard
            eyebrow="Create"
            title="Invite your first creator"
            description="Start with the minimum creator detail needed to assign ownership, track the first result, and prove the channel works."
          >
            <InfoPanel
              title="Why this matters"
              description="The first creator turns setup into a real growth test. Once this record exists, you can assign a code or link and start tracking results."
            />
            <form action={createPartnerAction} className="space-y-4">
              <PartnerFormFields />
              <div className="flex justify-end">
                <ActionButton type="submit" variant="primary">
                  Invite creator
                </ActionButton>
              </div>
            </form>
          </SectionCard>

          <FilterBar
            title="Creator filters"
            description="Keep lifecycle review narrow without losing the list and detail workflow."
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
            title="Creator directory"
            description="Review relationship state, contact coverage, and assigned code volume in one place."
          >
            <div className="hidden grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_90px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Creator</span>
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
                        : "Sign in to review creators"
                    }
                    description={
                      data.hasWorkspaceAccess
                        ? "Invite your first creator or widen the current lifecycle filter to return to the full directory."
                        : "An internal workspace membership is required before creator records can be read."
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
            eyebrow="Creator detail"
            title={selectedPartner.name}
            description={
              selectedPartner.notes ??
              "No internal note has been added yet. Keep only the creator context operators actually need."
            }
            status={
              <StatusBadge tone={statusTone(selectedPartner.status)}>
                {statusLabel(selectedPartner.status)}
              </StatusBadge>
            }
          >
            <SectionCard
              title="Relationship context"
              description="Keep ownership, linked apps, and contact detail visible before editing the record."
            >
              <DetailList
                items={[
                  {
                    label: "Contact email",
                    value: selectedPartner.contactEmail ?? "No email on file",
                  },
                  {
                    label: "Record type",
                    value: selectedPartner.partnerType,
                  },
                  {
                    label: "Assigned codes",
                    value: String(selectedPartner.assignedCodes),
                  },
                  {
                    label: "Linked apps",
                    value:
                      selectedPartner.appNames.length > 0
                        ? selectedPartner.appNames.join(", ")
                        : "No app coverage yet",
                  },
                ]}
              />
            </SectionCard>

            <SectionCard
              title="Update creator record"
              description="Update lifecycle, contact detail, or internal notes without expanding this page into a broader CRM tool."
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
                  <ActionButton type="submit" variant="primary">
                    Save changes
                  </ActionButton>
                </div>
              </form>
            </SectionCard>
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Creator detail"
            title="No creator selected"
            description="Select a creator from the directory to review coverage, lifecycle, and linked code context."
          >
            <EmptyState
              eyebrow="Empty detail"
              title="No creator record is available"
              description="The detail panel shows relationship, contact, and assigned code context once a record matches the current view."
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
