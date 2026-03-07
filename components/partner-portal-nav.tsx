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
    return "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary shadow-[0_8px_18px_rgba(46,83,255,0.08)]";
  }

  return "border-transparent bg-white/70 text-ink-muted hover:border-border hover:bg-white hover:text-ink";
}

export function PartnerPortalNav() {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[var(--portal-max-width)] px-4 py-2.5 sm:px-6 lg:px-8">
      <nav className="overflow-x-auto rounded-[20px] border border-white/80 bg-[rgba(255,255,255,0.82)] p-1.5 shadow-[0_10px_24px_rgba(17,24,39,0.05)] backdrop-blur">
        <div className="flex min-w-max gap-2">
          {portalNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`min-h-10 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white ${navItemClasses(active)}`}
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
