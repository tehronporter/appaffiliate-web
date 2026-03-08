# AppAffiliate Web

This repository contains the internal AppAffiliate MVP built with Next.js App Router, Tailwind CSS, and Supabase.

The current operator-facing product includes:

- Apple ingestion visibility and per-app readiness checks
- creators, codes, and review queue workflows
- earnings, payouts, payout batches, and finance exports
- org-scoped settings, audit history, team context, and lightweight monitoring
- launch-readiness surfaces for internal rollout checks
- a separate read-only partner portal for partner-scoped codes, performance, and payouts

The external partner portal remains intentionally separate from the admin workspace and stays read-only in the current MVP.

## Local Startup

1. Install dependencies:

```bash
npm install
```

2. Confirm `.env.local` contains the expected values:

```bash
NEXT_PUBLIC_APP_URL=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
APPLE_ROOT_CA_BASE64=TODO_BASE64_APPLE_ROOT_CA
APPLE_ENABLE_ONLINE_CHECKS=false
```

If Apple verification is not configured yet, leave the placeholder value in place so the UI stays honest and shows setup attention instead of a false ready state.

3. Apply any missing SQL migrations in filename order.

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
npm run typecheck
```

## Local Public URL

For real webhook testing, expose port `3000` publicly and set `NEXT_PUBLIC_APP_URL` to that URL.

Example with ngrok after configuring your authtoken:

```bash
ngrok config add-authtoken <your-ngrok-authtoken>
ngrok http 3000
```

Then update `.env.local`:

```bash
NEXT_PUBLIC_APP_URL=https://<your-public-subdomain>.ngrok-free.app
```

## Operator Docs

- [Phase A brand translation](docs/phase-a-brand-translation.md)
- [Phase B information architecture](docs/phase-b-information-architecture.md)
- [Phase C messaging and copy strategy](docs/phase-c-messaging-copy-strategy.md)
- [Phase J design system notes](docs/phase-j-design-system-notes.md)
- [Phase L launch design review](docs/phase-l-launch-design-review.md)
- [Final MVP handoff](docs/final-mvp-handoff.md)
- [Final MVP limitations](docs/final-mvp-limitations.md)
- [Phase 2 launch runbook](docs/phase-2-launch-runbook.md)
- [Phase 2 QA checklist](docs/phase-2-qa-checklist.md)

Historical reference:

- [Phase 0 handoff](docs/phase-0-handoff.md)
- [Phase 0 QA checklist](docs/phase-0-qa-checklist.md)
- [Phase 0 known gaps](docs/phase-0-known-gaps.md)

## Current Project Shape

- `app/`: App Router pages and route handlers
- `components/`: shared shell, auth, and operator UI components
- `lib/`: auth, workspace, Supabase, and service-layer helpers
- `docs/`: lightweight runbooks and QA checklists
- `supabase/migrations/`: SQL migrations applied manually in Supabase
- `supabase/tests/`: SQL verification queries for RLS checks

## Manual Migration Files

Apply these in filename order when bringing up a new environment or reconciling a stale database:

- `supabase/migrations/20260306123000_phase0_workspace_foundation.sql`
- `supabase/migrations/20260306133000_phase0_product_baseline.sql`
- `supabase/migrations/20260306143000_phase0_rls_hardening.sql`
- `supabase/migrations/20260306153000_phase0_service_foundation_policies.sql`
- `supabase/migrations/20260306170000_phase1_apple_ingestion_mvp.sql`
- `supabase/migrations/20260307013000_phase2_manual_ops_write_policies.sql`
- `supabase/migrations/20260307023000_phase2_finance_manual_write_policies.sql`
- `supabase/migrations/20260307110000_phase2_settings_write_policies.sql`
- `supabase/migrations/20260307143000_phase2_partner_portal_read_policies.sql`
- `supabase/migrations/20260308010000_workspace_billing_states.sql`

## Launch Notes

- Keep service-role usage server-only.
- Verify Apple ingest setup, unattributed backlog, finance review queues, payout batch posture, and export access before launch.
- Billing is not active in-product; treat it as an off-platform planning concern until a real billing model exists.
