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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(46,83,255,0.14)_0%,transparent_30%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_100%)] text-ink">
      <header className="border-b border-border bg-[rgba(248,251,255,0.86)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1120px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <BrandLogoLink size="public-header" priority />
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              {publicBrandLine}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/request-access" className="aa-button aa-button-secondary w-full sm:w-auto">
              Request access
            </Link>
            <Link href="/login" className="aa-button aa-button-primary w-full sm:w-auto">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="rounded-[28px] border border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(244,247,255,0.96)_100%)] p-5 shadow-[var(--shadow-strong)] sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-ink sm:text-5xl">
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
