import Link from "next/link";
import type { ReactNode } from "react";

import { BrandLogoLink } from "@/components/brand-logo";
import { publicBrandLine } from "@/lib/public-site";

type PublicShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function PublicShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PublicShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(46,83,255,0.12)_0%,transparent_32%),linear-gradient(180deg,#fcfdff_0%,#f3f7ff_48%,#ffffff_100%)] text-ink">
      <div className="sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
        <header className="mx-auto rounded-[24px] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[rgba(255,255,255,0.82)] shadow-[0_10px_28px_rgba(17,24,39,0.05)] backdrop-blur-xl">
          <div className="mx-auto flex min-h-[72px] max-w-[1200px] flex-col gap-4 px-5 py-4 sm:min-h-20 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
            <div className="min-w-0">
              <BrandLogoLink size="public-header" priority />
              <p className="mt-1 max-w-xl text-sm text-ink-muted">
                {publicBrandLine}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/login" className="aa-button aa-button-secondary w-full sm:w-auto">
                Sign in
              </Link>
              <Link href="/signup" className="aa-button aa-button-primary w-full sm:w-auto">
                Sign up
              </Link>
            </div>
          </div>
        </header>
      </div>

      <main className="mx-auto max-w-[1200px] space-y-8 px-4 pb-12 pt-8 sm:space-y-10 sm:px-6 sm:pt-10 lg:px-12 lg:pb-16">
        <section className="relative overflow-hidden rounded-[28px] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(249,251,255,0.96)_100%)] px-5 py-7 shadow-[0_20px_44px_rgba(17,24,39,0.06)] sm:px-8 sm:py-9">
          <div className="pointer-events-none absolute right-[-64px] top-[-72px] h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(46,83,255,0.12)_0%,rgba(46,83,255,0.04)_48%,transparent_72%)] blur-2xl" />
          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-[52px] sm:leading-[1.02]">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
                {description}
              </p>
            </div>

            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
