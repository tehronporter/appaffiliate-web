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
    title: "Operator workspace",
    description:
      "The full internal workspace - tracking, review, commissions, payouts, and exports in one place.",
    icon: <Monitor size={20} strokeWidth={1.5} />,
  },
  {
    title: "Creator portal",
    description:
      "A read-only portal for creators to see their codes, results, and payout status - without accessing your workspace.",
    icon: <Users size={20} strokeWidth={1.5} />,
  },
  {
    title: "Guided setup",
    description:
      "New workspaces start with a guided rollout so setup matches how your team actually works.",
    icon: <Wrench size={20} strokeWidth={1.5} />,
  },
];

const comparisonRows = [
  {
    painPoint: "Upfront spend risk",
    oldWay: "You pay creators upfront and hope subscriptions follow.",
    newWay: "Creators are paid only when subscriptions confirm. Zero upfront fees.",
  },
  {
    painPoint: "Creator accountability",
    oldWay: "Payout is based on reach, not verified subscriptions.",
    newWay: "Every creator payout is tied directly to verified subscription outcomes.",
  },
  {
    painPoint: "Tracking complexity",
    oldWay: "Manual spreadsheets and follow-up on what actually converted.",
    newWay: "Codes, results, earnings, and payout status all live in one place.",
  },
  {
    painPoint: "Payout trust",
    oldWay: "Creators wait on your updates to know what they earned.",
    newWay: "Creators see earnings, codes, and payout progress in real time.",
  },
  {
    painPoint: "Review process",
    oldWay: "Decisions happen in inboxes and DMs, with no clear record.",
    newWay: "A review queue shows which results to trust and which need a second look.",
  },
  {
    painPoint: "Commission changes",
    oldWay: "Rate changes mean messages, spreadsheet edits, and mismatched numbers.",
    newWay: "Commission changes are tracked in the system, so both sides stay aligned.",
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
          eyebrow="PRICING"
          title="A better bet than risky upfront influencer spend."
          description="AppAffiliate is priced through guided rollout - so your team starts with a workflow that actually fits your creator program, not a plan you outgrow in 60 days."
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

        <MarketingSection muted className="border-b border-border">
          <MarketingComparison
            eyebrow="WHAT YOU'RE REPLACING"
            title="The real cost isn't the subscription. It's the spend that goes nowhere."
            description="Compare the cost logic, not just a feature list."
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
            title="Simple, guided, and honest about the current product."
            description="Pricing is handled during rollout so setup, access, and support match your current stage."
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
              eyebrow="LET'S TALK"
              title="See if it fits. Request access."
              description="Request access and we'll set up a walkthrough around your specific creator program."
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
