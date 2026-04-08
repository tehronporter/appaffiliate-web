import type { StatusTone } from "@/components/admin-ui";

function normalizeStatusValue(value: string | null | undefined) {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replaceAll(/[\s-]+/g, "_");
}

export function toneForLaunchStatus(
  status: "ready" | "attention" | "blocked" | "informational",
): StatusTone {
  if (status === "blocked") {
    return "red";
  }

  if (status === "attention") {
    return "amber";
  }

  if (status === "ready") {
    return "green";
  }

  return "blue";
}

export function toneForActivationState(
  state: "not_started" | "in_progress" | "ready" | "completed" | "needs_attention",
): StatusTone {
  if (state === "completed") {
    return "green";
  }

  if (state === "ready") {
    return "blue";
  }

  if (state === "needs_attention") {
    return "red";
  }

  if (state === "in_progress") {
    return "amber";
  }

  return "gray";
}

export function toneForPartnerStatus(
  status: "pending" | "active" | "inactive" | "archived",
): StatusTone {
  if (status === "active") {
    return "green";
  }

  if (status === "pending") {
    return "amber";
  }

  return "gray";
}

export function toneForPromoCodeStatus(
  status: "draft" | "active" | "paused" | "expired" | "archived",
): StatusTone {
  if (status === "active") {
    return "green";
  }

  if (status === "draft" || status === "paused") {
    return "amber";
  }

  return "gray";
}

export function toneForEventState(
  state: "attributed" | "unattributed" | "ignored" | "failed",
): StatusTone {
  if (state === "attributed") {
    return "green";
  }

  if (state === "unattributed") {
    return "amber";
  }

  if (state === "failed") {
    return "red";
  }

  return "gray";
}

export function toneForCommissionState(
  state: "pending_review" | "approved" | "rejected" | "payout_ready" | "paid",
): StatusTone {
  if (state === "approved" || state === "payout_ready" || state === "paid") {
    return "green";
  }

  if (state === "pending_review") {
    return "amber";
  }

  return "gray";
}

export function toneForPayoutBatchStatus(status: string): StatusTone {
  const normalized = normalizeStatusValue(status);

  if (normalized === "paid" || normalized === "approved") {
    return "green";
  }

  if (normalized === "draft" || normalized === "reviewing" || normalized === "pending") {
    return "amber";
  }

  if (normalized === "exported" || normalized === "cancelled") {
    return "gray";
  }

  if (normalized === "failed" || normalized === "blocked") {
    return "red";
  }

  return "blue";
}

export function toneForPayoutBatchItemStatus(status: string): StatusTone {
  const normalized = normalizeStatusValue(status);

  if (normalized === "paid" || normalized === "approved" || normalized === "payout_ready") {
    return "green";
  }

  if (normalized === "pending" || normalized === "reviewing") {
    return "amber";
  }

  if (normalized === "failed") {
    return "red";
  }

  if (normalized === "exported" || normalized === "cancelled") {
    return "gray";
  }

  return "blue";
}

export function toneForUnattributedQueueStatus(
  status: "open" | "in_review" | "resolved" | "ignored",
): StatusTone {
  if (status === "resolved") {
    return "green";
  }

  if (status === "open" || status === "in_review") {
    return "amber";
  }

  return "gray";
}

export function toneForSystemStatus(status: string | null | undefined): StatusTone {
  const normalized = normalizeStatusValue(status);

  if (
    normalized === "healthy" ||
    normalized === "active" ||
    normalized === "approved" ||
    normalized === "matched" ||
    normalized === "paid" ||
    normalized === "ready" ||
    normalized === "calm" ||
    normalized === "visible" ||
    normalized === "ready_for_apple_intake"
  ) {
    return "green";
  }

  if (
    normalized === "needs_review" ||
    normalized === "needs_action" ||
    normalized === "pending_review" ||
    normalized === "in_progress" ||
    normalized === "needs_setup" ||
    normalized === "awaiting_first_receipt" ||
    normalized === "attention_visible" ||
    normalized === "receipt_only" ||
    normalized === "in_review" ||
    normalized === "waiting_for_first_apple_receipt" ||
    normalized === "receipt_received_and_verification_needs_attention" ||
    normalized === "receipt_received_and_normalization_needs_attention" ||
    normalized === "receipt_intake_needs_attention"
  ) {
    return "amber";
  }

  if (
    normalized === "blocked" ||
    normalized === "error" ||
    normalized === "failed" ||
    normalized === "launch_blocked" ||
    normalized === "setup_needs_configuration"
  ) {
    return "red";
  }

  if (
    normalized === "not_started" ||
    normalized === "archived" ||
    normalized === "exported" ||
    normalized === "inactive" ||
    normalized === "ignored" ||
    normalized === "cancelled"
  ) {
    return "gray";
  }

  return "blue";
}

export function toneForWorkspaceLabel() {
  return "blue" as const;
}

export function toneForRoleLabel() {
  return "blue" as const;
}
