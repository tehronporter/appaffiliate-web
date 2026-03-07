import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingList,
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
  title: "Pricing",
  description:
    "AppAffiliate is currently offered through guided onboarding and invited team access. Review what is included and how rollout works today.",
};

const includedItems = [
  "Internal admin workspace access for affiliate operations",
  "Partner and code management, review workflows, commissions, payouts, and exports",
  "Settings, audit, operational visibility, and partner portal access where configured",
];

const pricingNotes = [
  {
    title: "Guided rollout",
    description:
      "AppAffiliate is currently introduced through a direct rollout process rather than self-serve checkout.",
  },
  {
    title: "Team access",
    description:
      "Access is configured around invited internal users and, when needed, linked partner portal users.",
  },
  {
    title: "No in-product billing",
    description:
      "Billing is not yet handled inside the product, so the public pricing page stays honest about the current guided rollout model.",
  },
];

export default function PricingPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/pricing"
    >
      <main>
        <MarketingHero
          eyebrow="Pricing"
          title="Guided rollout for live programs."
          description="AppAffiliate is currently offered through guided onboarding and invited team access. The rollout model stays honest to the product that exists today instead of pretending public self-serve billing is already live."
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
          <p className="text-sm font-medium text-[#1A1A1A]">Included in the current rollout</p>
          <div className="mt-5">
            <MarketingList items={includedItems} />
          </div>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="Pricing posture"
            title="A rollout page that reflects the current product honestly."
            description="The current model is contact-led and onboarding-driven. That keeps the commercial story aligned with the product instead of implying in-product subscriptions or automated billing that do not exist yet."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingNotes.map((note) => (
              <MarketingCard
                key={note.title}
                title={note.title}
                description={note.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="What the rollout includes"
            title="Coverage built around the current product."
            description="AppAffiliate is positioned as an operational product for partner programs. Access discussions should stay centered on the workflow coverage that exists today."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <MarketingCard
              title="Internal team workflows"
              description="Apple health, partners, promo codes, attributed and unattributed review, commissions, payouts, payout batches, exports, settings, audit, and monitoring."
            />
            <MarketingCard
              title="Partner visibility"
              description="A separate read-only partner portal for codes, performance, and payout status when partner access is linked safely."
            />
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Request access when the rollout model fits."
              description="AppAffiliate is best evaluated through the product and workflow pages first. If the current product lines up with your needs, use the access page to continue the conversation."
              primaryHref="/request-access"
              primaryLabel="Request access"
              secondaryHref="/how-it-works"
              secondaryLabel="How it works"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
