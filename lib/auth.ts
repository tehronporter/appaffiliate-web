import { cookies } from "next/headers";

import { createServerSupabaseClient } from "@/lib/server-supabase";

export const AUTH_COOKIE_NAME = "appaffiliate-access-token";

export async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return null;
  }

  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error) {
    return null;
  }

  return data.user;
}
