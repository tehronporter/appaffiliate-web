import { redirect } from "next/navigation";

type EventsRedirectPageProps = {
  searchParams: Promise<{
    state?: string;
    event?: string;
  }>;
};

export default async function EventsRedirectPage({
  searchParams,
}: EventsRedirectPageProps) {
  const { state, event } = await searchParams;
  const search = new URLSearchParams();

  if (event) {
    search.set("event", event);
  }

  if (state === "attributed") {
    search.set("view", "approved");
  } else if (state === "ignored") {
    search.set("view", "rejected");
  } else if (state === "failed") {
    search.set("view", "blocked");
  } else if (state === "unattributed") {
    search.set("view", "needs-review");
  } else {
    search.set("view", "all");
  }

  redirect(`/review?${search.toString()}`);
}
