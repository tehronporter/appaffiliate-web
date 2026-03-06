"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { clearSessionCookie } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

export function SignOutButton() {
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
      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:text-slate-400"
    >
      {isSigningOut ? "Signing out..." : "Sign out"}
    </button>
  );
}
