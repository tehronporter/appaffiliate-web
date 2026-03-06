import { PlaceholderPage } from "@/components/placeholder-page";

export default function LoginPage() {
  return (
    <PlaceholderPage
      currentPath="/login"
      eyebrow="Access"
      title="Login placeholder"
      description="This screen marks the future entry point for AppAffiliate users. It stays intentionally simple for Phase 0 so routing and product framing are ready before auth is wired in."
      primaryAction={{ href: "/dashboard", label: "Continue to dashboard" }}
      secondaryAction={{ href: "/", label: "Back to home" }}
      stats={[
        {
          label: "Auth state",
          value: "Mocked",
          detail: "No real sign-in flow or session handling is connected yet.",
        },
        {
          label: "Next step",
          value: "Supabase",
          detail: "This route is ready for Supabase auth UI or custom forms later.",
        },
        {
          label: "Purpose",
          value: "Entry",
          detail: "Keep a clear first-stop route for internal teams and partners.",
        },
      ]}
      sections={[
        {
          title: "Planned content",
          description: "The real login page can grow here without replacing the shell.",
          items: [
            "Email and password sign-in form.",
            "Magic link or invite acceptance flow.",
            "Basic role-based redirect after sign in.",
          ],
        },
        {
          title: "Phase 0 notes",
          description: "For now, this route only proves structure and presentation.",
          items: [
            "No form state or validation is included.",
            "No session checks block access to the rest of the app yet.",
            "The shared shell keeps the visual system consistent from day one.",
          ],
        },
      ]}
    />
  );
}
