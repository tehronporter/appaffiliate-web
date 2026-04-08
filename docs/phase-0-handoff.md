# Phase 0 Handoff

This document is the lightweight developer handoff for the current Phase 0 state.

## What Phase 0 Includes

- Public homepage and route shell
- Placeholder routes for the main product areas
- Supabase email/password login
- Protected `/dashboard`
- Workspace foundation:
  - `organizations`
  - `roles`
  - `organization_memberships`
  - `partner_users`
- Product baseline tables for apps, partners, attribution, commission storage, payouts, jobs, idempotency, and audit logs
- RLS hardening for tenant isolation and role-aware reads
- Service-layer helpers for:
  - request IDs
  - consistent service envelopes
  - service errors
  - audit logging
  - idempotency keys

## What Phase 0 Does Not Include

- Full partner portal behavior
- Billing
- Real commission calculation engine
- Real payout calculation engine
- Rich admin CRUD flows
- Full write APIs across the product
- Organization switching
- Role management UI
- Password reset, invites, or signup UX

## Current App Flow

1. `/` is public.
2. `/login` supports Supabase email/password sign-in.
3. `/dashboard` is protected and redirects to `/login?redirectTo=/dashboard` when unauthenticated.
4. Placeholder product pages exist for:
   - `/onboarding`
   - `/partners`
   - `/codes`
   - `/unattributed`
   - `/commissions`
   - `/payout-batches`
   - `/apps/[appId]/apple-health`

## Current Migration Set

Apply these in order:

1. `supabase/migrations/20260306123000_phase0_workspace_foundation.sql`
2. `supabase/migrations/20260306133000_phase0_product_baseline.sql`
3. `supabase/migrations/20260306143000_phase0_rls_hardening.sql`
4. `supabase/migrations/20260306153000_phase0_service_foundation_policies.sql`

## How To Apply SQL Migrations Manually In Supabase

Option 1: Supabase SQL Editor

1. Open your Supabase project.
2. Go to `SQL Editor`.
3. Open the migration file from this repo.
4. Paste the SQL into a new query.
5. Run the migration.
6. Repeat in filename order.

Option 2: Supabase CLI

Use the Supabase CLI only if your local environment is already configured for it. This repo does not depend on adding new CLI setup for Phase 0 handoff.

## Demo Workspace Notes

The Prompt 03 migration seeds the `appaffiliate-demo` organization and includes:

- baseline roles
- `bootstrap_phase0_demo_workspace(owner_user_id uuid)`

Use that function after creating your first auth user if the demo owner membership still needs to be attached.

## Helpful Files

- `app/login/page.tsx`
- `app/dashboard/page.tsx`
- `lib/auth.ts`
- `lib/workspace.ts`
- `lib/services/context.ts`
- `lib/services/audit.ts`
- `lib/services/idempotency.ts`
- `app/auth/session/route.ts`

## Suggested Next Work After Phase 0

1. Add first real internal write routes or server actions for one narrow domain.
2. Start with apps or partners CRUD before touching commissions or payouts.
3. Keep audit and idempotency patterns in every new write path.
4. Expand authorization carefully instead of adding broad bypasses.
