import Link from "next/link";
import type { Metadata } from "next";

import {
  MarketingCtaPanel,
  MarketingCard,
  MarketingHero,
  MarketingList,
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

const valuePoints = [
  {
    title: "Attribution visibility",
    description:
      "Keep attributed and unattributed activity readable instead of pushing review work into spreadsheets and side channels.",
  },
  {
    title: "Partners and codes",
    description:
      "Manage partner relationships, code ownership, and program coverage in one focused operating layer.",
  },
  {
    title: "Commission control",
    description:
      "Review commission state explicitly before anything moves into payout preparation.",
  },
  {
    title: "Payout preparation",
    description:
      "Group approved work into payout batches with clearer status and cleaner finance handoff.",
  },
  {
    title: "Finance-ready exports",
    description:
      "Keep exports close to the workflow that created them so finance handoff stays controlled.",
  },
  {
    title: "Partner visibility",
    description:
      "Give partners a read-only view into codes, performance, and payouts without exposing internal controls.",
  },
];

const audienceCards = [
  {
    title: "App founders and growth teams",
    description:
      "For teams that need a clear operating view of partner performance, attribution review, and payout readiness.",
  },
  {
    title: "Affiliate and program managers",
    description:
      "For people managing partner relationships, code coverage, review queues, and everyday program control.",
  },
  {
    title: "Finance and operations teams",
    description:
      "For reviewers who need explicit commission state, payout batches, exports, and safer workflow handoff.",
  },
  {
    title: "Partners",
    description:
      "For partners who need simple visibility into their own codes, performance, and payout status through a separate portal.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Add your app",
    description:
      "Start with Apple ingestion readiness and app-level operational visibility so receipt flow is readable from day one.",
  },
  {
    step: "02",
    title: "Add partners and codes",
    description:
      "Link promo codes to the right partners and keep ownership visible as the program grows.",
  },
  {
    step: "03",
    title: "Review activity",
    description:
      "Work through attributed and unattributed activity with explicit review state instead of loose side-channel decisions.",
  },
  {
    step: "04",
    title: "Approve commissions",
    description:
      "Move only reviewed work forward so commission state stays clear before payout prep begins.",
  },
  {
    step: "05",
    title: "Prepare payouts and exports",
    description:
      "Group approved records into payout batches, export what finance needs, and keep the full workflow traceable.",
  },
];

const featureBlocks = [
  {
    title: "Partners and codes",
    description:
      "Track partner records, code ownership, and app coverage without turning the program into a loose directory.",
  },
  {
    title: "Attribution review",
    description:
      "Keep unattributed queues visible, manual decisions explicit, and event inspection safe for day-to-day operations.",
  },
  {
    title: "Commissions and payouts",
    description:
      "Review commissions, prepare payouts, and manage payout batches with status language the whole team can trust.",
  },
  {
    title: "Apple health",
    description:
      "Use app-level Apple ingestion visibility to catch operational issues before they create downstream confusion.",
  },
  {
    title: "Exports and controls",
    description:
      "Keep exports, settings, audit history, and finance-sensitive workflow controls close to the work they support.",
  },
];

const partnerPortalPoints = [
  "Partners can review their own codes and linked apps.",
  "Performance stays read-only and status-led, with commission state labeled clearly.",
  "Payout history is visible without exposing internal audit, settings, or finance controls.",
];

const securityPoints = [
  {
    title: "Role-aware access",
    description:
      "Internal workspace routes and partner portal routes stay separate, with access checked against explicit roles.",
  },
  {
    title: "Organization scoping",
    description:
      "Operational reads and writes stay scoped to the right organization to reduce cross-tenant risk.",
  },
  {
    title: "Audited decisions",
    description:
      "Manual attribution, commission, payout, and admin-sensitive actions retain an audit trail where the workflow needs it.",
  },
  {
    title: "Finance-safe operations",
    description:
      "Exports and review flows stay permissioned, and browser-facing surfaces avoid raw sensitive Apple payload exposure.",
  },
];

export const metadata: Metadata = {
  title: "AppAffiliate",
  description:
    "AppAffiliate helps app teams run affiliate operations with clearer attribution review, commissions, payouts, exports, and partner visibility.",
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
          eyebrow="Affiliate operations for app teams"
          title="Run partner programs with clearer control."
          description="AppAffiliate gives app teams one calm workflow for partner codes, attribution review, commissions, payout preparation, exports, and partner visibility, replacing spreadsheets, inbox decisions, and disconnected tooling."
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
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">
                AppAffiliate workflow
              </p>
              <p className="mt-1 text-sm text-[#6B7280]">
                One operating layer from intake to payout prep
              </p>
            </div>
            <span className="rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
              Working product
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {[
              {
                title: "Partners and codes",
                detail: "Keep ownership visible across apps and programs.",
              },
              {
                title: "Attribution review",
                detail: "Work through unattributed activity with explicit decisions.",
              },
              {
                title: "Commissions and payouts",
                detail: "Approve reviewed work before it moves into payout batches.",
              },
              {
                title: "Exports and portal visibility",
                detail: "Support finance handoff and partner transparency without opening internal controls.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-[#EEF1F4] bg-white px-4 py-4"
              >
                <p className="text-sm font-medium text-[#1A1A1A]">
                  {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#667085]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </MarketingHero>

        <MarketingSection>
          <MarketingSectionHeading
            eyebrow="Value"
            title="Built for the work between attribution and payout."
            description="AppAffiliate focuses on the operating layer most teams end up stitching together by hand: partner ownership, review discipline, commission control, payout preparation, finance-ready exports, and partner-safe visibility."
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {valuePoints.map((point) => (
              <MarketingCard
                key={point.title}
                title={point.title}
                description={point.description}
                className="bg-[#FAFBFC]"
              />
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
              eyebrow="Who it’s for"
              title="Clear enough for growth, operations, finance, and partners."
              description="AppAffiliate is designed for teams that need one shared operating view without forcing every audience into the same surface or vocabulary."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {audienceCards.map((audience) => (
                <MarketingCard
                  key={audience.title}
                  title={audience.title}
                  description={audience.description}
                />
              ))}
            </div>
        </MarketingSection>

        <MarketingSection>
          <MarketingSectionHeading
              eyebrow="How it works"
              title="From intake to payout prep, in one calmer sequence."
              description="The workflow stays intentionally narrow. Each step reduces ambiguity so partner programs can move forward with clearer attribution, clearer commission state, and cleaner finance handoff."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-5">
            {workflowSteps.map((step) => (
              <div
                key={step.step}
                className="rounded-[24px] border border-[#ECEFF3] bg-white p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F5FF] text-sm font-semibold text-[#2E53FF]">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold tracking-[-0.02em] text-[#1A1A1A]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-7 text-[#5B6472]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
              eyebrow="Product surfaces"
              title="The core surfaces stay focused on real workflow state."
              description="AppAffiliate is not a broad all-purpose admin suite. Each product area exists to support a clearer path from partner activity to reviewed finance output."
            />

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              {featureBlocks.map((feature) => (
                <MarketingCard
                  key={feature.title}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
        </MarketingSection>

        <MarketingSection>
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
            <MarketingSectionHeading
              eyebrow="Partner portal"
              title="A separate read-only portal for partner visibility."
              description="Partners should be able to review their own records without crossing into internal admin tools. AppAffiliate keeps that boundary explicit while still giving partners useful visibility into codes, performance, and payout status."
            />

            <div className="rounded-[28px] border border-[#E8EBF0] bg-[#FAFBFC] p-6 shadow-[0_18px_48px_rgba(17,24,39,0.05)]">
              <p className="text-sm font-medium text-[#1A1A1A]">What partners see</p>
              <div className="mt-5">
                <MarketingList items={partnerPortalPoints} />
              </div>
              <p className="mt-5 text-sm leading-7 text-[#7B8391]">
                The portal stays intentionally narrow. No admin-only settings,
                exports, audit logs, or internal notes leak into the partner
                experience.
              </p>
            </div>
          </div>
        </MarketingSection>

        <MarketingSection muted>
          <MarketingSectionHeading
              eyebrow="Security and trust"
              title="Controlled operations without heavyweight theater."
              description="AppAffiliate keeps trust grounded in the actual product: role-aware access, org scoping, audited decisions, and safer finance-sensitive workflows."
            />

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {securityPoints.map((point) => (
                <MarketingCard
                  key={point.title}
                  title={point.title}
                  description={point.description}
                />
              ))}
            </div>
        </MarketingSection>

        <MarketingSection>
          <div className="mx-auto max-w-5xl">
            <MarketingCtaPanel
              eyebrow="Access and rollout"
              title="Request access when the workflow fits."
              description="AppAffiliate is currently rolled out directly with invited teams. If the operating model matches your program, request access. If you already have invited access, sign in."
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
