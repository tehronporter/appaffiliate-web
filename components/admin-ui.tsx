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
  primary: "border-primary bg-primary-soft text-primary",
  success: "border-success bg-success-soft text-success",
  warning: "border-warning bg-warning-soft text-warning",
  danger: "border-danger bg-danger-soft text-danger",
};

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-[28px] border border-border bg-surface-elevated p-6 shadow-[var(--shadow-soft)]",
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
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 text-sm leading-7 text-ink-muted sm:text-base">
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
        "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
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
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{detail}</p>
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
              className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-ink-muted"
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
        "rounded-[24px] border border-dashed border-border-strong bg-surface px-5 py-6",
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle">
          {eyebrow}
        </p>
      ) : null}
      <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink">
        {title}
      </h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
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

      <div className="mt-6 overflow-hidden rounded-[24px] border border-border bg-surface">
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
        "flex flex-col gap-4 border-b border-border px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {badge}
        </div>
        <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
      </div>

      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
