import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingCtaPanel,
  MarketingHero,
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
      "Not yet. Public docs stay intentionally curated, and deeper rollout guidance is shared during onboarding when a team is actively implementing the product.",
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
      "New teams request access through guided rollout. Already invited team members and creators use sign-in to reach the right surface.",
  },
];

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
          actions={
            <>
              <Link href="/how-it-works" className="aa-button aa-button-primary px-5 py-3">
                Learn the basics
              </Link>
              <Link href="/request-access" className="aa-button aa-button-secondary px-5 py-3">
                Request access
              </Link>
            </>
          }
        >
          <div className="grid gap-3">
            {[
              "Start with the model, then move into setup",
              "Use short entry paths instead of a documentation maze",
              "Know exactly where to go next: learn, request access, or sign in",
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
            eyebrow="Entry paths"
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
              eyebrow="Founders"
              title="What founders usually need to know"
              description="Short answers that reduce the time between curiosity and a clear next step."
              items={founderFaq}
            />
            <FaqGroup
              eyebrow="Trust"
              title="How tracking, review, and payouts work"
              description="These are the questions that usually need a direct answer before a founder decides whether the model fits."
              items={trustFaq}
            />
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Learn the basics, then decide what to do next."
              description="If the model fits your app, request access. If you are already invited, go straight to sign-in."
              primaryHref="/request-access"
              primaryLabel="Request access"
              secondaryHref="/login"
              secondaryLabel="Sign in"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
