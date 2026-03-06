import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { SidebarNav } from "@/components/sidebar-nav";
import { TopBar } from "@/components/top-bar";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-ink">
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-primary)_14%,transparent)_0%,transparent_32%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_100%)]">
        <div className="mx-auto min-h-screen max-w-[1600px] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="border-b border-border px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
            <SidebarNav />
          </aside>

          <div className="min-w-0">
            <TopBar />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <main className={joinClasses("mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8", className)}>
      {children}
    </main>
  );
}

type ActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

export function ActionLink({
  href,
  children,
  variant = "secondary",
}: ActionLinkProps) {
  const classes =
    variant === "primary"
      ? "border-primary bg-primary text-white hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
      : "border-border bg-surface-elevated text-ink hover:border-border-strong hover:bg-surface";

  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-medium transition ${classes}`}
    >
      {children}
    </Link>
  );
}

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <section className="rounded-[32px] border border-border bg-surface-elevated p-6 shadow-[var(--shadow-strong)] sm:p-8">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
            {description}
          </p>
        </div>

        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>

      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export function SurfaceCard({ children, className }: SurfaceCardProps) {
  return (
    <div
      className={joinClasses(
        "rounded-[28px] border border-border bg-surface-elevated p-6 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: "primary" | "success" | "warning";
};

export function StatCard({
  label,
  value,
  detail,
  tone = "primary",
}: StatCardProps) {
  const toneClasses =
    tone === "success"
      ? "bg-success-soft text-success"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : "bg-primary-soft text-primary";

  return (
    <SurfaceCard>
      <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] ${toneClasses}`}>
        {label}
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{detail}</p>
    </SurfaceCard>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  items: string[];
};

export function SectionCard({
  title,
  description,
  items,
}: SectionCardProps) {
  return (
    <SurfaceCard>
      <h3 className="text-xl font-semibold tracking-tight text-ink">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-ink-muted">{description}</p>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li
            key={item}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm leading-6 text-ink-muted"
          >
            {item}
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}

type SurfaceListProps = ComponentPropsWithoutRef<"ul">;

export function SurfaceList({ className, ...props }: SurfaceListProps) {
  return (
    <ul
      className={joinClasses("space-y-3", className)}
      {...props}
    />
  );
}
