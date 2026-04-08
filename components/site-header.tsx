"use client";

import { forwardRef, type ReactNode } from "react";

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

export const SiteHeaderFrame = forwardRef<HTMLDivElement, SiteHeaderFrameProps>(
  function SiteHeaderFrame(
    {
      children,
      className,
      scrolled = false,
      maxWidthClassName = "max-w-[var(--marketing-max-width)]",
      stickyClassName = "sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4 lg:px-5",
      surfaceClassName,
    },
    ref,
  ) {
    return (
      <div ref={ref} className={joinClasses(stickyClassName, className)}>
        <header
          className={joinClasses(
            "mx-auto w-full rounded-[22px] border transition-all duration-300",
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
  },
);

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
        "mx-auto flex min-h-[66px] items-center gap-3 px-4 sm:min-h-[70px] sm:px-6 lg:px-8",
        maxWidthClassName,
        className,
      )}
    >
      {children}
    </div>
  );
}
