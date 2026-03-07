import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading,
} from "@/components/marketing-page";
import { MarketingShell } from "@/components/marketing-shell";
import {
  publicFooterLinks,
  publicNavLinks,
  publicPrimaryAction,
  publicSecondaryAction,
} from "@/lib/public-site";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Learn how AppAffiliate handles role-aware access, org scoping, audited decisions, partner separation, server-side secret handling, and sanitized browser-facing data.",
};

const trustAreas = [
  {
    title: "Role-aware access",
    description:
      "Internal admin users and partner users enter different experiences with distinct route boundaries and permission checks.",
  },
  {
    title: "Organization scoping",
    description:
      "Operational reads and writes stay scoped to the active organization to preserve multi-tenant safety.",
  },
  {
    title: "Audit history",
    description:
      "Key manual decisions across attribution, commissions, payouts, and admin-sensitive changes remain auditable.",
  },
  {
    title: "Partner and admin separation",
    description:
      "The partner portal stays read-only and separate from internal settings, exports, audit trails, and admin tooling.",
  },
  {
    title: "Server-side secret handling",
    description:
      "Sensitive service-role access and secret-backed operations stay on the server side rather than in browser-facing flows.",
  },
  {
    title: "Sanitized browser views",
    description:
      "Browser-facing event and receipt surfaces avoid exposing raw sensitive Apple payloads.",
  },
];

const honestyNotes = [
  {
    title: "Trust grounded in the product",
    description:
      "This page describes what AppAffiliate does today. It does not claim enterprise certifications or programs that are not part of the current product.",
  },
  {
    title: "Finance-aware controls",
    description:
      "Exports, payout preparation, and manual review paths are permissioned because those workflows carry real operational consequences.",
  },
  {
    title: "Operational rather than ornamental",
    description:
      "The product’s trust model comes from explicit boundaries, narrow server actions, and readable workflow state rather than heavy compliance theater.",
  },
];

export default function SecurityPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/security"
    >
      <main>
        <MarketingHero
          eyebrow="Security"
          title="Security grounded in real controls."
          description="AppAffiliate keeps the trust story grounded in the product: role-aware access, organization scoping, audited manual decisions, partner and admin separation, server-side secret handling, and safer browser-facing views."
          actions={
            <>
              <Link href="/request-access" className="aa-button aa-button-primary px-5 py-3">
                Request access
              </Link>
              <Link href="/product" className="aa-button aa-button-secondary px-5 py-3">
                See product
              </Link>
            </>
          }
        >
          <p className="text-sm font-medium text-[#1A1A1A]">Current trust posture</p>
          <p className="mt-4 text-sm leading-7 text-[#5B6472]">
            AppAffiliate is designed as a controlled operations product. The
            current product emphasizes narrower access, explicit review state, and
            server-side handling for sensitive paths rather than broad
            enterprise claims.
          </p>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="What exists today"
            title="Security posture aligned to the real product."
            description="The public site should make it easy to understand how AppAffiliate protects boundaries without overstating its scope."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trustAreas.map((area) => (
              <MarketingCard
                key={area.title}
                title={area.title}
                description={area.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="How we describe trust"
            title="Measured, specific, and current."
            description="AppAffiliate should build confidence by naming the controls that exist now and the workflows they protect."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {honestyNotes.map((note) => (
              <MarketingCard
                key={note.title}
                title={note.title}
                description={note.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Review the workflow and trust model together."
              description="Security review is more useful when paired with the product and workflow pages, because access boundaries and auditability are part of the operating model itself."
              primaryHref="/how-it-works"
              primaryLabel="See how it works"
              secondaryHref="/request-access"
              secondaryLabel="Request access"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
