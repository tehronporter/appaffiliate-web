import type { Metadata } from "next";
import Link from "next/link";
import {
  AppWindow,
  UserPlus,
  Link2,
  BarChart3,
  Award,
  PiggyBank,
  Heart,
  Rocket,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingHeroProofStack,
  MarketingSection,
  MarketingSectionHeading,
  MarketingSteps,
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
  title: "How It Works",
  description:
    "Add your app, invite creators, assign codes or links, track subscription results, and reward creators based on performance.",
};

const steps = [
  {
    number: "01",
    title: "Add your app",
    description:
      "Connect your iOS app so AppAffiliate can match creator codes to real subscription events.",
    icon: <AppWindow size={20} strokeWidth={1.5} />,
  },
  {
    number: "02",
    title: "Invite creators",
    description:
      "Invite the creators you already trust. No upfront deal required.",
    icon: <UserPlus size={20} strokeWidth={1.5} />,
  },
  {
    number: "03",
    title: "Assign codes or links",
    description:
      "Give each creator a code or link so their results trace back to them by default.",
    icon: <Link2 size={20} strokeWidth={1.5} />,
  },
  {
    number: "04",
    title: "Track real subscription results",
    description:
      "See what actually converted, what still needs review, and what is ready to become approved earnings.",
    icon: <BarChart3 size={20} strokeWidth={1.5} />,
  },
  {
    number: "05",
    title: "Reward creators based on performance",
    description:
      "Approve earnings, move them into payout, and keep creators updated with a simple read-only portal.",
    icon: <Award size={20} strokeWidth={1.5} />,
  },
];

const outcomes = [
  {
    title: "Less wasted spend",
    description:
      "You stop paying for creator promotion before knowing whether it turned into subscriptions.",
    icon: <PiggyBank size={20} strokeWidth={1.5} />,
  },
  {
    title: "Fairer creator rewards",
    description:
      "Creators get paid when their audience converts, with less ambiguity about what changed.",
    icon: <Heart size={20} strokeWidth={1.5} />,
  },
  {
    title: "More trust across the workflow",
    description:
      "Tracking, review, commissions, and payouts stay connected, so decisions stay explainable later.",
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
  },
];

const heroProofItems = [
  {
    icon: <Rocket size={16} strokeWidth={1.5} />,
    title: "Five steps, no training required",
    description: "Add your app, invite creators, and track real results in under a day.",
  },
  {
    icon: <Users size={16} strokeWidth={1.5} />,
    title: "Built for lean iOS teams",
    description: "No dedicated affiliate manager needed. One founder can run the entire channel.",
  },
  {
    icon: <ShieldCheck size={16} strokeWidth={1.5} />,
    title: "Results you can audit",
    description: "Every payout ties back to a verified subscription event, not a self-reported metric.",
  },
] as const;

export default function HowItWorksPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/how-it-works"
    >
      <main>
        <MarketingHero
          eyebrow="THE FIVE STEPS"
          title="A simple five-step creator growth system."
          description="The whole channel runs in one place, with a short path from creator invite to payout."
          wrapVisual={false}
          actions={
            <>
              <Link href="/signup" className="aa-button aa-button-primary px-5 py-3">
                Start free trial
              </Link>
              <Link href="/pricing" className="aa-button aa-button-secondary px-5 py-3">
                View pricing
              </Link>
            </>
          }
          actionsFooter="Self-serve plans start with a 14-day free trial."
        >
          <MarketingHeroProofStack items={heroProofItems} />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="HOW IT WORKS"
            title="Each step is easy to scan and easier to trust."
            description="The workflow is intentionally short. Founders should understand it in a few minutes, not after reading internal docs."
          />

          <div className="mt-10">
            <MarketingSteps steps={steps} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="WHY THE MODEL WORKS"
            title="It works because the economics make sense."
            description="The point is not just to track creator activity. It is to run creator promotion as a performance channel instead of a guessing game."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {outcomes.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="GET STARTED"
              title="Start when the model fits your app."
              description="Try AppAffiliate free for 14 days, or review pricing first if you want to compare plans."
              primaryHref="/signup"
              primaryLabel="Start free trial"
              secondaryHref="/pricing"
              secondaryLabel="View pricing"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
