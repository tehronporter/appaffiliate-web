import { redirect } from "next/navigation";

import { ActivationFlow } from "@/components/activation-flow";
import { getAuthenticatedUser } from "@/lib/auth";
import { listWorkspaceNormalizedEvents } from "@/lib/services/apple-read-model";
import { listWorkspaceApps } from "@/lib/services/apps";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { listCommissionItems } from "@/lib/services/finance";
import { listWorkspaceInvitations } from "@/lib/services/invitations";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { listWorkspacePartners } from "@/lib/services/partners";

type OnboardingPageProps = {
  searchParams: Promise<{
    step?: string;
    error?: "app" | "creator" | "code";
  }>;
};

type FlowStepKey = 1 | 2 | 3 | 4 | 5 | "complete";

function titleCaseLabel(value: string | null | undefined, fallback: string) {
  const normalized = (value ?? "").trim();

  if (!normalized) {
    return fallback;
  }

  return normalized
    .replaceAll(/[_-]+/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatMoney(valueMinor: number | null, currency: string | null) {
  if (valueMinor === null) {
    return "Value hidden";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency ?? "USD",
    }).format(valueMinor / 100);
  } catch {
    return `${(valueMinor / 100).toFixed(2)} ${currency ?? "USD"}`;
  }
}

