import Link from "next/link";
import type { ReactNode } from "react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

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
          ? "border-y border-border bg-[linear-gradient(180deg,#f4f7fb_0%,#edf3fa_100%)]"
          : "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-[var(--marketing-max-width)] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        {children}
      </div>
    </section>
  );
}

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
      <div className="mx-auto grid max-w-[var(--marketing-max-width)] gap-8 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-10 lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-ink sm:text-5xl lg:text-[4.3rem] lg:leading-[1.02]">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            {description}
          </p>
          {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {children ? (
          wrapVisual ? (
            <div className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(242,246,253,0.96)_100%)] p-6 shadow-[var(--shadow-strong)] sm:p-7">
              {children}
            </div>
          ) : (
            <div className="lg:self-stretch">{children}</div>
          )
        ) : null}
      </div>
    </section>
  );
}

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
    <div className={joinClasses("max-w-3xl", align === "center" && "mx-auto text-center")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-7 text-ink-muted">{description}</p>
    </div>
  );
}

type MarketingCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
  tone?: "default" | "soft" | "contrast";
};

export function MarketingCard({
  title,
  description,
  children,
  className,
  tone = "default",
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
        "rounded-[20px] border border-border p-5 shadow-[var(--shadow-soft)] transition-shadow",
        toneClass,
        className,
      )}
    >
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
          className="rounded-[16px] border border-border bg-[rgba(255,255,255,0.88)] px-4 py-4 text-sm leading-7 text-ink-muted"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

type MarketingComparisonProps = {
  eyebrow?: string;
  title: string;
  description: string;
  leftTitle: string;
  leftItems: string[];
  rightTitle: string;
  rightItems: string[];
};

export function MarketingComparison({
  eyebrow,
  title,
  description,
  leftTitle,
  leftItems,
  rightTitle,
  rightItems,
}: MarketingComparisonProps) {
  return (
    <div className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,#ffffff_0%,#f6f9ff_100%)] p-6 shadow-[var(--shadow-strong)] sm:p-8">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink sm:text-3xl">
        {title}
      </h3>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-muted sm:text-base">
        {description}
      </p>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <MarketingCard
          title={leftTitle}
          description="High spend lands first, then founders hope the campaign turns into real subscriptions."
          tone="soft"
        >
          <MarketingList items={leftItems} />
        </MarketingCard>
        <MarketingCard
          title={rightTitle}
          description="Tracking, review, and payouts stay tied to the real conversion path so both sides can trust what happened."
          tone="contrast"
        >
          <MarketingList items={rightItems} />
        </MarketingCard>
      </div>
    </div>
  );
}

type MarketingStep = {
  number: string;
  title: string;
  description: string;
};

export function MarketingSteps({ steps }: { steps: MarketingStep[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {steps.map((step) => (
        <div
          key={step.number}
          className="rounded-[24px] border border-border bg-white p-5 shadow-[var(--shadow-soft)]"
        >
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
            {step.number}
          </span>
          <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em] text-ink">
            {step.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-ink-muted">{step.description}</p>
        </div>
      ))}
    </div>
  );
}

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
    <div className="rounded-[24px] border border-[color:color-mix(in_srgb,var(--color-primary)_14%,var(--color-border))] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7ff_100%)] px-6 py-10 text-center shadow-[var(--shadow-strong)] sm:px-10">
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
  );
}
