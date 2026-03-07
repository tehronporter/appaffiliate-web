import "server-only";

import { createServiceContext } from "@/lib/services/context";

export type EventOperationalState =
  | "attributed"
  | "unattributed"
  | "ignored"
  | "failed";

type NormalizedEventRow = {
  id: string;
  app_id: string | null;
  apple_notification_receipt_id: string | null;
  source_type: string;
  source_event_key: string | null;
  event_type: string;
  event_status: string;
  attribution_status: string;
  event_at: string;
  received_at: string | null;
  environment: string;
  transaction_id: string | null;
  original_transaction_id: string | null;
  web_order_line_item_id: string | null;
  product_id: string | null;
  offer_identifier: string | null;
  currency: string | null;
  amount_minor: number | null;
  reason_code: string | null;
  payload: Record<string, unknown> | null;
  created_at: string;
};

type AppRow = {
  id: string;
  slug: string;
  name: string;
  ingest_key: string | null;
  status: string;
};

type ReceiptRow = {
  id: string;
  received_at: string;
  environment: string | null;
  verification_status: string | null;
  processed_status: string | null;
  last_error: string | null;
  notification_type: string | null;
  notification_subtype: string | null;
  request_id: string | null;
};

export type WorkspaceEventView = {
  id: string;
  appName: string;
  appSlug: string | null;
  eventType: string;
  eventStatus: string;
  attributionStatus: string;
  state: EventOperationalState;
  sourceType: string;
  sourceEventKey: string | null;
  environment: string;
  occurredAt: string;
  receivedAt: string | null;
  transactionId: string | null;
  originalTransactionId: string | null;
  webOrderLineItemId: string | null;
  productId: string | null;
  offerIdentifier: string | null;
  currency: string | null;
  amountMinor: number | null;
  reasonCode: string | null;
  appleNotificationReceiptId: string | null;
  payload: Record<string, unknown>;
};

export type WorkspaceEventsData = {
  events: WorkspaceEventView[];
  stats: Record<Exclude<EventOperationalState, never>, number>;
  hasWorkspaceAccess: boolean;
};

