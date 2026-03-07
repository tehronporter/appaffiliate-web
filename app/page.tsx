import Link from "next/link";

import { ActionLink } from "@/components/app-shell";
import { SectionCard, StatCard, SurfaceCard } from "@/components/admin-ui";
import { PublicShell } from "@/components/public-shell";

const routeCards = [
  {
    href: "/dashboard",
    name: "Overview",
    summary: "Central summary for partner activity, tracked codes, and payout status.",
  },
  {
    href: "/onboarding",
    name: "Program",
    summary: "Shallow access to onboarding, partners, codes, and Apple Health setup.",
  },
  {
    href: "/unattributed",
    name: "Needs Attribution",
    summary: "Operational queue for installs or purchases that still need a code or partner match.",
  },
  {
    href: "/commissions",
    name: "Operations",
    summary: "Commissions and payouts remain one click away in the finance-first workspace shell.",
  },
  {
    href: "/settings",
    name: "Settings",
    summary: "A shallow admin-only home for future workspace configuration and access controls.",
  },
];

export default function Home() {
  return (
    <PublicShell
      eyebrow="Internal MVP"
      title="A calm operating shell for AppAffiliate."
      description="AppAffiliate now ships an internal operator workspace for Apple ingestion, partners, codes, attribution review, commissions, payouts, exports, settings, audit, and launch-readiness checks."
      actions={
        <>
          <ActionLink href="/login">View login</ActionLink>
          <ActionLink href="/dashboard" variant="primary">
            Enter workspace
          </ActionLink>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Status"
          value="Launch-ready MVP"
          detail="Internal workflows, finance controls, and launch-readiness surfaces are wired into the live workspace."
          tone="primary"
        />
        <StatCard
          label="Shell"
          value="Workspace"
          detail="Operator routes share one calm, finance-first operational frame."
          tone="success"
        />
        <StatCard
          label="Boundary"
          value="/portal live"
          detail="The read-only partner portal stays separate from internal admin tools."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SurfaceCard className="border-primary bg-[color:color-mix(in_srgb,var(--color-primary)_94%,white)] text-white">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/75">
            Product direction
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
            Built for app teams that need a trustworthy place to manage
            affiliate operations.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/78">
            The product stays intentionally narrow: internal Apple receipt ops,
            partner and code management, manual attribution review, finance
            approvals, payout tracking, export controls, and launch-ready
            settings without unnecessary enterprise scope.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">What is ready now</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <li>Apple ingestion monitoring with sanitized receipt visibility.</li>
                <li>Partners, codes, unattributed review, commissions, payouts, and exports.</li>
                <li>Settings, audit, team context, launch controls, and a read-only partner portal.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">Current product boundaries</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <li>Partner portal stays separate and read-only.</li>
                <li>Billing remains off-platform and not active in-product.</li>
                <li>Manual operations stay explicit instead of hidden behind automation.</li>
              </ul>
            </div>
          </div>
        </SurfaceCard>

        <SectionCard
          title="Operator notes"
          description="The workspace is built for internal launch operations, not as a broad all-in-one admin suite."
          items={[
            "Core internal routes share one shell and shallow navigation model.",
            "Apple health, unattributed review, finance exports, and settings remain first-class destinations.",
            "Permission checks, audit trails, and org scoping stay explicit across operator actions.",
            "The partner portal remains intentionally outside the internal workspace frame.",
          ]}
        />
      </div>

      <SurfaceCard>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
              Route map
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              Explore the operator workspace
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink-muted">
            Each route is intentionally focused so operators can move quickly
            between intake, attribution, finance, and launch controls.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {routeCards.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group rounded-3xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-elevated hover:shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight text-ink">
                  {route.name}
                </h3>
                <span className="text-sm text-ink-subtle transition group-hover:text-ink-muted">
                  Open
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                {route.summary}
              </p>
            </Link>
          ))}
        </div>
      </SurfaceCard>
    </PublicShell>
  );
}
