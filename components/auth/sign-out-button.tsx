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
      className="aa-button aa-button-secondary disabled:text-ink-subtle"
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
