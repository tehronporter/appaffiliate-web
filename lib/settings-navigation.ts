export type SettingsSectionId =
  | "organization"
  | "team"
  | "rules"
  | "exports"
  | "audit";

export type SettingsSection = {
  id: SettingsSectionId;
  title: string;
  href: string;
  description: string;
  phase2Next: string;
};

export const settingsSections: SettingsSection[] = [
  {
    id: "organization",
    title: "Organization",
    href: "/settings/organization",
    description: "Workspace identity, defaults, and internal boundary decisions.",
    phase2Next: "Wire live workspace profile and editable notification defaults.",
  },
  {
    id: "team",
    title: "Team",
    href: "/settings/team",
    description: "Role posture, access review cadence, and invite operating rules.",
    phase2Next: "Connect real membership, invite, and role-management actions.",
  },
  {
    id: "rules",
    title: "Rules",
    href: "/settings/rules",
    description: "Attribution precedence, exclusions, and review-safe overrides.",
    phase2Next: "Plug in persisted attribution, exclusion, and policy controls.",
  },
  {
    id: "exports",
    title: "Exports",
    href: "/settings/exports",
    description: "Finance handoff shape, file conventions, and export retention.",
    phase2Next: "Connect export jobs, retained files, and operator confirmations.",
  },
  {
    id: "audit",
    title: "Audit",
    href: "/settings/audit",
    description: "Audit trail expectations, reconciliation posture, and exception review.",
    phase2Next: "Wire real audit history, actor metadata, and review filters.",
  },
];

export function getSettingsSection(sectionId: SettingsSectionId) {
  return settingsSections.find((section) => section.id === sectionId) ?? null;
}
