import Link from "next/link";
import type { Metadata } from "next";
import {
  BadgeDollarSign,
  ClipboardCheck,
  FileSearch,
  Lock,
  UserCircle,
  UserSearch,
  Wallet,
} from "lucide-react";

import {
  MarketingCard,
  MarketingComparison,
  MarketingCtaPanel,
  MarketingFaqAccordion,
  MarketingHero,
  MarketingHeroVisual,
  MarketingPortalPreview,
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
import {
  PRICING_PLANS,
  getPlanSelectionHref,
  type SelfServePlanKey,
} from "@/lib/pricing-catalog";

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
] as const;

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
] as const;

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
] as const;

const comparisonRows = [
  {
    painPoint: "Upfront spend risk",
    oldWay: "You pay creators upfront and only learn later whether the channel worked.",
    newWay: "Creators are paid only when subscriptions confirm, so spend starts at zero.",
  },
  {
    painPoint: "Creator accountability",
    oldWay: "Reach and promises drive the payout conversation instead of real outcomes.",
    newWay: "Every creator payout ties back to verified subscription results.",
  },
  {
    painPoint: "Tracking complexity",
    oldWay: "Ownership, codes, and results live across spreadsheets, inboxes, and DMs.",
    newWay: "Codes, results, earnings, and payout status stay connected in one system.",
  },
  {
    painPoint: "Payout trust",
    oldWay: "Creators wait for manual updates before they know what they earned.",
    newWay: "Creators can see earnings and payout progress in a clean read-only portal.",
  },
  {
    painPoint: "Review process",
    oldWay: "Ambiguous results are decided ad hoc with no clear audit trail.",
    newWay: "A review queue makes unclear results visible before earnings are trusted.",
  },
  {
    painPoint: "Commission changes",
    oldWay: "Rate changes mean spreadsheet edits, messages, and conflicting numbers.",
    newWay: "Commission changes stay visible in the same system as review and payout.",
  },
] as const;

const faqItems = [
  {
    question: "How does AppAffiliate attribute results to a creator?",
    answer:
      "AppAffiliate uses the creator path you assign through codes or links, then sends unclear results into review before earnings are trusted.",
  },
  {
    question: "Do creators need access to our internal workspace?",
    answer:
      "No. Creators use a separate read-only portal that shows their codes, results, earnings, and payout history without exposing internal admin tools.",
  },
  {
    question: "What happens if a result needs review?",
    answer:
      "It stays visible in review until your team confirms the ownership story or deliberately holds it for follow-up.",
  },
  {
    question: "How do payouts work?",
    answer:
      "Approved earnings move into payout prep, export, and paid states so finance and creators can follow the same money flow clearly.",
  },
  {
    question: "What happens with refunds?",
    answer:
      "Refund-related changes remain visible so your team can review earning impact before payout decisions move forward.",
  },
  {
    question: "Can we start with one app and a small creator group?",
    answer:
      "Yes. Starter is built for one app and a small creator set, so you can begin with a tight test instead of a large rollout.",
  },
  {
    question: "Do I need billing set up before I can try it?",
    answer:
      "No. Self-serve plans start with a 14-day trial, so you can begin before billing is fully set up.",
  },
  {
    question: "What if we manage multiple apps or brands?",
    answer:
      "Growth and Scale cover multi-app teams, and Enterprise is there for larger multi-brand or more tailored setups.",
  },
] as const;

const portalSections = [
  {
    label: "Codes and links",
    rows: [
      {
        title: "SUMMER-ALLY",
        meta: "Primary creator code for paid social traffic",
        status: "Assigned",
        tone: "blue" as const,
      },
      {
        title: "appaffiliate.co/ally",
        meta: "Read-only creator link with owned attribution path",
        status: "Live",
        tone: "green" as const,
      },
    ],
  },
  {
    label: "Results driven",
    rows: [
      {
        title: "14 subscription results",
        meta: "Latest activity from Ally's audience",
        status: "Tracked",
        tone: "blue" as const,
      },
    ],
  },
  {
    label: "Earnings state",
    rows: [
      {
        title: "$420.00 approved",
        meta: "Ready to move through payout",
        status: "Approved",
        tone: "green" as const,
      },
      {
        title: "$180.00 in payout",
        meta: "Exported and waiting for payment confirmation",
        status: "In payout",
        tone: "blue" as const,
      },
      {
        title: "$1,240.00 paid",
        meta: "Completed payout history",
        status: "Paid",
        tone: "neutral" as const,
      },
    ],
  },
] as const;

