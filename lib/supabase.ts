import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserSupabaseClient: SupabaseClient | null = null;

function getRequiredBrowserEnv(
  name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY",
) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Missing required browser Supabase environment variable: ${name}`,
    );
  }

  return value;
}

export function getBrowserSupabaseClient() {
  if (browserSupabaseClient) {
    return browserSupabaseClient;
  }

  browserSupabaseClient = createClient(
    getRequiredBrowserEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredBrowserEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  );

  return browserSupabaseClient;
}
