-- Prompt 04: broader Phase 0 product foundation.
-- This migration adds the main AppAffiliate product tables without implementing
-- the full commission engine, payout calculations, or billing behavior yet.

-- ---------------------------------------------------------------------------
-- Apps and partner management
-- ---------------------------------------------------------------------------

create table if not exists public.apps (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  platform text not null default 'ios' check (platform in ('ios', 'android', 'web', 'cross_platform')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  bundle_id text,
  app_store_id text,
  apple_team_id text,
  timezone text not null default 'UTC',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

comment on table public.apps is
'Applications that belong to an organization. Later phases can add store-specific settings and sync details.';

create table if not exists public.partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  partner_type text not null default 'affiliate' check (partner_type in ('creator', 'affiliate', 'agency', 'publisher', 'internal', 'other')),
  status text not null default 'active' check (status in ('pending', 'active', 'inactive', 'archived')),
  contact_name text,
  contact_email text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, slug)
);

comment on table public.partners is
'Organizations can work with many partners. This table is the core directory for those relationships.';

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  app_id uuid not null references public.apps(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete set null,
  code text not null,
  code_type text not null default 'promo' check (code_type in ('promo', 'referral', 'campaign', 'vanity')),
  status text not null default 'active' check (status in ('draft', 'active', 'paused', 'expired', 'archived')),
  channel text,
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, app_id, code)
);

comment on table public.promo_codes is
'Codes used for partner tracking and attribution. Later phases can add import, review, and conflict tools.';

create table if not exists public.commission_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  app_id uuid references public.apps(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete cascade,
  promo_code_id uuid references public.promo_codes(id) on delete cascade,
  name text not null,
  rule_type text not null default 'revenue_share' check (rule_type in ('revenue_share', 'flat_fee', 'cpa', 'hybrid')),
  status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'archived')),
  currency text not null default 'USD',
  rate numeric(12, 4),
  flat_amount numeric(12, 2),
  priority integer not null default 100,
  starts_at timestamptz,
  ends_at timestamptz,
  conditions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.commission_rules is
'Phase 0 storage for commission rule definitions. The rule engine itself is intentionally out of scope for now.';

-- ---------------------------------------------------------------------------
-- Ingestion, normalization, attribution, and ledger scaffolding
-- ---------------------------------------------------------------------------

create table if not exists public.apple_notification_receipts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  app_id uuid references public.apps(id) on delete set null,
  notification_uuid text,
  notification_type text not null,
  notification_subtype text,
  environment text not null default 'production' check (environment in ('sandbox', 'production', 'unknown')),
  signed_payload text not null,
  original_transaction_id text,
  processed_status text not null default 'pending' check (processed_status in ('pending', 'processed', 'ignored', 'failed')),
  last_error text,
  received_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, notification_uuid)
);

comment on table public.apple_notification_receipts is
'Raw Apple server notification receipts. They are stored first, then normalized into product events.';

create table if not exists public.normalized_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  app_id uuid references public.apps(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  apple_notification_receipt_id uuid references public.apple_notification_receipts(id) on delete set null,
  source_type text not null check (source_type in ('apple_notification', 'manual', 'internal_import', 'api')),
  source_event_key text,
  event_type text not null check (event_type in ('install', 'trial_started', 'subscription_started', 'renewal', 'purchase', 'refund', 'cancellation', 'other')),
  event_status text not null default 'received' check (event_status in ('received', 'normalized', 'invalid', 'ignored')),
  attribution_status text not null default 'pending' check (attribution_status in ('pending', 'attributed', 'unattributed', 'ignored')),
  event_at timestamptz not null,
  currency text,
  gross_amount numeric(12, 2),
  net_amount numeric(12, 2),
  customer_country text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, source_type, source_event_key)
);

comment on table public.normalized_events is
'Tenant-scoped event stream used as the common shape for attribution and commissions.';

create table if not exists public.unattributed_queue (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  normalized_event_id uuid not null references public.normalized_events(id) on delete cascade,
  assigned_membership_id uuid references public.organization_memberships(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'in_review', 'resolved', 'ignored')),
  reason text not null default 'missing_partner',
  notes text,
  resolved_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (normalized_event_id)
);

comment on table public.unattributed_queue is
'Queue of events that still need a partner, code, or attribution decision.';

create table if not exists public.attribution_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  normalized_event_id uuid not null references public.normalized_events(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete set null,
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  decision_type text not null check (decision_type in ('manual_match', 'rule_match', 'fallback_match', 'rejected')),
  confidence numeric(5, 2),
  reason text,
  decided_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.attribution_decisions is
'History of how an event was attributed. Multiple decisions can exist so later phases can preserve review history.';

create table if not exists public.commission_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  normalized_event_id uuid references public.normalized_events(id) on delete set null,
  commission_rule_id uuid references public.commission_rules(id) on delete set null,
  partner_id uuid references public.partners(id) on delete set null,
  promo_code_id uuid references public.promo_codes(id) on delete set null,
  entry_type text not null check (entry_type in ('accrual', 'adjustment', 'reversal', 'payout_hold')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'held', 'paid', 'reversed', 'void')),
  currency text not null default 'USD',
  amount numeric(12, 2) not null,
  effective_at timestamptz not null default timezone('utc', now()),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.commission_ledger_entries is
