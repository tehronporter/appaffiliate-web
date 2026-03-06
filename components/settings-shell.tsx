import type { ReactNode } from "react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  FilterChipLink,
  PageHeader,
  StatCard,
  StatusBadge,
} from "@/components/admin-ui";
import {
  settingsSections,
  type SettingsSectionId,
} from "@/lib/settings-navigation";

type SettingsStat = {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "success" | "warning" | "danger";
};

type SettingsPageFrameProps = {
  activeSection: "overview" | SettingsSectionId;
  title: string;
  description: string;
  actions?: ReactNode;
  stats?: SettingsStat[];
  children: ReactNode;
};

export function SettingsPageFrame({
  activeSection,
  title,
  description,
  actions,
  stats,
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
          <div className="flex flex-wrap gap-3">
            <StatusBadge tone="warning">Mock only in Phase 1</StatusBadge>
            <StatusBadge tone="primary">Phase 2 wires called out</StatusBadge>
            <StatusBadge>Internal admin settings</StatusBadge>
          </div>

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
      <ActionLink href="/dashboard">Back to overview</ActionLink>
      <ActionLink href="/portal" variant="primary">
        Open partner portal placeholder
      </ActionLink>
    </>
  );
}
