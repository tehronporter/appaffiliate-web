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
  title: "How It Works",
  description:
    "See how AppAffiliate moves from app setup and partner codes through attribution review, commissions, payouts, exports, and partner visibility.",
};

const steps = [
  {
    number: "01",
    title: "Set up your app",
    description:
      "Start with Apple ingestion readiness and app-level visibility so receipt flow and operational health are visible from the beginning.",
  },
  {
    number: "02",
    title: "Add partners and codes",
    description:
      "Create the partner and promo code structure that keeps ownership and program coverage readable.",
  },
  {
    number: "03",
    title: "Review activity",
    description:
      "Inspect attributed and unattributed activity without forcing the team to bounce between disconnected tools.",
  },
  {
    number: "04",
    title: "Resolve unattributed items",
    description:
      "Use the unattributed queue to work through ambiguous activity with explicit decisions and clear queue state.",
  },
  {
    number: "05",
    title: "Approve commissions",
    description:
      "Keep commission state explicit so reviewed items are separated from work that still needs attention.",
  },
  {
    number: "06",
    title: "Prepare payouts and exports",
    description:
      "Move approved work into payout batches, keep export state visible, and hand finance a clearer operational record.",
  },
  {
    number: "07",
    title: "Give partners visibility",
    description:
      "Provide a separate read-only portal for partner codes, performance, and payout status without exposing internal tools.",
  },
];

const outcomes = [
  {
    title: "Clearer review state",
    description:
      "The product is designed so attribution, commission, and payout status are explicit rather than implied.",
  },
  {
    title: "Fewer side channels",
    description:
      "Decisions stay closer to the workflow instead of drifting into inboxes and disconnected documents.",
  },
  {
    title: "Safer finance handoff",
    description:
      "Exports, payout batches, and review state remain visible in one operating system.",
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
          eyebrow="How it works"
          title="A clearer path from intake to payout."
          description="AppAffiliate gives partner programs a readable sequence: app readiness, partner setup, activity review, commission approval, payout preparation, exports, and partner visibility."
          actions={
            <>
              <Link href="/product" className="aa-button aa-button-primary px-5 py-3">
                See product
              </Link>
              <Link href="/request-access" className="aa-button aa-button-secondary px-5 py-3">
                Request access
              </Link>
            </>
          }
        >
          <p className="text-sm font-medium text-[#1A1A1A]">What the workflow replaces</p>
          <div className="mt-5 space-y-3">
            {[
              "Spreadsheet-based partner tracking",
              "Loose attribution decisions in side channels",
              "Unclear commission state before payout prep",
              "Partner visibility handled through manual updates",
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
            eyebrow="Workflow"
            title="Each step reduces ambiguity."
            description="The product is designed to keep the sequence readable for growth, operations, and finance users without turning the workflow into a maze."
          />

          <div className="mt-10 space-y-4">
            {steps.map((step) => (
              <div
                key={step.number}
                className="rounded-[26px] border border-[#ECEFF3] bg-white p-6 sm:p-7"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F1F5FF] text-sm font-semibold text-[#2E53FF]">
                    {step.number}
                  </span>
                  <div className="max-w-3xl">
                    <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#1A1A1A]">
                      {step.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#5B6472]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="What that creates"
            title="A calmer program operating rhythm."
            description="The flow matters because it gives internal teams and partners a clearer record of what has been reviewed, what is still pending, and what is ready for finance."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {outcomes.map((outcome) => (
              <MarketingCard
                key={outcome.title}
                title={outcome.title}
                description={outcome.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Access"
              title="See whether the workflow fits your program."
              description="If the model matches how your team handles partner activity, review, and finance handoff today, request access and continue the rollout conversation."
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
