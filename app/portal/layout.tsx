import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin-ui";
import { BrandLogoLink } from "@/components/brand-logo";
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
    <div className="aa-portal-shell min-h-screen bg-[var(--aa-shell-canvas)] text-ink">
      <header className="border-b border-[var(--aa-shell-border)] bg-white">
        <div className="mx-auto flex max-w-[var(--portal-max-width)] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div>
            <BrandLogoLink
              href="/portal"
              ariaLabel="Open AppAffiliate creator portal"
              size="portal"
              priority
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusBadge tone="primary">Creator portal</StatusBadge>
              <StatusBadge tone="success">Read-only</StatusBadge>
            </div>
            <h1 className="mt-4 text-[1.9rem] font-semibold tracking-[-0.05em] text-ink sm:text-[2.2rem]">
              {viewer.partnerName ?? viewer.displayName ?? "Your creator performance"}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-muted">
              Review your own codes, audience results, approved earnings, and payout history in a simpler read-only space built for creators.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {viewer.organizationName ? (
                <StatusBadge>{viewer.organizationName}</StatusBadge>
              ) : null}
              {viewer.partnerStatus ? (
                <StatusBadge tone={partnerStatusTone(viewer.partnerStatus)}>
                  {viewer.partnerStatus}
                </StatusBadge>
              ) : null}
              {viewer.hasPortalRole && !viewer.isLinkedToPartner ? (
                <StatusBadge tone="warning">Creator link required</StatusBadge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 lg:pt-1">
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
                Open workspace
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
