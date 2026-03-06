import { PlaceholderPage } from "@/components/placeholder-page";

type AppleHealthPageProps = {
  params: Promise<{
    appId: string;
  }>;
};

export default async function AppleHealthPage({
  params,
}: AppleHealthPageProps) {
  const { appId } = await params;
  const formattedAppId = decodeURIComponent(appId);

  return (
    <PlaceholderPage
      eyebrow="Program"
      title={`Apple Health for ${formattedAppId}`}
      description="This nested app route is reserved for Apple Health setup notes, permissions guidance, and implementation checks. Phase 1 keeps it placeholder-only, but the shared shell makes it feel like a first-class program surface."
      primaryAction={{ href: "/onboarding", label: "Back to onboarding" }}
      secondaryAction={{ href: "/dashboard", label: "Open overview" }}
      stats={[
        {
          label: "App",
          value: formattedAppId,
          detail: "The route is dynamic so app-specific setup pages can be added later.",
          tone: "primary",
        },
        {
          label: "Integration",
          value: "Pending",
          detail: "No checks or sync state are connected yet.",
          tone: "warning",
        },
        {
          label: "Scope",
          value: "Apple Health",
          detail: "This path can later hold docs, status, and troubleshooting steps.",
          tone: "success",
        },
      ]}
      sections={[
        {
          title: "What this page may include later",
          description: "The route is intended for app-specific operational setup.",
          items: [
            "Permission requirements and setup checklist.",
            "Health data sync status or environment checks.",
            "Links to docs or support notes for implementation teams.",
          ],
        },
        {
          title: "Current placeholder role",
          description: "For Phase 1, the goal is to prove the nested route structure works without adding real implementation logic yet.",
          items: [
            "No live data is read for the selected app.",
            "No integration actions are available.",
            "The shared shell keeps the nested route aligned with the rest of the product.",
          ],
        },
      ]}
    />
  );
}
