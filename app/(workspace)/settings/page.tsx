import { PlaceholderPage } from "@/components/placeholder-page";

export default function SettingsPage() {
  return (
    <PlaceholderPage
      eyebrow="Settings"
      title="Workspace settings"
      description="This shallow settings surface keeps configuration one click away without mixing deeper admin tools into Phase 1. It is intentionally light, but it gives future role, billing, and notification controls a stable home."
      primaryAction={{ href: "/dashboard", label: "Back to overview" }}
      secondaryAction={{ href: "/partners", label: "Open partners" }}
      stats={[
        {
          label: "Access",
          value: "Admin",
          detail: "Settings stay in the internal workspace, not the future partner portal.",
          tone: "primary",
        },
        {
          label: "Roles",
          value: "Ready",
          detail: "Workspace role foundations already exist and can plug in here later.",
          tone: "success",
        },
        {
          label: "Scope",
          value: "Shallow",
          detail: "Phase 1 keeps this as navigation and layout groundwork only.",
          tone: "warning",
        },
      ]}
      sections={[
        {
          title: "Future controls",
          description: "This page is reserving the right homes for admin-facing setup.",
          items: [
            "Organization profile, workspace defaults, and branding.",
            "Role management, invite rules, and audit-oriented controls.",
            "Notification, export, and payout policy preferences.",
          ],
        },
        {
          title: "Portal boundary",
          description: "Settings remain internal so external partner tools can stay clean later.",
          items: [
            "No creator or partner portal actions are mixed into this shell.",
            "A future /portal surface can reuse tokens without inheriting admin navigation.",
            "The route is shallow now and safe to extend later.",
          ],
        },
      ]}
    />
  );
}
