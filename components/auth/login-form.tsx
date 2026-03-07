"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { syncSessionCookie } from "@/lib/auth-client";
import { getBrowserSupabaseClient } from "@/lib/supabase";

type LoginFormProps = {
  redirectTo: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const supabase = getBrowserSupabaseClient();
    let isActive = true;

    async function checkExistingSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      if (session) {
        await syncSessionCookie(session);
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      setIsCheckingSession(false);
    }

    void checkExistingSession();

    return () => {
      isActive = false;
    };
  }, [redirectTo, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const supabase = getBrowserSupabaseClient();
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    await syncSessionCookie(data.session);
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <div className="rounded-[32px] border border-border bg-surface-elevated p-6 shadow-[var(--shadow-strong)] sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
          Sign in
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Use your invited email and password
        </h2>
        <p className="text-sm leading-6 text-ink-muted">
          Sign in with the account already provisioned for you. AppAffiliate
          uses the same entry point for invited internal users and linked
          partner users.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="aa-field"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isSubmitting || isCheckingSession}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="aa-field"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isSubmitting || isCheckingSession}
          />
        </label>

        {errorMessage ? (
          <p className="rounded-2xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isCheckingSession}
          className="aa-button aa-button-primary w-full py-3"
        >
          {isCheckingSession
            ? "Checking session..."
            : isSubmitting
              ? "Signing in..."
              : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-3xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-ink">Access note</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Public signup is not enabled. If you do not already have invited
          access, use the request-access page instead.
        </p>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        <Link href="/" className="font-medium text-primary hover:opacity-80">
          Back to site
        </Link>
      </p>
    </div>
  );
}