'Ledger-style commission entries. Amounts can be created later by a rules engine without changing the storage model.';

-- ---------------------------------------------------------------------------
-- Payout batching
-- ---------------------------------------------------------------------------

create table if not exists public.payout_batches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'reviewing', 'approved', 'exported', 'paid', 'cancelled')),
  currency text not null default 'USD',
  period_start date,
  period_end date,
  external_reference text,
  approved_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  approved_at timestamptz,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.payout_batches is
'Manual or generated payout groups. Phase 0 stores the shape only, not the full payout logic.';

create table if not exists public.payout_batch_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  payout_batch_id uuid not null references public.payout_batches(id) on delete cascade,
  commission_ledger_entry_id uuid not null references public.commission_ledger_entries(id) on delete cascade,
  partner_id uuid references public.partners(id) on delete set null,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'exported', 'paid', 'failed', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (commission_ledger_entry_id)
);

comment on table public.payout_batch_items is
'Items inside a payout batch. Each ledger entry can belong to at most one batch in this Phase 0 foundation.';

-- ---------------------------------------------------------------------------
-- Operational support tables
-- ---------------------------------------------------------------------------

create table if not exists public.job_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  job_name text not null,
  job_scope text not null default 'organization' check (job_scope in ('organization', 'system')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  payload jsonb not null default '{}'::jsonb,
  result_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.job_runs is
'Background job tracking for imports, normalizers, batch creation, or later worker tasks.';

create table if not exists public.idempotency_keys (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  key text not null,
  request_scope text not null,
  status text not null default 'started' check (status in ('started', 'completed', 'failed')),
  request_hash text,
  resource_type text,
  resource_id uuid,
  response_code integer,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, key)
);

