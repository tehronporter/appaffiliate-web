import { PlaceholderPage } from "@/components/placeholder-page";

export default function PartnersPage() {
  return (
    <PlaceholderPage
      currentPath="/partners"
      eyebrow="Relationships"
      title="Partners placeholder"
      description="This page will hold the partner directory for creators, affiliates, and agencies. It is scaffolded now so the route map already reflects the final product shape."
      primaryAction={{ href: "/commissions", label: "Review commissions" }}
      secondaryAction={{ href: "/dashboard", label: "Back to dashboard" }}
      stats={[
        {
          label: "Directory",
          value: "Empty",
          detail: "No partner records are rendered until real data is added.",
        },
        {
          label: "Status",
          value: "Planned",
          detail: "Approval states and relationship health will live here later.",
        },
        {
          label: "Surface",
          value: "List view",
          detail: "This route is the natural home for search and partner detail pages.",
        },
      ]}
      sections={[
        {
          title: "Partner data to add later",
          description: "This is the structure the page is preparing for.",
          items: [
            "Names, contact details, and payout preferences.",
            "Assigned codes, active campaigns, and app coverage.",
            "Approval history, notes, and internal ownership.",
          ],
        },
        {
          title: "Current placeholder role",
          description: "The route is present so the shell already feels complete.",
          items: [
            "Navigation is stable across local development.",
            "Design language stays consistent with the rest of the product.",
            "Future list and detail UIs can be added without changing the frame.",
          ],
        },
      ]}
    />
  );
}