function parseStep(value: string | undefined): FlowStepKey | null {
  if (value === "complete") {
    return "complete";
  }

  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "5") {
    return Number(value) as Exclude<FlowStepKey, "complete">;
  }

  return null;
}

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?redirectTo=/onboarding");
  }

  const [{ step, error }, launch, appsData, partnersData, invites, codesData, eventsData, commissions] =
    await Promise.all([
      searchParams,
      getLaunchReadinessData(),
      listWorkspaceApps(),
      listWorkspacePartners(),
      listWorkspaceInvitations(),
      listWorkspacePromoCodes(),
      listWorkspaceNormalizedEvents(),
      listCommissionItems(),
    ]);

  const workspaceName = launch.organizationName ?? "Current workspace";
  const totalApps = appsData.apps.length;
  const readyApps = appsData.apps.filter((app) => Boolean(app.ingestKey)).length;
  const firstApp = appsData.apps[0] ?? null;
  const firstReadyApp = appsData.apps.find((app) => Boolean(app.ingestKey)) ?? firstApp;
  const receiptIssues =
    launch.overview.monitoring.failedReceiptCount +
    launch.overview.monitoring.pendingReceiptCount;
  const creatorCount = partnersData.partners.length;
  const firstCreator = partnersData.partners[0] ?? null;
  const firstCreatorInvite =
    firstCreator
      ? invites.find(
          (invite) => invite.partnerId === firstCreator.id && invite.inviteType === "partner_portal",
        ) ?? null
      : null;
  const firstCode = codesData.codes[0] ?? null;
  const assignedCodes = codesData.stats.assigned;
  const totalResults =
    eventsData.stats.attributed +
    eventsData.stats.unattributed +
    eventsData.stats.failed +
    eventsData.stats.ignored;
  const reviewEvent =
    eventsData.events.find((event) => event.state === "unattributed" || event.state === "failed") ??
    eventsData.events[0] ??
    null;
  const approvedItem =
    commissions.items.find(
      (item) =>
        item.reviewState === "approved" ||
        item.reviewState === "payout_ready" ||
        item.reviewState === "paid",
    ) ?? null;

  const appSatisfied = readyApps > 0;
  const creatorSatisfied = creatorCount > 0;
  const codeSatisfied = assignedCodes > 0;
  const hasApprovedEarnings = Boolean(approvedItem);
  const flowComplete =
    appSatisfied && creatorSatisfied && codeSatisfied && totalResults > 0 && hasApprovedEarnings;

  const requestedStep = parseStep(step);
  const defaultStep: FlowStepKey = !appSatisfied
    ? 1
    : !creatorSatisfied
      ? 2
      : !codeSatisfied
        ? 3
        : !totalResults
          ? 4
          : !hasApprovedEarnings
            ? 5
            : "complete";
  const initialStep = requestedStep ?? (flowComplete ? "complete" : defaultStep);

  return (
    <ActivationFlow
      initialStep={initialStep}
      error={error ?? null}
      workspaceName={workspaceName}
      appStep={{
        satisfied: appSatisfied,
        connected: totalApps > 0,
        app: firstApp
          ? {
              id: firstApp.id,
              name: firstApp.name,
              bundleId: firstApp.bundleId,
              appStoreId: firstApp.appStoreId,
              appleTeamId: firstApp.appleTeamId,
              timezone: firstApp.timezone,
              appleFeeMode: firstApp.appleFeeMode,
              appleFeeBps: firstApp.appleFeeBps,
              ingestKey: firstApp.ingestKey,
            }
          : null,
        title: appSatisfied
          ? `${firstReadyApp?.name ?? "Your app"} is connected`
          : totalApps > 0
            ? `${readyApps}/${totalApps} app lanes are ready`
            : "No app lane is connected yet",
        detail: appSatisfied
          ? receiptIssues > 0
            ? `${receiptIssues} recent Apple receipt issues still need review, but the app connection is in place.`
            : "Apple can already post results into the workspace through the current app connection."
          : totalApps > 0
            ? "Your app record exists, but it still needs an ingest key or cleaner Apple intake before the first result is trustworthy."
            : "Create the first app record and assign an ingest key so Apple can send results into AppAffiliate.",
        href: launch.appleHealthHref,
        buttonLabel: totalApps > 0 ? "Finish app connection →" : "Create your app →",
        helperText: appSatisfied
          ? "Your first connected app is enough to keep moving."
          : "You can return here as soon as the app lane and ingest path are ready.",
      }}
      creatorStep={{
        satisfied: creatorSatisfied,
        firstCreator: firstCreator
          ? {
              name: firstCreator.name,
              email: firstCreator.contactEmail,
              statusLabel: titleCaseLabel(firstCreator.status, "Creator ready"),
              inviteStatusLabel: firstCreatorInvite
                ? titleCaseLabel(firstCreatorInvite.status, "Invite pending")
                : "Invite pending",
            }
          : null,
      }}
      codeStep={{
        satisfied: codeSatisfied,
        firstCode: firstCode
          ? {
              code: firstCode.code,
              owner: firstCode.partnerName,
              appName: firstCode.appName,
              typeLabel:
                firstCode.codeType === "referral" ? "Tracking link" : "Promo code",
            }
          : null,
        defaultAppId: codesData.appOptions[0]?.id ?? firstReadyApp?.id ?? null,
        defaultPartnerId: firstCreator?.id ?? null,
        appName: codesData.appOptions[0]?.label ?? firstReadyApp?.name ?? null,
        partnerName: firstCreator?.name ?? null,
      }}
      resultStep={{
        hasResult: totalResults > 0,
        needsReview: Boolean(reviewEvent && reviewEvent.state !== "attributed"),
        href:
          reviewEvent?.state === "failed" && reviewEvent.appSlug
            ? `/apps/${reviewEvent.appSlug}/apple-health`
            : reviewEvent?.state === "failed"
              ? launch.appleHealthHref
              : reviewEvent?.state === "unattributed"
                ? "/unattributed"
                : "/events",
        buttonLabel:
          reviewEvent?.state === "failed"
            ? "Open app health →"
            : "Review this result →",
        helperText: !reviewEvent
          ? "You can come back as soon as the first creator-driven result lands."
          : reviewEvent.state === "attributed"
            ? "This result already looks trustworthy. Continue when you are ready."
            : "Review this record before you rely on it for earnings.",
        result: reviewEvent
          ? {
              creatorName: titleCaseLabel(reviewEvent.eventType, "Tracked result"),
              eventType: reviewEvent.appName,
              appName: reviewEvent.appName,
              valueLabel: formatMoney(reviewEvent.amountMinor, reviewEvent.currency),
              stateLabel: titleCaseLabel(reviewEvent.state, "Needs review"),
              detail:
                reviewEvent.reasonCode
                  ? titleCaseLabel(reviewEvent.reasonCode, "Needs review")
                  : reviewEvent.state === "failed"
                    ? "Apple intake or normalization still needs attention."
                    : reviewEvent.state === "unattributed"
                      ? "Ownership still needs a human decision."
                      : "This result already carries usable attribution context.",
            }
          : null,
      }}
      payoutStep={{
        hasApprovedEarnings,
        financeVisible: commissions.hasFinanceAccess,
        item: approvedItem
          ? {
              creatorName: approvedItem.partnerName,
              amountLabel: approvedItem.commissionAmountLabel,
              stateLabel: approvedItem.reviewStateLabel,
              appName: approvedItem.appName,
              detail: approvedItem.codeLabel
                ? `${approvedItem.codeLabel} is already attached and the earning is visible for payout follow-through.`
                : "This earning is already visible in the finance flow.",
            }
          : null,
      }}
    />
  );
}
