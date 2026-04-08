import type { User } from "@supabase/supabase-js";

import { getAuthenticatedUser } from "@/lib/auth";
import { createAuthenticatedServerClient } from "@/lib/authenticated-supabase";
import { getWorkspaceContextForUser } from "@/lib/workspace";
import type { WorkspaceContext } from "@/lib/workspace-types";
import { ServiceError } from "@/lib/services/errors";
import { getRequestId } from "@/lib/services/request-id";

type ServiceContextOptions = {
  request?: Request;
  requireAuth?: boolean;
  requireOrganization?: boolean;
};

export type ServiceContext = {
  requestId: string;
  user: User | null;
  workspace: WorkspaceContext;
  supabase: Awaited<ReturnType<typeof createAuthenticatedServerClient>>;
};

function createEmptyWorkspaceContext(): WorkspaceContext {
  return {
    organization: null,
    membership: null,
    partnerUser: null,
    role: null,
    roles: [],
    source: "missing_setup",
  };
}

export async function createServiceContext(
  options: ServiceContextOptions = {},
): Promise<ServiceContext> {
  const requestId = await getRequestId(options.request);
  const user = await getAuthenticatedUser();

  if (options.requireAuth && !user) {
    throw new ServiceError("unauthenticated", "You must be signed in.", {
      status: 401,
    });
  }

  const workspace = user
    ? await getWorkspaceContextForUser(user)
    : createEmptyWorkspaceContext();

  if (options.requireOrganization && !workspace.organization) {
    throw new ServiceError(
      "forbidden",
      "No active organization membership was found for this user.",
      {
        status: 403,
      },
    );
  }

  return {
    requestId,
    user,
    workspace,
    supabase: user ? await createAuthenticatedServerClient() : null,
  };
}
