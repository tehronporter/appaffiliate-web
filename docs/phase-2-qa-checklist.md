# Phase 2 QA Checklist

Use this checklist for a targeted manual smoke pass across the internal MVP.

## Environment

- `npm run lint` succeeds.
- `npm run build` succeeds.
- Required Supabase environment variables are present.
- The target database has all migrations through `20260307110000_phase2_settings_write_policies.sql`.

## Core Internal Routes

- `/dashboard` loads and shows live launch-readiness data.
- `/onboarding` loads and shows real checklist rows and operational counts.
- `/settings` loads launch summary, billing posture, and settings links.
- `/settings/organization` loads org-scoped data and persists safe edits.
- `/settings/team` shows real workspace members and honest role/update boundaries.
- `/settings/rules` shows live rule/config context or honest read-only states.
- `/settings/audit` shows real activity history.
- `/settings/exports` shows real export counts for finance roles and an honest access-required state for other roles.
- `/portal`, `/portal/codes`, `/portal/performance`, and `/portal/payouts` show partner-safe read-only states and do not expose admin controls.

## Apple And Ops Visibility

- `/apps/[appId]/apple-health` renders for a valid app and shows current readiness/receipt state.
- `/events` renders sanitized event metadata without exposing raw signed receipt payloads.
- A missing or quiet app lane shows an honest empty state instead of a broken view.

## Partner And Attribution Flows

- `/partners` renders existing partners and a calm empty state if none exist.
- `/codes` renders existing codes and any related partner/code context.
- `/unattributed` renders queue counts, review states, and honest zero-backlog messaging.

## Finance Flows

- `/commissions` renders current review states and action feedback.
- `/payouts` renders payout readiness and honest no-data states.
- `/payout-batches` renders draft/exported/completed posture correctly.
- Export downloads remain available only to owner, admin, or finance roles.
- Partner portal pages remain read-only and do not expose exports, audit history, internal notes, or raw Apple data.

## Role Boundaries And Auditing

- Low-permission or non-internal users see access-required states on internal settings/finance routes.
- Internal owner/admin accounts hitting portal routes see the portal boundary state instead of partner data.
- Manual attribution, finance review, payout-batch, and export actions still create audit history.
- Organization and team actions remain org-scoped and permission-checked.

## Copy And Operator Feedback

- No core internal route still describes itself as a setup placeholder or early-phase shell.
- Empty states explain what the operator should do next.
- Error or access messaging is specific enough to distinguish permission issues from missing data.
