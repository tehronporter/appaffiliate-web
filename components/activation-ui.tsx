import type { ReactNode } from "react";

import { InsetPanel, StatusBadge, SurfaceCard } from "@/components/admin-ui";
import { toneForActivationState } from "@/lib/status-badges";

export type ActivationState =
  | "not_started"
  | "in_progress"
  | "ready"
  | "completed"
  | "needs_attention";

function activationLabel(state: ActivationState) {
  if (state === "not_started") {
    return "Not started";
  }

  if (state === "in_progress") {
    return "In progress";
  }

  if (state === "ready") {
    return "Ready";
  }

  if (state === "completed") {
    return "Completed";
  }

  return "This step needs attention";
}

type ActivationMilestoneCardProps = {
  step: string;
  title: string;
  description: string;
  status: ActivationState;
  helper: string;
  action?: ReactNode;
  detail?: ReactNode;
  className?: string;
};

export function ActivationMilestoneCard({
  step,
  title,
  description,
  status,
  helper,
  action,
  detail,
  className,
}: ActivationMilestoneCardProps) {
  return (
    <SurfaceCard className={className}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex min-h-8 items-center rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              {step}
            </span>
            <StatusBadge tone={toneForActivationState(status)}>{activationLabel(status)}</StatusBadge>
          </div>
          <h3 className="mt-4 text-[1.35rem] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
        </div>
      </div>

      <InsetPanel tone={toneForActivationState(status)} className="mt-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
          Next step
        </p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{helper}</p>
        {action ? <div className="mt-4 flex flex-wrap gap-3">{action}</div> : null}
      </InsetPanel>

      {detail ? <div className="mt-4">{detail}</div> : null}
    </SurfaceCard>
  );
}

type ActivationProgressCardProps = {
  title: string;
  description: string;
  completeCount: number;
  totalCount: number;
  children?: ReactNode;
};

export function ActivationProgressCard({
  title,
  description,
  completeCount,
  totalCount,
  children,
}: ActivationProgressCardProps) {
  const percent =
    totalCount > 0 ? Math.round((completeCount / totalCount) * 100) : 0;

  return (
    <SurfaceCard>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        Progress
      </p>
      <h2 className="mt-3 text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>

      <InsetPanel className="mt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
            Activation progress
          </p>
          <p className="text-sm font-medium text-primary">
            {completeCount} of {totalCount} milestones complete
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--aa-shell-border)]">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        {children ? <div className="mt-4">{children}</div> : null}
      </InsetPanel>
    </SurfaceCard>
  );
}

type ActivationNextActionProps = {
  title: string;
  description: string;
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function ActivationNextAction({
  title,
  description,
  status,
  actions,
  className,
}: ActivationNextActionProps) {
  return (
    <SurfaceCard className={className}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        Recommended next action
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h2 className="text-[1.5rem] font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink-muted">{description}</p>
        </div>
        {status}
      </div>
      {actions ? <div className="mt-4 flex flex-wrap gap-3">{actions}</div> : null}
    </SurfaceCard>
  );
}
