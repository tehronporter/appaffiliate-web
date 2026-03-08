import { redirect } from "next/navigation";

type OnboardingPageProps = {
  searchParams: Promise<{
    step?: string;
    error?: string;
  }>;
};

export default async function OnboardingRedirectPage({
  searchParams,
}: OnboardingPageProps) {
  const { step, error } = await searchParams;
  const search = new URLSearchParams();

  if (step) {
    search.set("step", step);
  }

  if (error) {
    search.set("error", error);
  }

  const query = search.toString();
  redirect(query ? `/setup?${query}` : "/setup");
}
