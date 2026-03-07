import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogoLink } from "@/components/brand-logo";
import {
  publicAudienceLabel,
  publicBrandLine,
  publicFooterDescription,
} from "@/lib/public-site";

type MarketingLink = {
  href: string;
  label: string;
};

type MarketingAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type MarketingShellProps = {
  children: ReactNode;
  navLinks: MarketingLink[];
  footerLinks: MarketingLink[];
  primaryAction: MarketingAction;
  secondaryAction: MarketingAction;
  currentPath?: string;
};

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

function ActionButton({
  href,
  label,
  variant = "secondary",
  className,
}: MarketingAction & { className?: string }) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "aa-button",
        variant === "primary" ? "aa-button-primary" : "aa-button-secondary",
        "w-full sm:w-auto",
        className,
      )}
    >
      {label}
    </Link>
  );
}

export function MarketingShell({
  children,
  navLinks,
  footerLinks,
  primaryAction,
  secondaryAction,
  currentPath,
}: MarketingShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(46,83,255,0.12)_0%,transparent_28%),linear-gradient(180deg,#fcfdff_0%,#f4f8fd_44%,#ffffff_100%)] text-ink">
      <header className="sticky top-0 z-30 border-b border-border bg-[rgba(252,253,255,0.86)] backdrop-blur-xl">
        <div className="mx-auto max-w-[var(--marketing-max-width)] px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <BrandLogoLink size="marketing-header" priority />
                <span className="hidden rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_15%,white)] bg-primary-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-primary sm:inline-flex">
                  {publicAudienceLabel}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
                {publicBrandLine}
              </p>
            </div>

            <div className="hidden items-center gap-3 md:flex">
              <ActionButton {...secondaryAction} />
              <ActionButton {...primaryAction} />
            </div>
          </div>

          <div className="flex flex-col gap-3 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-5 overflow-x-auto text-sm text-ink-muted">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={joinClasses(
                    "whitespace-nowrap rounded-full px-3 py-1.5 transition hover:bg-white hover:text-ink focus-visible:bg-white",
                    currentPath === link.href &&
                      "bg-white font-medium text-ink shadow-[0_8px_18px_rgba(17,24,39,0.05)]",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden text-xs uppercase tracking-[0.22em] text-ink-subtle lg:block">
              Built for performance-based app growth
            </div>
          </div>

          <div className="flex gap-3 pb-4 md:hidden">
            <ActionButton {...secondaryAction} className="flex-1" />
            <ActionButton {...primaryAction} className="flex-1" />
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-[linear-gradient(180deg,#ffffff_0%,#eef4fb_100%)]">
        <div className="mx-auto grid max-w-[var(--marketing-max-width)] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-12">
          <div className="max-w-md">
            <BrandLogoLink size="marketing-footer" />
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-ink">
              {publicBrandLine}
            </p>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              {publicFooterDescription}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Explore</p>
            <div className="mt-4 space-y-3">
              {footerLinks.map((link) => (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-muted transition hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink">Access</p>
            <div className="mt-4 flex flex-col gap-3">
              <ActionButton {...secondaryAction} />
              <ActionButton {...primaryAction} />
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-subtle">
              New teams join through guided rollout. Invited users sign in to
              either the internal workspace or the read-only creator portal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
