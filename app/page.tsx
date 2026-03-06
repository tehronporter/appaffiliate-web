import Link from "next/link";

import { AppShell, SectionCard, StatCard } from "@/components/app-shell";

const routeCards = [
  {
    href: "/dashboard",
    name: "Dashboard",
    summary: "Central summary for partner activity, tracked codes, and payout status.",
  },
  {
    href: "/onboarding",
    name: "Onboarding",
    summary: "A starting place for app setup, tracking requirements, and partner readiness.",
  },
  {
    href: "/partners",
    name: "Partners",
    summary: "Placeholder home for creators, affiliates, and partner relationship details.",
  },
  {
    href: "/codes",
    name: "Codes",
    summary: "Future table for referral codes, ownership, and attribution visibility.",
  },
  {
    href: "/unattributed",
    name: "Unattributed",
    summary: "Queue for installs or purchases that still need a code or partner match.",
  },
  {
    href: "/commissions",
    name: "Commissions",
    summary: "Upcoming source of truth for earnings, review states, and payout readiness.",
  },
  {
    href: "/payout-batches",
    name: "Payout Batches",
    summary: "Placeholder workflow for grouping approved commissions into payout runs.",
  },
  {
    href: "/apps/demo-app/apple-health",
    name: "Apple Health",
    summary: "Per-app sub-route for future Apple Health integration guidance and checks.",
  },
];

export default function Home() {
  return (
    <AppShell
      currentPath="/"
      eyebrow="Phase 0 Homepage"
      title="A clean route shell for AppAffiliate."
      description="This first phase gives the product a polished starting point: a clear homepage, consistent placeholder screens, and room to plug in auth, data, and workflows later."
      actions={
        <>
          <Link
            href="/login"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            View login
          </Link>
          <Link
            href="/dashboard"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Enter dashboard
          </Link>
        </>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Status"
          value="Phase 0"
          detail="Shared layout, navigation, and starter routes are in place."
        />
        <StatCard
          label="Scope"
          value="9 routes"
          detail="Core product areas are scaffolded so localhost navigation feels complete."
        />
        <StatCard
          label="Backend"
          value="Ready"
          detail="Supabase wiring stays untouched and can be connected when real screens begin."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-6 text-white shadow-[0_24px_60px_rgba(15,23,42,0.18)] sm:p-8">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">
            Product direction
          </p>
          <h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight">
            Built for app teams that need a calm place to manage affiliate
            operations.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            The shell keeps things intentionally light: consistent pages,
            simple navigation, and enough structure to start wiring in auth,
            partner records, attribution checks, and payout flows without
            reworking the foundation.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">What is ready now</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Consistent shell across homepage and product routes.</li>
                <li>Placeholder content for each main product area.</li>
                <li>Dynamic app sub-route for Apple Health setup.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">What comes next</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                <li>Authentication and protected route behavior.</li>
                <li>Supabase-backed partner, code, and commission data.</li>
                <li>Real workflows for onboarding, review, and payouts.</li>
              </ul>
            </div>
          </div>
        </div>

        <SectionCard
          title="Starter notes"
          description="The current shell is designed to be easy to extend without introducing complexity too early."
          items={[
            "All pages use simple server components and reusable Tailwind building blocks.",
            "No auth, mutations, or live queries are added yet.",
            "The placeholder copy is written so future feature work has obvious homes.",
            "Route-level navigation makes local review straightforward during Phase 0.",
          ]}
        />
      </div>

      <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Route map
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
              Explore the placeholder product surface
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600">
            Each route is intentionally lightweight so the structure is visible
            before real product logic is added.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {routeCards.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="group rounded-3xl border border-slate-200/80 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:shadow-[0_18px_40px_rgba(15,23,42,0.06)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold tracking-tight text-slate-950">
                  {route.name}
                </h3>
                <span className="text-sm text-slate-400 transition group-hover:text-slate-600">
                  Open
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {route.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
