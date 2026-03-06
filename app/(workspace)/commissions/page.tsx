import { PlaceholderPage } from "@/components/placeholder-page";

export default function CommissionsPage() {
  return (
    <PlaceholderPage
      eyebrow="Operations"
      title="Commissions"
      description="The commissions area will track what has been earned, what still needs review, and what is ready for payout. At the moment it is still a structured placeholder page, but it now sits in the new operations group."
      primaryAction={{ href: "/payout-batches", label: "Open payout batches" }}
      secondaryAction={{ href: "/partners", label: "Open partners" }}
      stats={[
        {
          label: "Approved",
          value: "$0",
          detail: "No real earnings data is loaded into the app yet.",
          tone: "success",
        },
        {
          label: "Pending",
          value: "$0",
          detail: "Review states and approval actions will be added later.",
          tone: "warning",
        },
        {
          label: "Currency",
          value: "USD",
          detail: "A simple default keeps the placeholder grounded in a real workflow.",
          tone: "primary",
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
