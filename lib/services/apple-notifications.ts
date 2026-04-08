import "server-only";

import { createHash } from "crypto";

import { createServiceSupabaseClient } from "@/lib/service-supabase";
import { verifyAppleSignedNotification } from "@/lib/services/apple-verifier";
import { ServiceError } from "@/lib/services/errors";

type AppleEnvironment = "sandbox" | "production" | "unknown";
type AppleVerificationStatus =
  | "pending"
  | "verified"
  | "failed";
type AppleReceiptProcessingStatus =
  | "pending"
  | "processed"
  | "ignored"
  | "failed";
type NormalizedEventType =
  | "install"
  | "trial_started"
  | "subscription_started"
  | "renewal"
  | "purchase"
  | "refund"
  | "cancellation"
  | "other";
type NormalizedEventStatus = "received" | "normalized" | "invalid" | "ignored";
type AttributionStatus = "pending" | "attributed" | "unattributed" | "ignored";

type AppleIngestApp = {
  id: string;
  organization_id: string;
  slug: string;
  name: string;
  bundle_id: string | null;
  app_store_id: string | null;
  apple_fee_mode: "standard_30" | "small_business_15" | "custom";
  apple_fee_bps: number | null;
  ingest_key: string | null;
};

type AppleReceiptRecord = {
  id: string;
  organization_id: string;
  app_id: string | null;
  notification_uuid: string | null;
  notification_type: string;
  notification_subtype: string | null;
  environment: AppleEnvironment;
  signed_payload: string;
  original_transaction_id: string | null;
  processed_status: AppleReceiptProcessingStatus;
  last_error: string | null;
  received_at: string;
  request_id: string | null;
  payload_hash: string | null;
  verification_status: AppleVerificationStatus;
  dedupe_key: string | null;
};

type NormalizedEventRecord = {
  id: string;
  source_event_key: string | null;
  event_type: NormalizedEventType;
  event_status: NormalizedEventStatus;
  attribution_status: AttributionStatus;
  reason_code: string | null;
};

type AppleNotificationPayload = {
  notificationUUID?: unknown;
  notificationType?: unknown;
  subtype?: unknown;
  version?: unknown;
  signedDate?: unknown;
  data?: {
    environment?: unknown;
    bundleId?: unknown;
    signedTransactionInfo?: unknown;
    signedRenewalInfo?: unknown;
  };
  environment?: unknown;
};

type AppleTransactionPayload = {
  environment?: unknown;
  transactionId?: unknown;
  originalTransactionId?: unknown;
  webOrderLineItemId?: unknown;
  productId?: unknown;
  offerIdentifier?: unknown;
  appAccountToken?: unknown;
  currency?: unknown;
  price?: unknown;
  purchaseDate?: unknown;
  signedDate?: unknown;
};

type DecodedAppleNotification = {
  payload: AppleNotificationPayload | null;
  transactionPayload: AppleTransactionPayload | null;
  notificationUuid: string | null;
  notificationType: string | null;
  notificationSubtype: string | null;
  environment: AppleEnvironment;
  originalTransactionId: string | null;
  transactionId: string | null;
  webOrderLineItemId: string | null;
  productId: string | null;
  offerIdentifier: string | null;
  currency: string | null;
  amountMinor: number | null;
  grossAmount: number | null;
  netAmount: number | null;
  occurredAt: string | null;
  verificationStatus: AppleVerificationStatus;
  failureReason: string | null;
};

type StoreAppleReceiptInput = {
  app: AppleIngestApp;
  requestId: string;
  signedPayload: string;
};

type StoreAppleReceiptResult = {
  receipt: AppleReceiptRecord;
  duplicate: boolean;
  decoded: DecodedAppleNotification;
};

type NormalizeAppleReceiptInput = {
  app: AppleIngestApp;
  receipt: AppleReceiptRecord;
  decoded: DecodedAppleNotification;
};

type NormalizeAppleReceiptResult = {
  status: "created" | "existing" | "skipped";
  normalizedEvent: NormalizedEventRecord | null;
  processingStatus: AppleReceiptProcessingStatus;
  failureReason: string | null;
};

