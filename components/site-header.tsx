"use client";

import type { ReactNode } from "react";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type SiteHeaderFrameProps = {
  children: ReactNode;
  className?: string;
  scrolled?: boolean;
  maxWidthClassName?: string;
  stickyClassName?: string;
  surfaceClassName?: string;
};

export function SiteHeaderFrame({
  children,
  className,
  scrolled = false,
  maxWidthClassName = "max-w-[var(--marketing-max-width)]",
  stickyClassName = "sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4",
  surfaceClassName,
}: SiteHeaderFrameProps) {
  return (
    <div className={joinClasses(stickyClassName, className)}>
      <header
        className={joinClasses(
          "mx-auto rounded-[22px] border transition-all duration-300",
          maxWidthClassName,
          scrolled
            ? "border-[color:color-mix(in_srgb,var(--color-primary)_9%,var(--color-border))] bg-[rgba(255,255,255,0.9)] shadow-[0_14px_34px_rgba(17,24,39,0.08)] backdrop-blur-xl"
            : "border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[rgba(255,255,255,0.82)] shadow-[0_10px_26px_rgba(17,24,39,0.05)] backdrop-blur-lg",
          surfaceClassName,
        )}
      >
        {children}
      </header>
    </div>
  );
}

type SiteHeaderRowProps = {
  children: ReactNode;
  className?: string;
  maxWidthClassName?: string;
};

export function SiteHeaderRow({
  children,
  className,
  maxWidthClassName = "max-w-[var(--marketing-max-width)]",
}: SiteHeaderRowProps) {
  return (
    <div
      className={joinClasses(
        "mx-auto flex min-h-[64px] items-center gap-3 px-4 sm:px-6 lg:px-8",
        maxWidthClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
