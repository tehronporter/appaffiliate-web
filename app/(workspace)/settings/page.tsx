import { ActionLink } from "@/components/app-shell";
import {
  EmptyState,
  InlineActionRow,
  SectionCard,
  SurfaceCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  SettingsHubActions,
  SettingsPageFrame,
} from "@/components/settings-shell";
import { settingsSections } from "@/lib/settings-navigation";

export default function SettingsPage() {
  return (
    <SettingsPageFrame
      activeSection="overview"
      title="Workspace settings"
      description="Keep organization, team, rules, exports, and audit controls shallow, explicit, and one click away so Phase 1 feels intentionally complete without pretending the deeper systems are wired yet."
      actions={<SettingsHubActions />}
      stats={[
        {
          label: "Settings shells",
          value: String(settingsSections.length),
          detail: "Each remaining admin setting now has a stable home instead of living behind one placeholder.",
          tone: "success",
        },
        {
          label: "Portal boundary",
          value: "Separate",
          detail: "Partner-facing screens stay outside the admin shell and settings remain internal.",
          tone: "primary",
        },
        {
          label: "Phase 2 wires",
          value: "Mapped",
          detail: "Every settings route calls out what the next real integration step is.",
          tone: "warning",
        },
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <SurfaceCard>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            Settings map
          </p>
          <div className="mt-4 overflow-hidden rounded-[22px] border border-border bg-surface">
            {settingsSections.map((section) => (
              <InlineActionRow
                key={section.id}
                title={section.title}
                description={section.description}
                badge={<StatusBadge tone="warning">Mock only</StatusBadge>}
                actions={
                  <ActionLink href={section.href} variant="primary">
                    Open
                  </ActionLink>
                }
              />
            ))}
          </div>
        </SurfaceCard>

        <div className="grid gap-6">
          <SectionCard
            title="Route audit"
            description="The remaining Phase 1 routes should now be reachable either from the workspace nav, this settings map, or the portal boundary link."
            actions={<ActionLink href="/portal">Open portal</ActionLink>}
            items={[
              "Workspace nav covers dashboard, onboarding, program, operations, and settings.",
              "This hub links organization, team, rules, exports, and audit in one place.",
              "The partner portal placeholder is linked separately so external workflows never inherit admin chrome.",
            ]}
          />

          <SectionCard
            title="State and copy audit"
            description="Phase 1 uses consistent review language across empty states, warnings, mock-only surfaces, and next-step notes."
            items={[
              "Settings routes use the same mock-only and Phase 2 badges instead of ad hoc disclaimers.",
              "Operational pages keep review-safe language around attribution, ledger, export, and payout states.",
              "The tone stays calm and system-of-record oriented instead of slipping into marketing analytics language.",
            ]}
          />

          <SectionCard
            title="Phase 2 wires next"
            description="This is the checklist for turning the settings shell into real controls later."
            items={settingsSections.map((section) => section.phase2Next)}
          />
        </div>
      </div>

      <SectionCard
        title="Portal boundary"
        description="The partner portal remains intentionally read-only and separate during Phase 1."
      >
        <EmptyState
          eyebrow="Separate surface"
          title="External partner workflows still stop at the placeholder"
          description="Phase 1 reserves the route, the shell, and the copy boundary. Phase 2 can add partner auth, reporting, and payout visibility without mixing those tools into admin settings."
          action={
            <ActionLink href="/portal" variant="primary">
              Review portal placeholder
            </ActionLink>
          }
        />
      </SectionCard>
    </SettingsPageFrame>
  );
}
