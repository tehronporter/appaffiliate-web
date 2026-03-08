"use client";

import Link from "next/link";
import { startTransition, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Code2,
  ExternalLink,
  Link2,
  Mail,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";

import { BrandLogoLink } from "@/components/brand-logo";
import {
  createActivationAppAction,
  createActivationCodeAction,
  createActivationPartnerAction,
} from "@/app/(workspace)/onboarding/actions";
import { StatusBadge } from "@/components/admin-ui";

type FlowStepKey = 1 | 2 | 3 | 4 | 5 | "complete";

type ActivationFlowProps = {
  initialStep: FlowStepKey;
  error?: "app" | "creator" | "code" | null;
  workspaceName: string;
  appStep: {
    satisfied: boolean;
    connected: boolean;
    app: {
      id: string;
      name: string;
      bundleId: string | null;
      appStoreId: string | null;
      appleTeamId: string | null;
      timezone: string;
      appleFeeMode: "standard_30" | "small_business_15" | "custom";
      appleFeeBps: number | null;
      ingestKey: string | null;
    } | null;
    title: string;
    detail: string;
    href: string;
    buttonLabel: string;
    helperText: string;
  };
  creatorStep: {
    satisfied: boolean;
    firstCreator: {
      name: string;
      email: string | null;
      statusLabel: string;
      inviteStatusLabel: string;
    } | null;
  };
  codeStep: {
    satisfied: boolean;
    firstCode: {
      code: string;
      owner: string | null;
      appName: string;
      typeLabel: string;
    } | null;
    defaultAppId: string | null;
    defaultPartnerId: string | null;
    appName: string | null;
    partnerName: string | null;
  };
  resultStep: {
    hasResult: boolean;
    needsReview: boolean;
    href: string;
    buttonLabel: string;
    helperText: string;
    result: {
      creatorName: string;
      eventType: string;
      appName: string;
      valueLabel: string;
      stateLabel: string;
      detail: string;
    } | null;
  };
  payoutStep: {
    hasApprovedEarnings: boolean;
    financeVisible: boolean;
    item: {
      creatorName: string;
      amountLabel: string;
      stateLabel: string;
      appName: string;
      detail: string;
    } | null;
  };
};

function joinClasses(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ActivationTopBar({ currentStepIndex }: { currentStepIndex: number }) {
  return (
    <header className="border-b border-[var(--aa-shell-border)] bg-white">
      <div className="aa-page-width flex h-14 items-center justify-between gap-3 sm:gap-6">
        <BrandLogoLink href="/dashboard" size="workspace-compact" ariaLabel="Open dashboard" />
        <div className="flex max-w-[240px] flex-1 items-center justify-center gap-2">
          {Array.from({ length: 5 }, (_, index) => {
            const filled = currentStepIndex >= index + 1;

            return (
              <span
                key={index}
                className={joinClasses(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  filled ? "bg-primary" : "bg-[var(--aa-shell-border)]",
                )}
              />
            );
          })}
        </div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink-muted transition hover:text-ink"
        >
          <span className="hidden sm:inline">Exit to dashboard</span>
          <span className="sm:hidden">Exit</span>
        </Link>
      </div>
    </header>
  );
}

function StepFrame({
  step,
  title,
  description,
  children,
  footer,
}: {
  step: number;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[600px] flex-col justify-center px-5 py-8 sm:px-6 sm:py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        STEP {step} OF 5
      </p>
      <h1 className="mt-4 text-[2rem] font-bold tracking-[-0.05em] text-ink sm:text-[2.4rem]">
        {title}
      </h1>
      <p className="mt-3 max-w-[48ch] text-sm leading-5 text-ink-muted">
        {description}
      </p>

      <div className="mt-8">{children}</div>
      {footer ? <div className="mt-6">{footer}</div> : null}
    </section>
  );
}

function StepCard({
  icon: Icon,
  title,
  detail,
  badge,
  action,
}: {
  icon: typeof Smartphone;
  title: string;
  detail: string;
  badge?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--aa-shell-border)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
          <Icon size={20} strokeWidth={1.75} />
        </span>
        {badge}
      </div>
      <h2 className="mt-5 text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-5 text-ink-muted">{detail}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function EmptyPanel({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Smartphone;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-[var(--radius-panel)] border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)] px-6 py-8 text-center">
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft/60 text-primary/60">
        <Icon size={24} strokeWidth={1.75} />
      </span>
      <h2 className="mt-4 text-[15px] font-semibold tracking-[-0.01em] text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-5 text-ink-muted">{detail}</p>
    </div>
  );
}

function FullWidthLink({
  href,
  label,
  variant = "primary",
}: {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={joinClasses(
        variant === "primary" ? "aa-button aa-button-primary" : "aa-button aa-button-secondary",
        "w-full justify-center py-3 text-base",
      )}
    >
      {label}
    </Link>
  );
}

function FullWidthButton({
  type = "button",
  label,
  disabled,
  variant = "primary",
  onClick,
}: {
  type?: "button" | "submit";
  label: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  onClick?: () => void;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={joinClasses(
        variant === "primary" ? "aa-button aa-button-primary" : "aa-button aa-button-secondary",
        "w-full justify-center py-3 text-base disabled:cursor-not-allowed disabled:opacity-60",
      )}
    >
      {label}
    </button>
  );
}

function ChoiceCard({
  title,
  description,
  selected,
  onSelect,
  icon: Icon,
}: {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
  icon: typeof Code2;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={joinClasses(
        "rounded-[var(--radius-panel)] border p-4 text-left transition",
        selected
          ? "border-primary bg-primary-soft/40"
          : "border-[var(--aa-shell-border)] bg-white hover:border-[var(--aa-shell-border-strong)]",
      )}
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-primary">
        <Icon size={18} strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-[15px] font-semibold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-5 text-ink-muted">{description}</p>
    </button>
  );
}

export function ActivationFlow({
  initialStep,
  error,
  workspaceName,
  appStep,
  creatorStep,
  codeStep,
  resultStep,
  payoutStep,
}: ActivationFlowProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [step, setStep] = useState<FlowStepKey>(initialStep);
  const [appName, setAppName] = useState(appStep.app?.name ?? "");
  const [bundleId, setBundleId] = useState(appStep.app?.bundleId ?? "");
  const [appStoreId, setAppStoreId] = useState(appStep.app?.appStoreId ?? "");
  const [appleTeamId, setAppleTeamId] = useState(appStep.app?.appleTeamId ?? "");
  const [timezone, setTimezone] = useState(appStep.app?.timezone ?? "UTC");
  const [appleFeeMode, setAppleFeeMode] = useState<
    "standard_30" | "small_business_15" | "custom"
  >(appStep.app?.appleFeeMode ?? "standard_30");
  const [appleFeeBps, setAppleFeeBps] = useState(
    appStep.app?.appleFeeBps?.toString() ?? "",
  );
  const [creatorName, setCreatorName] = useState("");
  const [creatorEmail, setCreatorEmail] = useState("");
  const [assetKind, setAssetKind] = useState<"promo" | "tracking">("promo");
  const [assetValue, setAssetValue] = useState("");

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    setAppName(appStep.app?.name ?? "");
    setBundleId(appStep.app?.bundleId ?? "");
    setAppStoreId(appStep.app?.appStoreId ?? "");
    setAppleTeamId(appStep.app?.appleTeamId ?? "");
    setTimezone(appStep.app?.timezone ?? "UTC");
    setAppleFeeMode(appStep.app?.appleFeeMode ?? "standard_30");
    setAppleFeeBps(appStep.app?.appleFeeBps?.toString() ?? "");
  }, [appStep.app]);

  const appValid =
    appName.trim().length > 1 &&
    timezone.trim().length > 1 &&
    (appleFeeMode !== "custom" || /^\d+$/.test(appleFeeBps.trim()));
  const creatorValid =
    creatorName.trim().length > 1 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(creatorEmail.trim());
  const codeValid =
    Boolean(codeStep.defaultAppId) &&
    Boolean(codeStep.defaultPartnerId) &&
    assetValue.trim().length > 1;

  const syncStep = (nextStep: FlowStepKey) => {
    setStep(nextStep);
    startTransition(() => {
      const href =
        nextStep === "complete" ? `${pathname}?step=complete` : `${pathname}?step=${nextStep}`;
      router.replace(href, { scroll: false });
    });
  };

  let resultPrimary: ReactNode;

  if (!resultStep.hasResult) {
    resultPrimary = (
      <FullWidthButton
        label="I’ll review later →"
        variant="secondary"
        onClick={() => syncStep(5)}
      />
    );
  } else if (resultStep.needsReview) {
    resultPrimary = <FullWidthLink href={resultStep.href} label={resultStep.buttonLabel} />;
  } else {
    resultPrimary = <FullWidthButton label="Continue →" onClick={() => syncStep(5)} />;
  }

  const payoutPrimary = payoutStep.hasApprovedEarnings ? (
    <FullWidthButton label="Finish setup →" onClick={() => syncStep("complete")} />
  ) : (
    <FullWidthButton
      label="I’ll do this later →"
      variant="secondary"
      onClick={() => syncStep("complete")}
    />
  );

  return (
    <div className="min-h-screen bg-white">
      <ActivationTopBar currentStepIndex={step === "complete" ? 5 : step} />

      {step === "complete" ? (
        <section className="mx-auto flex min-h-[calc(100vh-56px)] max-w-[560px] flex-col items-center justify-center px-6 py-10 text-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft/60 text-primary">
            <CheckCircle2 size={30} strokeWidth={1.8} />
          </span>
          <h1 className="mt-6 text-[2.5rem] font-bold tracking-[-0.06em] text-ink">
            You&apos;re live.
          </h1>
          <p className="mt-3 max-w-[42ch] text-sm leading-6 text-ink-muted">
            {workspaceName} now has the core setup needed to pay creators for results, not hype.
          </p>
          <div className="mt-8 w-full">
            <FullWidthLink href="/dashboard" label="Open your dashboard →" />
          </div>
        </section>
      ) : null}

      {step === 1 ? (
        <StepFrame
          step={1}
          title="Add your app"
          description="Start with the app lane that will receive creator-driven results."
          footer={
            appStep.satisfied ? (
              <>
                <FullWidthButton label="Continue →" onClick={() => syncStep(2)} />
                <p className="mt-3 text-center text-sm text-ink-muted">{appStep.helperText}</p>
              </>
            ) : null
          }
        >
          <form action={createActivationAppAction} className="space-y-4">
            <input type="hidden" name="appId" value={appStep.app?.id ?? ""} />
            <div className="rounded-[20px] border border-[var(--aa-shell-border)] bg-white p-5">
              <div className="grid gap-4">
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">App name</span>
                  <input
                    name="name"
                    type="text"
                    value={appName}
                    onChange={(event) => setAppName(event.target.value)}
                    className="aa-field h-14 rounded-[16px] px-4 text-base"
                    placeholder="Acme iOS"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-medium text-ink">Bundle ID</span>
                  <input
                    name="bundleId"
                    type="text"
                    value={bundleId}
                    onChange={(event) => setBundleId(event.target.value)}
                    className="aa-field h-14 rounded-[16px] px-4 text-base"
                    placeholder="com.acme.ios"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">App Store ID</span>
                    <input
                      name="appStoreId"
                      type="text"
                      value={appStoreId}
                      onChange={(event) => setAppStoreId(event.target.value)}
                      className="aa-field h-14 rounded-[16px] px-4 text-base"
                      placeholder="1234567890"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">Apple Team ID</span>
                    <input
                      name="appleTeamId"
                      type="text"
                      value={appleTeamId}
                      onChange={(event) => setAppleTeamId(event.target.value)}
                      className="aa-field h-14 rounded-[16px] px-4 text-base"
                      placeholder="ABCD123456"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">Timezone</span>
                    <input
                      name="timezone"
                      type="text"
                      value={timezone}
                      onChange={(event) => setTimezone(event.target.value)}
                      className="aa-field h-14 rounded-[16px] px-4 text-base"
                      placeholder="UTC"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">Apple fee mode</span>
                    <select
                      name="appleFeeMode"
                      value={appleFeeMode}
                      onChange={(event) =>
                        setAppleFeeMode(
                          event.target.value as "standard_30" | "small_business_15" | "custom",
                        )
                      }
                      className="aa-field h-14 rounded-[16px] px-4 text-base"
                    >
                      <option value="standard_30">Standard 30%</option>
                      <option value="small_business_15">Small Business 15%</option>
                      <option value="custom">Custom basis points</option>
                    </select>
                  </label>
                </div>

                {appleFeeMode === "custom" ? (
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-ink">Custom Apple fee (bps)</span>
                    <input
                      name="appleFeeBps"
                      type="number"
                      value={appleFeeBps}
                      onChange={(event) => setAppleFeeBps(event.target.value)}
                      className="aa-field h-14 rounded-[16px] px-4 text-base"
                      placeholder="2500"
                      min={0}
                      max={10000}
                    />
                  </label>
                ) : (
                  <input type="hidden" name="appleFeeBps" value="" />
                )}
              </div>
            </div>

            <StepCard
              icon={Smartphone}
              title={appStep.title}
              detail={appStep.detail}
              badge={
                <StatusBadge tone={appStep.satisfied ? "green" : appStep.connected ? "amber" : "blue"}>
                  {appStep.satisfied
                    ? "Connected"
                    : appStep.connected
                      ? "Needs setup"
                      : "Not connected"}
                </StatusBadge>
              }
              action={
                appStep.app?.ingestKey ? (
                  <Link
                    href={appStep.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open Apple health <ExternalLink size={14} strokeWidth={1.75} />
                  </Link>
                ) : null
              }
            />

            <FullWidthButton
              type="submit"
              label={appStep.app ? "Save app and continue →" : "Create app and continue →"}
              disabled={!appValid}
            />
            <p className="text-center text-sm text-ink-muted">{appStep.helperText}</p>
            {error === "app" ? (
              <p className="text-center text-sm text-danger">
                The app could not be saved. Check the required fields and try again.
              </p>
            ) : null}
          </form>
        </StepFrame>
      ) : null}

      {step === 2 ? (
        <StepFrame
          step={2}
          title="Invite your first creator"
          description="Add the first creator who should receive credit for real performance."
          footer={
            creatorStep.satisfied ? (
              <>
                <FullWidthButton label="Continue →" onClick={() => syncStep(3)} />
                <p className="mt-3 text-center text-sm text-ink-muted">
                  The creator portal stays read-only and focused on performance, codes, and payouts.
                </p>
              </>
            ) : (
              <>
                <form action={createActivationPartnerAction} className="space-y-4">
                  <div className="rounded-[20px] border border-[var(--aa-shell-border)] bg-white p-5">
                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-ink">Creator name</span>
                        <input
                          name="name"
                          type="text"
                          value={creatorName}
                          onChange={(event) => setCreatorName(event.target.value)}
                          className="aa-field h-14 rounded-[16px] px-4 text-base"
                          placeholder="Jordan Lee"
                        />
                      </label>
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-ink">Creator email</span>
                        <div className="relative">
                          <Mail
                            size={18}
                            strokeWidth={1.75}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-subtle"
                          />
                          <input
                            name="contactEmail"
                            type="email"
                            value={creatorEmail}
                            onChange={(event) => setCreatorEmail(event.target.value)}
                            className="aa-field h-14 rounded-[16px] pl-12 pr-4 text-base"
                            placeholder="jordan@example.com"
                          />
                        </div>
                      </label>
                    </div>
                  </div>
                  <FullWidthButton type="submit" label="Save and continue →" disabled={!creatorValid} />
                </form>
                <p className="mt-3 text-center text-sm text-ink-muted">
                  The creator portal is narrower than the admin app and stays read-only by default.
                </p>
                {error === "creator" ? (
                  <p className="mt-2 text-center text-sm text-danger">
                    That creator could not be saved. Check the name and email, then try again.
                  </p>
                ) : null}
              </>
            )
          }
        >
          {creatorStep.satisfied && creatorStep.firstCreator ? (
            <StepCard
              icon={Users}
              title={creatorStep.firstCreator.name}
              detail={
                creatorStep.firstCreator.email
                  ? `${creatorStep.firstCreator.email} is linked to the focused creator portal invitation flow.`
                  : "This creator is in the workspace and ready for a first tracking asset."
              }
              badge={
                <div className="flex flex-wrap gap-2">
                  <StatusBadge tone="green">{creatorStep.firstCreator.statusLabel}</StatusBadge>
                  <StatusBadge tone="blue">{creatorStep.firstCreator.inviteStatusLabel}</StatusBadge>
                </div>
              }
            />
          ) : (
            <EmptyPanel
              icon={Users}
              title="Your first creator will appear here"
              detail="Once saved, this step becomes the handoff point into code setup and the read-only creator portal."
            />
          )}
        </StepFrame>
      ) : null}

      {step === 3 ? (
        <StepFrame
          step={3}
          title="Create a tracking code or link"
          description="Choose the first trackable asset that connects promotion to results."
          footer={
            codeStep.satisfied ? (
              <>
                <FullWidthButton label="Continue →" onClick={() => syncStep(4)} />
                <p className="mt-3 text-center text-sm text-ink-muted">
                  This first asset becomes the clean ownership path for the first result.
                </p>
              </>
            ) : (
              <>
                <form action={createActivationCodeAction} className="space-y-4">
                  <input type="hidden" name="appId" value={codeStep.defaultAppId ?? ""} />
                  <input type="hidden" name="partnerId" value={codeStep.defaultPartnerId ?? "none"} />
                  <input type="hidden" name="assetKind" value={assetKind} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceCard
                      title="Promo code"
                      description="Use a code the creator can share directly."
                      selected={assetKind === "promo"}
                      onSelect={() => setAssetKind("promo")}
                      icon={Code2}
                    />
                    <ChoiceCard
                      title="Tracking link"
                      description="Use a link label or slug for the creator’s first tracked path."
                      selected={assetKind === "tracking"}
                      onSelect={() => setAssetKind("tracking")}
                      icon={Link2}
                    />
                  </div>
                  <div className="rounded-[20px] border border-[var(--aa-shell-border)] bg-white p-5">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-ink">
                        {assetKind === "promo" ? "Promo code" : "Tracking link label"}
                      </span>
                      <input
                        name="assetValue"
                        type="text"
                        value={assetValue}
                        onChange={(event) => setAssetValue(event.target.value)}
                        className="aa-field h-14 rounded-[16px] px-4 text-base"
                        placeholder={assetKind === "promo" ? "CREATOR10" : "jordan-launch"}
                      />
                    </label>
                    <p className="mt-3 text-sm text-ink-muted">
                      {codeStep.partnerName && codeStep.appName
                        ? `This will be attached to ${codeStep.partnerName} for ${codeStep.appName}.`
                        : "Finish the app and creator steps first so this asset can be attached cleanly."}
                    </p>
                  </div>
                  <FullWidthButton
                    type="submit"
                    label="Create and continue →"
                    disabled={!codeValid}
                  />
                </form>
                <p className="mt-3 text-center text-sm text-ink-muted">
                  Use one clean asset first. You can add more program structure later.
                </p>
                {error === "code" ? (
                  <p className="mt-2 text-center text-sm text-danger">
                    That tracking asset could not be saved. Check the value and try again.
                  </p>
                ) : null}
              </>
            )
          }
        >
          {codeStep.satisfied && codeStep.firstCode ? (
            <StepCard
              icon={codeStep.firstCode.typeLabel === "Tracking link" ? Link2 : Code2}
              title={codeStep.firstCode.code}
              detail={`${codeStep.firstCode.appName}${codeStep.firstCode.owner ? ` • owned by ${codeStep.firstCode.owner}` : ""}`}
              badge={<StatusBadge tone="green">{codeStep.firstCode.typeLabel}</StatusBadge>}
            />
          ) : (
            <EmptyPanel
              icon={Code2}
              title="Your first tracking asset will appear here"
              detail="Once saved, this becomes the direct path between creator promotion and the first result."
            />
          )}
        </StepFrame>
      ) : null}

      {step === 4 ? (
        <StepFrame
          step={4}
          title="Review your first result"
          description="Make sure the first tracked result is easy to trust before you move on."
          footer={
            <>
              {resultPrimary}
              <p className="mt-3 text-center text-sm text-ink-muted">{resultStep.helperText}</p>
            </>
          }
        >
          {resultStep.result ? (
            <StepCard
              icon={Activity}
              title={`${resultStep.result.creatorName} • ${resultStep.result.eventType}`}
              detail={`${resultStep.result.appName} • ${resultStep.result.valueLabel}. ${resultStep.result.detail}`}
              badge={
                <StatusBadge tone={resultStep.needsReview ? "amber" : "green"}>
                  {resultStep.result.stateLabel}
                </StatusBadge>
              }
              action={
                resultStep.needsReview ? (
                  <Link
                    href={resultStep.href}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    Open review <ChevronRight size={14} strokeWidth={1.75} />
                  </Link>
                ) : null
              }
            />
          ) : (
            <EmptyPanel
              icon={Activity}
              title="Your first tracked result will appear here"
              detail="As soon as creator-driven activity lands, this step becomes the fastest place to check whether attribution looks trustworthy."
            />
          )}
        </StepFrame>
      ) : null}

      {step === 5 ? (
        <StepFrame
          step={5}
          title="Approve earnings for payout"
          description="Keep payout trust high by making approval explicit before anything moves into finance."
          footer={
            <>
              {payoutPrimary}
              <p className="mt-3 text-center text-sm text-ink-muted">
                {payoutStep.hasApprovedEarnings
                  ? "You can still open the finance surfaces later without redoing setup."
                  : payoutStep.financeVisible
                    ? "Finance approval can happen later without blocking the rest of setup."
                    : "A finance-safe role can approve earnings later when the workspace is ready."}
              </p>
            </>
          }
        >
          {payoutStep.item ? (
            <StepCard
              icon={Wallet}
              title={`${payoutStep.item.creatorName} • ${payoutStep.item.amountLabel}`}
              detail={`${payoutStep.item.appName}. ${payoutStep.item.detail}`}
              badge={<StatusBadge tone="green">{payoutStep.item.stateLabel}</StatusBadge>}
              action={
                <Link
                  href="/earnings"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Open earnings <ArrowRight size={14} strokeWidth={1.75} />
                </Link>
              }
            />
          ) : (
            <EmptyPanel
              icon={Wallet}
              title="Approved earnings will appear here"
              detail={
                payoutStep.financeVisible
                  ? "Once a result clears review, the first earning will show up here for a deliberate payout decision."
                  : "Once finance-safe access is available, approved earnings will show here for payout review."
              }
            />
          )}
        </StepFrame>
      ) : null}
    </div>
  );
}
