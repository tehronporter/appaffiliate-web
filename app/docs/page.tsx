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
  title: "Docs",
  description:
    "A lightweight public help entry for AppAffiliate covering setup expectations, rollout guidance, and what documentation is currently shared during onboarding.",
};

const docsSections = [
  {
    title: "Setup expectations",
    description:
      "AppAffiliate setup is currently guided. Teams are walked through the product model, access, and launch readiness during rollout rather than through public self-serve documentation.",
  },
  {
    title: "Operational guidance",
    description:
      "Current deeper runbooks cover launch checks, finance export sequence, payout preparation, and rollout QA. Those materials are shared during onboarding for teams in active rollout.",
  },
  {
    title: "Help and support framing",
    description:
      "This public docs page is intentionally light. It exists to set expectations clearly without pretending there is a broad public documentation center already in place.",
  },
];

const availableTopics = [
  {
    title: "Product overview",
    description:
      "Use the product and workflow pages first if you are evaluating the current product coverage.",
  },
  {
    title: "Launch and rollout",
    description:
      "Teams in active rollout receive the implementation and launch runbooks that support setup and smoke testing.",
  },
  {
    title: "Partner portal scope",
    description:
      "Partner access is read-only and intentionally narrow. Deeper partner-facing guidance remains rollout-led today.",
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
          title="A lightweight public help entry."
          description="AppAffiliate keeps public documentation honest. The product includes rollout and operational materials, but the deeper runbooks are still shared during onboarding rather than published as a broad public docs center."
          actions={
            <>
              <Link href="/how-it-works" className="aa-button aa-button-primary px-5 py-3">
                How it works
              </Link>
              <Link href="/request-access" className="aa-button aa-button-secondary px-5 py-3">
                Request access
              </Link>
            </>
          }
        >
          <p className="text-sm font-medium text-[#1A1A1A]">Current docs boundary</p>
          <p className="mt-4 text-sm leading-7 text-[#5B6472]">
            This page is public. Deeper launch, QA, and operator runbooks are
            still distributed during implementation so the guidance stays tied
            to the active rollout.
          </p>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="What this page does"
            title="Set expectations clearly."
            description="The public help surface should explain what kind of guidance exists today without implying a larger docs platform than the product currently supports."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {docsSections.map((section) => (
              <MarketingCard
                key={section.title}
                title={section.title}
                description={section.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="Topics"
            title="Where public visitors should start."
            description="The public site should route evaluators toward product clarity first, then onboarding-led implementation materials when access is in motion."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {availableTopics.map((topic) => (
              <MarketingCard
                key={topic.title}
                title={topic.title}
                description={topic.description}
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Use the public site to evaluate fit first."
              description="If AppAffiliate looks aligned to your workflow, request access and the rollout process can provide the deeper launch and operator guidance."
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
