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
    return "border-[color:color-mix(in_srgb,var(--color-primary)_14%,white)] bg-primary-soft text-primary";
  }

  return "border-[var(--aa-shell-border)] bg-white text-ink-muted hover:border-[var(--aa-shell-border-strong)] hover:bg-[var(--aa-shell-panel-muted)] hover:text-ink";
}

export function PartnerPortalNav() {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[var(--portal-max-width)] px-4 py-4 sm:px-6 lg:px-8">
      <nav className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel)] p-2 shadow-[var(--aa-shell-shadow)]">
        <div className="flex min-w-max gap-2">
          {portalNavItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/portal" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex min-h-[44px] items-center rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)] focus-visible:bg-white ${navItemClasses(active)}`}
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
