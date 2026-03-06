import { PlaceholderPage } from "@/components/placeholder-page";

export default function CodesPage() {
  return (
    <PlaceholderPage
      currentPath="/codes"
      eyebrow="Attribution"
      title="Codes placeholder"
      description="The codes area will eventually track referral codes, ownership, status, and attribution coverage. For Phase 0, it exists as a clean route-level placeholder."
      primaryAction={{ href: "/unattributed", label: "View unattributed" }}
      secondaryAction={{ href: "/partners", label: "Open partners" }}
      stats={[
        {
          label: "Tracked codes",
          value: "0",
          detail: "Code records and validation rules are still to come.",
        },
        {
          label: "Coverage",
          value: "Draft",
          detail: "This page will later show how much traffic is attributable.",
        },
        {
          label: "Review state",
          value: "Open",
          detail: "It is ready for future moderation and cleanup workflows.",
        },
      ]}
      sections={[
        {
          title: "Planned table content",
          description: "A simple list will likely be the first real version of this page.",
          items: [
            "Referral code value and assigned partner.",
            "Associated app, channel, and start date.",
            "Active, paused, or retired code status.",
          ],
        },
        {
          title: "Supporting workflows",
          description: "This route also sets up adjacent pages and review queues.",
          items: [
            "Bulk code imports or creation flows.",
            "Duplicate or conflict detection.",
            "Cross-links into unattributed events and commissions.",
          ],
        },
      ]}
    />
  );
}
