import type { ReactNode } from "react";

import { InsetPanel, StatusBadge, SurfaceCard, type StatusTone } from "@/components/admin-ui";

export type ActivationState =
  | "not_started"
  | "in_progress"
  | "ready"
  | "completed"
  | "needs_attention";

function activationTone(state: ActivationState): StatusTone {
  if (state === "completed") {
    return "success";
  }

  if (state === "ready") {
    return "primary";
  }

  if (state === "needs_attention") {
    return "danger";
  }

  if (state === "in_progress") {
    return "warning";
  }

  return "neutral";
}

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
            {step}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-ink-muted">{description}</p>
        </div>
        <StatusBadge tone={activationTone(status)}>{activationLabel(status)}</StatusBadge>
      </div>

      <InsetPanel tone={activationTone(status)} className="mt-5">
        <p className="text-sm font-semibold tracking-[-0.01em] text-ink">Next step</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">{helper}</p>
        {action ? <div className="mt-4 flex flex-wrap gap-3">{action}</div> : null}
      </InsetPanel>

      {detail ? <div className="mt-5">{detail}</div> : null}
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
        Progress
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-ink">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>

      <InsetPanel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
            Activation progress
          </p>
          <p className="text-sm font-medium text-primary">
            {completeCount} of {totalCount} milestones complete
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
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
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
        Recommended next action
      </p>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-3xl">
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-ink">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>
        </div>
        {status}
      </div>
      {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
    </SurfaceCard>
  );
}
