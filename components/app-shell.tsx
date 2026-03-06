import Link from "next/link";
import type { ReactNode } from "react";

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
