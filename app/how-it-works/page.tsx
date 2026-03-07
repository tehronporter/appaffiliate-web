import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading,
  MarketingSteps,
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
      "Connect your iOS app so AppAffiliate can turn creator promotion into a real subscription growth channel.",
  },
  {
    number: "02",
    title: "Invite creators",
    description:
      "Work with creators you already trust instead of defaulting to risky upfront influencer deals.",
  },
  {
    number: "03",
    title: "Assign codes or links",
    description:
      "Give each creator a clear trackable path so ownership stays readable from the start.",
  },
  {
    number: "04",
    title: "Track real subscription results",
    description:
      "See what actually converted, what still needs review, and what is ready to become approved earnings.",
  },
  {
    number: "05",
    title: "Reward creators based on performance",
    description:
      "Approve earnings, move them into payout, and keep creators updated with a simple read-only portal.",
  },
];

const outcomes = [
  {
    title: "Less wasted spend",
    description:
      "You stop paying for creator promotion without knowing whether it turned into real subscriptions.",
  },
  {
    title: "Fairer creator rewards",
    description:
      "Creators get paid when their audience actually converts, with clearer visibility into what changed.",
  },
  {
    title: "More trust across the workflow",
    description:
      "Tracking, review, commissions, and payouts stay connected so decisions are easier to explain later.",
  },
];

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
          eyebrow="How AppAffiliate works"
          title="A simple five-step creator growth system."
          description="Add your app, invite creators, assign codes or links, track real subscription results, and reward creators based on performance."
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
          <div className="grid gap-3">
            {[
              "Built for iOS founders and lean app teams",
              "Designed around real subscription outcomes",
              "Keeps creator rewards and payout trust connected",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[16px] border border-border bg-[rgba(255,255,255,0.88)] px-4 py-4 text-sm leading-7 text-ink-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="The sequence"
            title="Each step is easy to scan and easier to trust."
            description="The workflow is intentionally short. Founders should understand how the model works in a few minutes, not after reading internal docs."
          />

          <div className="mt-10">
            <MarketingSteps steps={steps} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="Why that matters"
            title="The system works because the economics are clearer."
            description="The point is not just to track creator activity. The point is to run creator promotion as a performance channel instead of a guessing game."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {outcomes.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="See whether the model fits your app."
              description="If you want to grow through creators without risky upfront influencer spend, review the product and request access."
              primaryHref="/request-access"
              primaryLabel="Request access"
              secondaryHref="/pricing"
              secondaryLabel="View pricing"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
