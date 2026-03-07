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
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,color-mix(in_srgb,var(--color-primary)_8%,transparent)_0%,transparent_34%),linear-gradient(180deg,#FBFCFD_0%,var(--color-background)_100%)]">
        <div className="mx-auto min-h-screen max-w-[1620px] lg:grid lg:grid-cols-[312px_minmax(0,1fr)]">
          <aside className="border-b border-border px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
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
        "mx-auto max-w-[1360px] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
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
