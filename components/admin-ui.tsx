import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export type SurfaceTone = "workspace" | "portal" | "public-access";

type InsetTone = StatusTone | "default";

const badgeToneClasses: Record<StatusTone, string> = {
  neutral: "border-border bg-[rgba(255,255,255,0.82)] text-ink-muted",
  primary:
    "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary",
  success:
    "border-[color:color-mix(in_srgb,var(--color-success)_18%,white)] bg-success-soft text-success",
  warning:
    "border-[color:color-mix(in_srgb,var(--color-warning)_18%,white)] bg-warning-soft text-warning",
  danger:
    "border-[color:color-mix(in_srgb,var(--color-danger)_18%,white)] bg-danger-soft text-danger",
};

const surfaceToneClasses: Record<SurfaceTone, string> = {
  workspace:
    "border-border bg-[rgba(255,255,255,0.94)] shadow-[var(--shadow-soft)]",
  portal:
    "border-[color:color-mix(in_srgb,var(--color-primary)_8%,var(--color-border))] bg-[rgba(255,255,255,0.96)] shadow-[0_10px_28px_rgba(17,24,39,0.05)]",
  "public-access":
    "border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.96)_100%)] shadow-[var(--shadow-strong)]",
};

const surfaceDensityClasses = {
  compact: "p-4 sm:p-5",
  default: "p-5 sm:p-6",
  hero: "p-6 sm:p-7",
};

const insetToneClasses: Record<InsetTone, string> = {
  default: "border-border bg-surface",
  neutral: "border-border bg-[rgba(255,255,255,0.82)]",
  primary:
    "border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-primary)_6%,white)]",
  success:
    "border-[color:color-mix(in_srgb,var(--color-success)_16%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-success)_6%,white)]",
  warning:
    "border-[color:color-mix(in_srgb,var(--color-warning)_16%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_7%,white)]",
  danger:
    "border-[color:color-mix(in_srgb,var(--color-danger)_16%,var(--color-border))] bg-[color:color-mix(in_srgb,var(--color-danger)_7%,white)]",
};

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  tone?: SurfaceTone;
  density?: keyof typeof surfaceDensityClasses;
};

