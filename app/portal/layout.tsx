import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin-ui";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PartnerPortalNav } from "@/components/partner-portal-nav";
import { getPortalViewerState } from "@/lib/services/portal";

type PartnerPortalLayoutProps = {
  children: ReactNode;
};

function partnerStatusTone(status: string | null) {
  if (!status) {
    return "neutral" as const;
  }

  if (status.toLowerCase() === "active") {
    return "success" as const;
  }

  if (status.toLowerCase() === "pending") {
    return "warning" as const;
  }

  return "primary" as const;
}

export default async function PartnerPortalLayout({
  children,
}: PartnerPortalLayoutProps) {
  const viewer = await getPortalViewerState();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-primary)_7%,transparent)_0%,transparent_28%),linear-gradient(180deg,#FCFDFE_0%,#F6F8FB_100%)] text-ink">
      <header className="border-b border-border bg-[rgba(255,255,255,0.82)] backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/portal"
              className="text-sm font-semibold uppercase tracking-[0.28em] text-primary"
            >
              AppAffiliate
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-[-0.03em] text-ink sm:text-2xl">
                Partner portal
              </h1>
              <StatusBadge tone="primary">Read-only</StatusBadge>
              <StatusBadge tone="primary">
                {viewer.partnerName ?? viewer.displayName ?? "Partner access"}
              </StatusBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Review your own codes, performance, commission status, and payout history in a partner-safe view that stays separate from internal operations.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {viewer.organizationName ? (
                <StatusBadge>{viewer.organizationName}</StatusBadge>
              ) : null}
              {viewer.partnerStatus ? (
                <StatusBadge tone={partnerStatusTone(viewer.partnerStatus)}>
                  {viewer.partnerStatus}
                </StatusBadge>
              ) : null}
              {viewer.hasPortalRole && !viewer.isLinkedToPartner ? (
                <StatusBadge tone="warning">Partner link required</StatusBadge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {viewer.isAuthenticated ? <SignOutButton /> : null}
            {!viewer.isAuthenticated ? (
              <Link
                href="/login?redirectTo=/portal"
                className="aa-button aa-button-secondary"
              >
                Sign in
              </Link>
            ) : null}
            {!viewer.hasPortalRole ? (
              <Link
                href="/dashboard"
                className="aa-button aa-button-primary"
              >
                Open admin workspace
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <PartnerPortalNav />
      {children}
    </div>
  );
}
