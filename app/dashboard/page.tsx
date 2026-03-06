import { PlaceholderPage } from "@/components/placeholder-page";

export default function DashboardPage() {
  return (
    <PlaceholderPage
      currentPath="/dashboard"
      eyebrow="Overview"
      title="Dashboard placeholder"
      description="The dashboard will become the main summary for partner performance, code activity, unattributed events, and payout readiness. For now it serves as a polished shell route."
      primaryAction={{ href: "/partners", label: "View partners" }}
      secondaryAction={{ href: "/codes", label: "Open codes" }}
      stats={[
        {
          label: "Partners",
          value: "0",
          detail: "No connected records yet. Real counts will come from Supabase.",
        },
        {
          label: "Codes",
          value: "0",
          detail: "Referral codes and ownership rules will appear here later.",
        },
        {
          label: "Payouts",
          value: "Draft",
          detail: "Batching and approvals are not active in Phase 0.",
        },
      ]}
      sections={[
        {
          title: "Dashboard modules",
          description: "These are the blocks this page is being prepared to host.",
          items: [
            "Top-line partner, code, and revenue metrics.",
            "Recent attribution exceptions that need review.",
            "Quick links into onboarding and payout workflows.",
          ],
        },
        {
          title: "Why this placeholder exists",
          description: "The page provides stable navigation and layout before the data model lands.",
          items: [
            "Lets localhost review feel like a real product.",
            "Creates a consistent home for future widgets and filters.",
            "Keeps route structure clear while backend logic is still pending.",
          ],
        },
      ]}
    />
  );
}