const homepagePricingPlans = PRICING_PLANS.filter(
  (plan) => plan.priceKind === "self_serve",
) as Array<(typeof PRICING_PLANS)[number] & { key: SelfServePlanKey }>;

function formatMonthlyPreview(price: string | undefined) {
  if (!price) {
    return "";
  }

  return price.replace("/month", "/mo");
}

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
              <Link href="/signup" className="aa-button aa-button-primary px-5 py-3">
                Start free trial
              </Link>
              <Link href="/how-it-works" className="aa-button aa-button-secondary px-5 py-3">
                See how it works
              </Link>
            </>
          }
          actionsFooter="14-day free trial on self-serve plans."
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
            description="The alternative to AppAffiliate is not a competitor. It is spreadsheets, DMs, and hoping creators drive subscriptions."
            rows={comparisonRows}
            actions={
              <>
                <Link href="/how-it-works" className="aa-button aa-button-primary px-5 py-3">
                  See how it works
                </Link>
                <Link
                  href="/pricing"
                  className="text-sm font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
                >
                  View pricing
                </Link>
              </>
            }
          />
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="HOW IT WORKS"
            title="A short path from creator invite to payout."
            description="The workflow stays easy to understand: connect the app, assign the creator path, track results, review what matters, and reward real performance."
          />

          <div className="mt-10">
            <MarketingSteps steps={workflowSteps} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="WHAT THE SYSTEM COVERS"
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
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start">
            <MarketingSectionHeading
              eyebrow="CREATOR VISIBILITY"
              title="Give creators a simple view of what they earned."
              description="Creators do not need the internal workspace. They need a clean read-only view of codes, results, approved earnings, and payout history."
            />

            <MarketingPortalPreview sections={portalSections} />
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
            eyebrow="BUILT FOR TRUST"
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
            <MarketingSectionHeading
              eyebrow="PRICING"
              title="Start small, scale when the channel works."
              description="Choose a plan based on how many apps and active creators you manage. Every self-serve plan starts with a 14-day free trial."
              align="center"
            />

            <ScrollReveal className="mt-10 grid gap-4 lg:grid-cols-3">
              {homepagePricingPlans.map((plan) => {
                const featured = plan.key === "growth";

                return (
                  <article
                    key={plan.key}
                    className={`rounded-[22px] border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] ${
                      featured
                        ? "border-[color:color-mix(in_srgb,var(--color-primary)_20%,var(--color-border))]"
                        : "border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[21px] font-semibold tracking-[-0.03em] text-ink">
                          {plan.name}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-ink-muted">
                          {plan.metaLine}
                        </p>
                      </div>
                      {plan.badge ? (
                        <span className="rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_16%,var(--color-border))] bg-[#eef3ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-6 text-[34px] font-semibold tracking-[-0.05em] text-ink">
                      {formatMonthlyPreview(plan.prices.monthly)}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-ink-muted">
                      {plan.description}
                    </p>
                  </article>
                );
              })}
            </ScrollReveal>

            <p className="mt-6 text-center text-sm leading-6 text-ink-muted">
              Need more?{" "}
              <Link
                href="/request-access"
                className="font-semibold text-primary transition hover:text-[color:color-mix(in_srgb,var(--color-primary)_82%,black)]"
              >
                Contact us for Enterprise pricing.
              </Link>
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/pricing" className="aa-button aa-button-primary px-5 py-3">
                View full pricing
              </Link>
              <Link
                href={getPlanSelectionHref("growth", "monthly")}
                className="aa-button aa-button-secondary px-5 py-3"
              >
                Start free trial
              </Link>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <div className="mx-auto max-w-4xl">
            <MarketingSectionHeading
              eyebrow="FAQ"
              title="Questions teams ask before they switch."
              description="Keep the next decision simple with short answers about attribution, visibility, payouts, and scale."
              align="center"
            />

            <MarketingFaqAccordion items={faqItems} className="mt-10" />
          </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="GET STARTED"
              title="Start rewarding results instead of guessing on hype."
              description="Try AppAffiliate free for 14 days, or explore the workflow before deciding."
              primaryHref={getPlanSelectionHref("growth", "monthly")}
              primaryLabel="Start free trial"
              secondaryHref="/how-it-works"
              secondaryLabel="See how it works"
            />
          </div>
        </MarketingSection>
      </main>
    </MarketingShell>
  );
}
