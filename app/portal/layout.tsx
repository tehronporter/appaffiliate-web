import Link from "next/link";
import type { ReactNode } from "react";

import { StatusBadge } from "@/components/admin-ui";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PartnerPortalNav } from "@/components/partner-portal-nav";
import { getPortalViewerState } from "@/lib/services/portal";

type PartnerPortalLayoutProps = {
  children: ReactNode;
};

export default async function PartnerPortalLayout({
  children,
}: PartnerPortalLayoutProps) {
  const viewer = await getPortalViewerState();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-success)_12%,transparent)_0%,transparent_28%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_100%)] text-ink">
      <header className="border-b border-border bg-[color:color-mix(in_srgb,var(--color-surface-elevated)_88%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/portal"
              className="text-sm font-semibold uppercase tracking-[0.28em] text-success"
            >
              AppAffiliate
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-ink">
                Partner portal
              </h1>
              <StatusBadge tone="success">Read-only</StatusBadge>
              <StatusBadge tone="primary">
                {viewer.partnerName ?? viewer.displayName ?? "Partner access"}
              </StatusBadge>
            </div>
            <p className="mt-2 text-sm leading-6 text-ink-muted">
              Review your own codes, attributed performance, commission status,
              and payout history without inheriting internal admin tooling.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {viewer.organizationName ? (
                <StatusBadge>{viewer.organizationName}</StatusBadge>
              ) : null}
              {viewer.partnerStatus ? (
                <StatusBadge tone="success">{viewer.partnerStatus}</StatusBadge>
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
                className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface"
              >
                Sign in
              </Link>
            ) : null}
            {!viewer.hasPortalRole ? (
              <Link
                href="/dashboard"
                className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
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
