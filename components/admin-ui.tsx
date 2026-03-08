import Link from "next/link";
import { ArrowRight, CircleDashed, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export type SemanticStatusTone = "gray" | "blue" | "green" | "amber" | "red";
export type LegacyStatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";
export type StatusTone = SemanticStatusTone | LegacyStatusTone;

export type SurfaceTone = "workspace" | "portal" | "public-access";

type InsetTone = StatusTone | "default";

const badgeToneAliases: Record<LegacyStatusTone, SemanticStatusTone> = {
  neutral: "gray",
  primary: "blue",
  success: "green",
  warning: "amber",
  danger: "red",
};

function resolveStatusTone(tone: StatusTone): SemanticStatusTone {
  return badgeToneAliases[tone as LegacyStatusTone] ?? (tone as SemanticStatusTone);
}

const badgeToneClasses: Record<SemanticStatusTone, string> = {
  gray: "border-[var(--aa-shell-border)] bg-white text-ink-muted",
  blue:
    "border-[color:color-mix(in_srgb,var(--color-primary)_12%,white)] bg-[color:color-mix(in_srgb,var(--color-primary)_7%,white)] text-primary",
  green:
    "border-[color:color-mix(in_srgb,var(--color-success)_14%,white)] bg-[color:color-mix(in_srgb,var(--color-success)_6%,white)] text-success",
  amber:
    "border-[color:color-mix(in_srgb,var(--color-warning)_14%,white)] bg-[color:color-mix(in_srgb,var(--color-warning)_7%,white)] text-warning",
  red:
    "border-[color:color-mix(in_srgb,var(--color-danger)_14%,white)] bg-[color:color-mix(in_srgb,var(--color-danger)_6%,white)] text-danger",
};

const surfaceToneClasses: Record<SurfaceTone, string> = {
  workspace:
    "border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel)] shadow-[var(--aa-shell-shadow)]",
  portal:
    "border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel)] shadow-[var(--aa-shell-shadow)]",
  "public-access":
    "border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.96)_100%)] shadow-[var(--shadow-strong)]",
};

const surfaceDensityClasses = {
  compact: "p-[var(--card-padding)]",
  default: "p-4 sm:p-5",
  hero: "p-5 sm:p-6",
};

const insetToneClasses: Record<SemanticStatusTone | "default", string> = {
  default: "border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)]",
  gray: "border-[var(--aa-shell-border)] bg-white",
  blue:
    "border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--aa-shell-border))] bg-[color:color-mix(in_srgb,var(--color-primary)_6%,white)]",
  green:
    "border-[color:color-mix(in_srgb,var(--color-success)_16%,var(--aa-shell-border))] bg-[color:color-mix(in_srgb,var(--color-success)_6%,white)]",
  amber:
    "border-[color:color-mix(in_srgb,var(--color-warning)_16%,var(--aa-shell-border))] bg-[color:color-mix(in_srgb,var(--color-warning)_7%,white)]",
  red:
    "border-[color:color-mix(in_srgb,var(--color-danger)_16%,var(--aa-shell-border))] bg-[color:color-mix(in_srgb,var(--color-danger)_7%,white)]",
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
        "rounded-[var(--radius-card)] border transition-colors hover:border-[var(--aa-shell-border-strong)]",
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
        "flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1.5 text-[15px] font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-5 text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">{actions}</div> : null}
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
  framed?: boolean;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  tone = "workspace",
  framed = false,
}: PageHeaderProps) {
  const content = (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-[clamp(1.75rem,3vw,2.1rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-ink">
          {title}
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-muted">
          {description}
        </p>
        {children ? <div className="mt-3 flex flex-wrap gap-2">{children}</div> : null}
      </div>

      {actions ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end xl:self-start">
          {actions}
        </div>
      ) : null}
    </div>
  );

  if (!framed) {
    return content;
  }

  return (
    <SurfaceCard tone={tone} density="compact" className="shadow-none">
      {content}
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
  tone = "gray",
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={joinClasses(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-[-0.01em]",
        badgeToneClasses[resolveStatusTone(tone)],
        className,
      )}
    >
      {children}
    </span>
  );
}

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "destructive" | "tertiary";
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
      : variant === "tertiary"
        ? "aa-button aa-button-tertiary"
      : variant === "destructive"
        ? "aa-button aa-button-danger"
        : "aa-button aa-button-secondary";

  return <button type={type} className={joinClasses(variantClass, className)} {...props} />;
}

type ActionAnchorProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "destructive" | "tertiary";
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
      : variant === "tertiary"
        ? "aa-button aa-button-tertiary"
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
  const resolvedTone =
    tone === "default" ? "default" : resolveStatusTone(tone);

  return (
    <div
      className={joinClasses(
        "rounded-[var(--radius-card)] border px-4 py-4",
        insetToneClasses[resolvedTone],
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
        <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
        {badge}
      </div>
      <p className="mt-2 text-sm leading-5 text-ink-muted">{description}</p>
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
    <div
      className={joinClasses(
        "flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white px-4 py-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      <StatusBadge tone={tone}>{title}</StatusBadge>
      <p className="min-w-0 flex-1 text-sm leading-6 text-ink-muted">{detail}</p>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
  size?: "default" | "compact";
  className?: string;
  icon?: ReactNode;
  badge?: ReactNode;
};

const statCardUrgencyClasses: Record<SemanticStatusTone, string> = {
  gray: "",
  blue: "",
  green: "",
  red: "border-[color:color-mix(in_srgb,var(--color-danger)_16%,var(--aa-shell-border))]",
  amber: "border-[color:color-mix(in_srgb,var(--color-warning)_16%,var(--aa-shell-border))]",
};

export function StatCard({
  label,
  value,
  detail,
  tone = "primary",
  size = "default",
  className,
  icon,
  badge,
}: StatCardProps) {
  const resolvedTone = resolveStatusTone(tone);
  const urgencyClass = statCardUrgencyClasses[resolvedTone] ?? "";
  const accentClass =
    resolvedTone === "green"
      ? "bg-success"
      : resolvedTone === "amber"
        ? "bg-warning"
        : resolvedTone === "red"
          ? "bg-danger"
          : "bg-primary";

  return (
    <SurfaceCard density="compact" className={joinClasses("relative overflow-hidden", urgencyClass, className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            {label}
          </p>
          {badge ? <div className="mt-2">{badge}</div> : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {icon ? (
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--aa-shell-panel-muted)] text-ink-subtle">
              {icon}
            </span>
          ) : null}
          <span className={joinClasses("inline-flex h-2.5 w-2.5 rounded-full", accentClass)} />
        </div>
      </div>
      <p
        className={joinClasses(
          size === "compact"
            ? "mt-2.5 text-[24px] font-semibold tracking-[-0.05em] text-ink sm:text-[24px]"
            : "mt-3 text-[30px] font-semibold tracking-[-0.05em] text-ink sm:text-[32px]",
        )}
      >
        {value}
      </p>
      <p
        title={detail}
        className={joinClasses(
          size === "compact"
            ? "mt-1 text-xs leading-5 text-ink-muted"
            : "mt-2 text-sm leading-5 text-ink-muted",
        )}
      >
        {detail}
      </p>
    </SurfaceCard>
  );
}

type MetricChipProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: StatusTone;
  className?: string;
};

export function MetricChip({
  label,
  value,
  detail,
  tone = "gray",
  className,
}: MetricChipProps) {
  return (
    <div
      className={joinClasses(
        "min-w-0 rounded-[10px] border border-[var(--aa-shell-border)] bg-white px-3.5 py-3 transition-colors hover:border-[var(--aa-shell-border-strong)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {label}
        </p>
        <StatusBadge tone={tone} className="min-h-5 px-2 py-0 text-[10px]">
          {value}
        </StatusBadge>
      </div>
      {detail ? <p className="mt-1 text-xs leading-5 text-ink-muted">{detail}</p> : null}
    </div>
  );
}

type SummaryBarItem = {
  label: string;
  value: string;
};

type SummaryBarProps = {
  items: SummaryBarItem[];
  className?: string;
};

export function SummaryBar({ items, className }: SummaryBarProps) {
  return (
    <SurfaceCard density="compact" className={joinClasses("shadow-none", className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={`${item.label}:${item.value}`}
            className="flex min-w-0 flex-col gap-1"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
              {item.label}
            </p>
            <p className="text-sm font-medium text-ink">{item.value}</p>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

type QuickActionTileProps = {
  href: string;
  title: string;
  description: string;
  badge?: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export function QuickActionTile({
  href,
  title,
  description,
  badge,
  className,
  icon,
}: QuickActionTileProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "block rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white px-4 py-4 transition-colors hover:border-[var(--aa-shell-border-strong)] focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] text-ink-subtle">
              {icon}
            </span>
          ) : null}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
              {badge}
            </div>
            <p className="mt-2 text-sm leading-5 text-ink-muted">{description}</p>
          </div>
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] text-ink-subtle">
          <ArrowRight size={16} strokeWidth={1.75} />
        </span>
      </div>
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
    <InsetPanel tone="gray" className={className}>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <pre className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] p-4 text-xs leading-6 text-ink-muted">
        {code}
      </pre>
    </InsetPanel>
  );
}

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={joinClasses(
        "aa-loading-skeleton rounded-[var(--radius-card)] bg-[var(--aa-shell-panel-muted)]",
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
        <ul className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item}>
              <InsetPanel>
                <p className="text-sm leading-5 text-ink-muted">{item}</p>
              </InsetPanel>
            </li>
          ))}
        </ul>
      ) : null}

      {children ? <div className={items?.length ? "mt-4" : "mt-6"}>{children}</div> : null}
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
        <InsetPanel key={`${item.label}:${item.value}`} tone={item.tone ?? "gray"}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            {item.label}
          </p>
          <p className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
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
                <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                  {step.label}
                </p>
                {step.meta ? (
                  <span className="text-xs text-ink-subtle">{step.meta}</span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-5 text-ink-muted">{step.detail}</p>
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
  icon?: LucideIcon;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
  tone = "default",
  icon: Icon = CircleDashed,
}: EmptyStateProps) {
  return (
    <InsetPanel
      tone={tone}
      className={joinClasses("flex flex-col items-center px-4 py-5 text-center sm:px-5", className)}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft/60 text-primary/55">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      {eyebrow ? (
        <p className="mt-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h3>
      <p className="mt-1 max-w-lg text-sm leading-5 text-ink-muted">
        {description}
      </p>
      {action ? <div className="mt-4 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">{action}</div> : null}
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
}: ListTableProps) {
  return (
    <div className={joinClasses(className)}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <div className="mt-3 overflow-hidden rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white">
        {children}
      </div>
    </div>
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
        "flex flex-col gap-3 border-b border-[var(--aa-shell-border)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</p>
          {badge}
        </div>
        <p className="mt-1 text-sm leading-5 text-ink-muted">{description}</p>
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
  sticky?: boolean;
};

export function FilterBar({
  title,
  description,
  children,
  className,
  sticky = false,
}: FilterBarProps) {
  return (
    <div
      className={joinClasses(
        "flex flex-col gap-2 rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white px-4 py-3.5",
        sticky && "z-10 xl:sticky xl:top-[var(--aa-shell-top-offset)]",
        className,
      )}
    >
      {title ? (
        <div className="flex flex-wrap items-baseline justify-between gap-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
            {title}
          </p>
          {description ? (
            <p className="text-sm leading-5 text-ink-muted">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {children}
      </div>
    </div>
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
        "inline-flex min-h-[38px] items-center rounded-full border px-3.5 py-1.5 text-sm font-semibold transition focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white",
        active
          ? "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary"
          : "border-[var(--aa-shell-border)] bg-white text-ink-muted hover:border-[var(--aa-shell-border-strong)] hover:bg-[var(--aa-shell-panel-muted)] hover:text-ink",
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
      className={joinClasses("xl:sticky xl:top-[var(--aa-shell-top-offset)]", className)}
    >
      <div className="flex flex-col gap-4 border-b border-[var(--aa-shell-border)] pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-ink">
              {title}
            </h2>
          </div>
          {status}
        </div>

        {description ? (
          <p className="text-sm leading-5 text-ink-muted">{description}</p>
        ) : null}
      </div>

      <div className="mt-4 space-y-4">{children}</div>
    </SurfaceCard>
  );
}

type WorkspaceDrawerProps = {
  closeHref: string;
  eyebrow?: string;
  title: string;
  description?: string;
  status?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function WorkspaceDrawer({
  closeHref,
  eyebrow,
  title,
  description,
  status,
  children,
  className,
}: WorkspaceDrawerProps) {
  return (
    <>
      <Link
        href={closeHref}
        aria-label="Close drawer"
        className="aa-drawer-backdrop fixed inset-0 top-[var(--aa-shell-top-offset)] z-30 bg-[rgba(17,24,39,0.08)] backdrop-blur-[2px]"
      />
      <aside
        className={joinClasses(
          "aa-drawer-panel fixed inset-y-[var(--aa-shell-top-offset)] right-0 z-40 w-full border-l border-[var(--aa-shell-border)] bg-white sm:max-w-[560px]",
          className,
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4 border-b border-[var(--aa-shell-border)] px-4 py-4 sm:px-5">
            <div className="min-w-0">
              {eyebrow ? (
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {eyebrow}
                </p>
              ) : null}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h2 className="text-[clamp(1.35rem,2.6vw,1.6rem)] font-semibold tracking-[-0.03em] text-ink">
                  {title}
                </h2>
                {status}
              </div>
              {description ? (
                <p className="mt-2 text-sm leading-5 text-ink-muted">{description}</p>
              ) : null}
            </div>
            <Link
              href={closeHref}
              aria-label="Close drawer"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--aa-shell-border)] bg-white text-ink-muted transition hover:border-[var(--aa-shell-border-strong)] hover:text-ink"
            >
              <X size={18} strokeWidth={1.75} />
            </Link>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
            <div className="space-y-4">{children}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
