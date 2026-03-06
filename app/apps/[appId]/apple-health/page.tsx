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
      currentPath={`/apps/${formattedAppId}/apple-health`}
      eyebrow="App Integration"
      title={`Apple Health placeholder for ${formattedAppId}`}
      description="This nested app route is reserved for future Apple Health setup notes, permissions guidance, and implementation checks. The page currently acts as a clean placeholder only."
      primaryAction={{ href: "/onboarding", label: "Back to onboarding" }}
      secondaryAction={{ href: "/dashboard", label: "Open dashboard" }}
      stats={[
        {
          label: "App",
          value: formattedAppId,
          detail: "The route is dynamic so app-specific setup pages can be added later.",
        },
        {
          label: "Integration",
          value: "Pending",
          detail: "No checks or sync state are connected yet.",
        },
        {
          label: "Scope",
          value: "Apple Health",
          detail: "This path can later hold docs, status, and troubleshooting steps.",
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
          description: "For Phase 0, the goal is just to prove the nested route structure works.",
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
