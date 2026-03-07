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
        muted ? "border-y border-border bg-surface-muted" : "bg-white",
        className,
      )}
    >
      <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
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
};

export function MarketingHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: MarketingHeroProps) {
  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:px-12 lg:py-24">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
            {eyebrow}
          </p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-ink-muted">
            {description}
          </p>
          {actions ? <div className="mt-9 flex flex-wrap gap-3">{actions}</div> : null}
        </div>

        {children ? (
          <div className="rounded-[28px] border border-border bg-surface-muted p-6 shadow-[var(--shadow-soft)] sm:p-7">
            {children}
          </div>
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-ink sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-base leading-8 text-ink-muted">{description}</p>
    </div>
  );
}

type MarketingCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
  className?: string;
};

export function MarketingCard({
  title,
  description,
  children,
  className,
}: MarketingCardProps) {
  return (
    <div className={joinClasses("rounded-[24px] border border-border bg-white p-6 shadow-[var(--shadow-soft)]", className)}>
      <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink">
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
          className="rounded-[18px] border border-border bg-surface-muted px-4 py-4 text-sm leading-7 text-ink-muted"
        >
          {item}
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
    <div className="rounded-[32px] border border-border bg-white px-6 py-10 text-center shadow-[var(--shadow-strong)] sm:px-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
        {eyebrow}
      </p>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-ink-muted">
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
