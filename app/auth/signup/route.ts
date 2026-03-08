import { serviceErrorJson, serviceJson } from "@/lib/services/envelope";
import { ServiceError } from "@/lib/services/errors";
import { getRequestId } from "@/lib/services/request-id";
import { createServiceSupabaseClient } from "@/lib/service-supabase";

type SignupBody = {
  fullName?: string;
  email?: string;
  password?: string;
  organizationName?: string;
};

function normalizeRequiredText(value: string | undefined, field: string, maxLength = 120) {
  const normalized = value?.trim() ?? "";

  if (!normalized) {
    throw new ServiceError("validation_error", `${field} is required.`, {
      status: 400,
    });
  }

  return normalized.slice(0, maxLength);
}

function normalizeEmail(value: string | undefined) {
  const normalized = normalizeRequiredText(value, "Email", 320).toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new ServiceError("validation_error", "Invalid email address.", {
      status: 400,
    });
  }

  return normalized;
}

function validatePassword(value: string | undefined) {
  const password = normalizeRequiredText(value, "Password", 120);

  if (password.length < 10) {
    throw new ServiceError("validation_error", "Password must be at least 10 characters.", {
      status: 400,
    });
  }

  return password;
}

export async function POST(request: Request) {
  const requestId = await getRequestId(request);

  try {
    const body = (await request.json()) as SignupBody;
    const fullName = normalizeRequiredText(body.fullName, "Full name");
    const email = normalizeEmail(body.email);
    const password = validatePassword(body.password);
    const organizationName = normalizeRequiredText(
      body.organizationName,
      "Organization name",
      160,
    );
    const serviceSupabase = createServiceSupabaseClient();
    let createdUserId: string | null = null;

    try {
      const { data: createdUser, error: createUserError } =
        await serviceSupabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: {
            full_name: fullName,
            name: fullName,
          },
        });

      if (createUserError || !createdUser.user) {
        throw new ServiceError("internal_error", "Failed to create the owner account.", {
          status: 500,
          details: { message: createUserError?.message ?? "Missing created user." },
        });
      }

      createdUserId = createdUser.user.id;

      const { data: organizationId, error: bootstrapError } = await serviceSupabase.rpc(
        "create_organization_with_owner",
        {
          owner_user_id: createdUser.user.id,
          organization_name: organizationName,
          organization_slug: null,
        },
      );

      if (bootstrapError || !organizationId) {
        throw new ServiceError("internal_error", "Failed to create the workspace.", {
          status: 500,
          details: { message: bootstrapError?.message ?? "Missing organization id." },
        });
      }

      return serviceJson(
        {
          userId: createdUser.user.id,
          organizationId,
          email,
        },
        {
          requestId,
          status: 201,
        },
      );
    } catch (error) {
      if (createdUserId) {
        await serviceSupabase.auth.admin.deleteUser(createdUserId).catch(() => undefined);
      }

      throw error;
    }
  } catch (error) {
    return serviceErrorJson(error, { requestId });
  }
}
