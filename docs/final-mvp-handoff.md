# Final MVP Handoff

Use this as the final launch and operational handoff for the current AppAffiliate MVP.

## Current MVP Capabilities

- Public marketing shell at `/`
- Supabase email/password sign-in with a synced server cookie
- Internal admin workspace with explicit role checks
- Apple notification ingest endpoint and receipt health visibility
- App-level Apple health/readiness views
- Partner directory and code ownership management
- Manual review queue workflow
- Attribution-aware event inspection with sanitized browser output
- Commission review and approval/rejection workflow
- Payout-ready grouping and payout batch tracking
- Finance CSV export flow with permission checks and audit logging
- Org settings, team visibility, rules context, exports, and audit surfaces
- Lightweight launch-readiness and operations summary surfaces
- Separate read-only partner portal for linked partner users

## Required Environment Variables

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Keep the service-role key server-only.

## Migration Inventory

Apply SQL migrations in this order for a fresh environment:

1. `supabase/migrations/20260306123000_phase0_workspace_foundation.sql`
2. `supabase/migrations/20260306133000_phase0_product_baseline.sql`
3. `supabase/migrations/20260306143000_phase0_rls_hardening.sql`
4. `supabase/migrations/20260306153000_phase0_service_foundation_policies.sql`
5. `supabase/migrations/20260306170000_phase1_apple_ingestion_mvp.sql`
6. `supabase/migrations/20260307013000_phase2_manual_ops_write_policies.sql`
7. `supabase/migrations/20260307023000_phase2_finance_manual_write_policies.sql`
8. `supabase/migrations/20260307110000_phase2_settings_write_policies.sql`
9. `supabase/migrations/20260307143000_phase2_partner_portal_read_policies.sql`
10. `supabase/migrations/20260308010000_workspace_billing_states.sql`

## Production Setup Checklist

1. Confirm all required environment variables are present.
2. Apply any missing migrations in filename order.
3. Confirm at least one internal owner/admin account exists.
4. Confirm at least one app record exists if Apple ingest is in scope.
5. Confirm partner mappings exist if the partner portal is in scope.
6. Deploy the current app build.
7. Run the launch smoke checklist below before calling the environment launch-ready.

## Launch Smoke Checklist

- `/` and `/login` load correctly when signed out.
- `/dashboard`, `/setup`, `/creators`, `/codes`, `/review`, `/events`, `/earnings`, `/payouts`, `/payout-batches`, `/settings`, `/settings/organization`, `/settings/team`, `/settings/rules`, `/settings/exports`, and `/settings/audit` render for an internal admin account.
- `/apps/[appId]/apple-health` renders for at least one real app slug.
- `/portal`, `/portal/codes`, `/portal/performance`, and `/portal/payouts` render as a sign-in boundary when signed out.
- Portal routes render partner-scoped read-only data for a linked `partner_user` account.
- Portal routes render a portal boundary state, not partner data, for internal admin users.
- Finance exports remain restricted to owner/admin/finance roles.
- Browser-facing routes do not expose raw Apple signed payloads.

## Rollback And Recovery Notes

- This MVP uses additive migrations; if a deploy regresses, first roll the application back to the previous known-good build.
- Do not drop tables or revert migrations destructively during a launch incident unless you have an explicit database recovery plan.
- If the partner portal mapping is incomplete, leave `partner_users.partner_id` null and keep those users in the honest portal boundary state until manual mapping is finished.
- If Apple ingest is unstable, use the audit/monitoring and Apple health surfaces first before changing schema or route behavior.

## Final Audit Notes

- Internal routes and portal routes render separately and maintain their role boundaries.
- Admin and finance-sensitive actions remain server-side and audited.
- The portal is intentionally read-only and does not replace internal finance operations.
