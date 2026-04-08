import type { Metadata } from "next";
import Link from "next/link";
import { Compass, LogIn, Route } from "lucide-react";

import {
  MarketingCtaPanel,
  MarketingHero,
  MarketingHeroProofStack,
  MarketingSection,
  MarketingSectionHeading,
} from "@/components/marketing-page";
import { MarketingShell } from "@/components/marketing-shell";
import { FaqGroup, SupportCard } from "@/components/support-ui";
import {
  publicFooterLinks,
  publicNavLinks,
  publicPrimaryAction,
  publicSecondaryAction,
} from "@/lib/public-site";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Everything you need to launch and run creator-based growth, with clear founder-friendly entry paths into setup, tracking, payouts, security, and creator visibility.",
};

const docCategories = [
  {
    title: "Getting started",
    description:
      "Learn the basics: what AppAffiliate does, who it is for, and how to get from setup to the first creator-driven result.",
    href: "/how-it-works",
    label: "Start here",
  },
  {
    title: "Working with creators",
    description:
      "See how creators fit into the model, how codes and links work, and why creator visibility matters.",
    href: "/product",
    label: "View creator flow",
  },
  {
    title: "Tracking and review",
    description:
      "Understand how results are tracked, why some activity needs review, and how trusted earnings are formed.",
    href: "/product",
    label: "Learn tracking",
  },
  {
    title: "Payouts",
    description:
      "See how approved earnings move into payout and why AppAffiliate keeps payout states easy to trust.",
    href: "/pricing",
    label: "Understand payouts",
  },
  {
    title: "Security",
    description:
      "Review how access, payout workflows, and creator visibility stay controlled without enterprise-heavy language.",
    href: "/security",
    label: "Review trust",
  },
  {
    title: "Partner portal",
    description:
      "Understand what creators can see, what stays read-only, and how the portal reduces support confusion.",
    href: "/product",
    label: "See portal scope",
  },
];

const founderFaq = [
  {
    question: "What this page covers",
    answer:
      "The docs landing is the fastest path into the basics: fit, setup, creator flow, tracking, payouts, security, and what creators can see.",
  },
  {
    question: "Where should a founder start?",
    answer:
      "Start with how it works if you want the short version, then move into product and pricing once the model feels right.",
  },
  {
    question: "Is there a giant public help center?",
    answer:
      "Public docs stay curated. Deeper rollout guidance is shared once a team starts implementing.",
  },
];

const trustFaq = [
  {
    question: "How tracking, review, and payouts work",
    answer:
      "Creator-linked results are tracked, reviewed when needed, turned into approved earnings, and only then moved into payout.",
  },
  {
    question: "What creators can see",
    answer:
      "Creators see a simpler read-only portal with codes, results, approved earnings, and payout history. Internal workspace tools stay separate.",
  },
  {
    question: "How access works",
    answer:
      "New teams can start a self-serve trial, while invited team members and creators use sign-in to reach the right surface.",
  },
];

const heroProofItems = [
  {
    title: "Start with the model",
    description: "See the basics first, then move into setup, tracking, and payouts.",
    icon: <Compass size={16} strokeWidth={1.5} />,
  },
  {
    title: "Use short entry paths",
    description: "Find the right answer without working through a documentation maze.",
    icon: <Route size={16} strokeWidth={1.5} />,
  },
  {
    title: "Know where to go next",
    description: "Learn the model, start a trial, or sign in if you're already invited.",
    icon: <LogIn size={16} strokeWidth={1.5} />,
  },
] as const;

export default function DocsPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/docs"
    >
      <main>
        <MarketingHero
          eyebrow="Docs and help"
          title="Everything you need to launch and run creator-based growth"
          description="Use the docs landing to understand fit, setup, creator tracking, payout flow, security, and creator visibility without getting lost in internal product language."
          wrapVisual={false}
          actions={
            <>
              <Link href="/signup" className="aa-button aa-button-primary px-5 py-3">
                Start free trial
              </Link>
              <Link href="/how-it-works" className="aa-button aa-button-secondary px-5 py-3">
                See how it works
              </Link>
            </>
          }
          actionsFooter="Self-serve plans start with a 14-day free trial."
        >
          <MarketingHeroProofStack items={heroProofItems} />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            title="Pick the question you need answered first."
            description="Docs work better when founders can jump straight into the right topic instead of reading a flat list of pages."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {docCategories.map((item) => (
              <SupportCard
                key={item.title}
                title={item.title}
                description={item.description}
                href={item.href}
                label={item.label}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <div className="grid gap-6 lg:grid-cols-2">
            <FaqGroup
              title="What founders usually need to know"
              description="Short answers that reduce the time between curiosity and a clear next step."
              items={founderFaq}
            />
            <FaqGroup
              title="How tracking, review, and payouts work"
              description="These are the questions that usually need a direct answer before a founder decides whether the model fits."
              items={trustFaq}
            />
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="GET STARTED"
              title="Learn the basics, then start when you are ready."
              description="If the model fits your app, start a free trial. Already invited team members and creators can go straight to sign-in."
              primaryHref="/signup"
              primaryLabel="Start free trial"
              secondaryHref="/login"
              secondaryLabel="Sign in"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
