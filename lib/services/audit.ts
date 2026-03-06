import { ServiceError } from "@/lib/services/errors";
import type { ServiceContext } from "@/lib/services/context";

type AuditMetadata = Record<string, unknown>;

export type WriteAuditLogInput = {
  organizationId: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  summary: string;
  metadata?: AuditMetadata;
};

export async function writeAuditLog(
  context: ServiceContext,
  input: WriteAuditLogInput,
) {
  if (!context.supabase) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const actorUserId = context.user?.id ?? null;
  const actorMembershipId = context.workspace.membership?.id ?? null;

  const { data, error } = await context.supabase
    .from("audit_logs")
    .insert({
      organization_id: input.organizationId,
      actor_user_id: actorUserId,
      actor_membership_id: actorMembershipId,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      action: input.action,
      summary: input.summary,
      metadata: input.metadata ?? {},
    })
    .select("id")
    .single<{ id: string }>();

  if (error) {
    throw new ServiceError(
      "audit_log_write_failed",
      "Failed to write the audit log entry.",
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
    id: data.id,
    requestId: context.requestId,
  };
}
