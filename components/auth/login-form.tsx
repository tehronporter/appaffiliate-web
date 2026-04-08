"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";

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
    <div className="rounded-[var(--radius-hero)] border border-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(249,251,255,0.98)_100%)] p-6 shadow-[0_18px_44px_rgba(17,24,39,0.07)] sm:p-8">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-primary">
          Existing account
        </p>
        <h2 className="text-[28px] font-semibold tracking-[-0.04em] text-ink">
          Use your email and password
        </h2>
        <p className="max-w-lg text-sm leading-6 text-ink-muted">
          Sign in with the email already linked to your workspace or creator portal invite.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Email</span>
          <span className="relative block">
            <Mail
              size={16}
              strokeWidth={1.75}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="aa-field h-12 rounded-[var(--radius-card)] border-[color:color-mix(in_srgb,var(--color-primary)_8%,var(--color-border))] bg-white pl-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting || isCheckingSession}
            />
          </span>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Password</span>
          <span className="relative block">
            <LockKeyhole
              size={16}
              strokeWidth={1.75}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="aa-field h-12 rounded-[var(--radius-card)] border-[color:color-mix(in_srgb,var(--color-primary)_8%,var(--color-border))] bg-white pl-11 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              disabled={isSubmitting || isCheckingSession}
            />
          </span>
        </label>

        {errorMessage ? (
          <p className="rounded-[var(--radius-card)] border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isCheckingSession}
          className="aa-button aa-button-primary w-full"
        >
          {isCheckingSession
            ? "Checking session..."
            : isSubmitting
              ? "Signing in..."
              : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-[var(--radius-panel)] border border-[color:color-mix(in_srgb,var(--color-primary)_8%,var(--color-border))] bg-white/72 px-4 py-4">
        <p className="text-sm font-medium text-ink">Need a workspace instead?</p>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Start from signup if you are creating the first owner account for a new AppAffiliate workspace.
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:opacity-80"
          >
            Start with signup
            <ArrowRight size={16} strokeWidth={1.75} />
          </Link>
          <Link href="/" className="text-sm text-ink-muted transition hover:text-ink">
            Back to site
          </Link>
        </div>
      </div>

      <p className="mt-4 text-xs leading-6 text-ink-subtle">
        If you opened a protected route first, AppAffiliate sends you back there after sign-in.
      </p>
    </div>
  );
}
