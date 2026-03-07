import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, LogIn, Waypoints } from "lucide-react";

import {
  MarketingCtaPanel,
  MarketingHero,
  MarketingHeroProofStack,
  MarketingSection,
  MarketingSectionHeading,
} from "@/components/marketing-page";
import { MarketingShell } from "@/components/marketing-shell";
import { FaqGroup, SupportCard, SupportChecklist } from "@/components/support-ui";
import {
  publicFooterLinks,
  publicNavLinks,
  publicPrimaryAction,
  publicSecondaryAction,
} from "@/lib/public-site";

export const metadata: Metadata = {
  title: "Request Access",
  description:
    "See if AppAffiliate fits your growth model and understand what we need to know before inviting your team into the product.",
};

const fitSignals = [
  {
    title: "Built for iOS founders",
    description:
      "AppAffiliate fits best when your team wants creator growth tied to real subscription results.",
  },
  {
    title: "Best for results-based creator programs",
    description:
      "The product is built for teams that want to stop paying upfront for hype and start rewarding performance.",
  },
  {
    title: "Works best for lean teams",
    description:
      "The current product is designed for founder-led and operator-led teams that want clear tracking, review, and payout visibility.",
  },
];

const accessQuestions = [
  {
    label: "Your role",
    detail: "Founder, growth lead, ops lead, finance reviewer, or another core decision-maker.",
  },
  {
    label: "Your app type",
    detail: "What kind of iOS app you run and how subscription growth matters to the business.",
  },
  {
    label: "How you promote today",
    detail: "Whether you already work with creators, rely on paid influencer deals, or want a better model.",
  },
  {
    label: "Your creator strategy",
    detail: "How you want to work with creators, codes, links, and performance-based rewards.",
  },
  {
    label: "Approximate scale",
    detail: "A simple sense of how many creators, campaigns, or app lanes you expect to manage first.",
  },
  {
    label: "Where you want help",
    detail: "Setup, tracking, creator onboarding, payouts, or understanding whether the model fits at all.",
  },
];

const requestFaq = [
  {
    question: "See if AppAffiliate fits your growth model",
    answer:
      "AppAffiliate is for iOS teams that want to grow through creators without risky upfront influencer fees and without losing payout trust later.",
  },
  {
    question: "Tell us how you promote your app today and how you want to work with creators",
    answer:
      "That context helps determine whether the current product and rollout path match your stage and the way you want to run creator growth.",
  },
  {
    question: "What happens after request access?",
    answer:
      "The next step is a guided rollout conversation, not an automated self-serve signup. That keeps the access path aligned with the real product today.",
  },
];

const heroProofItems = [
  {
    title: "Fit first",
    description: "Start with whether the model matches how your team wants to grow through creators.",
    icon: <CheckCircle2 size={16} strokeWidth={1.5} />,
  },
  {
    title: "Guided from day one",
    description: "Access starts with a rollout conversation, not a generic self-serve signup.",
    icon: <Waypoints size={16} strokeWidth={1.5} />,
  },
  {
    title: "Already invited?",
    description: "If your account already has access, go straight to sign in.",
    icon: <LogIn size={16} strokeWidth={1.5} />,
  },
] as const;

export default function RequestAccessPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/request-access"
    >
      <main>
        <MarketingHero
          eyebrow="Request access"
          title="See if AppAffiliate fits your growth model"
          description="Tell us how you promote your app today and how you want to work with creators. AppAffiliate is built for iOS teams that want to pay for results, not hype."
          wrapVisual={false}
          actions={
            <>
              <Link href="/how-it-works" className="aa-button aa-button-primary px-5 py-3">
                See how it works
              </Link>
              <Link href="/login" className="aa-button aa-button-secondary px-5 py-3">
                Already invited? Sign in
              </Link>
            </>
          }
        >
          <MarketingHeroProofStack items={heroProofItems} />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            title="A clearer path for founder-fit evaluation."
            description="Request access should quickly help founders understand whether the product matches how they want to grow through creators."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {fitSignals.map((item) => (
              <SupportCard
                key={item.title}
                title={item.title}
                description={item.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <SupportChecklist
              title="What we need to understand first"
              description="These questions help us understand whether the rollout matches how your team actually works."
              items={accessQuestions}
            />

            <FaqGroup
              title="The short version"
              description="A few direct answers before you decide whether to keep evaluating or ask for access."
              items={requestFaq}
            />
          </div>
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            title="Choose the clearest next step."
            description="If you are still evaluating fit, keep reading. If you already have invited access, go straight to sign-in."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <SupportCard
              title="Review the product"
              description="See how creator tracking, review, payouts, and creator visibility fit together."
              href="/product"
              label="See product"
            />
            <SupportCard
              title="Learn the workflow"
              description="Walk through the short sequence from app setup to first creator-driven result."
              href="/how-it-works"
              label="See how it works"
            />
            <SupportCard
              title="Already invited?"
              description="Sign in to the right surface if your team or creator account already has access."
              href="/login"
              label="Sign in"
            />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="GET STARTED"
              title="Keep evaluating, or sign in if you are already invited."
              description="Use the public site to finish assessing fit. Invited users should go straight to sign-in."
              primaryHref="/product"
              primaryLabel="See product"
              secondaryHref="/login"
              secondaryLabel="Sign in"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