export type AppleHealthReadinessData = {
  hasWorkspaceAccess: boolean;
  app: AppRow | null;
  latestReceipt: ReceiptRow | null;
  latestEvent: WorkspaceEventView | null;
  readinessLabel: string;
  readinessTone: "primary" | "success" | "warning";
  readinessDetail: string;
  warningNote: string | null;
  environmentLabel: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function mapOperationalState(row: NormalizedEventRow): EventOperationalState {
  if (row.event_status === "invalid") {
    return "failed";
  }

  if (row.event_status === "ignored" || row.attribution_status === "ignored") {
    return "ignored";
  }

  if (row.attribution_status === "attributed") {
    return "attributed";
  }

  return "unattributed";
}

function normalizePayload(value: Record<string, unknown> | null) {
  return value ?? {};
}

function normalizeTextLabel(value: string | null | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();

  return normalized || fallback;
}

function normalizeEnvironmentLabel(value: string | null | undefined) {
  const normalized = normalizeTextLabel(value, "unknown").toLowerCase();

  if (normalized === "sandbox" || normalized === "production") {
    return normalized;
  }

  return "unknown";
}

function toWorkspaceEventView(
  row: NormalizedEventRow,
  appsById: Map<string, AppRow>,
): WorkspaceEventView {
  const app = row.app_id ? appsById.get(row.app_id) ?? null : null;

  return {
    id: row.id,
    appName: app?.name ?? "Unknown app",
    appSlug: app?.slug ?? null,
    eventType: row.event_type,
    eventStatus: row.event_status,
    attributionStatus: row.attribution_status,
    state: mapOperationalState(row),
    sourceType: row.source_type,
    sourceEventKey: row.source_event_key,
    environment: row.environment,
    occurredAt: row.event_at,
    receivedAt: row.received_at,
    transactionId: row.transaction_id,
    originalTransactionId: row.original_transaction_id,
    webOrderLineItemId: row.web_order_line_item_id,
    productId: row.product_id,
    offerIdentifier: row.offer_identifier,
    currency: row.currency,
    amountMinor: row.amount_minor,
    reasonCode: row.reason_code,
    appleNotificationReceiptId: row.apple_notification_receipt_id,
    payload: normalizePayload(row.payload),
  };
}

export function formatOperationalTimestamp(value: string | null) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

async function resolveAppleHealthApp(
  context: Awaited<ReturnType<typeof createServiceContext>>,
  appIdentifier: string,
) {
  const normalizedIdentifier = appIdentifier.trim();

  if (!normalizedIdentifier) {
    return null;
  }

  if (UUID_PATTERN.test(normalizedIdentifier)) {
    const { data: appById, error: appByIdError } = await context.supabase!
      .from("apps")
      .select("id, slug, name, ingest_key, status")
      .eq("organization_id", context.workspace.organization!.id)
      .eq("id", normalizedIdentifier)
      .maybeSingle<AppRow>();

    if (appByIdError) {
      throw new Error(appByIdError.message);
    }

    if (appById) {
      return appById;
    }
  }

  const { data: appBySlug, error: appBySlugError } = await context.supabase!
    .from("apps")
    .select("id, slug, name, ingest_key, status")
    .eq("organization_id", context.workspace.organization!.id)
    .eq("slug", normalizedIdentifier)
    .maybeSingle<AppRow>();

  if (appBySlugError) {
    throw new Error(appBySlugError.message);
  }

  return appBySlug;
}

export async function listWorkspaceNormalizedEvents() {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      events: [],
      stats: {
        attributed: 0,
        unattributed: 0,
        ignored: 0,
        failed: 0,
      },
      hasWorkspaceAccess: false,
    } satisfies WorkspaceEventsData;
  }

  const { data: eventRows, error: eventError } = await context.supabase
    .from("normalized_events")
    .select(
      "id, app_id, apple_notification_receipt_id, source_type, source_event_key, event_type, event_status, attribution_status, event_at, received_at, environment, transaction_id, original_transaction_id, web_order_line_item_id, product_id, offer_identifier, currency, amount_minor, reason_code, payload, created_at",
    )
    .eq("organization_id", context.workspace.organization.id)
    .order("received_at", { ascending: false })
    .limit(80)
    .returns<NormalizedEventRow[]>();

  if (eventError) {
    throw new Error(eventError.message);
  }

  const appIds = Array.from(
    new Set(
      (eventRows ?? [])
        .map((eventRow) => eventRow.app_id)
        .filter((value): value is string => Boolean(value)),
    ),
  );

  let appsById = new Map<string, AppRow>();

  if (appIds.length > 0) {
    const { data: appRows, error: appError } = await context.supabase
      .from("apps")
      .select("id, slug, name, ingest_key, status")
      .in("id", appIds)
      .returns<AppRow[]>();

    if (appError) {
      throw new Error(appError.message);
    }

    appsById = new Map((appRows ?? []).map((app) => [app.id, app]));
  }

  const events = (eventRows ?? []).map((row) => toWorkspaceEventView(row, appsById));
  const stats = {
    attributed: events.filter((event) => event.state === "attributed").length,
    unattributed: events.filter((event) => event.state === "unattributed").length,
    ignored: events.filter((event) => event.state === "ignored").length,
    failed: events.filter((event) => event.state === "failed").length,
  };

  return {
    events,
    stats,
    hasWorkspaceAccess: true,
  } satisfies WorkspaceEventsData;
}

