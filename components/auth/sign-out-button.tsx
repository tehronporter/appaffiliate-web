"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { clearSessionCookie } from "@/lib/auth-client";
import { getBrowserSupabaseClient } from "@/lib/supabase";

export function SignOutButton() {
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

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className="rounded-full border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-ink transition hover:border-border-strong hover:bg-surface disabled:cursor-not-allowed disabled:text-ink-subtle"
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
