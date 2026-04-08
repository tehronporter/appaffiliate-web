# Final MVP Limitations

Use this as the honest limitations list for launch and handoff.

## Core MVP Limitations

- Billing is not active in-product.
- Tax forms, payout method collection, and remittance tooling are not implemented.
- Invite delivery still depends on Supabase auth email configuration and real redirect URLs.
- Organization switching is not implemented.
- Password reset and deep account management are not implemented.
- Apple cryptographic verification and historical reconciliation remain intentionally narrow.
- Manual operations are still required for attribution review, commission approval, and payout preparation.
- Finance exports are manual CSV downloads, not a full reporting or remittance system.
- There is no external notification, messaging, or support workflow in-product.
- Background jobs/monitoring are lightweight operational views, not a full jobs platform.

## Partner Portal Limitations

- The portal is read-only.
- Portal access requires a linked `partner_user` membership and `partner_users.partner_id`.
- Unlinked partner users remain in an honest boundary state until manually mapped.
- Portal data is intentionally narrow: codes, attributed performance, commission status, and payout history only.
- The portal does not allow editing codes, payout methods, tax details, settings, or support requests.
- Portal users do not see internal notes, audit logs, export controls, finance admin actions, or raw Apple payloads.
- Portal visibility depends on safe partner scoping already being present in the underlying records.

## Operational Notes

- Fresh environments need all migrations applied in order.
- Portal smoke testing requires at least one real linked partner user and partner-owned data.
- Empty states should be treated as honest signals, not as evidence that the route is broken.
