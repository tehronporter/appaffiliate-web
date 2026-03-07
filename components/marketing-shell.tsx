import Link from "next/link";
import type { ReactNode } from "react";

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
    <div className="min-h-screen bg-white text-ink">
      <header className="sticky top-0 z-30 border-b border-border bg-[rgba(255,255,255,0.92)] backdrop-blur">
        <div className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-12">
          <div className="flex items-center justify-between gap-4 py-4">
            <Link
              href="/"
              className="text-sm font-semibold tracking-[-0.02em] text-ink"
            >
              AppAffiliate
            </Link>

            <div className="hidden items-center gap-3 md:flex">
              <ActionButton {...secondaryAction} />
              <ActionButton {...primaryAction} />
            </div>
          </div>

          <div className="flex items-center gap-5 overflow-x-auto pb-4 text-sm text-ink-muted">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={joinClasses(
                  "whitespace-nowrap transition hover:text-ink",
                  currentPath === link.href && "text-ink",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-3 pb-4 md:hidden">
            <ActionButton {...secondaryAction} className="flex-1" />
            <ActionButton {...primaryAction} className="flex-1" />
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-border bg-surface-muted">
        <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-12">
          <div className="max-w-md">
            <p className="text-sm font-semibold tracking-[-0.02em] text-ink">
              AppAffiliate
            </p>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              A calmer operating layer for partner programs, attribution
              review, commissions, payouts, exports, and partner visibility.
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
              New teams request access through guided rollout. Invited users
              sign in to the internal workspace or the read-only partner
              portal.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
