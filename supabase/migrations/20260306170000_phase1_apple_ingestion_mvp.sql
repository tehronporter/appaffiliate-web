-- Phase 1: Apple ingestion MVP slice.
-- Add only the fields needed for public Apple notification intake, durable
-- receipt storage, idempotent normalization, and app-scoped readiness views.

alter table public.apps
  add column if not exists ingest_key text;

comment on column public.apps.ingest_key is
'Public Apple notification ingest key resolved by the MVP ingestion route.';

create unique index if not exists apps_ingest_key_idx
  on public.apps (ingest_key)
  where ingest_key is not null;

alter table public.apple_notification_receipts
  alter column environment set default 'unknown';

alter table public.apple_notification_receipts
  add column if not exists dedupe_key text,
  add column if not exists payload_hash text,
  add column if not exists request_id text,
  add column if not exists verification_status text not null default 'pending';

alter table public.apple_notification_receipts
  drop constraint if exists apple_notification_receipts_verification_status_check;

alter table public.apple_notification_receipts
  add constraint apple_notification_receipts_verification_status_check
  check (
    verification_status in (
      'pending',
      'placeholder_unverified',
      'verified',
      'failed'
    )
  );

update public.apple_notification_receipts
set payload_hash = encode(digest(signed_payload, 'sha256'), 'hex')
where payload_hash is null;

update public.apple_notification_receipts
set dedupe_key = coalesce(nullif(notification_uuid, ''), payload_hash)
where dedupe_key is null;

create unique index if not exists apple_notification_receipts_dedupe_key_idx
  on public.apple_notification_receipts (organization_id, app_id, dedupe_key)
  where dedupe_key is not null;

create index if not exists apple_notification_receipts_app_received_at_idx
  on public.apple_notification_receipts (app_id, received_at desc);

alter table public.normalized_events
  add column if not exists environment text not null default 'unknown',
  add column if not exists transaction_id text,
  add column if not exists original_transaction_id text,
  add column if not exists web_order_line_item_id text,
  add column if not exists product_id text,
  add column if not exists offer_identifier text,
  add column if not exists amount_minor bigint,
  add column if not exists received_at timestamptz,
  add column if not exists reason_code text;

alter table public.normalized_events
  drop constraint if exists normalized_events_environment_check;

alter table public.normalized_events
  add constraint normalized_events_environment_check
  check (environment in ('sandbox', 'production', 'unknown'));

update public.normalized_events
set received_at = coalesce(received_at, event_at, created_at)
where received_at is null;

alter table public.normalized_events
  alter column received_at set default timezone('utc', now());

create index if not exists normalized_events_received_at_idx
  on public.normalized_events (organization_id, received_at desc);

create index if not exists normalized_events_transaction_id_idx
  on public.normalized_events (organization_id, transaction_id);
