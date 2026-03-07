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
  title: "Product",
  description:
    "See how AppAffiliate handles partners, codes, attribution review, commissions, payouts, exports, Apple health, auditability, and partner visibility.",
};

const productAreas = [
  {
    title: "Partners and codes",
    description:
      "Keep partner records, promo code ownership, and app coverage readable as the program grows.",
  },
  {
    title: "Attribution review",
    description:
      "Inspect attributed and unattributed activity with a workflow that supports manual review where it matters.",
  },
  {
    title: "Unattributed queue",
    description:
      "Keep unresolved items in one visible queue instead of letting them drift into side-channel decisions.",
  },
  {
    title: "Commission review",
    description:
      "Review commissions explicitly so approval state is clear before anything moves toward payout.",
  },
  {
    title: "Payout preparation",
    description:
      "Group approved records into payout batches and keep status visible through export and paid states.",
  },
  {
    title: "Exports and auditability",
    description:
      "Keep finance-ready exports close to the workflow and preserve audit history where manual decisions matter.",
  },
  {
    title: "Apple health",
    description:
      "Use app-level ingest readiness and operational visibility to catch issues early.",
  },
  {
    title: "Partner portal",
    description:
      "Give partners a separate read-only portal for codes, performance, and payout status without exposing internal controls.",
  },
];

const operatingPrinciples = [
  {
    title: "Built for real review work",
    description:
      "AppAffiliate keeps manual attribution and finance review explicit instead of hiding the important steps behind automation claims.",
  },
  {
    title: "Finance-aware by default",
    description:
      "Commissions, payouts, exports, auditability, and role-aware controls stay close to the daily workflow.",
  },
  {
    title: "One brand, distinct surfaces",
    description:
      "The internal admin workspace and the read-only partner portal share the same product logic without collapsing into the same interface.",
  },
];

export default function ProductPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/product"
    >
      <main>
        <MarketingHero
          eyebrow="Product"
          title="The operating layer for partner programs."
          description="AppAffiliate brings the core operating surfaces for partner programs into one calm workflow: partners, codes, attribution review, commission control, payout preparation, exports, auditability, and a separate read-only partner portal."
          actions={
            <>
              <Link href="/how-it-works" className="aa-button aa-button-primary px-5 py-3">
                See how it works
              </Link>
              <Link href="/request-access" className="aa-button aa-button-secondary px-5 py-3">
                Request access
              </Link>
            </>
          }
        >
          <p className="text-sm font-medium text-[#1A1A1A]">What the product covers</p>
          <div className="mt-5 space-y-3">
            {[
              "Apple ingestion readiness and app-level operational visibility",
              "Partner and promo code management",
              "Attributed and unattributed review workflows",
              "Commission approval, payout batches, exports, and partner visibility",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#E9EDF3] bg-white px-4 py-4 text-sm leading-7 text-[#5B6472]"
              >
                {item}
              </div>
            ))}
          </div>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="Coverage"
            title="Product clarity without feature theater."
            description="The current product is intentionally narrow. Each product area exists to make partner programs more readable, more controlled, and easier to hand off into finance."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {productAreas.map((area) => (
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
            eyebrow="Why it feels different"
            title="A product shaped around workflow trust."
            description="AppAffiliate does not try to be a generic dashboard, a billing suite, or a marketplace. It is built for the review work between partner activity and payout."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {operatingPrinciples.map((principle) => (
              <MarketingCard
                key={principle.title}
                title={principle.title}
                description={principle.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Review the workflow, then request access."
              description="Start with the workflow if you want to see how AppAffiliate moves from app setup and attribution review into commissions, payouts, exports, and partner visibility."
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
