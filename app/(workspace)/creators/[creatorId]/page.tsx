import Link from "next/link";
import { notFound } from "next/navigation";

import {
  resendPartnerInviteAction,
  revokePartnerInviteAction,
  updatePartnerAction,
} from "@/app/(workspace)/partners/actions";
import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  InsetPanel,
  ListTable,
  NoticeBanner,
  PageHeader,
  QuickActionTile,
  SectionCard,
  StatusBadge,
  SummaryBar,
  WorkspaceDrawer,
} from "@/components/admin-ui";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { listCommissionItems } from "@/lib/services/finance";
import { listWorkspaceInvitations } from "@/lib/services/invitations";
import { listWorkspacePartners, type PartnerStatus } from "@/lib/services/partners";
import { toneForPartnerStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

type CreatorDetailPageProps = {
  params: Promise<{
    creatorId: string;
  }>;
  searchParams: Promise<{
    notice?: string;
    drawer?: string;
  }>;
};

function noticeCopy(notice: string | undefined) {
  if (notice === "creator-created") {
    return {
      tone: "green" as const,
      title: "Creator added",
      detail: "The creator record is ready for invite, code, and payout follow-up.",
    };
  }

  if (notice === "creator-created-invite-error") {
    return {
      tone: "amber" as const,
      title: "Creator added, invite still needs attention",
      detail: "The creator record was saved, but the invite did not send successfully. Review the email and retry from this page if needed.",
    };
  }

  if (notice === "creator-updated") {
    return {
      tone: "green" as const,
      title: "Creator updated",
      detail: "The creator details were saved successfully.",
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
      detail: "Review the submitted values and try again.",
    };
  }

  return null;
}

function CreatorFormFields(props: {
  creatorId: string;
  name: string;
  contactEmail: string | null;
  status: PartnerStatus;
  notes: string | null;
}) {
  return (
    <div className="grid gap-4">
      <input type="hidden" name="partnerId" value={props.creatorId} />

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator name</span>
        <input name="name" type="text" required defaultValue={props.name} className="aa-field" />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator email</span>
        <input name="contactEmail" type="email" defaultValue={props.contactEmail ?? ""} className="aa-field" />
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Status</span>
        <select name="status" defaultValue={props.status} className="aa-field">
          <option value="pending">Pending</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="archived">Archived</option>
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Notes</span>
        <textarea name="notes" rows={4} defaultValue={props.notes ?? ""} className="aa-field" />
      </label>
    </div>
  );
}

export default async function CreatorDetailPage({
  params,
  searchParams,
}: CreatorDetailPageProps) {
  const { creatorId } = await params;
  const { notice, drawer } = await searchParams;
  const decodedCreatorId = decodeURIComponent(creatorId);
  const [partnersData, codesData, invitations, commissions] = await Promise.all([
    listWorkspacePartners(),
    listWorkspacePromoCodes(),
    listWorkspaceInvitations().catch(() => []),
    listCommissionItems(),
  ]);
  const creator =
    partnersData.partners.find(
      (item) => item.id === decodedCreatorId || item.slug === decodedCreatorId,
    ) ?? null;

  if (!creator) {
    notFound();
  }

  const banner = noticeCopy(notice);
  const creatorCodes = codesData.codes.filter((code) => code.partnerId === creator.id);
  const creatorCommissions = commissions.items.filter((item) => item.partnerId === creator.id);
  const invite =
    creator.contactEmail
      ? invitations.find(
          (item) =>
            item.inviteType === "partner_portal" &&
            item.email.toLowerCase() === creator.contactEmail?.toLowerCase(),
        ) ?? null
      : null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Creators"
        title={creator.name}
        description="Manage creator profile, invite state, linked apps, codes, and earnings context."
        actions={
          <>
            <ActionLink href={`/creators/${creator.slug}?drawer=edit`}>Edit creator</ActionLink>
            <ActionLink href="/codes?drawer=create" variant="primary">
              Create code
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Creator center</StatusBadge>
          <StatusBadge tone={toneForPartnerStatus(creator.status)}>{creator.status}</StatusBadge>
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <SummaryBar
        items={[
          {
            label: "Apps",
            value: creator.appNames.length > 0 ? creator.appNames.join(", ") : "No linked apps",
          },
          {
            label: "Codes",
            value: creator.assignedCodes > 0 ? `${creator.assignedCodes} assigned` : "No codes yet",
          },
          {
            label: "Invite",
            value: invite ? invite.statusLabel : creator.contactEmail ? "No invite sent" : "No email on file",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <SectionCard
            title="Profile"
            description="Current creator record, contact context, and program status."
          >
            <DetailList
              items={[
                { label: "Creator", value: creator.name },
                { label: "Email", value: creator.contactEmail ?? "No email on file" },
                { label: "Status", value: creator.status },
                { label: "Apps", value: creator.appNames.join(", ") || "No linked apps" },
                { label: "Assigned codes", value: String(creator.assignedCodes) },
                { label: "Notes", value: creator.notes ?? "No internal notes yet" },
              ]}
            />
          </SectionCard>

          <ListTable
            eyebrow="Codes"
            title="Assigned codes"
            description="Codes remain an expert register, but they are surfaced here in the creator workflow."
          >
            {creatorCodes.length === 0 ? (
              <div className="p-4">
                <InsetPanel tone="amber">
                  <p className="text-sm text-ink-muted">
                    No codes are linked to this creator yet. Create one from the register to complete ownership coverage.
                  </p>
                </InsetPanel>
              </div>
            ) : (
              creatorCodes.map((code) => (
                <Link
                  key={code.id}
                  href={`/codes?code=${code.id}`}
                  className="flex items-center justify-between gap-3 border-b border-[var(--aa-shell-border)] px-4 py-3 last:border-b-0 hover:bg-[var(--aa-shell-panel-muted)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{code.code}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {code.appName} • {code.codeType}
                    </p>
                  </div>
                  <StatusBadge tone={code.status === "active" ? "green" : "gray"}>
                    {code.status}
                  </StatusBadge>
                </Link>
              ))
            )}
          </ListTable>

          <SectionCard
            title="Earnings summary"
            description="Read-only earning posture for this creator."
          >
            <DetailList
              columns={1}
              items={[
                {
                  label: "Tracked rows",
                  value: String(creatorCommissions.length),
                },
                {
                  label: "Approved or payout-ready",
                  value: String(
                    creatorCommissions.filter(
                      (item) =>
                        item.reviewState === "approved" ||
                        item.reviewState === "payout_ready" ||
                        item.reviewState === "paid",
                    ).length,
                  ),
                },
                {
                  label: "Latest review",
                  value: creatorCommissions[0]?.reviewStateLabel ?? "No earnings rows yet",
                },
              ]}
            />
          </SectionCard>
        </div>

        <div className="space-y-5">
          <QuickActionTile
            href="/codes?drawer=create"
            title="Create code"
            description="Add the next code for this creator and link it to an app lane."
          />
          <QuickActionTile
            href="/review?view=needs-review"
            title="Review attributed activity"
            description="Open the review queue and resolve items that still need an owner decision."
          />
          <QuickActionTile
            href="/payouts"
            title="Open payouts"
            description="Review payout posture and finance readiness for creator earnings."
          />

          <SectionCard
            title="Invite status"
            description="The invite belongs to the creator workflow, not a separate concept."
          >
            <DetailList
              columns={1}
              items={[
                {
                  label: "Current invite state",
                  value: invite ? invite.statusLabel : creator.contactEmail ? "No invite sent yet" : "Creator email missing",
                },
                {
                  label: "Email",
                  value: creator.contactEmail ?? "No email on file",
                },
              ]}
            />

            {invite ? (
              <div className="mt-4 flex flex-wrap gap-3">
                <form action={resendPartnerInviteAction}>
                  <input type="hidden" name="invitationId" value={invite.id} />
                  <input type="hidden" name="partnerId" value={creator.id} />
                  <button type="submit" className="aa-button aa-button-secondary">
                    Resend invite
                  </button>
                </form>
                {invite.status === "pending" ? (
                  <form action={revokePartnerInviteAction}>
                    <input type="hidden" name="invitationId" value={invite.id} />
                    <input type="hidden" name="partnerId" value={creator.id} />
                    <button type="submit" className="aa-button aa-button-secondary">
                      Revoke invite
                    </button>
                  </form>
                ) : null}
              </div>
            ) : null}
          </SectionCard>
        </div>
      </div>

      {drawer === "edit" ? (
        <WorkspaceDrawer
          closeHref={`/creators/${creator.slug}`}
          eyebrow="Edit creator"
          title={creator.name}
          description="Update the creator record without leaving the management surface."
        >
          <form action={updatePartnerAction} className="space-y-4">
            <CreatorFormFields
              creatorId={creator.id}
              name={creator.name}
              contactEmail={creator.contactEmail}
              status={creator.status}
              notes={creator.notes}
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="aa-button aa-button-primary">
                Save changes
              </button>
              <Link href={`/creators/${creator.slug}`} className="aa-button aa-button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
