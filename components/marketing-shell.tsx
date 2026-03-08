"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";

import { BrandLogoLink } from "@/components/brand-logo";

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
  const pathname = usePathname();
  const activePath = currentPath ?? pathname;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    if (!drawerOpen) {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setDrawerOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [drawerOpen, pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) setDrawerOpen(false);
    },
    [drawerOpen],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(46,83,255,0.12)_0%,transparent_28%),linear-gradient(180deg,#fcfdff_0%,#f4f8fd_44%,#ffffff_100%)] text-ink">
      {/* ── Refined Marketing Header ── */}
      <div className="sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
        <header
          className={joinClasses(
            "mx-auto max-w-[var(--marketing-max-width)] rounded-[24px] border transition-all duration-300",
            scrolled
              ? "border-border bg-[rgba(255,255,255,0.88)] shadow-[0_14px_34px_rgba(17,24,39,0.08)] backdrop-blur-xl"
              : "border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[rgba(255,255,255,0.78)] shadow-[0_10px_28px_rgba(17,24,39,0.05)] backdrop-blur-lg",
          )}
        >
          <div className="mx-auto flex h-[72px] max-w-[var(--marketing-max-width)] items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-12">
            {/* Logo */}
            <div className="min-w-0 flex-1">
              <BrandLogoLink size="marketing-header" priority />
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden items-center gap-0.5 md:flex lg:mr-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={joinClasses(
                    "whitespace-nowrap rounded-full px-3.5 py-2 text-sm transition-colors duration-200 hover:bg-white/86",
                    link.label === "Docs" && "ml-1 text-ink-subtle",
                    activePath === link.href
                      ? link.label === "Docs"
                        ? "bg-white/80 font-medium text-ink-muted shadow-[0_2px_8px_rgba(17,24,39,0.05)]"
                        : "bg-white font-medium text-ink shadow-[0_2px_8px_rgba(17,24,39,0.06)]"
                      : link.label === "Docs"
                        ? "hover:text-ink-muted"
                        : "text-ink-muted hover:text-ink",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop CTAs */}
            <div className="hidden items-center gap-3 md:flex">
              <ActionButton {...secondaryAction} />
              <ActionButton {...primaryAction} />
            </div>

            {/* Mobile Hamburger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition hover:bg-white/80 hover:text-ink md:hidden"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
          </div>
        </header>
      </div>

      {/* ── Mobile Drawer Overlay ── */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          {/* Drawer */}
          <nav className="absolute right-0 top-0 flex h-full w-[280px] max-w-[85vw] flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-5">
              <span className="text-sm font-semibold text-ink">Menu</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink-muted transition hover:bg-surface hover:text-ink"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setDrawerOpen(false)}
                    className={joinClasses(
                      "flex min-h-[44px] items-center rounded-[var(--radius-card)] px-4 text-sm font-medium transition-colors",
                      link.label === "Docs" && "text-ink-subtle",
                      activePath === link.href
                        ? "bg-primary-soft text-primary"
                        : link.label === "Docs"
                          ? "hover:bg-surface hover:text-ink-muted"
                          : "text-ink-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="border-t border-border px-4 py-4 space-y-3">
              <ActionButton {...secondaryAction} className="w-full" />
              <ActionButton {...primaryAction} className="w-full" />
            </div>
          </nav>
        </div>
      ) : null}

      {children}

      {/* ── Footer ── */}
      <footer className="border-t border-border bg-[linear-gradient(180deg,#ffffff_0%,#f5f5f5_100%)]">
        <div className="mx-auto grid max-w-[var(--marketing-max-width)] gap-10 px-5 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] lg:px-12">
          <div className="max-w-md sm:col-span-2 lg:col-span-1">
            <BrandLogoLink size="marketing-footer" />
            <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-ink">
              Pay creators for results, not hype.
            </p>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Trackable creator growth for iOS app teams. No upfront fees, no spreadsheets, no
              guesswork.
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
            <p className="text-sm font-medium text-ink">Get started</p>
            <div className="mt-4 flex flex-col gap-3">
              <ActionButton href="/signup" label="Sign up" variant="primary" />
              <ActionButton href="/login" label="Sign in" variant="secondary" />
            </div>
            <p className="mt-4 text-sm leading-6 text-ink-subtle">
              New workspaces open directly into activation.
            </p>
          </div>
        </div>

        {/* Legal */}
        <div className="border-t border-border">
          <div className="mx-auto flex max-w-[var(--marketing-max-width)] flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-ink-subtle sm:flex-row sm:px-8 lg:px-12">
            <p>&copy; 2026 AppAffiliate. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/privacy" className="transition hover:text-ink">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-ink">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
