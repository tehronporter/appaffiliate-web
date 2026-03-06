import Link from "next/link";
import type { ReactNode } from "react";

type NavItem = {
  href: string;
  label: string;
  match?: "exact" | "prefix";
};

const navigation: NavItem[] = [
  { href: "/", label: "Home", match: "exact" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/partners", label: "Partners" },
  { href: "/codes", label: "Codes" },
  { href: "/unattributed", label: "Unattributed" },
  { href: "/commissions", label: "Commissions" },
  { href: "/payout-batches", label: "Payout Batches" },
];

function isActive(currentPath: string, item: NavItem) {
  if (item.match === "exact") {
    return currentPath === item.href;
  }

  if (item.href === "/") {
    return currentPath === "/";
  }

  return currentPath === item.href || currentPath.startsWith(`${item.href}/`);
}

function navLinkClasses(active: boolean) {
  return active
    ? "bg-slate-900 text-white shadow-sm"
    : "text-slate-600 hover:bg-white hover:text-slate-900";
}

type AppShellProps = {
  currentPath: string;
  eyebrow?: string;
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
};

export function AppShell({
  currentPath,
  eyebrow = "AppAffiliate Phase 0",
  title,
  description,
  children,
  actions,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-950">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="space-y-1">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.28em] text-sky-700"
            >
              AppAffiliate
            </Link>
            <p className="text-sm text-slate-500">
              Affiliate operations shell for apps and partner teams
            </p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              href="/login"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-3xl border border-white/70 bg-white/85 p-3 shadow-[0_18px_40px_rgba(15,23,42,0.06)] backdrop-blur">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Routes
            </p>
            <nav className="grid gap-1">
              {navigation.map((item) => {
                const active = isActive(currentPath, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${navLinkClasses(active)}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Current stage
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              Product shell only
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Layout, routes, and placeholder content are ready for the next
              implementation phase.
            </p>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-3xl space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-sky-700">
                  {eyebrow}
                </p>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-base leading-7 text-slate-600">
                  {description}
                </p>
              </div>

              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </div>

          {children}
        </section>
      </main>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  items: string[];
};

export function SectionCard({
  title,
  description,
  items,
}: SectionCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/85 p-6 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
      <h2 className="text-xl font-semibold tracking-tight text-slate-950">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-slate-200/80 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
