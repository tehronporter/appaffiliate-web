# Phase 2 Launch Runbook

Use this as the concise operator/developer runbook for deployment and internal launch review.

## Required Environment Variables

Confirm these values are present in the target environment before deploying:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not expose the service-role key in browser-facing code. Service-role helpers must stay server-only.

## Migration Apply Order

Apply SQL migrations in filename order:

1. `supabase/migrations/20260306123000_phase0_workspace_foundation.sql`
2. `supabase/migrations/20260306133000_phase0_product_baseline.sql`
3. `supabase/migrations/20260306143000_phase0_rls_hardening.sql`
4. `supabase/migrations/20260306153000_phase0_service_foundation_policies.sql`
5. `supabase/migrations/20260306170000_phase1_apple_ingestion_mvp.sql`
6. `supabase/migrations/20260307013000_phase2_manual_ops_write_policies.sql`
7. `supabase/migrations/20260307023000_phase2_finance_manual_write_policies.sql`
8. `supabase/migrations/20260307110000_phase2_settings_write_policies.sql`
9. `supabase/migrations/20260307143000_phase2_partner_portal_read_policies.sql`

If an environment is missing any migration, apply the missing files before app deploy smoke tests.

## Deploy Sequence

1. Confirm environment variables are present.
2. Apply missing migrations in filename order.
3. Deploy the app build.
4. Open `/dashboard`, `/onboarding`, and `/settings` with an internal account.
5. Open `/portal` with a partner-linked account if the portal is part of the launch scope.
6. Confirm audit, export, finance-sensitive, and portal surfaces still respect role boundaries.

## Apple Ingest Setup Reminder

- Confirm at least one app record exists.
- Confirm the app has an ingest key configured.
- Review `/settings/rules` and at least one `/apps/[appId]/apple-health` page.
- Confirm recent receipt health is readable and that browser-facing UI does not expose raw signed payloads.

## Finance Export And Payout Sequence

Use this sequence when preparing a payout cycle:

1. Review unattributed backlog so unresolved queue items are understood before finance review.
2. Review commission approvals and rejections.
3. Review draft and exported payout batches.
4. Download finance CSVs from `/settings/exports`.
5. Complete remittance outside the product.
6. Confirm the relevant finance/manual actions appear in audit history.

Downloading a CSV does not mark a payout complete.

## Launch Smoke-Test Checklist

- `/dashboard` shows a real launch summary.
- `/onboarding` shows live checklist data instead of setup placeholder copy.
- `/settings` shows launch status, billing posture, and runbook reminders.
- `/settings/organization` persists allowed org fields successfully.
- `/settings/team` shows real membership context and safe role controls only.
- `/settings/rules` and `/settings/audit` load live operational data.
- `/settings/exports` remains finance-scoped.
- `/partners`, `/codes`, `/unattributed`, `/commissions`, `/payouts`, and `/payout-batches` render honest empty states and clear notices.
- `/apps/[appId]/apple-health` and `/events` show sanitized operator-safe receipt/event information.
- `/portal`, `/portal/codes`, `/portal/performance`, and `/portal/payouts` stay read-only and only show partner-scoped data for linked partner users.
