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
      eyebrow="Phase 1 foundation"
      title="A calm operating shell for AppAffiliate."
      description="Phase 1 establishes design tokens, a shared admin workspace, and a route-group foundation that keeps Overview, Program, Operations, and Settings shallow and easy to extend."
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
          value="Phase 1"
          detail="Shared layout, navigation, and route-group foundations are now in place."
          tone="primary"
        />
        <StatCard
          label="Shell"
          value="Workspace"
          detail="Admin routes now share one calm, finance-first operational frame."
          tone="success"
        />
        <StatCard
          label="Boundary"
          value="/portal reserved"
          detail="A future partner portal can stay separate from internal admin tools."
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
            The shell keeps things intentionally light: shared tokens, route-aware
            navigation, and enough structure to start wiring in partner records,
            attribution checks, and finance workflows without reworking the frame.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">What is ready now</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <li>Tokenized colors and surfaces for the admin product.</li>
                <li>Shared workspace shell across protected and placeholder routes.</li>
                <li>Route groups that keep admin and future partner portal concerns separate.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/10 p-5">
              <p className="text-sm font-semibold text-white">What comes next</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                <li>Supabase-backed partner, code, and commission records.</li>
                <li>Real onboarding and attribution review workflows.</li>
                <li>Finance-grade payout and reconciliation behavior.</li>
              </ul>
            </div>
          </div>
        </SurfaceCard>

        <SectionCard
          title="Starter notes"
          description="The current shell is designed to be easy to extend without introducing complexity too early."
          items={[
            "All admin routes now share the same shell and top-level navigation model.",
            "No new persistence, commission logic, or payout logic was added in this phase.",
            "Apple Health and Needs Attribution are positioned as first-class destinations.",
            "The future partner portal remains intentionally outside the admin workspace frame.",
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
              Explore the workspace story
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-ink-muted">
            Each route is intentionally lightweight so the product structure is
            visible before real product logic is added.
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