export function SurfaceCard({
  children,
  className,
  tone = "workspace",
  density = "default",
}: SurfaceCardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-[var(--radius-card)] border",
        surfaceToneClasses[tone],
        surfaceDensityClasses[density],
        className,
      )}
    >
      {children}
    </div>
  );
}

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={joinClasses(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-[1.65rem] font-semibold tracking-[-0.04em] text-ink sm:text-[2rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-[0.95rem]">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  tone?: SurfaceTone;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  tone = "workspace",
}: PageHeaderProps) {
  return (
    <SurfaceCard tone={tone} density="hero">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
        className="xl:items-end xl:justify-between"
      />

      {children ? <div className="mt-5 flex flex-wrap gap-3">{children}</div> : null}
    </SurfaceCard>
  );
}

type StatusBadgeProps = {
  children: ReactNode;
  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({
  children,
  tone = "neutral",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-[-0.01em]",
        badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive";
};

export function ActionButton({
  variant = "secondary",
  className,
  type = "button",
  ...props
}: ActionButtonProps) {
  const variantClass =
    variant === "primary"
      ? "aa-button aa-button-primary"
      : variant === "destructive"
        ? "aa-button aa-button-danger"
        : "aa-button aa-button-secondary";

  return <button type={type} className={joinClasses(variantClass, className)} {...props} />;
}

type ActionAnchorProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "destructive";
};

export function ActionAnchor({
  href,
  children,
  className,
  variant = "secondary",
}: ActionAnchorProps) {
  const variantClass =
    variant === "primary"
      ? "aa-button aa-button-primary"
      : variant === "destructive"
        ? "aa-button aa-button-danger"
        : "aa-button aa-button-secondary";

  return (
    <a href={href} className={joinClasses(variantClass, className)}>
      {children}
    </a>
  );
}

type InsetPanelProps = {
  children: ReactNode;
  tone?: InsetTone;
  className?: string;
};

export function InsetPanel({
  children,
  tone = "default",
  className,
}: InsetPanelProps) {
  return (
    <div
      className={joinClasses(
        "rounded-[var(--radius-soft)] border px-4 py-4",
        insetToneClasses[tone],
        className,
      )}
    >
      {children}
    </div>
  );
}

type InfoPanelProps = {
  title: string;
  description: string;
  tone?: InsetTone;
  badge?: ReactNode;
  className?: string;
};

export function InfoPanel({
  title,
  description,
  tone = "default",
  badge,
  className,
}: InfoPanelProps) {
  return (
    <InsetPanel tone={tone} className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</p>
        {badge}
      </div>
      <p className="mt-2 text-sm leading-7 text-ink-muted">{description}</p>
    </InsetPanel>
  );
}

type NoticeBannerProps = {
  title: string;
  detail: string;
  tone?: StatusTone;
  className?: string;
};

export function NoticeBanner({
  title,
  detail,
  tone = "primary",
  className,
}: NoticeBannerProps) {
  return (
    <SurfaceCard density="compact" className={className}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-1 text-sm text-ink-muted">{detail}</p>
        </div>
        <StatusBadge tone={tone}>{title}</StatusBadge>
      </div>
    </SurfaceCard>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: Extract<StatusTone, "primary" | "success" | "warning" | "danger">;
  size?: "default" | "compact";
  className?: string;
};

export function StatCard({
  label,
  value,
  detail,
  tone = "primary",
  size = "default",
  className,
}: StatCardProps) {
  return (
    <SurfaceCard
      density={size === "compact" ? "compact" : "default"}
      className={className}
    >
      <StatusBadge tone={tone}>{label}</StatusBadge>
      <p
        className={joinClasses(
          size === "compact"
            ? "mt-3 text-[1.55rem] font-semibold tracking-[-0.05em] text-ink sm:text-[1.75rem]"
            : "mt-4 text-[1.9rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2.05rem]",
        )}
      >
        {value}
      </p>
      <p
        className={joinClasses(
          size === "compact"
            ? "mt-2 text-sm leading-6 text-ink-muted"
            : "mt-2 text-sm leading-7 text-ink-muted",
        )}
      >
        {detail}
      </p>
    </SurfaceCard>
  );
}

type QuickActionTileProps = {
  href: string;
  title: string;
  description: string;
  badge?: ReactNode;
  className?: string;
};

export function QuickActionTile({
  href,
  title,
  description,
  badge,
  className,
}: QuickActionTileProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "block rounded-[var(--radius-soft)] border border-border bg-[rgba(255,255,255,0.84)] px-4 py-4 transition hover:border-border-strong hover:bg-white hover:shadow-[var(--shadow-soft)] focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</p>
        {badge}
      </div>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </Link>
  );
}

type CodeBlockPanelProps = {
  title: string;
  code: string;
  className?: string;
};

export function CodeBlockPanel({
  title,
  code,
  className,
}: CodeBlockPanelProps) {
  return (
    <InsetPanel tone="neutral" className={className}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <pre className="mt-3 overflow-x-auto rounded-[var(--radius-soft)] border border-border bg-surface-elevated p-4 text-xs leading-6 text-ink-muted">
        {code}
      </pre>
    </InsetPanel>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={joinClasses(
        "animate-pulse rounded-[var(--radius-soft)] bg-[linear-gradient(90deg,rgba(233,238,244,0.9),rgba(244,247,252,1),rgba(233,238,244,0.9))]",
        className,
      )}
    />
  );
}

type SectionCardProps = {
  eyebrow?: string;
  title: string;
  description: string;
  items?: string[];
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  tone?: SurfaceTone;
};

export function SectionCard({
  eyebrow,
  title,
  description,
  items,
  actions,
  children,
  className,
  tone = "workspace",
}: SectionCardProps) {
  return (
    <SurfaceCard className={className} tone={tone}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      {items?.length ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li key={item}>
              <InsetPanel>
                <p className="text-sm leading-7 text-ink-muted">{item}</p>
              </InsetPanel>
            </li>
          ))}
        </ul>
      ) : null}

      {children ? <div className={items?.length ? "mt-5" : "mt-6"}>{children}</div> : null}
    </SurfaceCard>
  );
}

type DetailListItem = {
  label: string;
  value: string;
  tone?: InsetTone;
};

type DetailListProps = {
  items: DetailListItem[];
  columns?: 1 | 2 | 3;
  className?: string;
};

export function DetailList({
  items,
  columns = 2,
  className,
}: DetailListProps) {
  const columnClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 3
        ? "grid-cols-1 md:grid-cols-3"
        : "grid-cols-1 md:grid-cols-2";

  return (
    <div className={joinClasses("grid gap-3", columnClass, className)}>
      {items.map((item) => (
        <InsetPanel key={`${item.label}:${item.value}`} tone={item.tone ?? "neutral"}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
            {item.label}
          </p>
          <p className="mt-2 text-sm font-semibold tracking-[-0.01em] text-ink">
            {item.value}
          </p>
        </InsetPanel>
      ))}
    </div>
  );
}

