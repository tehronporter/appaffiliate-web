import { PlaceholderPage } from "@/components/placeholder-page";

export default function OnboardingPage() {
  return (
    <PlaceholderPage
      eyebrow="Program"
      title="Onboarding"
      description="This route is reserved for the early setup experience: app registration, partner invite flow, and tracking requirements. The content is still placeholder-only, but it now lives inside the shared workspace shell."
      primaryAction={{ href: "/apps/demo-app/apple-health", label: "Open app setup" }}
      secondaryAction={{ href: "/dashboard", label: "Back to overview" }}
      stats={[
        {
          label: "Checklist",
          value: "0%",
          detail: "No setup items are connected yet, but this page is ready for them.",
          tone: "warning",
        },
        {
          label: "Apps",
          value: "1 demo",
          detail: "The Apple Health route demonstrates a nested app-specific path.",
          tone: "primary",
        },
        {
          label: "Partners",
          value: "Pending",
          detail: "Invite and approval workflows will eventually start from here.",
          tone: "success",
        },
      ]}
      sections={[
        {
          title: "Future onboarding flow",
          description: "The final version can guide teams through the first important steps.",
          items: [
            "Create or connect an app record.",
            "Confirm attribution and partner tracking rules.",
            "Invite internal teammates or external partners.",
          ],
        },
        {
          title: "Phase 1 boundaries",
          description: "This page is intentionally shallow so the route exists without extra complexity.",
          items: [
            "No forms, writes, or progress persistence.",
            "No auth checks or role gating yet.",
            "Only enough structure to support future product work.",
          ],
        },
      ]}
    />
  );
}
