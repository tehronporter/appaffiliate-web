import type { PostgrestError } from "@supabase/supabase-js";

export const WORKSPACE_SETUP_ERROR_CODES = new Set(["42P01", "PGRST205", "42501", "42703"]);

export function isWorkspaceSetupError(error: PostgrestError | null) {
  if (!error?.code) {
    return false;
  }

  return WORKSPACE_SETUP_ERROR_CODES.has(error.code);
}

export function hasWorkspaceSetupError(
  errors: Array<PostgrestError | null | undefined>,
) {
  return errors.some((error) => isWorkspaceSetupError(error ?? null));
}