type RefundMatchRow = {
  id: string;
  partner_id: string | null;
  promo_code_id: string | null;
  original_transaction_id: string | null;
};

type RefundLedgerRow = {
  id: string;
  chain_id: string;
  currency: string;
  amount: number | string;
  transition_type: string;
};

type ProcessAppleNotificationReceiptInput = {
  ingestKey: string;
  requestId: string;
  signedPayload: string;
};

type ProcessAppleNotificationReceiptResult = {
  requestId: string;
  app: Pick<AppleIngestApp, "id" | "slug" | "name">;
  receipt: Pick<
    AppleReceiptRecord,
    | "id"
    | "notification_uuid"
    | "notification_type"
    | "notification_subtype"
    | "environment"
    | "processed_status"
    | "verification_status"
    | "received_at"
    | "last_error"
  >;
  normalizedEventId: string | null;
  duplicate: boolean;
};

const APP_SELECT =
  "id, organization_id, slug, name, bundle_id, app_store_id, apple_fee_mode, apple_fee_bps, ingest_key";
const RECEIPT_SELECT =
  "id, organization_id, app_id, notification_uuid, notification_type, notification_subtype, environment, signed_payload, original_transaction_id, processed_status, last_error, received_at, request_id, payload_hash, verification_status, dedupe_key";
const EVENT_SELECT =
  "id, source_event_key, event_type, event_status, attribution_status, reason_code";

const NOTIFICATION_EVENT_TYPE_MAP: Record<string, NormalizedEventType> = {
  CONSUMPTION_REQUEST: "refund",
  DID_CHANGE_RENEWAL_PREF: "other",
  DID_CHANGE_RENEWAL_STATUS: "other",
  DID_FAIL_TO_RENEW: "other",
  DID_RENEW: "renewal",
  DID_RECOVER: "renewal",
  EXPIRED: "cancellation",
  EXTERNAL_PURCHASE_TOKEN: "purchase",
  OFFER_REDEEMED: "purchase",
  ONE_TIME_CHARGE: "purchase",
  PRICE_INCREASE: "other",
  REFUND: "refund",
  REFUND_DECLINED: "refund",
  RENEWAL_EXTENDED: "renewal",
  RENEWAL_EXTENSION: "renewal",
  REVOKE: "cancellation",
  SUBSCRIBED: "subscription_started",
  TEST: "other",
};

function normalizeText(value: unknown, maxLength = 255) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, maxLength);
}

function normalizeEnvironment(value: unknown): AppleEnvironment {
  const normalized = normalizeText(value, 40)?.toLowerCase();

  if (normalized === "sandbox") {
    return "sandbox";
  }

  if (normalized === "production" || normalized === "prod") {
    return "production";
  }

  return "unknown";
}

function normalizeIsoTimestamp(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }

  if (typeof value === "string" && value.trim()) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return new Date(numericValue).toISOString();
    }

    const parsedDate = new Date(value);

    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString();
    }
  }

  return null;
}

function resolveAppleFeeBps(app: AppleIngestApp) {
  if (app.apple_fee_mode === "small_business_15") {
    return 1500;
  }

  if (app.apple_fee_mode === "custom") {
    return app.apple_fee_bps ?? null;
  }

  return 3000;
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
  const json = Buffer.from(
    padded.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  ).toString("utf8");

  return JSON.parse(json) as T;
}

