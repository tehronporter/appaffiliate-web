import Link from "next/link";
import { Users } from "lucide-react";

import {
  createPartnerAction,
} from "@/app/(workspace)/partners/actions";
import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  FilterBar,
  FilterChipLink,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  StatusBadge,
  SummaryBar,
  WorkspaceDrawer,
  type StatusTone,
} from "@/components/admin-ui";
import { listWorkspaceInvitations } from "@/lib/services/invitations";
import {
  listWorkspacePartners,
  type PartnerStatus,
} from "@/lib/services/partners";
import {
  toneForPartnerStatus,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type CreatorsPageProps = {
  searchParams: Promise<{
    status?: string;
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

function buildHref(params: { status: string; drawer?: string }) {
  const search = new URLSearchParams();

  if (params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.drawer) {
    search.set("drawer", params.drawer);
  }

  const query = search.toString();
  return query ? `/creators?${query}` : "/creators";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "creator-created") {
    return {
      tone: "green" as const,
      title: "Creator added",
      detail: "The creator record is live and ready for codes, invites, and payouts.",
    };
  }

  if (notice === "creator-created-invite-error") {
    return {
      tone: "amber" as const,
      title: "Creator added, invite still needs attention",
      detail: "The creator record was saved, but the invite did not send successfully. Open the creator detail page before retrying.",
    };
  }

  if (notice === "creator-updated") {
    return {
      tone: "green" as const,
      title: "Creator updated",
      detail: "The latest creator details were saved successfully.",
    };
  }

  if (notice === "creator-invite-resent") {
    return {
      tone: "green" as const,
      title: "Invite resent",
      detail: "The creator invite email was sent again.",
    };
  }

  if (notice === "creator-invite-revoked") {
    return {
      tone: "amber" as const,
      title: "Invite revoked",
      detail: "The pending creator invite was revoked.",
    };
  }

  if (notice === "creator-error") {
    return {
      tone: "red" as const,
      title: "Creator change failed",
      detail: "Review the submitted fields and try again.",
    };
  }

  return null;
}

function CreatorFormFields() {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator name</span>
        <input name="name" type="text" required className="aa-field" />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator email</span>
        <input name="contactEmail" type="email" className="aa-field" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Setup state</span>
          <select name="status" defaultValue="active" className="aa-field">
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Send invite now?</span>
          <select name="sendInvite" defaultValue="yes" className="aa-field">
            <option value="yes">Yes, send invite</option>
            <option value="no">No, save record only</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Setup note</span>
        <textarea name="notes" rows={4} className="aa-field" />
      </label>
    </div>
  );
}

export default async function CreatorsPage({ searchParams }: CreatorsPageProps) {
  const { status: rawStatus = "all", notice, drawer } = await searchParams;
  const status = VALID_STATUSES.has(rawStatus as PartnerStatus)
    ? (rawStatus as PartnerStatus)
    : "all";
  const [data, invitations] = await Promise.all([
    listWorkspacePartners(),
    listWorkspaceInvitations().catch(() => []),
  ]);
  const banner = noticeCopy(notice);
  const filteredCreators = data.partners.filter(
    (creator) => status === "all" || creator.status === status,
  );
  const inviteByEmail = new Map(
    invitations
      .filter((invitation) => invitation.inviteType === "partner_portal")
      .map((invitation) => [invitation.email.toLowerCase(), invitation]),
  );
  const pendingInviteCount = data.partners.filter((creator) => {
    const email = creator.contactEmail?.toLowerCase();
    return email ? inviteByEmail.get(email)?.status === "pending" : false;
  }).length;
  const creatorsWithoutCodes = data.partners.filter((creator) => creator.assignedCodes === 0).length;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program management"
        title="Creators"
        description="Manage creator records, invite state, linked apps, and code coverage."
        actions={
          <>
            <ActionLink href="/setup">Open setup</ActionLink>
            <ActionLink href="/creators?drawer=create" variant="primary">
              Add creator
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Creator program</StatusBadge>
          {creatorsWithoutCodes > 0 ? <StatusBadge tone="amber">Coverage gaps visible</StatusBadge> : null}
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <section className="aa-stat-grid">
        <MetricChip label="Creators" value={String(data.partners.length)} detail="Directory size" tone="blue" />
        <MetricChip label="Active" value={String(data.stats.active)} detail="Ready records" tone="green" />
        <MetricChip
          label="Needs codes"
          value={String(creatorsWithoutCodes)}
          detail="No linked ownership yet"
          tone={creatorsWithoutCodes > 0 ? "amber" : "green"}
        />
        <MetricChip
          label="Invites pending"
          value={String(pendingInviteCount)}
          detail="Awaiting creator response"
          tone={pendingInviteCount > 0 ? "amber" : "gray"}
        />
      </section>

      <SummaryBar
        items={[
          {
            label: "Coverage",
            value: creatorsWithoutCodes > 0 ? `${creatorsWithoutCodes} still need codes` : "Coverage calm",
          },
          {
            label: "Invites",
            value: pendingInviteCount > 0 ? `${pendingInviteCount} waiting` : "No pending invites",
          },
        ]}
      />

      <FilterBar title="Creator state">
        <FilterChipLink href={buildHref({ status: "all" })} active={status === "all"}>
          All
        </FilterChipLink>
        <FilterChipLink href={buildHref({ status: "pending" })} active={status === "pending"}>
          Pending
        </FilterChipLink>
        <FilterChipLink href={buildHref({ status: "active" })} active={status === "active"}>
          Active
        </FilterChipLink>
        <FilterChipLink href={buildHref({ status: "inactive" })} active={status === "inactive"}>
          Inactive
        </FilterChipLink>
        <FilterChipLink href={buildHref({ status: "archived" })} active={status === "archived"}>
          Archived
        </FilterChipLink>
      </FilterBar>

      <ListTable
        eyebrow="Directory"
        title="Creators"
        description="Open a creator to review invite, app coverage, codes, and earnings context."
      >
        <div className="hidden grid-cols-[minmax(0,1.2fr)_130px_160px_150px_120px] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
          <span>Creator</span>
          <span>Status</span>
          <span>Apps</span>
          <span>Codes</span>
          <span>Action</span>
        </div>

        <div className="divide-y divide-border bg-surface-elevated">
          {filteredCreators.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={Users}
                eyebrow={data.hasWorkspaceAccess ? "Creator program" : "Access required"}
                title={
                  data.hasWorkspaceAccess
                    ? "Add the first creator record"
                    : "Sign in to manage creators"
                }
                description={
                  data.hasWorkspaceAccess
                    ? "Creators become the home for invites, codes, earnings, and payout context."
                    : "Internal workspace access is required before creator records can be managed."
                }
                action={
                  data.hasWorkspaceAccess ? (
                    <ActionLink href="/creators?drawer=create" variant="primary">
                      Add creator
                    </ActionLink>
                  ) : null
                }
              />
            </div>
          ) : null}

          {filteredCreators.map((creator) => (
            <Link
              key={creator.id}
              href={`/creators/${creator.slug}`}
              className="grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.2fr)_130px_160px_150px_120px] md:items-center md:gap-4 md:px-5 md:py-3"
            >
              <div>
                <span className="aa-mobile-label md:hidden">Creator</span>
                <h3 className="text-sm font-semibold text-ink">{creator.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  {creator.contactEmail ?? "No email on file"}
                </p>
              </div>
              <div>
                <span className="aa-mobile-label md:hidden">Status</span>
                <StatusBadge tone={statusTone(creator.status)}>{creator.status}</StatusBadge>
              </div>
              <div>
                <span className="aa-mobile-label md:hidden">Apps</span>
                <p className="text-sm text-ink-muted">
                  {creator.appNames.length > 0 ? creator.appNames.join(", ") : "No linked apps"}
                </p>
              </div>
              <div>
                <span className="aa-mobile-label md:hidden">Codes</span>
                <p className="text-sm text-ink-muted">
                  {creator.assignedCodes > 0 ? `${creator.assignedCodes} assigned` : "No codes"}
                </p>
              </div>
              <div>
                <span className="aa-mobile-label md:hidden">Action</span>
                <p className="text-sm font-semibold text-primary">Open creator</p>
              </div>
            </Link>
          ))}
        </div>
      </ListTable>

      {drawer === "create" ? (
        <WorkspaceDrawer
          closeHref={buildHref({ status: status === "all" ? "all" : status })}
          eyebrow="Add creator"
          title="Create creator record"
          description="Add the next creator, decide whether to invite them now, then link codes and apps."
        >
          <form action={createPartnerAction} className="space-y-4">
            <CreatorFormFields />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="aa-button aa-button-primary">
                Save creator
              </button>
              <Link href="/creators" className="aa-button aa-button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
