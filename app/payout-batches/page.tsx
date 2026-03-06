import { PlaceholderPage } from "@/components/placeholder-page";

export default function PayoutBatchesPage() {
  return (
    <PlaceholderPage
      currentPath="/payout-batches"
      eyebrow="Payments"
      title="Payout batches placeholder"
      description="This page will support the final batching workflow for approved commissions. In Phase 0 it simply marks the destination for future payout review and release tools."
      primaryAction={{ href: "/commissions", label: "Back to commissions" }}
      secondaryAction={{ href: "/dashboard", label: "Back to dashboard" }}
      stats={[
        {
          label: "Batches",
          value: "0",
          detail: "No payout runs have been created yet.",
        },
        {
          label: "State",
          value: "Draft",
          detail: "The route is present before real approval mechanics exist.",
        },
        {
          label: "Destination",
          value: "Finance",
          detail: "This screen will eventually support handoff and reconciliation.",
        },
      ]}
      sections={[
        {
          title: "Likely workflow",
          description: "The full version of this page can guide operators through payout prep.",
          items: [
            "Select approved commissions for a new batch.",
            "Review totals, partners, and payout method coverage.",
            "Mark batches as exported, paid, or reconciled.",
          ],
        },
        {
          title: "Why it exists now",
          description: "The product already feels whole when every major destination has a route.",
          items: [
            "Supports end-to-end navigation during early demos.",
            "Clarifies where finance-oriented tools will land.",
            "Keeps later implementation focused on behavior instead of structure.",
          ],
        },
      ]}
    />
  );
}
