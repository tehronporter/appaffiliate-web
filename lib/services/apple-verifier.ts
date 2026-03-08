import "server-only";

import {
  Environment,
  SignedDataVerifier,
} from "@apple/app-store-server-library";

type AppleVerifierEnvironment = "sandbox" | "production" | "unknown";

type VerifiedAppleTransaction = {
  environment: AppleVerifierEnvironment;
  bundleId: string | null;
  appAppleId: string | null;
  transactionId: string | null;
  originalTransactionId: string | null;
  webOrderLineItemId: string | null;
  productId: string | null;
  offerIdentifier: string | null;
  currency: string | null;
  amountMinor: number | null;
  occurredAt: string | null;
  rawNotification: Record<string, unknown> | null;
  rawTransaction: Record<string, unknown> | null;
};

export type AppleVerificationResult = {
  verificationStatus: "verified" | "failed";
  failureReason: string | null;
  transaction: VerifiedAppleTransaction;
};

function normalizeEnvironment(value: unknown): AppleVerifierEnvironment {
  if (typeof value !== "string") {
    return "unknown";
  }

  const normalized = value.trim().toLowerCase();

  if (normalized === "sandbox") {
    return "sandbox";
  }

  if (normalized === "production") {
    return "production";
  }

  return "unknown";
}

function normalizeOptionalText(value: unknown, maxLength = 255) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : null;
}

function normalizeIsoTimestamp(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return new Date(parsed).toISOString();
    }

    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return null;
}

function decodeJwtPayload<T>(token: string) {
  const segments = token.split(".");

  if (segments.length < 2) {
    throw new Error("signed payload is not a JWT/JWS");
  }

  const payloadSegment = segments[1];
  const padded = payloadSegment.padEnd(
    payloadSegment.length + ((4 - (payloadSegment.length % 4)) % 4),
    "=",
  );

  return JSON.parse(
    Buffer.from(
      padded.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8"),
  ) as T;
}

function loadRootCertificates() {
  const configuredValues = [
    process.env.APPLE_ROOT_CA_BASE64,
    process.env.APPLE_ROOT_CA_BASE64_1,
    process.env.APPLE_ROOT_CA_BASE64_2,
    process.env.APPLE_ROOT_CA_BASE64_3,
  ]
    .filter(Boolean)
    .flatMap((value) => String(value).split(/[\n,]+/))
    .map((value) => value.trim())
    .filter(Boolean);

  return configuredValues.map((value) => Buffer.from(value, "base64"));
}

function environmentToApple(environment: AppleVerifierEnvironment) {
  return environment === "production" ? Environment.PRODUCTION : Environment.SANDBOX;
}

function parseAmountMinor(priceMilliunits: unknown) {
  if (typeof priceMilliunits !== "number" || !Number.isFinite(priceMilliunits)) {
    return null;
  }

  return Math.round(priceMilliunits / 10);
}

function buildFailedResult(
  failureReason: string,
  partial: Partial<VerifiedAppleTransaction> = {},
): AppleVerificationResult {
  return {
    verificationStatus: "failed",
    failureReason,
    transaction: {
      environment: partial.environment ?? "unknown",
      bundleId: partial.bundleId ?? null,
      appAppleId: partial.appAppleId ?? null,
      transactionId: partial.transactionId ?? null,
      originalTransactionId: partial.originalTransactionId ?? null,
      webOrderLineItemId: partial.webOrderLineItemId ?? null,
      productId: partial.productId ?? null,
      offerIdentifier: partial.offerIdentifier ?? null,
      currency: partial.currency ?? null,
      amountMinor: partial.amountMinor ?? null,
      occurredAt: partial.occurredAt ?? null,
      rawNotification: partial.rawNotification ?? null,
      rawTransaction: partial.rawTransaction ?? null,
    },
  };
}

export async function verifyAppleSignedNotification(input: {
  signedPayload: string;
  bundleId: string | null;
  appAppleId: string | null;
}) {
  let unsignedNotification: Record<string, unknown> | null = null;

  try {
    unsignedNotification = decodeJwtPayload<Record<string, unknown>>(input.signedPayload);
  } catch {
    return buildFailedResult("unparseable_signed_payload");
  }

  const environmentHint = normalizeEnvironment(
    (unsignedNotification.data as { environment?: unknown } | undefined)?.environment ??
      unsignedNotification.environment,
  );

  if (!input.bundleId) {
    return buildFailedResult("missing_bundle_id", {
      environment: environmentHint,
      rawNotification: unsignedNotification,
    });
  }

  const rootCertificates = loadRootCertificates();

  if (rootCertificates.length === 0) {
    return buildFailedResult("missing_apple_root_certificates", {
      environment: environmentHint,
      bundleId: input.bundleId,
      appAppleId: input.appAppleId,
      rawNotification: unsignedNotification,
    });
  }

  try {
    const verifier = new SignedDataVerifier(
      rootCertificates,
      process.env.APPLE_ENABLE_ONLINE_CHECKS === "true",
      environmentToApple(environmentHint === "unknown" ? "sandbox" : environmentHint),
      input.bundleId,
      input.appAppleId ? Number(input.appAppleId) : undefined,
    );
    const notification = await verifier.verifyAndDecodeNotification(input.signedPayload);
    const signedTransactionInfo =
      typeof notification.data?.signedTransactionInfo === "string"
        ? notification.data.signedTransactionInfo
        : null;
    const transaction = signedTransactionInfo
      ? await verifier.verifyAndDecodeTransaction(signedTransactionInfo)
      : null;

    return {
      verificationStatus: "verified",
      failureReason: null,
      transaction: {
        environment: normalizeEnvironment(transaction?.environment ?? notification.data?.environment),
        bundleId: normalizeOptionalText(notification.data?.bundleId ?? transaction?.bundleId),
        appAppleId: input.appAppleId,
        transactionId: normalizeOptionalText(transaction?.transactionId),
        originalTransactionId: normalizeOptionalText(transaction?.originalTransactionId),
        webOrderLineItemId: normalizeOptionalText(transaction?.webOrderLineItemId),
        productId: normalizeOptionalText(transaction?.productId),
        offerIdentifier: normalizeOptionalText(transaction?.offerIdentifier),
        currency: normalizeOptionalText(transaction?.currency, 12),
        amountMinor: parseAmountMinor(transaction?.price),
        occurredAt: normalizeIsoTimestamp(transaction?.purchaseDate ?? transaction?.signedDate),
        rawNotification: notification as unknown as Record<string, unknown>,
        rawTransaction: transaction as unknown as Record<string, unknown>,
      },
    } satisfies AppleVerificationResult;
  } catch (error) {
    return buildFailedResult("verification_failed", {
      environment: environmentHint,
      bundleId: input.bundleId,
      appAppleId: input.appAppleId,
      rawNotification: unsignedNotification,
      rawTransaction: {
        error:
          error instanceof Error ? error.message : "Unknown Apple verification failure",
      },
    });
  }
}
