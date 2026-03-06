# Phase 0 QA Checklist

Use this as a simple manual QA pass before handoff or before starting Phase 1 work.

## Environment

- `npm install` completes successfully
- `.env.local` is present and uses the expected Supabase project values
- `npm run dev` starts without obvious runtime errors
- `npm run build` succeeds

## Public Routes

- `/` loads correctly
- Homepage navigation links open the expected placeholder routes
- Placeholder pages share the same shell styling

## Auth Flow

- `/login` loads correctly
- Invalid credentials show a readable error message
- Valid credentials sign in successfully
- Signed-in users reaching `/login` are redirected to `/dashboard`
- Signing out returns the user to `/login`

## Protected Route Behavior

- Visiting `/dashboard` while signed out redirects to `/login?redirectTo=/dashboard`
- Visiting `/dashboard` while signed in succeeds
- Dashboard still renders placeholder content even if no workspace records are found

## Workspace And Schema Readiness

- Prompt 03 through Prompt 07 migrations have been applied in order
- The demo organization exists
- The test auth user has an active membership in the demo organization
- Dashboard shows workspace-aware placeholder information once membership exists

## RLS Verification

- Run `supabase/tests/phase0_prompt05_rls_verification.sql` manually with real UUIDs
- Confirm cross-organization reads are denied
- Confirm partner users only see narrow allowed records
- Confirm finance-sensitive tables are not broadly visible

## Service Foundation

- `/auth/session` still works for session sync and sign-out
- Responses from `/auth/session` now include an `x-request-id` header
- Audit and idempotency helper files are present for future writes

## Handoff Readiness

- README reflects the current project instead of the default Next.js template
- `docs/phase-0-handoff.md` is up to date
- `docs/phase-0-known-gaps.md` matches the current deferred scope
