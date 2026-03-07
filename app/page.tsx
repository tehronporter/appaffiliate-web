import Link from "next/link";
import type { Metadata } from "next";
import {
  Banknote,
  Users,
  ShieldCheck,
  TrendingUp,
  Eye,
  Handshake,
  UserSearch,
  ClipboardCheck,
  Wallet,
  UserCircle,
  Lock,
  FileSearch,
  BadgeDollarSign,
} from "lucide-react";

import {
  MarketingCard,
  MarketingComparison,
  MarketingCtaPanel,
  MarketingHero,
  MarketingHeroVisual,
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

const founderPain = [
  {
    title: "No upfront fees.",
    description:
      "Every creator payout starts at zero and moves toward payment only when a real subscription confirms.",
    icon: <Banknote size={20} strokeWidth={1.5} />,
  },
  {
    title: "Creators earn what they drive.",
    description:
      "When results are visible to both sides, the payout conversation disappears.",
    icon: <Users size={20} strokeWidth={1.5} />,
  },
  {
    title: "Trust, not admin.",
    description:
      "The review and payout flows are built so your team can act with confidence, not chase down what happened.",
    icon: <ShieldCheck size={20} strokeWidth={1.5} />,
  },
];

const valueProps = [
  {
    title: "Safer growth for founders",
    description:
      "Reward creators when subscription results show up, not before you know whether a campaign worked.",
    icon: <TrendingUp size={20} strokeWidth={1.5} />,
  },
  {
    title: "Fair visibility for creators",
    description:
      "Give creators a simple read-only view of codes, results, approved earnings, and payout progress.",
    icon: <Eye size={20} strokeWidth={1.5} />,
  },
  {
    title: "Trust for both sides",
    description:
      "Tracking, review, commissions, and payouts stay connected so nobody has to guess where a result ended up.",
    icon: <Handshake size={20} strokeWidth={1.5} />,
  },
];

const workflowSteps = [
  {
    number: "01",
    title: "Add your app",
    description:
      "Start with your iOS app so subscription results can be tracked with the right product context.",
  },
  {
    number: "02",
    title: "Invite creators",
    description:
      "Bring creators into the program without locking yourself into risky upfront promo deals.",
  },
  {
    number: "03",
    title: "Assign codes or links",
    description:
      "Give each creator a trackable path so ownership stays clear from the start.",
  },
  {
    number: "04",
    title: "Track subscription results",
    description:
      "See which creators actually drive conversions and which results still need review.",
  },
  {
    number: "05",
    title: "Reward performance",
    description:
      "Approve earnings, move them into payout, and keep creators informed without messy manual updates.",
  },
];

const productSurfaces = [
  {
    title: "Creator tracking",
    description:
      "Keep creator ownership, codes, and linked app context readable as the program grows.",
    icon: <UserSearch size={20} strokeWidth={1.5} />,
  },
  {
    title: "Results review",
    description:
      "See which results are ready to trust, which still need review, and why.",
    icon: <ClipboardCheck size={20} strokeWidth={1.5} />,
  },
  {
    title: "Commissions and payouts",
    description:
      "Move from approved earnings into payout without losing the logic behind what changed.",
    icon: <Wallet size={20} strokeWidth={1.5} />,
  },
  {
    title: "Creator portal",
    description:
      "Give creators a simple view of what they earned without exposing internal workspace detail.",
    icon: <UserCircle size={20} strokeWidth={1.5} />,
  },
];

const trustBlocks = [
  {
    title: "Role-aware access",
    description:
      "Internal teams and creators get separate experiences with the right level of visibility.",
    icon: <Lock size={20} strokeWidth={1.5} />,
  },
  {
    title: "Audited decisions",
    description:
      "Manual review, commission changes, and payout steps stay visible when trust matters.",
    icon: <FileSearch size={20} strokeWidth={1.5} />,
  },
  {
    title: "Finance-safe payouts",
    description:
      "Payout prep, export, and paid states stay clear instead of blending into one vague money flow.",
    icon: <BadgeDollarSign size={20} strokeWidth={1.5} />,
  },
];

const comparisonRows = [
  {
    painPoint: "Upfront spend risk",
    oldWay: "You pay creators upfront and find out later if it worked.",
    newWay: "Creators are paid only when subscriptions confirm. Zero upfront fees.",
  },
  {
    painPoint: "Creator accountability",
    oldWay: "Payout is based on reach - not on whether anyone subscribed.",
    newWay: "Every creator payout is tied directly to verified subscription outcomes.",
  },
  {
    painPoint: "Tracking complexity",
    oldWay: "Manual spreadsheets and back-and-forth on what actually converted.",
    newWay: "Codes, results, earnings, and payout status - all in one place.",
  },
  {
    painPoint: "Payout trust",
    oldWay: "Creators are in the dark about earnings until you tell them.",
    newWay: "Creators see their earnings, codes, and payout progress in real time - no follow-up needed.",
  },
  {
    painPoint: "Review process",
    oldWay: "You decide what counts via DMs and emails, with no record.",
    newWay: "A built-in review queue shows which results to trust and which need a second look - all auditable.",
  },
  {
    painPoint: "Commission changes",
    oldWay: "Rate changes mean messages, spreadsheet edits, and hoping the creator has the right number.",
    newWay: "Commission rates and changes are tracked in the system - both sides always see the same number.",
  },
];

export const metadata: Metadata = {
  title: "AppAffiliate",
  description:
    "Pay creators for results, not hype. AppAffiliate helps iOS app teams grow through creators without risky upfront promo fees.",
};

export default function Home() {
  return (
    <MarketingShell
      navLinks={publicNavLinks}
      footerLinks={publicFooterLinks}
      primaryAction={publicPrimaryAction}
      secondaryAction={publicSecondaryAction}
      currentPath="/"
    >
      <main>
        <MarketingHero
          eyebrow="PERFORMANCE-BASED CREATOR GROWTH"
          title="Pay creators for results, not hype."
          description="Run a creator growth channel where every payout ties back to a real subscription - not a view count or a vibe."
          wrapVisual={false}
          actions={
            <>
              <Link href="/request-access" className="aa-button aa-button-primary px-5 py-3">
                Request access
              </Link>
              <Link href="/how-it-works" className="aa-button aa-button-secondary px-5 py-3">
                See how it works
              </Link>
            </>
          }
        >
          <MarketingHeroVisual
            src="/branding/appaffiliate3d.png"
            alt="AppAffiliate 3D brand mark"
          />
        </MarketingHero>

        <div id="content" />

        <MarketingSection muted className="border-b border-border">
          <MarketingComparison
            eyebrow="WHY IT WORKS DIFFERENTLY"
            title="Compare the cost logic, not just a feature list."
            description="The alternative to AppAffiliate isn't a competitor. It's spreadsheets, DMs, and hoping creators drive subscriptions."
            rows={comparisonRows}
          />
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            title="Built on a simple belief."
            description="Creator growth should only cost money when it works."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {founderPain.map((item) => (
              <MarketingCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            title="A cleaner deal for founders, creators, and ops."
            description="The surface is simple. Under it, every review, commission, and payout action has a paper trail."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {valueProps.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                tone="contrast"
                icon={item.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            title="A short path from creator invite to payout."
            description="The workflow stays easy to understand: connect the app, assign the creator path, track results, review what matters, and reward real performance."
          />

          <div className="mt-10">
            <MarketingSteps steps={workflowSteps} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            title="Everything you need to run creator performance in one place."
            description="AppAffiliate connects creator tracking, review, commissions, payouts, and creator visibility without turning the site into a product-tour maze."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productSurfaces.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] lg:items-start">
            <MarketingSectionHeading
              title="Give creators a simple view of what they earned."
              description="Creators do not need the internal workspace. They need a clean read-only view of codes, results, approved earnings, and payout history."
            />

            <MarketingCard
              title="Creator portal"
              description="The portal stays simpler than admin: creator-friendly language, payout-safe status labels, and a calmer layout designed for trust instead of back-office complexity."
              tone="contrast"
              icon={<UserCircle size={20} strokeWidth={1.5} />}
            >
              <div className="mt-5 grid gap-3">
                {[
                  "Codes and links that clearly belong to the creator",
                  "Results driven by their audience",
                  "Approved earnings, in payout, and paid history",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[var(--radius-input)] border border-border bg-white px-4 py-3 text-sm leading-6 text-ink-muted"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </MarketingCard>
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            title="Built to keep performance and payouts trustworthy."
            description="Trust is part of the growth model: role-aware access, clear review state, and finance-safe payout handling all reinforce the public promise."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trustBlocks.map((item) => (
              <MarketingCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="GET STARTED"
              title="Start rewarding results instead of guessing on hype."
              description="Request access and we'll walk you through the workflow together."
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
