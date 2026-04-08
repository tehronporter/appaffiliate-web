import { redirect } from "next/navigation";

import { listWorkspacePartners } from "@/lib/services/partners";

type PartnersRedirectPageProps = {
  searchParams: Promise<{
    status?: string;
    partner?: string;
    notice?: string;
    drawer?: string;
  }>;
};

export default async function PartnersRedirectPage({
  searchParams,
}: PartnersRedirectPageProps) {
  const { status, partner, notice, drawer } = await searchParams;
  const creators = await listWorkspacePartners();
  const matchedCreator = partner
    ? creators.partners.find((item) => item.id === partner || item.slug === partner) ?? null
    : null;

  if (matchedCreator) {
    const detailSearch = new URLSearchParams();

    if (notice) {
      detailSearch.set("notice", notice);
    }

    if (drawer) {
      detailSearch.set("drawer", drawer);
    }

    const detailQuery = detailSearch.toString();
    redirect(
      detailQuery
        ? `/creators/${matchedCreator.slug}?${detailQuery}`
        : `/creators/${matchedCreator.slug}`,
    );
  }

  const search = new URLSearchParams();

  if (status) {
    search.set("status", status);
  }

  if (notice) {
    search.set("notice", notice);
  }

  if (drawer) {
    search.set("drawer", drawer);
  }

  const query = search.toString();
  redirect(query ? `/creators?${query}` : "/creators");
}
