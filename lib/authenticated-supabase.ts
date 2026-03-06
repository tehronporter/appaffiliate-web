import { getAccessToken } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/server-supabase";

export async function createAuthenticatedServerClient() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  return createServerSupabaseClient(accessToken);
}
