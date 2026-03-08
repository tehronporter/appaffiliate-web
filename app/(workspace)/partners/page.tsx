import Link from "next/link";
import { Users } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActionButton,
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  SectionCard,
  StatusBadge,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import {
  createPartnerAction,
  resendPartnerInviteAction,
  revokePartnerInviteAction,
  updatePartnerAction,
} from "@/app/(workspace)/partners/actions";
import { listWorkspaceInvitations } from "@/lib/services/invitations";
import {
  listWorkspacePartners,
  type PartnerStatus,
} from "@/lib/services/partners";
import {
  toneForPartnerStatus,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type PartnersPageProps = {
  searchParams: Promise<{
    status?: string;
    partner?: string;
    notice?: string;
    drawer?: string;
  }>;
};

const VALID_STATUSES = new Set<PartnerStatus>([
  "pending",
  "active",
  "inactive",
  "archived",
]);

function statusTone(status: PartnerStatus): StatusTone {
  return toneForPartnerStatus(status);
}

function statusLabel(status: PartnerStatus) {
  if (status === "inactive") {
    return "Inactive";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function buildHref(params: { status: string; partner?: string; drawer?: string }) {
  const search = new URLSearchParams();

  if (params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.partner) {
    search.set("partner", params.partner);
  }

  if (params.drawer) {
    search.set("drawer", params.drawer);
  }

  const query = search.toString();
  return query ? `/partners?${query}` : "/partners";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "partner-created") {
    return {
      tone: "green" as const,
      title: "Partner created",
      detail: "The partner directory now includes the new workspace record.",
    };
  }

  if (notice === "partner-updated") {
    return {
      tone: "green" as const,
      title: "Partner updated",
      detail: "The latest partner details were saved successfully.",
    };
  }

  if (notice === "partner-invite-resent") {
    return {
      tone: "green" as const,
      title: "Portal invite resent",
      detail: "The creator portal invite email has been sent again.",
    };
  }

  if (notice === "partner-invite-revoked") {
    return {
      tone: "amber" as const,
      title: "Portal invite revoked",
      detail: "The pending creator portal invite was revoked.",
    };
  }

  if (notice === "partner-error") {
    return {
      tone: "red" as const,
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
    drawer,
  } = await searchParams;
  const status = VALID_STATUSES.has(rawStatus as PartnerStatus)
    ? (rawStatus as PartnerStatus)
    : "all";
  const [data, invitations] = await Promise.all([
    listWorkspacePartners(),
    listWorkspaceInvitations().catch(() => []),
  ]);
  const filteredPartners = data.partners.filter(
    (partner) => status === "all" || partner.status === status,
  );
  const selectedPartner =
    filteredPartners.find((partner) => partner.id === selectedPartnerId) ?? null;
  const banner = noticeCopy(notice);
  const missingEmailCount = data.partners.filter((partner) => !partner.contactEmail).length;
  const withoutCodesCount = data.partners.filter((partner) => partner.assignedCodes === 0).length;
  const inviteByEmail = new Map(
    invitations
      .filter((invitation) => invitation.inviteType === "partner_portal")
      .map((invitation) => [invitation.email.toLowerCase(), invitation]),
  );
  const pendingInviteCount = data.partners.filter((partner) => {
    const email = partner.contactEmail?.toLowerCase();
    return email ? inviteByEmail.get(email)?.status === "pending" : false;
  }).length;
  const selectedInvite = selectedPartner?.contactEmail
    ? inviteByEmail.get(selectedPartner.contactEmail.toLowerCase()) ?? null
    : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Partners"
        description="Manage creator records and code coverage."
        actions={
          <>
            <ActionLink href="/codes">Review codes</ActionLink>
            <ActionLink href={buildHref({ status, drawer: "create" })} variant="primary">
              Invite creator
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForWorkspaceLabel()}>Creator directory</StatusBadge>
          <StatusBadge tone="amber">Manual relationship updates</StatusBadge>
        </div>
      </PageHeader>

      {banner ? (
        <NoticeBanner
          title={banner.title}
          detail={banner.detail}
          tone={banner.tone}
        />
      ) : null}

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          <MetricChip
            label="Creators"
            value={String(data.partners.length)}
            detail="Visible in this workspace"
            tone="blue"
          />
          <MetricChip
            label="Active"
            value={String(data.stats.active)}
            detail="Live creator relationships"
            tone="green"
          />
          <MetricChip
            label="Needs setup"
            value={String(withoutCodesCount)}
            detail={`${missingEmailCount} missing email`}
            tone="amber"
          />
          <MetricChip
            label="Invites pending"
            value={String(pendingInviteCount)}
            detail="Creator portal access still waiting on acceptance"
            tone={pendingInviteCount > 0 ? "amber" : "green"}
          />
          <MetricChip
            label="Pending"
            value={String(data.stats.pending)}
            tone={data.stats.pending > 0 ? "amber" : "green"}
          />
        </div>
      </section>

      <div className="space-y-3">
        <FilterBar
          title="Creator filters"
          description={
            withoutCodesCount > 0
              ? `${withoutCodesCount} creators still need code coverage.`
              : "Every visible creator already has code coverage."
          }
        >
          <FilterChipLink
            href={buildHref({ status: "all" })}
            active={status === "all"}
          >
            All states
          </FilterChipLink>
          <FilterChipLink
            href={buildHref({ status: "pending" })}
            active={status === "pending"}
          >
            Pending
          </FilterChipLink>
          <FilterChipLink
            href={buildHref({ status: "active" })}
            active={status === "active"}
          >
            Active
          </FilterChipLink>
          <FilterChipLink
            href={buildHref({ status: "inactive" })}
            active={status === "inactive"}
          >
            Inactive
          </FilterChipLink>
          <FilterChipLink
            href={buildHref({ status: "archived" })}
            active={status === "archived"}
          >
            Archived
          </FilterChipLink>
        </FilterBar>

        <ListTable className="w-full" eyebrow="Directory" title="Creators table" description="Click a row to inspect or update the creator record.">
          <div className="hidden grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_90px_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Creator</span>
              <span>Contact</span>
              <span>Codes</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredPartners.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    icon={Users}
                    eyebrow={data.hasWorkspaceAccess ? "Directory" : "Access required"}
                    title={
                      data.hasWorkspaceAccess
                        ? "Invite your first creator to start tracking performance"
                        : "Sign in to review creator records"
                    }
                    description={
                      data.hasWorkspaceAccess
                        ? "Creator records will appear here once the workspace has at least one invited creator or you return to a wider directory view."
                        : "An internal workspace membership is required before creator records can be read."
                    }
                    action={
                      data.hasWorkspaceAccess ? (
                        <ActionLink href="/partners" variant="primary">
                          Invite first creator
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
                  className="grid gap-4 px-5 py-3 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)_90px_auto] md:items-center"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-ink">{partner.name}</h3>
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

      {drawer === "create" ? (
        <WorkspaceDrawer
          closeHref={buildHref({ status })}
          eyebrow="Create"
          title="Invite creator"
          description="Start with the minimum detail needed to assign ownership and track the first result."
        >
          <SectionCard
            title="Why this matters"
            description="The first creator turns setup into a real growth test. Once this record exists, you can assign a code or link and start tracking results."
          >
            <form action={createPartnerAction} className="space-y-4">
              <PartnerFormFields />
              <div className="flex justify-end">
                <ActionButton type="submit" variant="primary">
                  Invite creator
                </ActionButton>
              </div>
            </form>
          </SectionCard>
        </WorkspaceDrawer>
      ) : null}

      {selectedPartner ? (
        <WorkspaceDrawer
          closeHref={buildHref({ status })}
          eyebrow="Creator detail"
          title={selectedPartner.name}
          description={
            selectedPartner.notes ??
            "No internal note has been added yet. Keep only the creator context operators actually need."
          }
          status={
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={statusTone(selectedPartner.status)}>
                {statusLabel(selectedPartner.status)}
              </StatusBadge>
              {selectedInvite ? (
                <StatusBadge tone={selectedInvite.status === "pending" ? "amber" : "green"}>
                  Portal invite {selectedInvite.statusLabel.toLowerCase()}
                </StatusBadge>
              ) : null}
            </div>
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
                  {
                    label: "Portal invite",
                    value: selectedInvite
                      ? `${selectedInvite.statusLabel} for ${selectedInvite.email}`
                      : "No portal invite has been sent yet",
                  },
                ]}
              />
            </SectionCard>

            <SectionCard
              title="Update creator record"
              description="Update lifecycle, contact detail, or internal notes without expanding this page into a broader CRM tool."
            >
              {selectedInvite?.status === "pending" ? (
                <div className="mb-4 flex flex-wrap justify-end gap-2">
                  <form action={resendPartnerInviteAction}>
                    <input type="hidden" name="invitationId" value={selectedInvite.id} />
                    <input type="hidden" name="partnerId" value={selectedPartner.id} />
                    <ActionButton type="submit">Resend invite</ActionButton>
                  </form>
                  <form action={revokePartnerInviteAction}>
                    <input type="hidden" name="invitationId" value={selectedInvite.id} />
                    <input type="hidden" name="partnerId" value={selectedPartner.id} />
                    <ActionButton type="submit" variant="secondary">
                      Revoke invite
                    </ActionButton>
                  </form>
                </div>
              ) : null}

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
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
