import type { ReactNode } from "react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  FilterChipLink,
  PageHeader,
  StatCard,
  StatusBadge,
  type StatusTone,
} from "@/components/admin-ui";
import {
  settingsSections,
  type SettingsSectionId,
} from "@/lib/settings-navigation";

type SettingsStat = {
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
};

type SettingsPageFrameProps = {
  activeSection: "overview" | SettingsSectionId;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: SettingsStat[];
  badges?: ReactNode;
  children: ReactNode;
};

export function SettingsPageFrame({
  activeSection,
  title,
  description,
  actions,
  stats,
  badges,
  children,
}: SettingsPageFrameProps) {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Settings"
        title={title}
        description={description}
        actions={actions}
      >
        <div className="space-y-4">
          {badges ?? (
            <div className="flex flex-wrap gap-3">
              <StatusBadge tone="green">Backed by live data</StatusBadge>
              <StatusBadge tone="amber">Read-only where models stay narrow</StatusBadge>
              <StatusBadge tone="blue">Internal workspace settings</StatusBadge>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <FilterChipLink href="/settings" active={activeSection === "overview"}>
              Overview
            </FilterChipLink>
            {settingsSections.map((section) => (
              <FilterChipLink
                key={section.id}
                href={section.href}
                active={activeSection === section.id}
              >
                {section.title}
              </FilterChipLink>
            ))}
          </div>
        </div>
      </PageHeader>

      {stats?.length ? (
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              detail={stat.detail}
              tone={stat.tone}
              size="compact"
            />
          ))}
        </div>
      ) : null}

      {children}
    </PageContainer>
  );
}

export function SettingsHubActions() {
  return (
    <>
      <ActionLink href="/dashboard">Open dashboard</ActionLink>
      <ActionLink href="/onboarding" variant="primary">
        Open activation guide
      </ActionLink>
    </>
  );
}
