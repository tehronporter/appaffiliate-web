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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(46,83,255,0.08)_0%,transparent_32%),linear-gradient(180deg,#f8fafd_0%,var(--color-background)_100%)]">
        <div className="mx-auto min-h-screen max-w-[1540px] lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
          <aside className="border-b border-border px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 lg:bg-[rgba(244,247,251,0.6)] lg:px-4 lg:py-4">
            <SidebarNav />
          </aside>

          <div className="min-w-0 bg-transparent">
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
    <main
      className={joinClasses(
        "mx-auto max-w-[var(--page-max-width)] space-y-6 px-4 py-5 sm:px-6 lg:px-8 lg:py-6",
        className,
      )}
    >
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
      ? "aa-button aa-button-primary"
      : "aa-button aa-button-secondary";

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
