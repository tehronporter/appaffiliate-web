import Link from "next/link";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type SupportCardProps = {
  title: string;
  description: string;
  href?: string;
  label?: string;
  className?: string;
};

export function SupportCard({
  title,
  description,
  href,
  label = "Open",
  className,
}: SupportCardProps) {
  const content = (
    <>
      <h3 className="text-xl font-semibold tracking-[-0.03em] text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>
      {href ? (
        <span className="mt-5 inline-flex text-sm font-semibold text-primary">
          {label}
        </span>
      ) : null}
    </>
  );

  const classes = joinClasses(
    "block rounded-[20px] border border-border bg-[rgba(255,255,255,0.96)] p-5 shadow-[var(--shadow-soft)] transition sm:p-6",
    href &&
      "hover:border-border-strong hover:bg-white hover:shadow-[var(--shadow-strong)] focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white",
    className,
  );

  return href ? (
    <Link href={href} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  );
}

type FaqItem = {
  question: string;
  answer: string;
};

type FaqGroupProps = {
  eyebrow?: string;
  title: string;
  description: string;
  items: FaqItem[];
  className?: string;
};

export function FaqGroup({
  eyebrow,
  title,
  description,
  items,
  className,
}: FaqGroupProps) {
  return (
    <div
        className={joinClasses(
        "rounded-[24px] border border-border bg-[rgba(255,255,255,0.96)] p-5 shadow-[var(--shadow-soft)] sm:p-6",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-ink">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div
            key={item.question}
            className="rounded-[18px] border border-border bg-[rgba(248,251,255,0.9)] px-4 py-4"
          >
            <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
              {item.question}
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-muted">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

type SupportChecklistProps = {
  title: string;
  description: string;
  items: Array<{
    label: string;
    detail: string;
  }>;
  className?: string;
};

export function SupportChecklist({
  title,
  description,
  items,
  className,
}: SupportChecklistProps) {
  return (
    <div
        className={joinClasses(
        "rounded-[24px] border border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,#ffffff_0%,#f3f7ff_100%)] p-5 shadow-[var(--shadow-strong)] sm:p-6",
        className,
      )}
    >
      <h3 className="text-2xl font-semibold tracking-[-0.04em] text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>

      <div className="mt-6 space-y-3">
        {items.map((item, index) => (
          <div
            key={item.label}
            className="flex flex-col gap-3 rounded-[18px] border border-border bg-white px-4 py-4 sm:flex-row sm:gap-4"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                {item.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-muted">{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
