import type { Metadata } from "next";
import Link from "next/link";
import {
  UserPlus,
  Radar,
  ClipboardCheck,
  CreditCard,
  Eye,
  Users,
  Code2,
  FileSearch,
  Wallet,
  ShieldCheck,
} from "lucide-react";

import {
  MarketingCard,
  MarketingCtaPanel,
  MarketingHero,
  MarketingHeroProofStack,
  MarketingSection,
  MarketingSectionHeading,
  MarketingSteps,
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
    icon: <UserPlus size={20} strokeWidth={1.5} />,
  },
  {
    number: "02",
    title: "Tracking",
    description:
      "Use creator-linked codes and links so ownership stays obvious when performance starts landing.",
    icon: <Radar size={20} strokeWidth={1.5} />,
  },
  {
    number: "03",
    title: "Review",
    description:
      "Keep attribution and earnings review visible so results become trustworthy before they become payable.",
    icon: <ClipboardCheck size={20} strokeWidth={1.5} />,
  },
  {
    number: "04",
    title: "Payouts",
    description:
      "Approve, batch, and pay creators with a cleaner record of what happened and why.",
    icon: <CreditCard size={20} strokeWidth={1.5} />,
  },
  {
    number: "05",
    title: "Visibility",
    description:
      "Give creators a simpler portal so they can understand results and payout status without internal noise.",
    icon: <Eye size={20} strokeWidth={1.5} />,
  },
];

const productAreas = [
  {
    title: "Creator and code ownership",
    description:
      "Keep creators, codes, links, and app context connected so nobody is guessing which asset belongs to whom.",
    icon: <Users size={20} strokeWidth={1.5} />,
  },
  {
    title: "Results and attribution review",
    description:
      "See which results are ready to trust, which still need review, and where the next decision belongs.",
    icon: <FileSearch size={20} strokeWidth={1.5} />,
  },
  {
    title: "Commission control",
    description:
      "Move from result review into approved earnings with clear state labels instead of vague spreadsheet handoffs.",
    icon: <Code2 size={20} strokeWidth={1.5} />,
  },
  {
    title: "Payout workflow",
    description:
      "Keep approved earnings, payout batches, export handoff, and paid history connected in one operating flow.",
    icon: <Wallet size={20} strokeWidth={1.5} />,
  },
];

const productPrinciples = [
  {
    title: "Role-aware access",
    description:
      "One workspace, two views. Founders manage the full program. Creators see only their codes, results, and earnings.",
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
  },
  {
    title: "Audited decisions",
    description:
      "Every commission approval, rate change, and payout action is logged. When something is questioned, the answer is already there.",
    icon: <FileSearch size={20} strokeWidth={1.5} />,
  },
  {
    title: "Finance-safe payouts",
    description:
      "Approved earnings move through clearly separated states - ready to batch, reserved, exported, and paid - so finance always knows what's in motion.",
    icon: <Wallet size={20} strokeWidth={1.5} />,
  },
];

const productHeroProof = [
  {
    icon: <Code2 size={16} strokeWidth={1.5} />,
    title: "Codes and links",
    description: "One trackable asset per creator, linked to your app from day one.",
  },
  {
    icon: <ClipboardCheck size={16} strokeWidth={1.5} />,
    title: "Results review",
    description: "See which results are ready to trust before any earnings are calculated.",
  },
  {
    icon: <Wallet size={16} strokeWidth={1.5} />,
    title: "Commissions and payouts",
    description: "Approve earnings and move them toward payout without losing the paper trail.",
  },
] as const;

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
          eyebrow="WHAT'S INSIDE"
          title="Creator performance, tracked end to end."
          description="From the first creator code to the final payout state, every step has a clear home in AppAffiliate."
          wrapVisual={false}
          actions={
            <>
              <Link href="/signup" className="aa-button aa-button-primary px-5 py-3">
                Start free trial
              </Link>
              <Link href="/pricing" className="aa-button aa-button-secondary px-5 py-3">
                View pricing
              </Link>
            </>
          }
          actionsFooter="Self-serve plans start with a 14-day free trial."
        >
          <MarketingHeroProofStack items={productHeroProof} />
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="HOW THE SYSTEM FLOWS"
            title="One connected system from creator invite to payout."
            description="The product works best when the whole loop stays visible: who promoted the app, what converted, what was approved, and what has been paid."
          />

          <div className="mt-10">
            <MarketingSteps steps={growthLoop} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="WHAT IT COVERS"
            title="Focused product surfaces instead of feature theater."
            description="AppAffiliate gives founders the workflow they actually need to run creator performance without drowning the page in back-office jargon."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productAreas.map((area) => (
              <MarketingCard
                key={area.title}
                title={area.title}
                description={area.description}
                icon={area.icon}
                className="border-[#E8E8E8]"
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="BUILT FOR TRUST"
            title="A product shaped around trust, not dashboard clutter."
            description="The product is designed to help founders grow through creators while keeping review, payouts, and creator visibility trustworthy as the program scales."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {productPrinciples.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="contrast"
                icon={item.icon}
                className="border-[#E8E8E8]"
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection muted>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="GET STARTED"
              title="Start with the product, then scale when the channel works."
              description="Try AppAffiliate free for 14 days, or review pricing first if you want the plan breakdown."
              primaryHref="/signup"
              primaryLabel="Start free trial"
              secondaryHref="/pricing"
              secondaryLabel="View pricing"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
