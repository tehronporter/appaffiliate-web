"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Settings } from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import type { WorkspaceShellUser } from "@/components/workspace-shell-types";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type WorkspaceUserMenuProps = {
  user: WorkspaceShellUser;
};

export function WorkspaceUserMenu({ user }: WorkspaceUserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={joinClasses(
          "inline-flex h-10 items-center gap-2 rounded-full border border-[var(--aa-shell-border)] bg-white px-1.5 pr-2 transition hover:border-[var(--aa-shell-border-strong)] hover:bg-surface",
          open && "border-[color:color-mix(in_srgb,var(--color-primary)_18%,white)]",
        )}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
          {user.initials}
        </span>
        <ChevronDown size={16} strokeWidth={1.75} className="hidden text-ink-subtle sm:block" />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(15rem,calc(100vw-1rem))] rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-white p-2 shadow-[0_16px_40px_rgba(17,24,39,0.08)] sm:w-[240px]"
        >
          <div className="rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-surface px-3 py-3">
            <p className="text-sm font-semibold text-ink">{user.name}</p>
            <p className="mt-1 text-sm text-ink-muted">{user.role}</p>
            {user.email ? (
              <p className="mt-1 truncate text-xs text-ink-subtle">{user.email}</p>
            ) : null}
          </div>

          <div className="mt-2 grid gap-1">
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-[var(--radius-card)] px-3 py-2 text-sm font-medium text-ink transition hover:bg-surface"
            >
              <Settings size={16} strokeWidth={1.75} />
              Settings
            </Link>
            <div className="rounded-[var(--radius-card)] px-3 py-2 text-sm text-ink-muted">
              Single-workspace access for this MVP
            </div>
            <SignOutButton variant="menu-item" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
