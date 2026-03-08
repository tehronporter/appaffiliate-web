import { ActionLink } from "@/components/app-shell";
import {
  ActionButton,
  EmptyState,
  InsetPanel,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import {
  inviteTeamMemberAction,
  resendTeamInviteAction,
  revokeTeamInviteAction,
  updateTeamMemberRoleAction,
} from "@/app/(workspace)/settings/actions";
import { listWorkspaceInvitations } from "@/lib/services/invitations";
import { getTeamSettingsData } from "@/lib/services/settings";
import { toneForRoleLabel } from "@/lib/status-badges";

type SettingsTeamPageProps = {
  searchParams: Promise<{
    notice?: string;
  }>;
};

function noticeBadge(notice: string | undefined) {
  if (notice === "team-role-saved") {
    return <StatusBadge tone="green">Workspace role updated</StatusBadge>;
  }

  if (notice === "team-role-error") {
    return <StatusBadge tone="red">Workspace role update failed</StatusBadge>;
  }

  if (notice === "team-invite-sent") {
    return <StatusBadge tone="green">Invite sent</StatusBadge>;
  }

  if (notice === "team-invite-resent") {
    return <StatusBadge tone="green">Invite resent</StatusBadge>;
  }

  if (notice === "team-invite-revoked") {
    return <StatusBadge tone="amber">Invite revoked</StatusBadge>;
  }

  if (notice === "team-invite-error") {
    return <StatusBadge tone="red">Invite action failed</StatusBadge>;
  }

  return null;
}

export default async function SettingsTeamPage({
  searchParams,
}: SettingsTeamPageProps) {
  const { notice } = await searchParams;
  const [data, invitationData] = await Promise.all([
    getTeamSettingsData(),
    listWorkspaceInvitations().catch(() => []),
  ]);
  const noticeChip = noticeBadge(notice);
  const teamInvites = invitationData.filter(
    (invitation) => invitation.inviteType === "internal_team",
  );

  return (
    <SettingsPageFrame
      activeSection="team"
      title="Team settings"
      description="Show the real workspace membership directory allowed by the current auth model, keep role changes narrow and explicit, and stay honest that invite automation still does not exist in the current product."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/settings/audit">Open audit</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="green">Live workspace membership</StatusBadge>
          <StatusBadge tone={data.canManageRoles ? "blue" : "amber"}>
            {data.canManageRoles ? "Narrow role edits enabled" : "Read-only for your role"}
          </StatusBadge>
          {noticeChip}
        </div>
      }
      stats={[
        {
          label: "Visible members",
          value: String(data.visibleMemberCount),
          detail: data.visibleScopeLabel,
          tone: "blue",
        },
        {
          label: "Pending invites",
          value: String(data.pendingInviteCount),
          detail: "Invite issuance is still out of scope, so this count only reflects current membership data if invited rows already exist.",
          tone: "amber",
        },
        {
          label: "Partner-linked users",
          value: String(data.partnerUserCount),
          detail: "External partner identities stay separate from the internal workspace team.",
          tone: "green",
        },
      ]}
    >
      {!data.hasWorkspaceAccess ? (
        <SectionCard
          title="Internal workspace access required"
          description="Team settings remain an internal surface because they reveal operational roles."
        >
          <EmptyState
            eyebrow="Access required"
            title="No internal team directory is available"
            description="Sign in with an internal workspace role to review membership context."
            action={
              <ActionLink href="/dashboard" variant="primary">
                Open dashboard
              </ActionLink>
            }
          />
        </SectionCard>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <SectionCard
            title="Workspace members"
            description="The directory reflects real workspace memberships. Role edits stay narrow, explicit, and audited."
          >
            <div className="space-y-4">
              {data.members.length === 0 ? (
                <EmptyState
                  eyebrow="No visible members"
                  title="No workspace memberships are visible"
                  description="If this seems unexpected, verify the current role and membership scope first."
                />
              ) : null}

              {data.members.map((member) => (
                <InsetPanel
                  key={member.membershipId}
                  className="rounded-[var(--radius-card)] bg-[rgba(255,255,255,0.94)] p-5 shadow-[var(--shadow-soft)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-ink">
                        {member.displayName}
                        {member.isCurrentUser ? " (You)" : ""}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {member.email ?? `User id ${member.userId}`}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone={toneForRoleLabel()}>{member.roleName}</StatusBadge>
                      <StatusBadge tone={member.status === "active" ? "green" : "amber"}>
                        {member.status}
                      </StatusBadge>
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-ink-muted">
                    {member.roleDescription}
                  </p>

                  {member.canChangeRole ? (
                    <form action={updateTeamMemberRoleAction} className="mt-4 flex flex-wrap items-end gap-3">
                      <input
                        type="hidden"
                        name="membershipId"
                        value={member.membershipId}
                      />
                      <label className="grid min-w-[220px] gap-2">
                        <span className="text-sm font-medium text-ink">Internal role</span>
                        <select
                          name="roleKey"
                          defaultValue={member.roleKey}
                          className="aa-field"
                        >
                          {member.roleOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <ActionButton type="submit" variant="primary">
                        Save role
                      </ActionButton>
                    </form>
                  ) : (
                    <InsetPanel tone="gray" className="mt-4 text-sm text-ink-muted">
                      {member.isCurrentUser
                        ? "Self role changes are intentionally blocked so the current session cannot remove its own admin access."
                        : member.roleKey === "owner"
                          ? "Owner role changes stay out of scope for the current product."
                          : "This role is read-only under the current actor permissions."}
                    </InsetPanel>
                  )}
                </InsetPanel>
              ))}
            </div>
          </SectionCard>

          <div className="grid gap-6">
            <SectionCard
              title="Access posture"
              description="Keep role language aligned with real operational duties instead of generic user-management copy."
              items={[
                "Owner and admin roles can review the workspace directory; only narrow internal role edits are enabled.",
                "Admins can rebalance finance and analyst roles, but owner reassignment remains out of scope here.",
                "Partner-linked users remain separate from internal team memberships so the external portal boundary stays clean.",
              ]}
            />

            <SectionCard
              title="Invite internal users"
              description="Send team invites directly from the workspace so access setup does not rely on manual admin work."
            >
              <form action={inviteTeamMemberAction} className="space-y-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Email</span>
                  <input name="email" type="email" className="aa-field" required />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Role</span>
                  <select name="roleKey" defaultValue="analyst" className="aa-field">
                    <option value="admin">Admin</option>
                    <option value="finance">Finance</option>
                    <option value="analyst">Analyst</option>
                  </select>
                </label>

                <div className="flex justify-end">
                  <ActionButton type="submit" variant="primary">
                    Send invite
                  </ActionButton>
                </div>
              </form>
            </SectionCard>

            <SectionCard
              title="Pending invites"
              description="Keep invite state visible after the first send so the team directory stays trustworthy."
            >
              {teamInvites.length === 0 ? (
                <EmptyState
                  title="Your next internal invite will appear here"
                  description="Invited teammates accept from email and land directly in the workspace."
                />
              ) : (
                <div className="space-y-3">
                  {teamInvites.map((invitation) => (
                    <InsetPanel key={invitation.id}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-ink">{invitation.email}</p>
                          <p className="mt-1 text-sm text-ink-muted">
                            {invitation.roleLabel} • {invitation.statusLabel}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge tone={invitation.status === "pending" ? "amber" : "gray"}>
                            {invitation.statusLabel}
                          </StatusBadge>
                          {invitation.status === "pending" ? (
                            <>
                              <form action={resendTeamInviteAction}>
                                <input type="hidden" name="invitationId" value={invitation.id} />
                                <ActionButton type="submit">Resend</ActionButton>
                              </form>
                              <form action={revokeTeamInviteAction}>
                                <input type="hidden" name="invitationId" value={invitation.id} />
                                <ActionButton type="submit" variant="secondary">
                                  Revoke
                                </ActionButton>
                              </form>
                            </>
                          ) : null}
                        </div>
                      </div>
                    </InsetPanel>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </SettingsPageFrame>
  );
}
