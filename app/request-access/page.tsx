import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingCard,
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
  title: "Request Access",
  description:
    "Request access to AppAffiliate through the current guided rollout model. Existing users can sign in; new teams join through an onboarding-led process.",
};

const rolloutSteps = [
  {
    title: "Review fit first",
    description:
      "Start with the product, workflow, pricing, and security pages so the operating model is clear before access is requested.",
  },
  {
    title: "Guided rollout",
    description:
      "AppAffiliate access is currently provisioned during a direct rollout rather than through public self-serve signup.",
  },
  {
    title: "Invited access",
    description:
      "When a team moves forward, internal users and any linked partner users are invited into the appropriate experience.",
  },
];

const pageNotes = [
  "There is no self-serve request form or in-product billing flow yet.",
  "Existing users should use the sign-in page instead of requesting access again.",
  "Partner portal access is configured separately from the internal admin workspace.",
];

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
          title="Request access through guided rollout."
          description="AppAffiliate does not use a public self-serve access form yet. New teams are onboarded directly, and existing users should continue through the sign-in page."
          actions={
            <>
              <Link href="/product" className="aa-button aa-button-primary px-5 py-3">
                See product
              </Link>
              <Link href="/login" className="aa-button aa-button-secondary px-5 py-3">
                Sign in
              </Link>
            </>
          }
        >
          <p className="text-sm font-medium text-[#1A1A1A]">Current access model</p>
          <div className="mt-5 space-y-3">
            {pageNotes.map((note) => (
              <div
                key={note}
                className="rounded-[18px] border border-[#E9EDF3] bg-white px-4 py-4 text-sm leading-7 text-[#5B6472]"
              >
                {note}
              </div>
            ))}
          </div>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="What this page does"
            title="An honest access page without fake submission flows."
            description="This page explains the current access process clearly. It keeps the public site professional without pretending there is a live self-serve request pipeline behind the scenes."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {rolloutSteps.map((step) => (
              <MarketingCard
                key={step.title}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <div className="mx-auto max-w-4xl rounded-[28px] border border-border bg-white p-7 shadow-[var(--shadow-soft)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
              What to do next
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink">
              Use the public site to finish evaluation.
            </h2>
            <p className="mt-4 text-base leading-8 text-ink-muted">
              If you are still assessing fit, start with the product, workflow,
              pricing, and security pages. If you already have invited access,
              the sign-in page is the correct next step.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/how-it-works" className="aa-button aa-button-primary px-5 py-3">
                How it works
              </Link>
              <Link href="/pricing" className="aa-button aa-button-secondary px-5 py-3">
                View pricing
              </Link>
              <Link href="/login" className="aa-button aa-button-secondary px-5 py-3">
                Sign in
              </Link>
            </div>
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
