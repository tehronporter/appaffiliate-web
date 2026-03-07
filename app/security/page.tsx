import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  FileSearch,
  Landmark,
  UserCircle,
  Monitor,
  Award,
  Target,
  BookOpen,
} from "lucide-react";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingSection,
  MarketingSectionHeading,
  ScrollReveal,
} from "@/components/marketing-page";
import { MarketingShell } from "@/components/marketing-shell";
import {
  publicFooterLinks,
  publicNavLinks,
  publicPrimaryAction,
  publicSecondaryAction,
} from "@/lib/public-site";

export const metadata: Metadata = {
  title: "Security",
  description:
    "Built to keep performance and payouts trustworthy with role-aware access, org scoping, audited decisions, and finance-safe workflow boundaries.",
};

const trustAreas = [
  {
    title: "Role-aware access",
    description:
      "Internal teams and creators enter different experiences with different visibility, even though the product logic stays connected.",
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
  },
  {
    title: "Organization scoping",
    description:
      "Reads and writes stay scoped to the right organization so creator performance and payout data do not spill across teams.",
    icon: <Building2 size={20} strokeWidth={1.5} />,
  },
  {
    title: "Audited decisions",
    description:
      "Key review and payout actions stay visible later when a founder, creator, or support teammate needs to understand what changed.",
    icon: <FileSearch size={20} strokeWidth={1.5} />,
  },
  {
    title: "Finance-safe workflows",
    description:
      "Approved earnings, payout batches, export handoff, and paid history stay separate so the money flow remains readable.",
    icon: <Landmark size={20} strokeWidth={1.5} />,
  },
  {
    title: "Creator-safe portal",
    description:
      "Creators get a simpler read-only portal that shows what they need without exposing internal workspace tools.",
    icon: <UserCircle size={20} strokeWidth={1.5} />,
  },
  {
    title: "Safer browser views",
    description:
      "Sensitive workflows stay server-side and browser views avoid exposing raw back-office detail unnecessarily.",
    icon: <Monitor size={20} strokeWidth={1.5} />,
  },
];

const proofNotes = [
  {
    title: "Trust as proof, not theater",
    description:
      "This page describes the controls that exist today instead of leaning on vague enterprise language.",
    icon: <Award size={20} strokeWidth={1.5} />,
  },
  {
    title: "Built for operational clarity",
    description:
      "The product is designed so growth, review, and payout steps are easier to explain, not harder.",
    icon: <Target size={20} strokeWidth={1.5} />,
  },
  {
    title: "Current and specific",
    description:
      "The public trust story stays grounded in the real product rather than certifications or claims that are not in scope.",
    icon: <BookOpen size={20} strokeWidth={1.5} />,
  },
];

export default function SecurityPage() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/security"
    >
      <main>
        <MarketingHero
          eyebrow="Security"
          title="Built to keep performance and payouts trustworthy."
          description="AppAffiliate keeps trust grounded in the product: role-aware access, organization scoping, audited decisions, a creator-safe portal, and finance-safe payout workflows."
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
              "Keep founders, operators, and creators in the right surface",
              "Make review and payout decisions easier to trust later",
              "Avoid heavy compliance theater in favor of specific workflow controls",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[var(--radius-input)] border border-border bg-[rgba(255,255,255,0.88)] px-4 py-4 text-sm leading-7 text-ink-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="What exists today"
            title="Plain-language trust for a real product."
            description="The security story should make founders more confident without turning the page into enterprise-heavy theater."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {trustAreas.map((area) => (
              <MarketingCard
                key={area.title}
                title={area.title}
                description={area.description}
                icon={area.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="How we talk about trust"
            title="Specific, current, and grounded."
            description="Trust is stronger when the language matches the actual controls in the product and the workflows they protect."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {proofNotes.map((note) => (
              <MarketingCard
                key={note.title}
                title={note.title}
                description={note.description}
                tone="contrast"
                icon={note.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Next step"
              title="Review the workflow and trust model together."
              description="Security is easier to evaluate when paired with the product and workflow pages, because review and payout boundaries are part of the operating model."
              primaryHref="/how-it-works"
              primaryLabel="See how it works"
              secondaryHref="/request-access"
              secondaryLabel="Request access"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
