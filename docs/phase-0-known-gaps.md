# Phase 0 Known Gaps

This list is intentionally blunt so future work stays organized.

## Product Gaps

- Most product routes are still placeholders
- No real app CRUD yet
- No real partner CRUD yet
- No promo code management UI yet
- No live attribution review workflow yet
- No real commission rule management yet
- No real payout batching workflow yet

## Auth And Access Gaps

- Login is email/password only
- No signup flow
- No password reset flow
- No invite acceptance flow
- No org switching
- No role management UI
- Authorization is still Phase 0 and mostly read-focused

## Data And Operations Gaps

- Product tables exist, but most are not yet used by live UI or write paths
- No ingestion jobs wired to Apple notifications yet
- No normalized event pipeline yet
- No commission calculation engine yet
- No payout calculation or export logic yet
- No retention or archival jobs yet

## Service Layer Gaps

- Audit and idempotency helpers exist, but no major write endpoints use them yet
- No shared job runner abstraction yet
- No shared validation layer yet
- No central logging/observability integration yet

## Testing Gaps

- No automated unit tests yet
- No automated integration tests yet
- RLS verification is still manual SQL
- No end-to-end browser checks yet

## Recommended Next Steps

1. Build one narrow internal write flow end-to-end.
2. Reuse the service context, audit helper, idempotency helper, and request IDs.
3. Add tests as soon as the first real write path lands.
4. Keep permissions specific by table and action instead of broadening access globally.
