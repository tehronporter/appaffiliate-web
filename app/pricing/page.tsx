import type { Metadata } from "next";
import Link from "next/link";

import {
  MarketingHero,
} from "@/components/marketing-page";
import { PricingPageContent } from "@/components/pricing-page";
import { MarketingShell } from "@/components/marketing-shell";
import {
  publicFooterLinks,
  publicNavLinks,
} from "@/lib/public-site";
import { getPlanSelectionHref } from "@/lib/pricing-catalog";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start a 14-day free trial, compare monthly and annual plans, and choose the AppAffiliate setup that fits your creator program.",
};

const pricingPrimaryAction = {
  href: getPlanSelectionHref("growth", "monthly"),
  label: "Start free trial",
  variant: "primary" as const,
};

const pricingSecondaryAction = {
  href: "/login",
  label: "Sign in",
  variant: "secondary" as const,
};

export default function PricingPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={pricingPrimaryAction}
      secondaryAction={pricingSecondaryAction}
      currentPath="/pricing"
    >
      <main>
        <MarketingHero
          eyebrow="PRICING"
          title="Pricing built for teams that pay for results, not hype"
          description="Start with a 14-day free trial. Track real subscription outcomes, prepare payouts clearly, and only upgrade when the channel is working."
          actions={
            <>
              <Link
                href={getPlanSelectionHref("growth", "monthly")}
                className="aa-button aa-button-primary px-5 py-3"
              >
                Start free trial
              </Link>
              <Link href="/how-it-works" className="aa-button aa-button-secondary px-5 py-3">
                See how it works
              </Link>
            </>
          }
          actionsFooter="All self-serve plans include a 14-day free trial."
        />

        <PricingPageContent />
      </main>
    </MarketingShell>
  );
}
