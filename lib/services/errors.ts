export type ServiceErrorCode =
  | "bad_request"
  | "unauthenticated"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation_error"
  | "internal_error"
  | "audit_log_write_failed"
  | "idempotency_key_failed";

export class ServiceError extends Error {
  code: ServiceErrorCode;
  status: number;
  details?: unknown;

  constructor(
    code: ServiceErrorCode,
    message: string,
    options?: {
      status?: number;
      details?: unknown;
    },
  ) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.status = options?.status ?? 500;
    this.details = options?.details;
  }
}

export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}
