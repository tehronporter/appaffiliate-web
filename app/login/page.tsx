import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, BadgeCheck, Building2, ShieldCheck, UserRound } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { PublicShell } from "@/components/public-shell";
import { getAuthenticatedUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getAuthenticatedUser();
  const { redirectTo } = await searchParams;
  const safeRedirectTo =
    redirectTo && redirectTo.startsWith("/") ? redirectTo : "/dashboard";

  if (user) {
    redirect(safeRedirectTo);
  }

  return (
    <PublicShell
      eyebrow="Sign in"
      title="Sign in to your AppAffiliate account"
      description="Use the email already linked to your workspace or creator invite. AppAffiliate opens the right surface automatically."
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(420px,0.9fr)] lg:items-start lg:gap-10">
        <div className="space-y-5">
          <section className="relative overflow-hidden rounded-[24px] border border-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-border))] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(246,249,255,0.98)_100%)] p-6 shadow-[0_16px_40px_rgba(17,24,39,0.06)] sm:p-8">
            <div className="pointer-events-none absolute right-[-68px] top-[-72px] h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(46,83,255,0.14)_0%,rgba(46,83,255,0.04)_52%,transparent_76%)] blur-3xl" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_12%,white)] bg-[#EBF0FF] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                AppAffiliate access
              </div>
              <h2 className="mt-5 text-[30px] font-semibold tracking-[-0.04em] text-ink sm:text-[34px]">
                One login, two product surfaces.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">
                Internal operators open the full workspace. Invited creators open the lighter portal built for codes, results, and payout visibility.
              </p>

              <div className="mt-7 space-y-3">
                <div className="flex items-start gap-4 rounded-[18px] border border-border bg-white/84 px-4 py-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EBF0FF] text-primary">
                    <Building2 size={22} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                        Internal workspace
                      </p>
                      <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--color-primary)_12%,white)] bg-primary-soft px-2.5 py-1 text-[11px] font-semibold text-primary">
                        Operators
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      Manage tracking, attribution review, commissions, payouts, and exports in one place.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 rounded-[18px] border border-border bg-white/84 px-4 py-4">
                  <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EBF0FF] text-primary">
                    <UserRound size={22} strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                        Creator portal
                      </p>
                      <span className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--color-success)_12%,white)] bg-success-soft px-2.5 py-1 text-[11px] font-semibold text-success">
                        Read-only
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-ink-muted">
                      See assigned codes, tracked results, approved earnings, and payout history without entering the admin workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-border bg-white/88 px-5 py-5 shadow-[0_10px_26px_rgba(17,24,39,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              What happens next
            </p>
            <div className="mt-4 space-y-3">
              {[
                "AppAffiliate opens the workspace or portal already tied to your account.",
                "If you asked for a protected page first, you return there after sign-in.",
                "New teams should create the first owner account from signup instead.",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[16px] border border-border bg-surface px-4 py-3"
                >
                  <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-primary">
                    <BadgeCheck size={16} strokeWidth={1.75} />
                  </span>
                  <p className="text-sm leading-6 text-ink-muted">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 font-semibold text-primary transition hover:opacity-80"
              >
                Start free trial
                <ArrowRight size={16} strokeWidth={1.75} />
              </Link>
              <span className="text-ink-subtle">if you are setting up the first owner account</span>
            </div>
          </section>

          <div className="flex items-start gap-3 text-sm text-ink-muted">
            <ShieldCheck size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" />
            <p className="max-w-xl leading-6">
              Access stays scoped after login. Workspace users do not land in the portal by accident, and invited creators only see their own creator-facing records.
            </p>
          </div>
        </div>

        <LoginForm redirectTo={safeRedirectTo} />
      </div>
    </PublicShell>
  );
}
