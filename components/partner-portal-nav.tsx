"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const portalNavItems = [
  {
    href: "/portal",
    label: "Overview",
  },
  {
    href: "/portal/codes",
    label: "Codes",
  },
  {
    href: "/portal/performance",
    label: "Performance",
  },
  {
    href: "/portal/payouts",
    label: "Payouts",
  },
];

function navItemClasses(active: boolean) {
  if (active) {
    return "border-success bg-success text-white shadow-[var(--shadow-soft)]";
  }

  return "border-border bg-surface text-ink-muted hover:border-border-strong hover:bg-surface-elevated hover:text-ink";
}

export function PartnerPortalNav() {
  const pathname = usePathname();

  return (
    <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-4 py-4 sm:px-6 lg:px-8">
      {portalNavItems.map((item) => {
        const active =
          pathname === item.href || (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${navItemClasses(active)}`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
