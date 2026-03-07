"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const portalNavItems = [
  {
    href: "/portal",
    label: "Home",
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
    return "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary shadow-[0_10px_24px_rgba(46,83,255,0.08)]";
  }

  return "border-border bg-white text-ink-muted hover:border-border-strong hover:bg-surface hover:text-ink";
}

export function PartnerPortalNav() {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-4 sm:px-6 lg:px-8">
      <nav className="rounded-[24px] border border-border bg-[rgba(255,255,255,0.94)] p-3 shadow-[var(--shadow-soft)] backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {portalNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-2.5 text-sm font-medium transition ${navItemClasses(active)}`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
