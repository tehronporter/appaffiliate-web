import { PlaceholderPage } from "@/components/placeholder-page";

export default function CodesPage() {
  return (
    <PlaceholderPage
      eyebrow="Program"
      title="Codes"
      description="The codes area will eventually track referral codes, ownership, status, and attribution coverage. For Phase 1, it exists as a clean route-level placeholder inside the new shared shell."
      primaryAction={{ href: "/unattributed", label: "Open needs attribution" }}
      secondaryAction={{ href: "/partners", label: "Open partners" }}
      stats={[
        {
          label: "Tracked codes",
          value: "0",
          detail: "Code records and validation rules are still to come.",
          tone: "primary",
        },
        {
          label: "Coverage",
          value: "Draft",
          detail: "This page will later show how much traffic is attributable.",
          tone: "success",
        },
        {
          label: "Review state",
          value: "Open",
          detail: "It is ready for future moderation and cleanup workflows.",
          tone: "warning",
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
