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
      className={className}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-[1.7rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2rem]">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
            {description}
          </p>
        </div>

        {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
      </div>

      {children ? <div className="mt-4 flex flex-wrap gap-2">{children}</div> : null}
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
      className={joinClasses(className)}
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          {label}
        </p>
        <span className={joinClasses("inline-flex h-2.5 w-2.5 rounded-full", accentClass)} />
      </div>
      <p className="mt-4 text-[1.6rem] font-semibold tracking-[-0.05em] text-ink sm:text-[1.8rem]">
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
      tone="gray"
      className={joinClasses("px-4 py-4", className)}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-base font-semibold tracking-[-0.02em] text-ink">{title}</p>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
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
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
    </InsetPanel>
  );
}
