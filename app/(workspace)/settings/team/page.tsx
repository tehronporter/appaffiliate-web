import { ActionLink } from "@/components/app-shell";
import {
  EmptyState,
  SectionCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import { updateTeamMemberRoleAction } from "@/app/(workspace)/settings/actions";
import { getTeamSettingsData } from "@/lib/services/settings";

type SettingsTeamPageProps = {
  searchParams: Promise<{
    notice?: string;
  }>;
};

function noticeBadge(notice: string | undefined) {
  if (notice === "team-role-saved") {
    return <StatusBadge tone="success">Workspace role updated</StatusBadge>;
  }

  if (notice === "team-role-error") {
    return <StatusBadge tone="danger">Workspace role update failed</StatusBadge>;
  }

  return null;
}

export default async function SettingsTeamPage({
  searchParams,
}: SettingsTeamPageProps) {
  const { notice } = await searchParams;
  const data = await getTeamSettingsData();
  const noticeChip = noticeBadge(notice);

  return (
    <SettingsPageFrame
      activeSection="team"
      title="Team settings"
      description="Show the real workspace membership directory allowed by the current auth model, keep role changes narrow and explicit, and stay honest that invite automation still does not exist in this MVP."
      actions={
        <>
          <SettingsHubActions />
          <ActionLink href="/settings/audit">Open audit</ActionLink>
        </>
      }
      badges={
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Real workspace membership</StatusBadge>
          <StatusBadge tone={data.canManageRoles ? "primary" : "warning"}>
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
          tone: "primary",
        },
        {
          label: "Pending invites",
          value: String(data.pendingInviteCount),
          detail: "Invite issuance is still out of scope, so this count only reflects current membership data if invited rows already exist.",
          tone: "warning",
        },
        {
          label: "Partner-linked users",
          value: String(data.partnerUserCount),
          detail: "External partner identities stay separate from the internal workspace team.",
          tone: "success",
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
                Return to overview
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
                <div
                  key={member.membershipId}
                  className="rounded-[24px] border border-border bg-surface p-5"
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
                      <StatusBadge tone="primary">{member.roleName}</StatusBadge>
                      <StatusBadge tone={member.status === "active" ? "success" : "warning"}>
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
                          className="rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-white"
                        >
                          {member.roleOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button
                        type="submit"
                        className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                      >
                        Save role
                      </button>
                    </form>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-ink-muted">
                      {member.isCurrentUser
                        ? "Self role changes are intentionally blocked so the current session cannot remove its own admin access."
                        : member.roleKey === "owner"
                          ? "Owner role changes stay out of scope for this MVP slice."
                          : "This role is read-only under the current actor permissions."}
                    </div>
                  )}
                </div>
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
              title="Invite flows"
              description="Be honest about the current boundary instead of showing fake onboarding controls."
            >
              {data.pendingInviteCount === 0 ? (
                <EmptyState
                  eyebrow="No pending invites"
                  title="Invite issuance is still not modeled here"
                  description="This route shows existing membership state only. If invited rows already exist in the workspace model, they will appear in the real count above."
                />
              ) : (
                <div className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted">
                  {data.pendingInviteCount} invited membership rows are visible, but invite send and accept flows remain intentionally out of scope.
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </SettingsPageFrame>
  );
}
