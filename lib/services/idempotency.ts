import { ServiceError } from "@/lib/services/errors";
import type { ServiceContext } from "@/lib/services/context";

type IdempotencyStatus = "started" | "completed" | "failed";

type IdempotencyRecord = {
  id: string;
  organization_id: string;
  key: string;
  request_scope: string;
  status: IdempotencyStatus;
  request_hash: string | null;
  resource_type: string | null;
  resource_id: string | null;
  response_code: number | null;
  expires_at: string | null;
};

type ReserveIdempotencyKeyInput = {
  organizationId: string;
  key: string;
  requestScope: string;
  requestHash?: string;
  expiresAt?: string | null;
};

type CompleteIdempotencyKeyInput = {
  organizationId: string;
  key: string;
  resourceType?: string | null;
  resourceId?: string | null;
  responseCode?: number | null;
  status?: Extract<IdempotencyStatus, "completed" | "failed">;
};

function normalizeIdempotencyKey(key: string) {
  const normalizedKey = key.trim();

  if (!normalizedKey) {
    throw new ServiceError(
      "validation_error",
      "Idempotency key is required.",
      {
        status: 400,
      },
    );
  }

  return normalizedKey.slice(0, 200);
}

async function getExistingIdempotencyRecord(
  context: ServiceContext,
  organizationId: string,
  key: string,
) {
  if (!context.supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const { data, error } = await context.supabase
    .from("idempotency_keys")
    .select(
      "id, organization_id, key, request_scope, status, request_hash, resource_type, resource_id, response_code, expires_at",
    )
    .eq("organization_id", organizationId)
    .eq("key", key)
    .maybeSingle<IdempotencyRecord>();

  if (error) {
    throw new ServiceError(
      "idempotency_key_failed",
      "Failed to read the idempotency key.",
      {
        status: 500,
        details: {
          requestId: context.requestId,
          message: error.message,
        },
      },
    );
  }

  return data;
}

export async function reserveIdempotencyKey(
  context: ServiceContext,
  input: ReserveIdempotencyKeyInput,
) {
  const key = normalizeIdempotencyKey(input.key);
  const existingRecord = await getExistingIdempotencyRecord(
    context,
    input.organizationId,
    key,
  );

  if (existingRecord) {
    return {
      status: "existing" as const,
      record: existingRecord,
      requestId: context.requestId,
    };
  }

  if (!context.supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const { data, error } = await context.supabase
    .from("idempotency_keys")
    .insert({
      organization_id: input.organizationId,
      key,
      request_scope: input.requestScope,
      request_hash: input.requestHash ?? null,
      status: "started",
      expires_at: input.expiresAt ?? null,
    })
    .select(
      "id, organization_id, key, request_scope, status, request_hash, resource_type, resource_id, response_code, expires_at",
    )
    .single<IdempotencyRecord>();

  if (error) {
    const existingAfterConflict = await getExistingIdempotencyRecord(
      context,
      input.organizationId,
      key,
    );

    if (existingAfterConflict) {
      return {
        status: "existing" as const,
        record: existingAfterConflict,
        requestId: context.requestId,
      };
    }

    throw new ServiceError(
      "idempotency_key_failed",
      "Failed to reserve the idempotency key.",
      {
        status: 500,
        details: {
          requestId: context.requestId,
          message: error.message,
        },
      },
    );
  }

  return {
    status: "created" as const,
    record: data,
    requestId: context.requestId,
  };
}

export async function completeIdempotencyKey(
  context: ServiceContext,
  input: CompleteIdempotencyKeyInput,
) {
  const key = normalizeIdempotencyKey(input.key);

  if (!context.supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const { data, error } = await context.supabase
    .from("idempotency_keys")
    .update({
      status: input.status ?? "completed",
      resource_type: input.resourceType ?? null,
      resource_id: input.resourceId ?? null,
      response_code: input.responseCode ?? null,
    })
    .eq("organization_id", input.organizationId)
    .eq("key", key)
    .select(
      "id, organization_id, key, request_scope, status, request_hash, resource_type, resource_id, response_code, expires_at",
    )
    .single<IdempotencyRecord>();

  if (error) {
    throw new ServiceError(
      "idempotency_key_failed",
      "Failed to update the idempotency key.",
      {
        status: 500,
        details: {
          requestId: context.requestId,
          message: error.message,
        },
      },
    );
  }

  return {
    record: data,
    requestId: context.requestId,
  };
}
