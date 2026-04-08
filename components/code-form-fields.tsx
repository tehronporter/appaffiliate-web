"use client";

import { useId, useMemo, useState } from "react";

import type {
  PromoCodeStatus,
  PromoCodeType,
  SelectOption,
} from "@/lib/services/codes";

type ResultType = "install" | "trial" | "subscription";

type CodeFormFieldsProps = {
  appOptions: SelectOption[];
  partnerOptions: SelectOption[];
  defaultAppId?: string;
  defaultPartnerId?: string | null;
  defaultCode?: string;
  defaultStatus?: PromoCodeStatus;
  defaultCodeType?: PromoCodeType;
  defaultChannel?: string | null;
  defaultResultType?: ResultType;
  defaultPayoutValue?: string;
};

function inferResultType(defaultCodeType?: PromoCodeType): ResultType {
  if (defaultCodeType === "promo") {
    return "install";
  }

  if (defaultCodeType === "campaign") {
    return "trial";
  }

  return "subscription";
}

function defaultPayoutForResultType(resultType: ResultType) {
  if (resultType === "install") {
    return "1.00";
  }

  if (resultType === "trial") {
    return "5.00";
  }

  return "10";
}

function payoutHelperCopy(resultType: ResultType) {
  if (resultType === "install") {
    return "Creator earns this flat amount for each install from this code.";
  }

  if (resultType === "trial") {
    return "Creator earns this flat amount for each trial from this code.";
  }

  return "Creator earns this percentage for each paid subscription from this code.";
}

function payoutPlaceholder(resultType: ResultType) {
  if (resultType === "install") {
    return "$1.00";
  }

  if (resultType === "trial") {
    return "$5.00";
  }

  return "10%";
}

export function CodeFormFields({
  appOptions,
  partnerOptions,
  defaultAppId,
  defaultPartnerId,
  defaultCode,
  defaultStatus,
  defaultCodeType,
  defaultChannel,
  defaultResultType,
  defaultPayoutValue,
}: CodeFormFieldsProps) {
  const initialResultType = defaultResultType ?? inferResultType(defaultCodeType);
  const [resultType, setResultType] = useState<ResultType>(initialResultType);
  const [payoutValue, setPayoutValue] = useState(
    defaultPayoutValue ?? defaultPayoutForResultType(initialResultType),
  );
  const payoutHelpId = useId();
  const legacyCodeType = defaultCodeType ?? "promo";

  const helperText = useMemo(() => payoutHelperCopy(resultType), [resultType]);
  const placeholder = useMemo(() => payoutPlaceholder(resultType), [resultType]);

  function handleResultTypeChange(nextValue: ResultType) {
    setResultType(nextValue);
    setPayoutValue(defaultPayoutForResultType(nextValue));
  }

  return (
    <div className="grid gap-4">
      <input type="hidden" name="codeType" value={legacyCodeType} />

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">App</span>
        <select
          name="appId"
          required
          defaultValue={defaultAppId ?? appOptions[0]?.id ?? ""}
          className="aa-field"
        >
          {appOptions.map((app) => (
            <option key={app.id} value={app.id}>
              {app.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator owner</span>
        <select
          name="partnerId"
          defaultValue={defaultPartnerId ?? "none"}
          className="aa-field"
        >
          <option value="none">Choose later</option>
          {partnerOptions.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Code or link label</span>
        <input
          name="code"
          type="text"
          required
          defaultValue={defaultCode ?? ""}
          className="aa-field uppercase"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={defaultStatus ?? "active"}
            className="aa-field"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Result type</span>
          <select
            name="resultType"
            value={resultType}
            onChange={(event) => handleResultTypeChange(event.target.value as ResultType)}
            className="aa-field"
          >
            <option value="install">Install</option>
            <option value="trial">Trial</option>
            <option value="subscription">Subscription</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Payout</span>
        <input
          name="payoutValue"
          type="text"
          inputMode="decimal"
          value={payoutValue}
          onChange={(event) => setPayoutValue(event.target.value)}
          placeholder={placeholder}
          aria-describedby={payoutHelpId}
          className="aa-field"
        />
        <span id={payoutHelpId} className="text-xs leading-5 text-ink-muted">
          {helperText}
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Channel note</span>
        <input
          name="channel"
          type="text"
          defaultValue={defaultChannel ?? ""}
          className="aa-field"
        />
      </label>
    </div>
  );
}
