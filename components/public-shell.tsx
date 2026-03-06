import Link from "next/link";
import type { ReactNode } from "react";

import { PageContainer } from "@/components/app-shell";

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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-primary)_16%,transparent)_0%,transparent_30%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_100%)] text-ink">
      <header className="border-b border-border bg-[color:color-mix(in_srgb,var(--color-surface-elevated)_82%,transparent)] backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-[0.28em] text-primary"
            >
              AppAffiliate
            </Link>
            <p className="mt-2 text-sm text-ink-muted">
              Admin operations shell for affiliate programs and attribution.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
            >
              Open workspace
            </Link>
          </div>
        </div>
      </header>

      <PageContainer className="py-8 lg:py-10">
        <section className="rounded-[32px] border border-border bg-surface-elevated p-6 shadow-[var(--shadow-strong)] sm:p-8">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
                {eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
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
      </PageContainer>
    </div>
  );
}
