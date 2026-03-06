import { NextResponse } from "next/server";

import { applyRequestIdHeader } from "@/lib/services/request-id";
import { isServiceError } from "@/lib/services/errors";

type EnvelopeMeta = {
  requestId: string;
};

export type SuccessEnvelope<T> = {
  ok: true;
  data: T;
  meta: EnvelopeMeta;
};

export type ErrorEnvelope = {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: EnvelopeMeta;
};

export function createSuccessEnvelope<T>(
  data: T,
  requestId: string,
): SuccessEnvelope<T> {
  return {
    ok: true,
    data,
    meta: {
      requestId,
    },
  };
}

export function createErrorEnvelope(
  error: unknown,
  requestId: string,
): {
  body: ErrorEnvelope;
  status: number;
} {
  if (isServiceError(error)) {
    return {
      body: {
        ok: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        meta: {
          requestId,
        },
      },
      status: error.status,
    };
  }

  return {
    body: {
      ok: false,
      error: {
        code: "internal_error",
        message: "Something went wrong.",
      },
      meta: {
        requestId,
      },
    },
    status: 500,
  };
}

export function serviceJson<T>(
  data: T,
  options: {
    requestId: string;
    status?: number;
  },
) {
  const response = NextResponse.json(createSuccessEnvelope(data, options.requestId), {
    status: options.status ?? 200,
  });

  return applyRequestIdHeader(response, options.requestId);
}

export function serviceErrorJson(
  error: unknown,
  options: {
    requestId: string;
  },
) {
  const envelope = createErrorEnvelope(error, options.requestId);
  const response = NextResponse.json(envelope.body, {
    status: envelope.status,
  });

  return applyRequestIdHeader(response, options.requestId);
}
