import { redirect } from "next/navigation";

type UnattributedRedirectPageProps = {
  searchParams: Promise<{
    item?: string;
    notice?: string;
  }>;
};

export default async function UnattributedRedirectPage({
  searchParams,
}: UnattributedRedirectPageProps) {
  const { item, notice } = await searchParams;
  const search = new URLSearchParams();
  search.set("view", "needs-review");

  if (item) {
    search.set("item", item);
  }

  if (notice) {
    search.set("notice", notice);
  }

  redirect(`/review?${search.toString()}`);
}
