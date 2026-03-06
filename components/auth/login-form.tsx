"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { syncSessionCookie } from "@/lib/auth-client";
import { supabase } from "@/lib/supabase";

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
    <div className="rounded-[2rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          Sign in
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
          Use your Supabase email and password
        </h2>
        <p className="text-sm leading-6 text-slate-600">
          Keep this simple for Phase 0. Sign in with an existing Auth user from
          your Supabase project.
        </p>
      </div>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={isSubmitting || isCheckingSession}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-sky-400 focus:bg-white"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            disabled={isSubmitting || isCheckingSession}
          />
        </label>

        {errorMessage ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting || isCheckingSession}
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isCheckingSession
            ? "Checking session..."
            : isSubmitting
              ? "Signing in..."
              : "Sign in"}
        </button>
      </form>

      <div className="mt-6 rounded-3xl border border-slate-200/80 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">Phase 0 note</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Signup is intentionally skipped for now to keep the auth foundation
          focused and predictable.
        </p>
      </div>

      <p className="mt-6 text-sm text-slate-500">
        <Link href="/" className="font-medium text-sky-700 hover:text-sky-800">
          Back to home
        </Link>
      </p>
    </div>
  );
}