async function inspectAppleSignedPayload(
  signedPayload: string,
  app: AppleIngestApp,
): Promise<DecodedAppleNotification> {
  try {
    const payload = decodeJwtPayload<AppleNotificationPayload>(signedPayload);
    const transactionToken =
      typeof payload.data?.signedTransactionInfo === "string"
        ? payload.data.signedTransactionInfo.trim()
        : null;
    let transactionPayload: AppleTransactionPayload | null = null;

    if (transactionToken) {
      try {
        transactionPayload = decodeJwtPayload<AppleTransactionPayload>(
          transactionToken,
        );
      } catch {
        transactionPayload = null;
      }
    }

    const verification = await verifyAppleSignedNotification({
      signedPayload,
      bundleId: app.bundle_id,
      appAppleId: app.app_store_id,
    });
    const amountMinor = verification.transaction.amountMinor;
    const grossAmount =
      amountMinor === null ? null : Math.round((amountMinor / 100) * 100) / 100;
    const feeBps = resolveAppleFeeBps(app);
    const netAmount =
      grossAmount === null || feeBps === null
        ? null
        : Math.round(grossAmount * ((10000 - feeBps) / 10000) * 100) / 100;

    return {
      payload,
      transactionPayload,
      notificationUuid: normalizeText(payload.notificationUUID),
      notificationType: normalizeText(payload.notificationType)?.toUpperCase() ?? null,
      notificationSubtype: normalizeText(payload.subtype),
      environment: normalizeEnvironment(
        transactionPayload?.environment ??
          payload.data?.environment ??
          payload.environment,
      ),
      originalTransactionId:
        verification.transaction.originalTransactionId ??
        normalizeText(transactionPayload?.originalTransactionId) ??
        null,
      transactionId:
        verification.transaction.transactionId ??
        normalizeText(transactionPayload?.transactionId) ??
        null,
      webOrderLineItemId:
        verification.transaction.webOrderLineItemId ??
        normalizeText(transactionPayload?.webOrderLineItemId) ??
        null,
      productId:
        verification.transaction.productId ??
        normalizeText(transactionPayload?.productId) ??
        null,
      offerIdentifier:
        verification.transaction.offerIdentifier ??
        normalizeText(transactionPayload?.offerIdentifier) ??
        null,
      currency:
        verification.transaction.currency ??
        normalizeText(transactionPayload?.currency, 12),
      amountMinor,
      grossAmount,
      netAmount,
      occurredAt:
        verification.transaction.occurredAt ??
        normalizeIsoTimestamp(
          transactionPayload?.purchaseDate ?? transactionPayload?.signedDate,
        ) ?? normalizeIsoTimestamp(payload.signedDate),
      verificationStatus: verification.verificationStatus,
      failureReason: verification.failureReason,
    };
  } catch {
    return {
      payload: null,
      transactionPayload: null,
      notificationUuid: null,
      notificationType: null,
      notificationSubtype: null,
      environment: "unknown",
      originalTransactionId: null,
      transactionId: null,
      webOrderLineItemId: null,
      productId: null,
      offerIdentifier: null,
      currency: null,
      amountMinor: null,
      grossAmount: null,
      netAmount: null,
      occurredAt: null,
      verificationStatus: "failed",
      failureReason: "unparseable_signed_payload",
    };
  }
}

function createPayloadHash(signedPayload: string) {
  return createHash("sha256").update(signedPayload).digest("hex");
}

function createReceiptDedupeKey(decoded: DecodedAppleNotification, payloadHash: string) {
  if (decoded.notificationUuid) {
    return `notification_uuid:${decoded.notificationUuid}`;
  }

  // Apple uses notificationUUID for idempotency. Until full verification lands,
  // hash the exact signed payload so repeated deliveries of the same body collapse
  // deterministically without inventing a synthetic UUID.
  return `payload_hash:${payloadHash}`;
}

function deriveNormalizedEventType(notificationType: string | null) {
  if (!notificationType) {
    return null;
  }

  return NOTIFICATION_EVENT_TYPE_MAP[notificationType] ?? "other";
}

function deriveNormalizedEventStatus(
  notificationType: string | null,
): NormalizedEventStatus {
  if (notificationType === "TEST") {
    return "ignored";
  }

  return "normalized";
}

function deriveAttributionStatus(
  eventStatus: NormalizedEventStatus,
): AttributionStatus {
  if (eventStatus === "ignored") {
    return "ignored";
  }

  return "unattributed";
}

