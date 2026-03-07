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
  title: "Product",
  description:
    "Everything you need to run creator performance in one place, from tracking and review to commissions, payouts, and creator visibility.",
};

const growthLoop = [
  {
    number: "01",
    title: "Creators",
    description:
      "Invite creators into a model that rewards real subscription results instead of risky upfront promotion.",
  },
  {
    number: "02",
    title: "Tracking",
    description:
      "Use creator-linked codes and links so ownership stays obvious when performance starts landing.",
  },
  {
    number: "03",
    title: "Review",
    description:
      "Keep attribution and earnings review visible so results become trustworthy before they become payable.",
  },
  {
    number: "04",
    title: "Payouts",
    description:
      "Approve, batch, and pay creators with a cleaner record of what happened and why.",
  },
  {
    number: "05",
    title: "Visibility",
    description:
      "Give creators a simpler portal so they can understand results and payout status without internal noise.",
  },
];

const productAreas = [
  {
    title: "Creator and code ownership",
    description:
      "Keep creators, codes, links, and app context connected so nobody is guessing which asset belongs to whom.",
  },
  {
    title: "Results and attribution review",
    description:
      "See which results are ready to trust, which still need review, and where the next decision belongs.",
  },
  {
    title: "Commission control",
    description:
      "Move from result review into approved earnings with clear state labels instead of vague spreadsheet handoffs.",
  },
  {
    title: "Payout workflow",
    description:
      "Keep approved earnings, payout batches, export handoff, and paid history connected in one operating flow.",
  },
  {
    title: "Creator portal",
    description:
      "Show creators what belongs to them, what their audience drove, and what has been paid in a clean read-only experience.",
  },
  {
    title: "Trust and access boundaries",
    description:
      "Separate internal workspace access from creator visibility while keeping the underlying system consistent.",
  },
];

const productPrinciples = [
  {
    title: "Built for lean app teams",
    description:
      "The product is designed for founders and small operators who need real clarity, not a bloated affiliate suite.",
  },
  {
    title: "Results first, operations second",
    description:
      "Tracking, commissions, and payouts support the growth model. They should not overwhelm the story above the fold.",
  },
  {
    title: "Trust without enterprise theater",
    description:
      "Review state, payout state, and role boundaries stay clear without pretending the product is something it is not.",
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
          title="Everything you need to run creator performance in one place."
          description="AppAffiliate connects creator tracking, results review, commissions, payouts, and creator visibility into one clear growth loop for iOS app teams."
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
          <div className="grid gap-3">
            {[
              "Track real subscription results tied to creators",
              "Review what needs attention before earnings are finalized",
              "Reward creators fairly and keep payout history easy to trust",
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
            eyebrow="The growth loop"
            title="One connected system from creator invite to payout."
            description="The product works best when the whole loop stays visible: who promoted the app, what converted, what was approved, and what has been paid."
          />

          <div className="mt-10">
            <MarketingSteps steps={growthLoop} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="What the product covers"
            title="Focused product surfaces instead of feature theater."
            description="AppAffiliate gives founders the workflow they actually need to run creator performance without drowning the page in back-office jargon."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productAreas.map((area) => (
              <MarketingCard
                key={area.title}
                title={area.title}
                description={area.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="Why it feels different"
            title="A product shaped around trust, not dashboard clutter."
            description="The product is designed to help founders grow through creators while keeping review, payouts, and creator visibility trustworthy as the program scales."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {productPrinciples.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="contrast"
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Review the workflow, then request access."
              description="If the model fits your iOS app team, continue into how it works and start the guided rollout conversation."
              primaryHref="/request-access"
              primaryLabel="Request access"
              secondaryHref="/how-it-works"
              secondaryLabel="See how it works"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
