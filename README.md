# AppAffiliate Web

This repository contains the Phase 0 AppAffiliate web shell built with Next.js App Router, Tailwind CSS, and Supabase.

Phase 0 focuses on:

- a public homepage and placeholder product routes
- Supabase email/password auth
- a protected dashboard
- workspace and product baseline schema
- RLS hardening
- a small service-layer foundation for future writes

## Local Startup

1. Install dependencies:

```bash
npm install
```

2. Confirm `.env.local` already contains the expected Supabase values.

3. Start the app:

```bash
npm run dev
```

4. Open `http://localhost:3000`.

## Useful Commands

```bash
npm run dev
npm run build
npm run lint
```

## Phase 0 Docs

- [Phase 0 handoff](docs/phase-0-handoff.md)
- [Phase 0 QA checklist](docs/phase-0-qa-checklist.md)
- [Phase 0 known gaps](docs/phase-0-known-gaps.md)

## Current Project Shape

- `app/`: App Router pages and route handlers
- `components/`: shared shell and auth UI components
- `lib/`: auth, workspace, Supabase, and service-layer helpers
- `supabase/migrations/`: SQL migrations applied manually in Supabase
- `supabase/tests/`: SQL verification queries for RLS checks

## Manual Migration Files

Current Phase 0 migrations:

- `supabase/migrations/20260306123000_phase0_workspace_foundation.sql`
- `supabase/migrations/20260306133000_phase0_product_baseline.sql`
- `supabase/migrations/20260306143000_phase0_rls_hardening.sql`
- `supabase/migrations/20260306153000_phase0_service_foundation_policies.sql`

Apply them manually in Supabase in filename order if your database is not up to date.
