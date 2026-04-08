import { InsetPanel, SectionCard, StatusBadge } from "@/components/admin-ui";
import { AcceptInviteClient } from "@/components/auth/accept-invite-client";
import { PublicShell } from "@/components/public-shell";

export default async function AcceptInvitePage() {
  return (
    <PublicShell
      eyebrow="Accept invite"
      title="Finish setting up your AppAffiliate access"
      description="Use the invited account session to finish linking your workspace or creator portal access."
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-6">
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <InsetPanel tone="primary">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Internal workspace
                </p>
                <StatusBadge tone="primary">Team roles</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Internal invites open the admin workspace with the role assigned by your organization.
              </p>
            </InsetPanel>

            <InsetPanel tone="success">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Creator portal
                </p>
                <StatusBadge tone="success">Read-only</StatusBadge>
              </div>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Creator invites link your account to a single creator record and keep the portal scoped.
              </p>
            </InsetPanel>
          </div>

          <SectionCard
            tone="public-access"
            title="Before you continue"
            description="Use the same email that received the invite. AppAffiliate finalizes the org or creator link after your session is present."
            items={[
              "If the invite already opened a browser session, this page finishes the link automatically.",
              "If not, sign in with the invited email and return here.",
              "Creator portal access stays separate from internal workspace access even when the same company invited both.",
            ]}
          />
        </div>

        <AcceptInviteClient />
      </div>
    </PublicShell>
  );
}
