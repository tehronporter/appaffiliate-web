"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { InsetPanel, SurfaceCard } from "@/components/admin-ui";
import { syncSessionCookie } from "@/lib/auth-client";
import {
  getBillingIntervalLabel,
  getPlanPriceLabel,
  getSelfServePlan,
  type SelfServeBillingInterval,
  type SelfServePlanKey,
} from "@/lib/pricing-catalog";
import { getBrowserSupabaseClient } from "@/lib/supabase";

type SignupState = "idle" | "submitting" | "signing_in";

type SignupFormProps = {
  selectedPlanKey: SelfServePlanKey;
  selectedBillingInterval: SelfServeBillingInterval;
};

export function SignupForm({
  selectedPlanKey,
  selectedBillingInterval,
}: SignupFormProps) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<SignupState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const selectedPlan = getSelfServePlan(selectedPlanKey);
  const billingLabel = getBillingIntervalLabel(selectedBillingInterval);
  const priceLabel = getPlanPriceLabel(selectedPlanKey, selectedBillingInterval);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setState("submitting");

    try {
      const response = await fetch("/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          organizationName,
          email,
          password,
          planKey: selectedPlanKey,
          billingInterval: selectedBillingInterval,
        }),
      });

      const payload = (await response.json()) as
        | { ok: true }
        | { ok: false; error?: { message?: string } };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.ok ? "Signup failed." : payload.error?.message ?? "Signup failed.");
      }

      setState("signing_in");
      const supabase = getBrowserSupabaseClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        throw new Error(error?.message ?? "Account created, but automatic sign-in failed.");
      }

      await syncSessionCookie(data.session);
      router.replace("/onboarding?step=1");
      router.refresh();
    } catch (error) {
      setState("idle");
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong while creating the workspace.",
      );
    }
  }

  return (
    <SurfaceCard tone="public-access" density="hero">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          Start free trial
        </p>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-ink">
          Start your AppAffiliate workspace
        </h2>
        <p className="text-sm leading-6 text-ink-muted">
          Create the first owner account, lock in your plan selection, and land directly in activation.
        </p>
      </div>

      <InsetPanel className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">
              {selectedPlan.name} · {billingLabel}
            </p>
            <p className="mt-1 text-sm leading-6 text-ink-muted">
              {priceLabel}
              {selectedBillingInterval === "annual" ? " with annual billing" : ""}
            </p>
          </div>
          <p className="rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_14%,var(--color-border))] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            14-day free trial
          </p>
        </div>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          {selectedPlan.description}
        </p>
      </InsetPanel>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Your name</span>
          <input
            type="text"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="aa-field"
            placeholder="Alex Morgan"
            autoComplete="name"
            required
            disabled={state !== "idle"}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Organization name</span>
          <input
            type="text"
            value={organizationName}
            onChange={(event) => setOrganizationName(event.target.value)}
            className="aa-field"
            placeholder="Acme Apps"
            autoComplete="organization"
            required
            disabled={state !== "idle"}
          />
        </label>

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
            disabled={state !== "idle"}
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-ink">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="aa-field"
            placeholder="Use at least 10 characters"
            autoComplete="new-password"
            minLength={10}
            required
            disabled={state !== "idle"}
          />
        </label>

        {errorMessage ? (
          <p className="rounded-[16px] border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
            {errorMessage}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={state !== "idle"}
          className="aa-button aa-button-primary w-full py-3"
        >
          {state === "submitting"
            ? "Starting your trial..."
            : state === "signing_in"
              ? "Signing you in..."
              : "Start free trial"}
        </button>
      </form>

      <InsetPanel className="mt-6">
        <p className="text-sm font-medium text-ink">What happens next</p>
        <p className="mt-2 text-sm leading-6 text-ink-muted">
          After signup, AppAffiliate creates your workspace, starts your 14-day trial, and sends you straight into activation.
        </p>
      </InsetPanel>

      <p className="mt-6 text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:opacity-80">
          Sign in
        </Link>
      </p>
    </SurfaceCard>
  );
}
