"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

/* ─── Scroll Reveal ─── */

function useScrollReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

export function ScrollReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={joinClasses(className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 500ms ease-out, transform 500ms ease-out",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Section ─── */

type MarketingSectionProps = {
  children: ReactNode;
  className?: string;
  muted?: boolean;
};

export function MarketingSection({
  children,
  className,
  muted = false,
}: MarketingSectionProps) {
  return (
    <section
      className={joinClasses(
        muted
          ? "border-y border-border bg-surface"
          : "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-[var(--marketing-max-width)] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-20">
        {children}
      </div>
    </section>
  );
}

/* ─── Hero ─── */

type MarketingHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  wrapVisual?: boolean;
};

export function MarketingHero({
  eyebrow,
  title,
  description,
  actions,
  children,
  wrapVisual = true,
}: MarketingHeroProps) {
  return (
    <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,rgba(46,83,255,0.14),transparent_36%),linear-gradient(180deg,#fcfdff_0%,#ffffff_100%)]">
      <div className="mx-auto grid max-w-[var(--marketing-max-width)] gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)] lg:items-center lg:gap-12 lg:px-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
            {eyebrow}
          </p>
          <h1
            className="mt-4 font-semibold tracking-[-0.04em] text-ink leading-[1.05]"
            style={{ fontSize: "clamp(2rem, 6vw + 0.5rem, 4.3rem)" }}
          >
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-ink-muted">
            {description}
          </p>
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {children ? (
          wrapVisual ? (
            <div className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,246,253,0.96)_100%)] p-6 shadow-[var(--shadow-strong)] sm:p-7">
              {children}
            </div>
          ) : (
            <div className="lg:self-stretch">{children}</div>
          )
        ) : null}
      </div>

      {/* Scroll indicator */}
      <div className="flex justify-center pb-6">
        <a
          href="#content"
          className="flex flex-col items-center gap-1 text-ink-subtle transition-colors hover:text-primary"
        >
          <span className="text-xs tracking-wide">Scroll to explore</span>
          <ChevronDown size={18} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
}

type MarketingHeroVisualProps = {
  src: string;
  alt: string;
  className?: string;
};

export function MarketingHeroVisual({
  src,
  alt,
  className,
}: MarketingHeroVisualProps) {
  return (
    <div
      className={joinClasses(
        "relative mx-auto flex w-full max-w-[540px] items-center justify-center rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[radial-gradient(circle_at_top,rgba(46,83,255,0.12),transparent_62%),linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.94)_100%)] p-6 shadow-[var(--shadow-strong)] sm:p-8 lg:ml-auto lg:mr-0 lg:p-10",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-[10%] bottom-7 h-10 rounded-full bg-[radial-gradient(circle,rgba(19,41,123,0.18)_0%,rgba(19,41,123,0.04)_58%,transparent_78%)] blur-2xl" />
      <Image
        src={src}
        alt={alt}
        width={2000}
        height={2000}
        priority
        sizes="(min-width: 1280px) 520px, (min-width: 1024px) 42vw, (min-width: 640px) 520px, 88vw"
        className="relative z-10 h-auto w-full max-w-[460px] drop-shadow-[0_24px_40px_rgba(46,83,255,0.12)]"
      />
    </div>
  );
}

/* ─── Section Heading ─── */

type MarketingSectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
};

export function MarketingSectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: MarketingSectionHeadingProps) {
  return (
    <ScrollReveal className={joinClasses("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-ink-muted">{description}</p>
    </ScrollReveal>
  );
}

/* ─── Card ─── */

type MarketingCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "soft" | "contrast";
  icon?: ReactNode;
};

export function MarketingCard({
  title,
  description,
  children,
  className,
  tone = "default",
  icon,
}: MarketingCardProps) {
  const toneClass =
    tone === "contrast"
      ? "border-[color:color-mix(in_srgb,var(--color-primary)_14%,var(--color-border))] bg-[linear-gradient(180deg,#ffffff_0%,#f2f6ff_100%)]"
      : tone === "soft"
        ? "bg-[rgba(248,251,255,0.98)]"
        : "bg-[rgba(255,255,255,0.96)]";

  return (
    <div
      className={joinClasses(
        "rounded-[var(--radius-card)] border border-border p-5 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-strong)]",
        toneClass,
        className,
      )}
    >
      {icon ? (
        <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
          {icon}
        </div>
      ) : null}
      <h3 className="text-lg font-semibold tracking-[-0.03em] text-ink sm:text-xl">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

export function MarketingList({ items }: { items: string[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item}
          className="rounded-[var(--radius-input)] border border-border bg-[rgba(255,255,255,0.88)] px-4 py-4 text-sm leading-7 text-ink-muted"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

/* ─── Comparison Table (3-column) ─── */

type ComparisonRow = {
  painPoint: string;
  oldWay: string;
  newWay: string;
};

type MarketingComparisonProps = {
  eyebrow?: string;
  title: string;
  description: string;
  rows: ComparisonRow[];
  /** @deprecated Use rows instead */
  leftTitle?: string;
  /** @deprecated */
  leftItems?: string[];
  /** @deprecated */
  rightTitle?: string;
  /** @deprecated */
  rightItems?: string[];
};

export function MarketingComparison({
  eyebrow,
  title,
  description,
  rows,
}: MarketingComparisonProps) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] p-5 shadow-[var(--shadow-strong)] sm:p-8">
      <div className="mb-8 max-w-2xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
          {description}
        </p>
      </div>

      {/* Desktop: 3-column table */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border">
          {/* Header row */}
          <div className="grid grid-cols-3 border-b border-border bg-surface text-xs font-semibold uppercase tracking-[0.1em]">
            <div className="px-4 py-3 text-ink-muted">Pain Point</div>
            <div className="border-l border-border bg-danger-soft px-4 py-3 text-danger">The Old Way</div>
            <div className="border-l border-border bg-primary-soft px-4 py-3 text-primary">The AppAffiliate Way</div>
          </div>
          {/* Data rows */}
          {rows.map((row, i) => (
            <div
              key={i}
              className={joinClasses(
                "grid grid-cols-3 text-sm leading-7",
                i < rows.length - 1 && "border-b border-border",
              )}
            >
              <div className="px-4 py-4 font-medium text-ink">{row.painPoint}</div>
              <div className="border-l border-border bg-[#fef2f2] px-4 py-4 text-ink-muted">{row.oldWay}</div>
              <div className="border-l border-border bg-[#ebf0ff] px-4 py-4 text-ink-muted">{row.newWay}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: stacked cards */}
      <div className="space-y-4 md:hidden">
        {rows.map((row, i) => (
          <div key={i} className="rounded-[var(--radius-card)] border border-border bg-white p-4">
            <p className="text-sm font-semibold text-ink">{row.painPoint}</p>
            <div className="mt-3 space-y-2">
              <div className="rounded-[var(--radius-input)] bg-[#fef2f2] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-danger">Old Way</p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{row.oldWay}</p>
              </div>
              <div className="rounded-[var(--radius-input)] bg-[#ebf0ff] px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">AppAffiliate Way</p>
                <p className="mt-1 text-sm leading-6 text-ink-muted">{row.newWay}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Steps ─── */

type MarketingStep = {
  number: string;
  title: string;
  description: string;
  icon?: ReactNode;
};

export function MarketingSteps({ steps }: { steps: MarketingStep[] }) {
  return (
    <ScrollReveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-[var(--radius-card)] border border-border bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-strong)]"
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                  {step.icon ?? step.number}
                </span>
                <span className="text-xs font-medium text-ink-subtle">Step {step.number}</span>
              </div>
              <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-ink-muted">{step.description}</p>
            </div>
        ))}
      </div>
    </ScrollReveal>
  );
}

/* ─── CTA Panel ─── */

type MarketingCtaPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
};

export function MarketingCtaPanel({
  eyebrow,
  title,
  description,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: MarketingCtaPanelProps) {
  return (
    <ScrollReveal>
      <div className="rounded-[var(--radius-card)] border border-[color:color-mix(in_srgb,var(--color-primary)_14%,var(--color-border))] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7ff_100%)] px-6 py-10 text-center shadow-[var(--shadow-strong)] sm:px-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-ink sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-muted">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={primaryHref}
            className="aa-button aa-button-primary px-5 py-3"
          >
            {primaryLabel}
          </Link>
          <Link
            href={secondaryHref}
            className="aa-button aa-button-secondary px-5 py-3"
          >
            {secondaryLabel}
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
}
