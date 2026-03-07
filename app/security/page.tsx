import type { Metadata } from "next";
import Link from "next/link";
import {
  Eye,
  ShieldCheck,
  Building2,
  FileSearch,
  Landmark,
  UserCircle,
  Monitor,
  Award,
  Target,
  BookOpen,
  Lock,
  Shield,
} from "lucide-react";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingHeroProofStack,
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
      "Data is scoped to your organization. Creator performance and payout records don't cross team boundaries.",
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
      "What appears in the browser is operator-safe. Raw event and payout data stays server-side.",
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

const heroProofItems = [
  {
    icon: <Shield size={16} strokeWidth={1.5} />,
    title: "Role-aware from day one",
    description: "Founders, operators, and creators each see exactly what they need.",
  },
  {
    icon: <Eye size={16} strokeWidth={1.5} />,
    title: "Every decision is auditable",
    description:
      "Commission changes, payout approvals, and review actions stay visible to the people who need to trust them.",
  },
  {
    icon: <Lock size={16} strokeWidth={1.5} />,
    title: "No raw data in creator views",
    description:
      "Creator portals show earnings and results, not spreadsheets or back-office payloads.",
  },
] as const;

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
          eyebrow="SECURITY"
          title="Trust built into every step."
          description="No separate compliance layer needed. Trust comes from how the workflow is built - not from a policy document."
          wrapVisual={false}
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
          <MarketingHeroProofStack items={heroProofItems} />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="THE APPROACH"
            title="Plain-language trust for a real product."
            description="AppAffiliate doesn't need compliance theater to earn trust. The workflow is the security story."
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
              eyebrow="GET STARTED"
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
