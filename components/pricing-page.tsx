"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";

import {
  MarketingCtaPanel,
  MarketingFaqAccordion,
  MarketingSection,
  MarketingSectionHeading,
} from "@/components/marketing-page";
import {
  PRICING_PLANS,
  getPlanPriceLabel,
  getPlanSelectionHref,
  type SelfServeBillingInterval,
} from "@/lib/pricing-catalog";

function joinClasses(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const FAQ_ITEMS = [
  {
    question: "Is there a free trial?",
    answer:
      "Yes. Starter, Growth, and Scale all include a 14-day free trial.",
  },
  {
    question: "Do I need to talk to sales to get started?",
    answer:
      "No. You can start a free trial on any self-serve plan right away. Enterprise teams can contact us for a tailored rollout.",
  },
  {
    question: "What counts toward creator limits?",
    answer:
      "Creator limits are based on active creators in your workspace.",
  },
  {
    question: "Can I switch between monthly and annual billing?",
    answer:
      "Yes. You can choose monthly or annual billing based on what fits your team best.",
  },
  {
    question: "What happens when my trial ends?",
    answer:
      "You can choose a paid plan and continue running your program. If you do not upgrade, access can be limited until billing is set up.",
  },
  {
    question: "What if I need more than Scale includes?",
    answer:
      "That is what Enterprise is for. Contact us if you need higher limits, custom onboarding, or a more tailored setup.",
  },
] as const;

export function PricingPageContent() {
  const [billingInterval, setBillingInterval] =
    useState<SelfServeBillingInterval>("monthly");

  return (
    <>
      <MarketingSection id="content" className="border-b border-border bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex justify-center">
            <div className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[#f4f7fc] p-1 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
              <button
                type="button"
                onClick={() => setBillingInterval("monthly")}
                className={joinClasses(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  billingInterval === "monthly"
                    ? "bg-white text-ink shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBillingInterval("annual")}
                className={joinClasses(
                  "rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                  billingInterval === "annual"
                    ? "bg-white text-ink shadow-[0_8px_18px_rgba(15,23,42,0.08)]"
                    : "text-ink-muted hover:text-ink",
                )}
              >
                Annual - Save 2 months
              </button>
            </div>
          </div>

          <p className="mt-4 text-center text-sm leading-6 text-ink-muted">
            Save with annual billing. All paid self-serve plans begin with a 14-day free trial.
          </p>

          <div className="mt-10 grid gap-4 xl:grid-cols-4">
            {PRICING_PLANS.map((plan) => {
              const isEnterprise = plan.priceKind === "custom";
              const isFeatured = plan.key === "growth";
              const href =
                plan.key === "enterprise"
                  ? "/request-access"
                  : getPlanSelectionHref(plan.key, billingInterval);
              const priceLabel = isEnterprise
                ? "Custom"
                : getPlanPriceLabel(plan.key, billingInterval);

              return (
                <article
                  key={plan.key}
                  className={joinClasses(
                    "flex h-full flex-col rounded-[24px] border bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] p-6 shadow-[0_18px_40px_rgba(15,23,42,0.05)]",
                    isFeatured
                      ? "border-[color:color-mix(in_srgb,var(--color-primary)_26%,var(--color-border))] lg:-translate-y-1"
                      : "border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))]",
                  )}
                >
                  <div className="min-h-[120px]">
                    <div className="flex min-h-7 items-start justify-between gap-3">
                      <div>
                        <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-ink">
                          {plan.name}
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-ink-muted">
                          {plan.metaLine}
                        </p>
                      </div>
                      {plan.badge ? (
                        <span className="rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_18%,var(--color-border))] bg-[#eef3ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
                          {plan.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6">
                    <p className="text-[38px] font-semibold tracking-[-0.05em] text-ink">
                      {priceLabel}
                    </p>
                    <p className="mt-2 min-h-12 text-sm leading-6 text-ink-muted">
                      {billingInterval === "annual" && !isEnterprise
                        ? plan.annualSupportLine
                        : plan.description}
                    </p>
                    {billingInterval === "annual" && !isEnterprise ? (
                      <p className="mt-3 text-sm leading-6 text-ink-muted">
                        {plan.description}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-6">
                    <Link
                      href={href}
                      className={joinClasses(
                        "aa-button w-full",
                        isFeatured ? "aa-button-primary" : "aa-button-secondary",
                      )}
                    >
                      {plan.ctaLabel}
                    </Link>
                    <p className="mt-2 text-center text-xs font-medium uppercase tracking-[0.14em] text-ink-subtle">
                      {plan.ctaSupportLine}
                    </p>
                  </div>

                  <div className="mt-6 flex-1 border-t border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] pt-5">
                    {plan.featuresIntro ? (
                      <p className="text-sm font-semibold text-ink">
                        {plan.featuresIntro}
                      </p>
                    ) : null}
                    <ul className="mt-4 space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-ink-muted">
                          <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e8f0ff] text-primary">
                            <Check size={13} strokeWidth={2.25} />
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection muted>
        <div className="mx-auto max-w-5xl rounded-[28px] border border-[color:color-mix(in_srgb,var(--color-primary)_14%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(241,246,255,0.95)_100%)] px-6 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            WHY IT PAYS FOR ITSELF
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl">
            Built to cost less than a bad creator bet
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-ink-muted">
            AppAffiliate helps teams avoid risky upfront creator spend by tying payouts to verified subscription outcomes. Instead of managing attribution, commissions, creator visibility, and payout prep across spreadsheets and inboxes, your workflow stays in one system.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              "Pay for verified results, not vague reach",
              "Keep creator earnings and payout status visible",
              "Reduce spreadsheet and support overhead",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-white/90 px-4 py-4 text-sm leading-6 text-ink-muted"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </MarketingSection>

      <MarketingSection className="bg-white">
        <div className="mx-auto max-w-4xl">
          <MarketingSectionHeading
            eyebrow="FAQ"
            title="The short answers teams usually need first"
            description="Keep the next decision simple: start a trial, stay monthly, or move to annual when the channel is working."
            align="center"
          />

          <MarketingFaqAccordion items={FAQ_ITEMS} className="mt-10" />
        </div>
      </MarketingSection>

      <MarketingSection muted>
        <div className="mx-auto max-w-5xl">
          <MarketingCtaPanel
            eyebrow="GET STARTED"
            title="Start your creator program without the upfront guesswork"
            description="Try AppAffiliate free for 14 days, or talk to us if your team needs a more tailored rollout."
            primaryHref={getPlanSelectionHref("growth", billingInterval)}
            primaryLabel="Start free trial"
            secondaryHref="/request-access"
            secondaryLabel="Contact us"
          />
        </div>
      </MarketingSection>
    </>
  );
}