export async function getAppleHealthReadinessData(appIdentifier: string) {
  const context = await createServiceContext();

  if (!context.supabase || !context.workspace.organization) {
    return {
      hasWorkspaceAccess: false,
      app: null,
      latestReceipt: null,
      latestEvent: null,
      readinessLabel: "Workspace access required",
      readinessTone: "warning",
      readinessDetail:
        "Sign in to a workspace to review app-scoped Apple receipt readiness.",
      warningNote: null,
      environmentLabel: "Unknown",
    } satisfies AppleHealthReadinessData;
  }

  const app = await resolveAppleHealthApp(context, appIdentifier);

  if (!app) {
    return {
      hasWorkspaceAccess: true,
      app: null,
      latestReceipt: null,
      latestEvent: null,
      readinessLabel: "App record not found",
      readinessTone: "warning",
      readinessDetail:
        "No app row matched this workspace path yet, so receipt readiness cannot be evaluated.",
      warningNote: "Create the app row and assign an ingest key before Apple can post receipts here.",
      environmentLabel: "Unknown",
    } satisfies AppleHealthReadinessData;
  }

  const [latestReceiptResult, latestEventResult] = await Promise.all([
    context.supabase
      .from("apple_notification_receipts")
      .select(
        "id, received_at, environment, verification_status, processed_status, last_error, notification_type, notification_subtype, request_id",
      )
      .eq("app_id", app.id)
      .order("received_at", { ascending: false })
      .limit(1)
      .maybeSingle<ReceiptRow>(),
    context.supabase
      .from("normalized_events")
      .select(
        "id, app_id, apple_notification_receipt_id, source_type, source_event_key, event_type, event_status, attribution_status, event_at, received_at, environment, transaction_id, original_transaction_id, web_order_line_item_id, product_id, offer_identifier, currency, amount_minor, reason_code, payload, created_at",
      )
      .eq("app_id", app.id)
      .order("received_at", { ascending: false })
      .limit(1)
      .maybeSingle<NormalizedEventRow>(),
  ]);

  if (latestReceiptResult.error) {
    throw new Error(latestReceiptResult.error.message);
  }

  if (latestEventResult.error) {
    throw new Error(latestEventResult.error.message);
  }

  const appsById = new Map([[app.id, app]]);
  const latestEvent = latestEventResult.data
    ? toWorkspaceEventView(latestEventResult.data, appsById)
    : null;
  const latestReceipt = latestReceiptResult.data ?? null;

  if (!latestReceipt) {
    return {
      hasWorkspaceAccess: true,
      app,
      latestReceipt: null,
      latestEvent,
      readinessLabel: "Awaiting first receipt",
      readinessTone: "warning",
      readinessDetail:
        "No Apple notification receipt has been stored for this app yet.",
      warningNote:
        app.ingest_key === null
          ? "This app still needs an ingest key before Apple can target the public notification route."
          : null,
      environmentLabel: "Unknown",
    } satisfies AppleHealthReadinessData;
  }

  const environmentLabel = normalizeEnvironmentLabel(
    latestEvent?.environment ?? latestReceipt.environment,
  );
  const warningNote =
    latestReceipt.last_error ??
    (latestReceipt.verification_status === "placeholder_unverified"
      ? "Receipts are being stored, but Apple signature verification is still placeholder-only in this MVP."
      : null);

  if (latestEvent) {
    return {
      hasWorkspaceAccess: true,
      app,
      latestReceipt,
      latestEvent,
      readinessLabel: "Receiving receipts and normalized events",
      readinessTone: "success",
      readinessDetail:
        "Apple notifications are reaching the app and producing normalized event rows for operations review.",
      warningNote,
      environmentLabel,
    } satisfies AppleHealthReadinessData;
  }

  if (latestReceipt.processed_status === "failed") {
    return {
      hasWorkspaceAccess: true,
      app,
      latestReceipt,
      latestEvent: null,
      readinessLabel: "Receipt stored, review required",
      readinessTone: "warning",
      readinessDetail:
        "The latest receipt was stored durably, but normalization could not complete for the MVP path.",
      warningNote,
      environmentLabel,
    } satisfies AppleHealthReadinessData;
  }

  return {
    hasWorkspaceAccess: true,
    app,
    latestReceipt,
    latestEvent: null,
    readinessLabel: "Receipt intake active",
    readinessTone: "primary",
    readinessDetail:
      "The app has started receiving Apple receipts, but no normalized event has been produced yet.",
    warningNote,
    environmentLabel,
  } satisfies AppleHealthReadinessData;
}
