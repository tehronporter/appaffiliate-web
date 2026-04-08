"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { clearSessionCookie } from "@/lib/auth-client";
import { getBrowserSupabaseClient } from "@/lib/supabase";

function joinClasses(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(" ");
}

type SignOutButtonProps = {
  variant?: "button" | "menu-item";
  className?: string;
};

export function SignOutButton({
  variant = "button",
  className,
}: SignOutButtonProps) {
  const supabase = getBrowserSupabaseClient();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    await supabase.auth.signOut();
    await clearSessionCookie();

    router.replace("/login");
    router.refresh();
  }

  const label = isSigningOut ? "Signing out..." : "Sign out";
  const classes =
    variant === "menu-item"
      ? joinClasses(
          "flex w-full items-center gap-3 rounded-[var(--radius-card)] px-3 py-2 text-left text-sm font-medium text-ink transition hover:bg-surface focus-visible:bg-surface",
          className,
        )
      : joinClasses(
          "aa-button aa-button-secondary disabled:text-ink-subtle",
          className,
        );

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={classes}
    >
      {variant === "menu-item" ? <LogOut size={16} strokeWidth={1.75} /> : null}
      {label}
    </button>
  );
}
