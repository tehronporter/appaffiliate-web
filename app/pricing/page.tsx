import type { Metadata } from "next";
import Link from "next/link";
import { Lightbulb, Rocket, BarChart3, Monitor, Users, Wrench } from "lucide-react";

import {
  MarketingCard,
  MarketingComparison,
  MarketingCtaPanel,
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading,
  ScrollReveal,
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
    icon: <Lightbulb size={20} strokeWidth={1.5} />,
  },
  {
    title: "Guided rollout",
    description:
      "AppAffiliate is currently introduced through a guided rollout so setup, access, and early workflow fit stay aligned.",
    icon: <Rocket size={20} strokeWidth={1.5} />,
  },
  {
    title: "Scale without spreadsheet overhead",
    description:
      "As the creator program grows, tracking, review, commissions, payouts, and creator visibility stay in one system.",
    icon: <BarChart3 size={20} strokeWidth={1.5} />,
  },
];

const includedCoverage = [
  {
    title: "Internal workspace",
    description:
      "Creator tracking, review flows, commissions, payouts, exports, settings, and audit-safe operating surfaces.",
    icon: <Monitor size={20} strokeWidth={1.5} />,
  },
  {
    title: "Creator portal",
    description:
      "A separate read-only view for creators to see codes, results, approved earnings, and payout status.",
    icon: <Users size={20} strokeWidth={1.5} />,
  },
  {
    title: "Guided setup",
    description:
      "Teams start with rollout support so the workflow matches how the product is actually used today.",
    icon: <Wrench size={20} strokeWidth={1.5} />,
  },
];

const comparisonRows = [
  {
    painPoint: "Upfront spend risk",
    oldWay: "High spend lands first, then founders hope the campaign turns into real subscriptions. No recourse if it does not.",
    newWay: "Pay only when subscription results are confirmed. Zero upfront creator fees.",
  },
  {
    painPoint: "Creator accountability",
    oldWay: "Deals are based on reach and views. Payout is disconnected from whether the audience subscribed or stayed.",
    newWay: "Every creator\u2019s payout is tied directly to verified subscription outcomes.",
  },
  {
    painPoint: "Tracking complexity",
    oldWay: "Spreadsheet-heavy manual tracking, back-and-forth on what actually converted.",
    newWay: "Creator codes, results, approved earnings, and payout status all live in one place.",
  },
  {
    painPoint: "Payout trust",
    oldWay: "Creators do not know what they earned or when they will be paid until you tell them.",
    newWay: "Creators get a read-only portal showing codes, results, earnings, and payout progress in real time.",
  },
  {
    painPoint: "Review process",
    oldWay: "Manual review with no workflow \u2014 deciding in DMs or emails what counts.",
    newWay: "Built-in review queue: see which results are ready to trust, which need review, and why.",
  },
  {
    painPoint: "Commission changes",
    oldWay: "Any adjustment requires a manual message, spreadsheet update, and hope the creator has the right number.",
    newWay: "Commission changes, payout notes, and status updates are tracked in the system.",
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
        />

        <MarketingSection className="border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
          <MarketingComparison
            title="Compare the cost logic, not just a feature list."
            description="The real alternative is not another SaaS line item. It is wasted influencer spend, manual payout cleanup, and unclear creator performance."
            rows={comparisonRows}
          />

          <ScrollReveal className="mt-8 flex justify-center">
            <Link href="/request-access" className="aa-button aa-button-primary w-full px-6 py-3 sm:w-auto">
              Request access to see the full workflow
            </Link>
          </ScrollReveal>
        </MarketingSection>

        {/* Pricing CTA structure */}
        <MarketingSection>
          <ScrollReveal className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
            <MarketingCard
              title="Guided Rollout"
              description="New teams join through a guided onboarding. Pricing is based on creator volume and payout structure \u2014 not a fixed SaaS seat fee."
              tone="contrast"
              icon={<Rocket size={20} strokeWidth={1.5} />}
            >
              <div className="mt-4">
                <Link href="/request-access" className="aa-button aa-button-primary w-full">
                  Request access to start
                </Link>
              </div>
            </MarketingCard>
            <MarketingCard
              title="Want to see the workflow first?"
              description="Walk through creator tracking, the review queue, commission logic, and payout steps before committing to anything."
              icon={<Lightbulb size={20} strokeWidth={1.5} />}
            >
              <div className="mt-4">
                <Link href="/how-it-works" className="aa-button aa-button-secondary w-full">
                  See how it works
                </Link>
              </div>
            </MarketingCard>
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="How pricing is handled"
            title="Simple, guided, and honest about the current product."
            description="There is no public self-serve checkout yet. Pricing is handled during rollout so the setup, access model, and support path fit your current stage."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pricingCards.map((card) => (
              <MarketingCard
                key={card.title}
                title={card.title}
                description={card.description}
                icon={card.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="What is included"
            title="Coverage built around real creator growth workflows."
            description="The value is not just access to pages. It is a connected system for creators, results, commissions, payouts, and creator-safe visibility."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {includedCoverage.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="contrast"
                icon={item.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection muted>
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
