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
    title: "You should not have to prepay for guesswork",
    description:
      "Too much influencer spend lands before anyone knows whether subscriptions will actually convert.",
    icon: <Banknote size={20} strokeWidth={1.5} />,
  },
  {
    title: "Creators should be rewarded fairly",
    description:
      "When performance is tracked clearly, creators can see what they drove and what they earned without awkward side-channel updates.",
    icon: <Users size={20} strokeWidth={1.5} />,
  },
  {
    title: "Your team still needs trust behind the scenes",
    description:
      "Attribution, commission review, and payouts should support the growth model instead of turning into spreadsheet cleanup.",
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
    oldWay: "High spend lands first, then founders hope the campaign turns into real subscriptions. No recourse if it does not.",
    newWay: "Pay only when subscription results are confirmed. Zero upfront creator fees. Risk stays off your balance sheet until results arrive.",
  },
  {
    painPoint: "Creator accountability",
    oldWay: "Deals are based on reach and views. Payout is disconnected from whether the audience subscribed or stayed.",
    newWay: "Every creator\u2019s payout is tied directly to verified subscription outcomes \u2014 not follower counts or post metrics.",
  },
  {
    painPoint: "Tracking complexity",
    oldWay: "Spreadsheet-heavy manual tracking, back-and-forth on what actually converted, no single source of truth.",
    newWay: "Creator codes, results, approved earnings, and payout status all live in one place. No spreadsheets, no chasing follow-up.",
  },
  {
    painPoint: "Payout trust",
    oldWay: "Creators do not know what they earned or when they will be paid until you tell them. Friction and distrust build over time.",
    newWay: "Creators get a read-only portal showing their codes, results, approved earnings, and payout progress in real time.",
  },
  {
    painPoint: "Review process",
    oldWay: "Manual review with no workflow \u2014 you are deciding in DMs or emails what counts and what does not.",
    newWay: "Built-in review queue: see which results are ready to trust, which need review, and exactly why. Reviewable, auditable.",
  },
  {
    painPoint: "Commission changes",
    oldWay: "Any commission adjustment requires a manual message, update to your spreadsheet, and hope the creator has the right number.",
    newWay: "Commission changes, payout notes, and status updates are tracked in the system \u2014 both sides always see the same number.",
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
          eyebrow="Creator growth for modern iOS founders"
          title="Pay creators for results, not hype."
          description="AppAffiliate helps iOS app teams grow through creators without risky upfront promo fees. Track real subscription results, reward creators fairly, and manage commissions and payouts in one place."
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

        <MarketingSection className="border-b border-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
          <MarketingComparison
            eyebrow="Old way vs AppAffiliate"
            title="Compare the cost logic, not just a feature list."
            description="The real alternative is not another SaaS line item. It is wasted influencer spend, manual payout cleanup, and unclear creator performance."
            rows={comparisonRows}
          />
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="The problem"
            title="Stop paying for app promotion that does not convert."
            description="Founders are tired of spending on views, posts, and campaigns that feel busy but never turn into real subscription growth."
          />

          <ScrollReveal className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {founderPain.map((item) => (
              <MarketingCard key={item.title} title={item.title} description={item.description} icon={item.icon} />
            ))}
          </ScrollReveal>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="Built for performance-based app growth"
            title="A cleaner deal for founders, creators, and the team behind payouts."
            description="The growth story is simple up front, but the product still gives your team the review and payout trust needed to run the channel for real."
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
            eyebrow="How AppAffiliate works"
            title="A short path from creator invite to payout."
            description="The workflow stays easy to understand: connect the app, assign the creator path, track results, review what matters, and reward real performance."
          />

          <div className="mt-10">
            <MarketingSteps steps={workflowSteps} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="Product surfaces"
            title="Everything you need to run creator performance in one place."
            description="AppAffiliate connects creator tracking, review, commissions, payouts, and creator visibility without turning the site into a product-tour maze."
          />

          <ScrollReveal className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
              eyebrow="Creator trust"
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
            eyebrow="Security and trust"
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
              eyebrow="Final step"
              title="Start rewarding results instead of guessing on hype."
              description="If you want creator growth without risky upfront influencer deals, review the workflow and request access for a guided rollout."
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