comment on table public.idempotency_keys is
'Basic storage for safely retrying write operations without creating duplicates later.';

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_membership_id uuid references public.organization_memberships(id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

comment on table public.audit_logs is
'Lightweight audit trail for important user and system actions.';

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

create index if not exists apps_organization_id_idx
  on public.apps (organization_id);

create index if not exists apps_status_idx
  on public.apps (organization_id, status);

create index if not exists partners_organization_id_idx
  on public.partners (organization_id);

create index if not exists partners_status_idx
  on public.partners (organization_id, status);

create index if not exists promo_codes_organization_id_idx
  on public.promo_codes (organization_id);

create index if not exists promo_codes_partner_id_idx
  on public.promo_codes (partner_id);

create index if not exists promo_codes_status_idx
  on public.promo_codes (organization_id, status);

create index if not exists commission_rules_organization_id_idx
  on public.commission_rules (organization_id);

create index if not exists commission_rules_priority_idx
  on public.commission_rules (organization_id, status, priority);

create index if not exists apple_notification_receipts_organization_id_idx
  on public.apple_notification_receipts (organization_id);

create index if not exists apple_notification_receipts_processed_status_idx
  on public.apple_notification_receipts (organization_id, processed_status, received_at desc);

create index if not exists normalized_events_organization_id_idx
  on public.normalized_events (organization_id);

create index if not exists normalized_events_app_id_idx
  on public.normalized_events (app_id);

create index if not exists normalized_events_partner_id_idx
  on public.normalized_events (partner_id);

create index if not exists normalized_events_attribution_status_idx
  on public.normalized_events (organization_id, attribution_status, event_at desc);

create index if not exists normalized_events_source_idx
  on public.normalized_events (organization_id, source_type, source_event_key);

create index if not exists unattributed_queue_organization_id_idx
  on public.unattributed_queue (organization_id);

create index if not exists unattributed_queue_status_idx
  on public.unattributed_queue (organization_id, status, created_at desc);

create index if not exists attribution_decisions_organization_id_idx
  on public.attribution_decisions (organization_id);

create index if not exists attribution_decisions_event_idx
  on public.attribution_decisions (normalized_event_id, created_at desc);

create index if not exists commission_ledger_entries_organization_id_idx
  on public.commission_ledger_entries (organization_id);

create index if not exists commission_ledger_entries_partner_status_idx
  on public.commission_ledger_entries (organization_id, partner_id, status);

create index if not exists commission_ledger_entries_effective_at_idx
  on public.commission_ledger_entries (organization_id, effective_at desc);

create index if not exists payout_batches_organization_id_idx
  on public.payout_batches (organization_id);

create index if not exists payout_batches_status_idx
  on public.payout_batches (organization_id, status, created_at desc);

create index if not exists payout_batch_items_batch_id_idx
  on public.payout_batch_items (payout_batch_id);

create index if not exists payout_batch_items_partner_id_idx
  on public.payout_batch_items (partner_id);

create index if not exists job_runs_organization_id_idx
  on public.job_runs (organization_id);

create index if not exists job_runs_status_idx
  on public.job_runs (job_name, status, created_at desc);

create index if not exists idempotency_keys_organization_id_idx
  on public.idempotency_keys (organization_id, status);

create index if not exists idempotency_keys_expires_at_idx
  on public.idempotency_keys (expires_at);

create index if not exists audit_logs_organization_id_idx
  on public.audit_logs (organization_id, created_at desc);

create index if not exists audit_logs_entity_idx
  on public.audit_logs (organization_id, entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

drop trigger if exists set_updated_at_on_apps on public.apps;
create trigger set_updated_at_on_apps
before update on public.apps
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_partners on public.partners;
create trigger set_updated_at_on_partners
before update on public.partners
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_promo_codes on public.promo_codes;
create trigger set_updated_at_on_promo_codes
before update on public.promo_codes
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_commission_rules on public.commission_rules;
create trigger set_updated_at_on_commission_rules
before update on public.commission_rules
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_apple_notification_receipts on public.apple_notification_receipts;
create trigger set_updated_at_on_apple_notification_receipts
before update on public.apple_notification_receipts
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_normalized_events on public.normalized_events;
create trigger set_updated_at_on_normalized_events
before update on public.normalized_events
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_unattributed_queue on public.unattributed_queue;
create trigger set_updated_at_on_unattributed_queue
before update on public.unattributed_queue
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_commission_ledger_entries on public.commission_ledger_entries;
create trigger set_updated_at_on_commission_ledger_entries
before update on public.commission_ledger_entries
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_payout_batches on public.payout_batches;
create trigger set_updated_at_on_payout_batches
before update on public.payout_batches
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_payout_batch_items on public.payout_batch_items;
create trigger set_updated_at_on_payout_batch_items
before update on public.payout_batch_items
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_job_runs on public.job_runs;
create trigger set_updated_at_on_job_runs
before update on public.job_runs
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_on_idempotency_keys on public.idempotency_keys;
create trigger set_updated_at_on_idempotency_keys
before update on public.idempotency_keys
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------

alter table public.apps enable row level security;
alter table public.partners enable row level security;
alter table public.promo_codes enable row level security;
alter table public.commission_rules enable row level security;
alter table public.apple_notification_receipts enable row level security;
alter table public.normalized_events enable row level security;
alter table public.unattributed_queue enable row level security;
alter table public.attribution_decisions enable row level security;
alter table public.commission_ledger_entries enable row level security;
alter table public.payout_batches enable row level security;
alter table public.payout_batch_items enable row level security;
alter table public.job_runs enable row level security;
alter table public.idempotency_keys enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "members can read apps in their organization" on public.apps;
create policy "members can read apps in their organization"
on public.apps
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read partners in their organization" on public.partners;
create policy "members can read partners in their organization"
on public.partners
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read promo codes in their organization" on public.promo_codes;
create policy "members can read promo codes in their organization"
on public.promo_codes
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read commission rules in their organization" on public.commission_rules;
create policy "members can read commission rules in their organization"
on public.commission_rules
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read apple receipts in their organization" on public.apple_notification_receipts;
create policy "members can read apple receipts in their organization"
on public.apple_notification_receipts
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read normalized events in their organization" on public.normalized_events;
create policy "members can read normalized events in their organization"
on public.normalized_events
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read unattributed queue in their organization" on public.unattributed_queue;
create policy "members can read unattributed queue in their organization"
on public.unattributed_queue
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read attribution decisions in their organization" on public.attribution_decisions;
create policy "members can read attribution decisions in their organization"
on public.attribution_decisions
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read ledger entries in their organization" on public.commission_ledger_entries;
create policy "members can read ledger entries in their organization"
on public.commission_ledger_entries
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read payout batches in their organization" on public.payout_batches;
create policy "members can read payout batches in their organization"
on public.payout_batches
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read payout batch items in their organization" on public.payout_batch_items;
create policy "members can read payout batch items in their organization"
on public.payout_batch_items
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read job runs in their organization" on public.job_runs;
create policy "members can read job runs in their organization"
on public.job_runs
for select
to authenticated
using (
  organization_id is null
  or public.is_organization_member(organization_id)
);

drop policy if exists "members can read idempotency keys in their organization" on public.idempotency_keys;
create policy "members can read idempotency keys in their organization"
on public.idempotency_keys
for select
to authenticated
using (public.is_organization_member(organization_id));

drop policy if exists "members can read audit logs in their organization" on public.audit_logs;
create policy "members can read audit logs in their organization"
on public.audit_logs
for select
to authenticated
using (public.is_organization_member(organization_id));
