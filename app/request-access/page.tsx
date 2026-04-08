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
    "Talk to AppAffiliate about a more tailored rollout, higher limits, or implementation help beyond the self-serve plans.",
};

const fitSignals = [
  {
    title: "Higher limits",
    description:
      "Use this path if you need more apps, more creators, or a larger rollout than the self-serve plans cover.",
  },
  {
    title: "Tailored onboarding",
    description:
      "Some teams need help with rollout planning, training, or implementation before they go live.",
  },
  {
    title: "More complex operations",
    description:
      "Multi-brand setups, custom reporting needs, or more sensitive finance workflows belong on the tailored path.",
  },
];

const accessQuestions = [
  {
    label: "Apps or brands in scope",
    detail: "How many apps, brands, or workspaces you expect to manage from the start.",
  },
  {
    label: "Creator program scale",
    detail: "A rough sense of creator volume, review complexity, and payout cadence.",
  },
  {
    label: "Rollout help needed",
    detail: "Where you want support with setup, onboarding, or implementation planning.",
  },
  {
    label: "Reporting or payout needs",
    detail: "Whether you need more tailored exports, reporting, or finance workflow support.",
  },
  {
    label: "Timeline",
    detail: "When you want to launch and whether you are replacing an existing manual process.",
  },
];

const requestFaq = [
  {
    question: "Who should use this page?",
    answer:
      "Teams that need higher limits, tailored onboarding, multi-brand scope, or more rollout help than the self-serve plans cover.",
  },
  {
    question: "When should we just start a trial instead?",
    answer:
      "If one of the self-serve plans fits your app and creator count, start the 14-day trial and move into the workflow directly.",
  },
  {
    question: "What happens after request access?",
    answer:
      "We review your use case and reply with the next step for onboarding, pricing, or implementation support.",
  },
];

const heroProofItems = [
  {
    title: "Tailored path",
    description: "Use this route when the self-serve plans do not match your scope or rollout needs.",
    icon: <CheckCircle2 size={16} strokeWidth={1.5} />,
  },
  {
    title: "Rollout support",
    description: "Bring questions about onboarding, finance workflow, or larger creator program complexity.",
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
          eyebrow="TAILORED ROLLOUTS"
          title="Talk to us about a more tailored AppAffiliate setup"
          description="Self-serve covers most teams. Use this path if you need higher limits, multi-brand scope, or rollout help beyond the standard plans."
          wrapVisual={false}
          actions={
            <>
              <Link href="/pricing" className="aa-button aa-button-primary px-5 py-3">
                View pricing
              </Link>
              <Link href="/login" className="aa-button aa-button-secondary px-5 py-3">
                Sign in
              </Link>
            </>
          }
        >
          <MarketingHeroProofStack items={heroProofItems} />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            title="A clearer path for tailored evaluation."
            description="This route should quickly help teams decide whether they need more than the self-serve plans provide."
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
              description="These questions help us decide whether a more tailored rollout makes sense for your team."
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
            description="Use pricing and product if self-serve fits. Use sign-in if your team already has invited access."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            <SupportCard
              title="View pricing"
              description="Compare self-serve plans first if you think one of them may already fit your team."
              href="/pricing"
              label="View pricing"
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
              title="Start with pricing, or sign in if you already have access."
              description="Use the public site to decide whether self-serve fits. Invited users should go straight to sign-in."
              primaryHref="/pricing"
              primaryLabel="View pricing"
              secondaryHref="/login"
              secondaryLabel="Sign in"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
