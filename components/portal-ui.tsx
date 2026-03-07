import type { ReactNode } from "react";

import {
  InsetPanel,
  SurfaceCard,
  type StatusTone,
} from "@/components/admin-ui";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type PortalPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
};

export function PortalPageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
  className,
}: PortalPageHeaderProps) {
  return (
    <SurfaceCard
      tone="portal"
      density="compact"
      className={joinClasses("border-white/80", className)}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2.35rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-[0.98rem]">
            {description}
          </p>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {children ? <div className="mt-5 flex flex-wrap gap-3">{children}</div> : null}
    </SurfaceCard>
  );
}

type PortalMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
  className?: string;
};

export function PortalMetricCard({
  label,
  value,
  detail,
  tone = "primary",
  className,
}: PortalMetricCardProps) {
  const accentClass =
    tone === "success"
      ? "bg-success"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-danger"
          : tone === "neutral"
            ? "bg-ink-subtle"
            : "bg-primary";

  return (
    <SurfaceCard
      tone="portal"
      density="compact"
      className={joinClasses("relative overflow-hidden", className)}
    >
      <span className={joinClasses("absolute inset-x-0 top-0 h-1.5 rounded-t-[var(--radius-card)]", accentClass)} />
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
        {label}
      </p>
      <p className="mt-3 text-[1.7rem] font-semibold tracking-[-0.05em] text-ink sm:text-[1.9rem]">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{detail}</p>
    </SurfaceCard>
  );
}

type PortalRecordCardProps = {
  title: string;
  description: string;
  badge?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function PortalRecordCard({
  title,
  description,
  badge,
  children,
  footer,
  className,
}: PortalRecordCardProps) {
  return (
    <InsetPanel
      tone="neutral"
      className={joinClasses("px-5 py-4 shadow-[0_8px_20px_rgba(17,24,39,0.04)]", className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-[-0.02em] text-ink">{title}</p>
          <p className="mt-1 text-sm leading-6 text-ink-muted">{description}</p>
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
      {footer ? <div className="mt-4">{footer}</div> : null}
    </InsetPanel>
  );
}

type PortalHelpCardProps = {
  title: string;
  description: string;
  className?: string;
};

export function PortalHelpCard({
  title,
  description,
  className,
}: PortalHelpCardProps) {
  return (
    <InsetPanel tone="default" className={className}>
      <p className="text-sm font-semibold tracking-[-0.01em] text-ink">{title}</p>
      <p className="mt-2 text-sm leading-7 text-ink-muted">{description}</p>
    </InsetPanel>
  );
}
