import { PlaceholderPage } from "@/components/placeholder-page";

export default function CommissionsPage() {
  return (
    <PlaceholderPage
      currentPath="/commissions"
      eyebrow="Earnings"
      title="Commissions placeholder"
      description="The commissions area will track what has been earned, what still needs review, and what is ready for payout. At the moment it is a structured placeholder page only."
      primaryAction={{ href: "/payout-batches", label: "Open payout batches" }}
      secondaryAction={{ href: "/partners", label: "Open partners" }}
      stats={[
        {
          label: "Approved",
          value: "$0",
          detail: "No real earnings data is loaded into the app yet.",
        },
        {
          label: "Pending",
          value: "$0",
          detail: "Review states and approval actions will be added later.",
        },
        {
          label: "Currency",
          value: "USD",
          detail: "A simple default keeps the placeholder grounded in a real workflow.",
        },
      ]}
      sections={[
        {
          title: "Future commission details",
          description: "This route is being prepared for straightforward financial review screens.",
          items: [
            "Partner-level earnings and commission source.",
            "Approval, dispute, and hold states.",
            "Links into payout batches and partner records.",
          ],
        },
        {
          title: "Current placeholder notes",
          description: "The page is deliberately minimal while still feeling product-ready.",
          items: [
            "No calculations or filters are active yet.",
            "No export or approval buttons are wired up.",
            "The route structure is ready for real tables and summaries.",
          ],
        },
      ]}
    />
  );
}
