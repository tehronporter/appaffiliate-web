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
          Use your Supabase email and password
        </h2>
        <p className="text-sm leading-6 text-ink-muted">
          Keep this simple for Phase 1. Sign in with an existing Auth user from
          your Supabase project.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
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
            className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
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
          className="w-full rounded-full border border-primary bg-primary px-4 py-3 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)] disabled:cursor-not-allowed disabled:border-border-strong disabled:bg-border-strong"
        >
          {isCheckingSession
            ? "Checking session..."
            : isSubmitting
              ? "Signing in..."
              : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-3xl border border-border bg-surface p-4">
        <p className="text-sm font-medium text-ink">Phase 1 note</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          Signup is intentionally skipped for now to keep the auth foundation
          focused and predictable.
        </p>
      </div>

      <p className="mt-6 text-sm text-ink-muted">
        <Link href="/" className="font-medium text-primary hover:opacity-80">
          Back to home
        </Link>
      </p>
    </div>
  );
}
