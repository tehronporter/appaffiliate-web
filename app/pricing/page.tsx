import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingCard,
  MarketingComparison,
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
  title: "Pricing",
  description:
    "Pricing is handled through guided rollout so founders can evaluate the model against risky upfront influencer spend and manual payout overhead first.",
};

const pricingCards = [
  {
    title: "Founder-friendly evaluation",
    description:
      "Start with fit first: does a results-based creator channel make more sense than paying for promotion up front and hoping it converts?",
  },
  {
    title: "Guided rollout",
    description:
      "AppAffiliate is currently introduced through a guided rollout so setup, access, and early workflow fit stay aligned.",
  },
  {
    title: "Scale without spreadsheet overhead",
    description:
      "As the creator program grows, tracking, review, commissions, payouts, and creator visibility stay in one system.",
  },
];

const includedCoverage = [
  {
    title: "Internal workspace",
    description:
      "Creator tracking, review flows, commissions, payouts, exports, settings, and audit-safe operating surfaces.",
  },
  {
    title: "Creator portal",
    description:
      "A separate read-only view for creators to see codes, results, approved earnings, and payout status.",
  },
  {
    title: "Guided setup",
    description:
      "Teams start with rollout support so the workflow matches how the product is actually used today.",
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
          title="A better bet than risky upfront influencer spend."
          description="AppAffiliate is currently priced through guided rollout. That keeps the conversation focused on creator results, payout trust, and workflow fit instead of fake self-serve plans."
          actions={
            <>
              <Link href="/request-access" className="aa-button aa-button-primary px-5 py-3">
                Request access
              </Link>
              <Link href="/how-it-works" className="aa-button aa-button-secondary px-5 py-3">
                See how it works
              </Link>
            </>
          }
        >
          <MarketingComparison
            title="Compare the cost logic, not just a feature list."
            description="The real alternative is not another SaaS line item. It is wasted influencer spend, manual payout cleanup, and unclear creator performance."
            leftTitle="What founders are replacing"
            leftItems={[
              "Upfront creator deals with unclear subscription outcomes",
              "Spreadsheet-heavy tracking and payout follow-up",
              "Back-and-forth questions about what actually converted",
            ]}
            rightTitle="What AppAffiliate improves"
            rightItems={[
              "A results-based creator channel for iOS apps",
              "Clearer review, earnings, and payout visibility",
              "A founder-readable system that still holds up operationally",
            ]}
          />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="How pricing is handled"
            title="Simple, guided, and honest about the current product."
            description="There is no public self-serve checkout yet. Pricing is handled during rollout so the setup, access model, and support path fit your current stage."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingCards.map((card) => (
              <MarketingCard
                key={card.title}
                title={card.title}
                description={card.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="What is included"
            title="Coverage built around real creator growth workflows."
            description="The value is not just access to pages. It is a connected system for creators, results, commissions, payouts, and creator-safe visibility."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {includedCoverage.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="contrast"
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Review the model, then request access."
              description="If AppAffiliate looks like a better alternative to risky upfront influencer spend, request access and continue the rollout conversation."
              primaryHref="/request-access"
              primaryLabel="Request access"
              secondaryHref="/product"
              secondaryLabel="See product"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