type TimelineStep = {
  label: string;
  detail: string;
  meta?: string;
  status?: "complete" | "current" | "upcoming";
};

type StatusTimelineProps = {
  steps: TimelineStep[];
  className?: string;
};

export function StatusTimeline({
  steps,
  className,
}: StatusTimelineProps) {
  return (
    <div className={joinClasses("space-y-0", className)}>
      {steps.map((step, index) => {
        const status = step.status ?? "upcoming";
        const dotClass =
          status === "complete"
            ? "border-[color:color-mix(in_srgb,var(--color-success)_18%,white)] bg-success text-white"
            : status === "current"
              ? "border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] bg-primary text-white"
              : "border-border bg-white text-ink-subtle";
        const lineClass =
          status === "complete"
            ? "bg-[color:color-mix(in_srgb,var(--color-success)_28%,white)]"
            : "bg-border";

        return (
          <div key={`${step.label}:${index}`} className="flex gap-3">
            <div className="flex w-5 flex-col items-center">
              <span
                className={joinClasses(
                  "mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-semibold",
                  dotClass,
                )}
              >
                {index + 1}
              </span>
              {index < steps.length - 1 ? (
                <span className={joinClasses("mt-1 h-full w-px", lineClass)} />
              ) : null}
            </div>
            <div className="pb-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  {step.label}
                </p>
                {step.meta ? (
                  <span className="text-xs text-ink-subtle">{step.meta}</span>
                ) : null}
              </div>
              <p className="mt-1.5 text-sm leading-6 text-ink-muted">{step.detail}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  tone?: InsetTone;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
  tone = "default",
}: EmptyStateProps) {
  return (
    <InsetPanel tone={tone} className={joinClasses("px-5 py-6", className)}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.02em] text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-4 flex flex-wrap gap-3">{action}</div> : null}
    </InsetPanel>
  );
}

type ListTableProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: SurfaceTone;
};

export function ListTable({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
  tone = "workspace",
}: ListTableProps) {
  return (
    <SurfaceCard className={className} tone={tone}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <div className="mt-6 overflow-hidden rounded-[var(--radius-soft)] border border-border bg-[rgba(248,250,252,0.95)]">
        {children}
      </div>
    </SurfaceCard>
  );
}

type InlineActionRowProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  badge?: ReactNode;
  className?: string;
};

export function InlineActionRow({
  title,
  description,
  actions,
  badge,
  className,
}: InlineActionRowProps) {
  return (
    <div
      className={joinClasses(
        "flex flex-col gap-4 border-b border-border px-5 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</p>
          {badge}
        </div>
        <p className="mt-1.5 text-sm leading-7 text-ink-muted">{description}</p>
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}

type FilterBarProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
  tone?: SurfaceTone;
};

export function FilterBar({
  title,
  description,
  children,
  className,
  tone = "workspace",
}: FilterBarProps) {
  return (
    <SurfaceCard
      tone={tone}
      className={joinClasses(
        "z-10 backdrop-blur lg:sticky lg:top-[92px]",
        className,
      )}
    >
      {title ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
            {title}
          </p>
          {description ? (
            <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className={title ? "mt-4 flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
        {children}
      </div>
    </SurfaceCard>
  );
}

type FilterChipLinkProps = {
  href: string;
  children: ReactNode;
  active?: boolean;
};

export function FilterChipLink({
  href,
  children,
  active = false,
}: FilterChipLinkProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "inline-flex min-h-8 items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white",
        active
          ? "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary"
          : "border-border bg-white text-ink-muted hover:border-border-strong hover:bg-surface hover:text-ink",
      )}
    >
      {children}
    </Link>
  );
}

type DetailPanelProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  status?: ReactNode;
  children: ReactNode;
  className?: string;
  tone?: SurfaceTone;
};

export function DetailPanel({
  eyebrow,
  title,
  description,
  status,
  children,
  className,
  tone = "workspace",
}: DetailPanelProps) {
  return (
    <SurfaceCard
      tone={tone}
      className={joinClasses("lg:sticky lg:top-[92px]", className)}
    >
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-[1.6rem] font-semibold tracking-[-0.04em] text-ink">
              {title}
            </h2>
          </div>
          {status}
        </div>

        {description ? (
          <p className="text-sm leading-6 text-ink-muted">{description}</p>
        ) : null}
      </div>

      <div className="mt-5 space-y-5">{children}</div>
    </SurfaceCard>
  );
}
