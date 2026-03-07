import Link from "next/link";
import type { ReactNode } from "react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

export type StatusTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

const badgeToneClasses: Record<StatusTone, string> = {
  neutral: "border-border bg-surface text-ink-muted",
  primary: "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary",
  success:
    "border-[color:color-mix(in_srgb,var(--color-success)_18%,white)] bg-success-soft text-success",
  warning:
    "border-[color:color-mix(in_srgb,var(--color-warning)_18%,white)] bg-warning-soft text-warning",
  danger:
    "border-[color:color-mix(in_srgb,var(--color-danger)_18%,white)] bg-danger-soft text-danger",
};

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-[var(--radius-card)] border border-border bg-[rgba(255,255,255,0.94)] p-6 shadow-[var(--shadow-soft)] sm:p-7",
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
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-[1.8rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.15rem]">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
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
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <SurfaceCard className="p-6 shadow-[var(--shadow-strong)] sm:p-8">
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
        className="xl:items-end xl:justify-between"
      />

      {children ? <div className="mt-6">{children}</div> : null}
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
        "inline-flex rounded-full border px-3.5 py-1 text-xs font-medium tracking-[-0.01em]",
        badgeToneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: Extract<StatusTone, "primary" | "success" | "warning" | "danger">;
};

export function StatCard({
  label,
  value,
  detail,
  tone = "primary",
}: StatCardProps) {
  return (
    <SurfaceCard>
      <StatusBadge tone={tone}>{label}</StatusBadge>
      <p className="mt-5 text-[2rem] font-semibold tracking-[-0.04em] text-ink sm:text-[2.15rem]">
        {value}
      </p>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{detail}</p>
    </SurfaceCard>
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
};

export function SectionCard({
  eyebrow,
  title,
  description,
  items,
  actions,
  children,
  className,
}: SectionCardProps) {
  return (
    <SurfaceCard className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      {items?.length ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-[18px] border border-border bg-surface-muted px-4 py-3 text-sm leading-7 text-ink-muted"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}

      {children ? <div className={items?.length ? "mt-5" : "mt-6"}>{children}</div> : null}
    </SurfaceCard>
  );
}

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  eyebrow,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={joinClasses(
        "rounded-[22px] border border-border bg-surface-muted px-5 py-6",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
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
    </div>
  );
}

type ListTableProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
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
    <SurfaceCard className={className}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actions={actions}
      />

      <div className="mt-6 overflow-hidden rounded-[20px] border border-border bg-[#FBFCFD]">
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
        "flex flex-col gap-4 border-b border-border px-5 py-[18px] last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
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
};

export function FilterBar({
  title,
  description,
  children,
  className,
}: FilterBarProps) {
  return (
    <SurfaceCard
      className={joinClasses(
        "sticky top-[92px] z-10 border-border bg-[rgba(255,255,255,0.94)] backdrop-blur",
        className,
      )}
    >
      {title ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
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
        "inline-flex rounded-full border px-3.5 py-1.5 text-xs font-medium transition",
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
};

export function DetailPanel({
  eyebrow,
  title,
  description,
  status,
  children,
  className,
}: DetailPanelProps) {
  return (
    <SurfaceCard className={joinClasses("sticky top-[92px]", className)}>
      <div className="flex flex-col gap-4 border-b border-border pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {eyebrow ? (
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-[1.75rem] font-semibold tracking-[-0.03em] text-ink">
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