async function readReceiptByDedupeKey(params: {
  organizationId: string;
  appId: string;
  dedupeKey: string;
}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("apple_notification_receipts")
    .select(RECEIPT_SELECT)
    .eq("organization_id", params.organizationId)
    .eq("app_id", params.appId)
    .eq("dedupe_key", params.dedupeKey)
    .maybeSingle<AppleReceiptRecord>();

  if (error) {
    throw new ServiceError(
      "internal_error",
      "Failed to read the stored Apple receipt.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  return data;
}

async function readNormalizedEventBySourceEventKey(params: {
  organizationId: string;
  sourceEventKey: string;
}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("normalized_events")
    .select(EVENT_SELECT)
    .eq("organization_id", params.organizationId)
    .eq("source_type", "apple_notification")
    .eq("source_event_key", params.sourceEventKey)
    .maybeSingle<NormalizedEventRecord>();

  if (error) {
    throw new ServiceError(
      "internal_error",
      "Failed to read the normalized Apple event.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  return data;
}

async function updateReceiptProcessingState(params: {
  receiptId: string;
  processedStatus: AppleReceiptProcessingStatus;
  lastError: string | null;
}) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("apple_notification_receipts")
    .update({
      processed_status: params.processedStatus,
      last_error: params.lastError,
    })
    .eq("id", params.receiptId)
    .select(RECEIPT_SELECT)
    .single<AppleReceiptRecord>();

  if (error) {
    throw new ServiceError(
      "internal_error",
      "Failed to update Apple receipt processing state.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  return data;
}

async function autoReverseRefundEvent(params: {
  app: AppleIngestApp;
  receipt: AppleReceiptRecord;
  normalizedEvent: NormalizedEventRecord;
  decoded: DecodedAppleNotification;
}) {
  if (
    !params.decoded.originalTransactionId ||
    !["refund", "cancellation"].includes(params.normalizedEvent.event_type)
  ) {
    return;
  }

  const supabase = createServiceSupabaseClient();
  const { data: matchedEvent, error: matchError } = await supabase
    .from("normalized_events")
    .select("id, partner_id, promo_code_id, original_transaction_id")
    .eq("organization_id", params.app.organization_id)
    .eq("app_id", params.app.id)
    .eq("original_transaction_id", params.decoded.originalTransactionId)
    .eq("attribution_status", "attributed")
    .neq("id", params.normalizedEvent.id)
    .order("event_at", { ascending: false })
    .limit(1)
    .maybeSingle<RefundMatchRow>();

  if (matchError || !matchedEvent?.partner_id) {
    return;
  }

  await supabase
    .from("normalized_events")
    .update({
      partner_id: matchedEvent.partner_id,
      promo_code_id: matchedEvent.promo_code_id,
      attribution_status: "attributed",
    })
    .eq("organization_id", params.app.organization_id)
    .eq("id", params.normalizedEvent.id);

  const { data: ledgerRows, error: ledgerError } = await supabase
    .from("commission_ledger_entries")
    .select("id, chain_id, currency, amount, transition_type")
    .eq("organization_id", params.app.organization_id)
    .eq("normalized_event_id", matchedEvent.id)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<RefundLedgerRow[]>();

  if (ledgerError || !ledgerRows?.length) {
    return;
  }

  const latestApprovedOrPaid =
    ledgerRows.find((row) => row.transition_type === "paid") ??
    ledgerRows.find((row) => row.transition_type === "reserved") ??
    ledgerRows.find((row) => row.transition_type === "approved") ??
    null;

  if (!latestApprovedOrPaid) {
    return;
  }

  await supabase.rpc("reverse_commission_for_refund", {
    target_organization_id: params.app.organization_id,
    target_chain_id: latestApprovedOrPaid.chain_id,
    target_event_id: params.normalizedEvent.id,
    target_amount: typeof latestApprovedOrPaid.amount === "string" ? Number(latestApprovedOrPaid.amount) : latestApprovedOrPaid.amount,
    target_currency: latestApprovedOrPaid.currency,
    target_note: `Auto reversal from ${params.normalizedEvent.event_type} receipt ${params.receipt.id}.`,
    target_metadata: {
      reversal_source: "apple_notification",
      receipt_id: params.receipt.id,
      original_transaction_id: params.decoded.originalTransactionId,
    },
  });
}

export async function resolveAppByIngestKey(ingestKey: string) {
  const normalizedKey = normalizeText(ingestKey, 255);

  if (!normalizedKey) {
    throw new ServiceError("not_found", "Apple ingest target was not found.", {
      status: 404,
    });
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("apps")
    .select(APP_SELECT)
    .eq("ingest_key", normalizedKey)
    .maybeSingle<AppleIngestApp>();

  if (error) {
    throw new ServiceError(
      "internal_error",
      "Failed to resolve the Apple ingest target.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  if (!data) {
    throw new ServiceError("not_found", "Apple ingest target was not found.", {
      status: 404,
    });
  }

  return data;
}

export async function storeAppleReceipt(
  input: StoreAppleReceiptInput,
): Promise<StoreAppleReceiptResult> {
  const decoded = await inspectAppleSignedPayload(input.signedPayload, input.app);
  const payloadHash = createPayloadHash(input.signedPayload);
  const dedupeKey = createReceiptDedupeKey(decoded, payloadHash);
  const supabase = createServiceSupabaseClient();

  const { data, error } = await supabase
    .from("apple_notification_receipts")
    .insert({
      organization_id: input.app.organization_id,
      app_id: input.app.id,
      notification_uuid: decoded.notificationUuid,
      notification_type: decoded.notificationType ?? "unknown",
      notification_subtype: decoded.notificationSubtype,
      environment: decoded.environment,
      signed_payload: input.signedPayload,
      original_transaction_id: decoded.originalTransactionId,
      processed_status: decoded.failureReason ? "failed" : "pending",
      last_error: decoded.failureReason,
      request_id: input.requestId,
      payload_hash: payloadHash,
      verification_status: decoded.verificationStatus,
      dedupe_key: dedupeKey,
    })
    .select(RECEIPT_SELECT)
    .single<AppleReceiptRecord>();

  if (error) {
    if (error.code === "23505") {
      const existingReceipt = await readReceiptByDedupeKey({
        organizationId: input.app.organization_id,
        appId: input.app.id,
        dedupeKey,
      });

      if (!existingReceipt) {
        throw new ServiceError(
          "internal_error",
          "Apple receipt dedupe matched, but the stored receipt could not be read.",
          {
            status: 500,
          },
        );
      }

      return {
        receipt: existingReceipt,
        duplicate: true,
        decoded,
      };
    }

    throw new ServiceError(
      "internal_error",
      "Failed to store the Apple receipt.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  return {
    receipt: data,
    duplicate: false,
    decoded,
  };
}

export async function normalizeAppleReceiptToEvent(
  input: NormalizeAppleReceiptInput,
): Promise<NormalizeAppleReceiptResult> {
  const notificationType = input.decoded.notificationType;
  const eventType = deriveNormalizedEventType(notificationType);
  const sourceEventKey =
    input.receipt.notification_uuid ??
    input.receipt.dedupe_key ??
    input.receipt.payload_hash;

  if (!input.decoded.payload || !sourceEventKey) {
    return {
      status: "skipped",
      normalizedEvent: null,
      processingStatus: input.decoded.failureReason ? "failed" : "pending",
      failureReason:
        input.decoded.failureReason ?? "missing_notification_identity",
    };
  }

  if (!eventType) {
    return {
      status: "skipped",
      normalizedEvent: null,
      processingStatus: "pending",
      failureReason: "missing_notification_type",
    };
  }

  const eventStatus = deriveNormalizedEventStatus(notificationType);
  const attributionStatus = deriveAttributionStatus(eventStatus);
  const reasonCode =
    notificationType === "TEST"
      ? "test_notification"
      : input.receipt.verification_status === "failed"
        ? "verification_failed"
        : null;
  const occurredAt = input.decoded.occurredAt ?? input.receipt.received_at;
  const supabase = createServiceSupabaseClient();

  const payload = {
    notificationType,
    notificationSubtype: input.decoded.notificationSubtype,
    verificationStatus: input.receipt.verification_status,
    notificationUuid: input.receipt.notification_uuid,
    requestId: input.receipt.request_id,
    receiptId: input.receipt.id,
    rawClaimsAvailable: {
      notificationPayload: Boolean(input.decoded.payload),
      transactionPayload: Boolean(input.decoded.transactionPayload),
    },
  };

  const { data, error } = await supabase
    .from("normalized_events")
    .insert({
      organization_id: input.app.organization_id,
      app_id: input.app.id,
      apple_notification_receipt_id: input.receipt.id,
      source_type: "apple_notification",
      source_event_key: sourceEventKey,
      event_type: eventType,
      event_status: eventStatus,
      attribution_status: attributionStatus,
      environment: input.decoded.environment,
      transaction_id: input.decoded.transactionId,
      original_transaction_id: input.decoded.originalTransactionId,
      web_order_line_item_id: input.decoded.webOrderLineItemId,
      product_id: input.decoded.productId,
      offer_identifier: input.decoded.offerIdentifier,
      amount_minor: input.decoded.amountMinor,
      currency: input.decoded.currency,
      gross_amount: input.decoded.grossAmount,
      net_amount: input.decoded.netAmount,
      event_at: occurredAt,
      received_at: input.receipt.received_at,
      reason_code: reasonCode,
      payload,
    })
    .select(EVENT_SELECT)
    .single<NormalizedEventRecord>();

  if (error) {
    if (error.code === "23505") {
      const existingEvent = await readNormalizedEventBySourceEventKey({
        organizationId: input.app.organization_id,
        sourceEventKey,
      });

      if (!existingEvent) {
        throw new ServiceError(
          "internal_error",
          "Apple event dedupe matched, but the normalized event could not be read.",
          {
            status: 500,
          },
        );
      }

      return {
        status: "existing",
        normalizedEvent: existingEvent,
        processingStatus:
          existingEvent.event_status === "ignored" ? "ignored" : "processed",
        failureReason: existingEvent.reason_code,
      };
    }

    throw new ServiceError(
      "internal_error",
      "Failed to normalize the Apple receipt.",
      {
        status: 500,
        details: {
          message: error.message,
        },
      },
    );
  }

  return {
    status: "created",
    normalizedEvent: data,
    processingStatus: eventStatus === "ignored" ? "ignored" : "processed",
    failureReason: reasonCode,
  };
}

export async function processAppleNotificationReceipt(
  input: ProcessAppleNotificationReceiptInput,
): Promise<ProcessAppleNotificationReceiptResult> {
  const app = await resolveAppByIngestKey(input.ingestKey);
  const stored = await storeAppleReceipt({
    app,
    requestId: input.requestId,
    signedPayload: input.signedPayload,
  });

  let receipt = stored.receipt;
  let normalizedEventId: string | null = null;

  if (
    !stored.duplicate ||
    receipt.processed_status === "pending" ||
    receipt.processed_status === "failed"
  ) {
    const normalization = await normalizeAppleReceiptToEvent({
      app,
      receipt,
      decoded: stored.decoded,
    });

    normalizedEventId = normalization.normalizedEvent?.id ?? null;

    if (normalization.normalizedEvent) {
      await autoReverseRefundEvent({
        app,
        receipt,
        normalizedEvent: normalization.normalizedEvent,
        decoded: stored.decoded,
      });
    }

    if (
      normalization.processingStatus !== receipt.processed_status ||
      normalization.failureReason !== receipt.last_error
    ) {
      receipt = await updateReceiptProcessingState({
        receiptId: receipt.id,
        processedStatus: normalization.processingStatus,
        lastError: normalization.failureReason,
      });
    }
  } else {
    const sourceEventKey =
      receipt.notification_uuid ?? receipt.dedupe_key ?? receipt.payload_hash;

    if (sourceEventKey) {
      const existingEvent = await readNormalizedEventBySourceEventKey({
        organizationId: app.organization_id,
        sourceEventKey,
      });

      normalizedEventId = existingEvent?.id ?? null;
    }
  }

  return {
    requestId: input.requestId,
    app: {
      id: app.id,
      slug: app.slug,
      name: app.name,
    },
    receipt: {
      id: receipt.id,
      notification_uuid: receipt.notification_uuid,
      notification_type: receipt.notification_type,
      notification_subtype: receipt.notification_subtype,
      environment: receipt.environment,
      processed_status: receipt.processed_status,
      verification_status: receipt.verification_status,
      received_at: receipt.received_at,
      last_error: receipt.last_error,
    },
    normalizedEventId,
    duplicate: stored.duplicate,
  };
}
