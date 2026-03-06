import { PlaceholderPage } from "@/components/placeholder-page";

export default function UnattributedPage() {
  return (
    <PlaceholderPage
      currentPath="/unattributed"
      eyebrow="Exceptions"
      title="Unattributed placeholder"
      description="This route is reserved for installs, trials, or purchases that do not yet map cleanly to a known partner or code. The placeholder keeps the operational workflow visible early."
      primaryAction={{ href: "/codes", label: "Review codes" }}
      secondaryAction={{ href: "/dashboard", label: "Back to dashboard" }}
      stats={[
        {
          label: "Queue size",
          value: "0",
          detail: "No unresolved events are loaded at this stage.",
        },
        {
          label: "Priority",
          value: "High",
          detail: "This route will matter once attribution exceptions appear.",
        },
        {
          label: "Resolution",
          value: "Manual",
          detail: "Future tools here will help analysts map events more quickly.",
        },
      ]}
      sections={[
        {
          title: "What will likely appear here",
          description: "The real page should help teams investigate missing attribution.",
          items: [
            "Event timestamps, app names, and suspected partner matches.",
            "Suggested code or campaign relationships.",
            "Actions to reassign, ignore, or escalate entries.",
          ],
        },
        {
          title: "Phase 0 purpose",
          description: "This placeholder gives the product a realistic operational footprint.",
          items: [
            "Shows where exception handling will live.",
            "Creates a natural partner to the codes screen.",
            "Keeps routing stable before any review logic exists.",
          ],
        },
      ]}
    />
  );
}
