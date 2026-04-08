"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { InsetPanel, SurfaceCard } from "@/components/admin-ui";
import { syncSessionCookie } from "@/lib/auth-client";
import { getBrowserSupabaseClient } from "@/lib/supabase";

type InviteState = "checking" | "accepting" | "done" | "needs_login" | "error";

export function AcceptInviteClient() {
  const router = useRouter();
  const [state, setState] = useState<InviteState>("checking");
  const [message, setMessage] = useState(
    "Checking your invite session and finalizing access...",
  );

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    let active = true;

    async function run() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session) {
        setState("needs_login");
        setMessage("Sign in with the invited email first, then open this page again.");
        return;
      }

      setState("accepting");
      await syncSessionCookie(session);

      const response = await fetch("/auth/accept-invite", {
        method: "POST",
      });
      const payload = (await response.json()) as
        | { ok: true; data: { redirectTo: string } }
        | { ok: false; error?: { message?: string } };

      if (!response.ok || !payload.ok) {
        setState("error");
        setMessage(
          payload.ok ? "Invite acceptance failed." : payload.error?.message ?? "Invite acceptance failed.",
        );
        return;
      }

      setState("done");
      router.replace(payload.data.redirectTo);
      router.refresh();
    }

    void run();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <SurfaceCard tone="public-access" density="hero">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Accept invite
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">
          Finalize your AppAffiliate access
        </h2>
        <p className="text-sm leading-6 text-ink-muted">{message}</p>
      </div>

      {state === "checking" || state === "accepting" ? (
        <InsetPanel className="mt-6">
          <p className="text-sm text-ink-muted">
            {state === "checking"
              ? "Reading your current session..."
              : "Applying your workspace or creator-portal access now..."}
          </p>
        </InsetPanel>
      ) : null}

      {state === "needs_login" ? (
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/login?redirectTo=/accept-invite" className="aa-button aa-button-primary w-full">
            Sign in to accept invite
          </Link>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="mt-6 flex flex-col gap-3">
          <p className="rounded-[16px] border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {message}
          </p>
          <Link href="/login?redirectTo=/accept-invite" className="aa-button aa-button-secondary w-full">
            Try sign-in again
          </Link>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
