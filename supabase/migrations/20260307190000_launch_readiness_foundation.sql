-- Launch readiness foundation:
-- - public signup bootstrap
-- - workspace invitations
-- - app fee configuration
-- - commission rule basis mode
-- - append-only finance transition model
-- - transactional finance RPCs

create or replace function public.is_service_role()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.role() = 'service_role';
$$;

comment on function public.is_service_role() is
'Returns true when the current request is running with the Supabase service role.';

create or replace function public.slugify_text(value text)
returns text
language sql
immutable
set search_path = public
as $$
  select coalesce(
    nullif(
      trim(both '-' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '-', 'g')),
      ''
    ),
    'workspace'
  );
$$;

comment on function public.slugify_text(text) is
'Normalizes free-form display text into a URL-safe slug base.';

create table if not exists public.workspace_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  invite_type text not null check (invite_type in ('internal_team', 'partner_portal')),
  role_key text not null references public.roles(key),
  partner_id uuid references public.partners(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  invited_by_membership_id uuid references public.organization_memberships(id) on delete set null,
  expires_at timestamptz not null default timezone('utc', now()) + interval '14 days',
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.workspace_invitations is
'Invites for internal workspace members and creator portal users.';

create unique index if not exists workspace_invitations_pending_unique_idx
  on public.workspace_invitations (
    organization_id,
    lower(email),
    invite_type,
    coalesce(partner_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where status = 'pending';

create index if not exists workspace_invitations_organization_id_idx
  on public.workspace_invitations (organization_id, created_at desc);

create trigger set_updated_at_on_workspace_invitations
before update on public.workspace_invitations
for each row
execute function public.set_updated_at();

alter table public.workspace_invitations enable row level security;

drop policy if exists "internal members can read invitations in their organization" on public.workspace_invitations;
create policy "internal members can read invitations in their organization"
on public.workspace_invitations
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can insert invitations in their organization" on public.workspace_invitations;
create policy "internal members can insert invitations in their organization"
on public.workspace_invitations
for insert
to authenticated
with check (
  public.is_internal_organization_member(organization_id)
  and (
    invited_by_membership_id is null
    or invited_by_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "internal members can update invitations in their organization" on public.workspace_invitations;
create policy "internal members can update invitations in their organization"
on public.workspace_invitations
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (
  public.is_internal_organization_member(organization_id)
  and (
    invited_by_membership_id is null
    or invited_by_membership_id = public.current_active_membership_id(organization_id)
  )
);

alter table public.apps
  add column if not exists apple_fee_mode text not null default 'standard_30',
  add column if not exists apple_fee_bps integer;

alter table public.apps
  drop constraint if exists apps_apple_fee_mode_check;

alter table public.apps
  add constraint apps_apple_fee_mode_check
  check (apple_fee_mode in ('standard_30', 'small_business_15', 'custom'));

alter table public.apps
  drop constraint if exists apps_apple_fee_bps_check;

alter table public.apps
  add constraint apps_apple_fee_bps_check
  check (apple_fee_bps is null or (apple_fee_bps >= 0 and apple_fee_bps <= 10000));

update public.apps
set apple_fee_mode = coalesce(apple_fee_mode, 'standard_30')
where apple_fee_mode is null;

alter table public.commission_rules
  add column if not exists basis_mode text not null default 'gross_revenue';

alter table public.commission_rules
  drop constraint if exists commission_rules_basis_mode_check;

alter table public.commission_rules
  add constraint commission_rules_basis_mode_check
  check (basis_mode in ('gross_revenue', 'net_revenue'));

alter table public.apple_notification_receipts
  drop constraint if exists apple_notification_receipts_verification_status_check;

alter table public.apple_notification_receipts
  add constraint apple_notification_receipts_verification_status_check
  check (
    verification_status in (
      'pending',
      'verified',
      'failed'
    )
  );

drop policy if exists "internal members can insert apps in their organization" on public.apps;
create policy "internal members can insert apps in their organization"
on public.apps
for insert
to authenticated
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can update apps in their organization" on public.apps;
create policy "internal members can update apps in their organization"
on public.apps
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "organization admins can insert rules in their organization" on public.commission_rules;
create policy "organization admins can insert rules in their organization"
on public.commission_rules
for insert
to authenticated
with check (
  public.has_organization_role(organization_id, array['owner', 'admin'])
);

drop policy if exists "organization admins can update rules in their organization" on public.commission_rules;
create policy "organization admins can update rules in their organization"
on public.commission_rules
for update
to authenticated
using (
  public.has_organization_role(organization_id, array['owner', 'admin'])
)
with check (
  public.has_organization_role(organization_id, array['owner', 'admin'])
);

alter table public.commission_ledger_entries
  add column if not exists chain_id uuid,
  add column if not exists transition_type text,
  add column if not exists related_entry_id uuid references public.commission_ledger_entries(id) on delete set null,
  add column if not exists payout_batch_id uuid references public.payout_batches(id) on delete set null,
  add column if not exists actor_membership_id uuid references public.organization_memberships(id) on delete set null;

update public.commission_ledger_entries
set chain_id = coalesce(chain_id, gen_random_uuid());

update public.commission_ledger_entries
set transition_type = coalesce(
  transition_type,
  case status
    when 'approved' then 'approved'
    when 'held' then 'reserved'
    when 'paid' then 'paid'
    when 'reversed' then 'reversed'
    when 'void' then 'rejected'
    else 'approved'
  end
)
where chain_id is not null;

alter table public.commission_ledger_entries
  alter column chain_id set not null;

alter table public.commission_ledger_entries
  drop constraint if exists commission_ledger_entries_transition_type_check;

alter table public.commission_ledger_entries
  add constraint commission_ledger_entries_transition_type_check
  check (transition_type in ('approved', 'rejected', 'reserved', 'released', 'paid', 'reversed'));

create index if not exists commission_ledger_entries_chain_id_idx
  on public.commission_ledger_entries (organization_id, chain_id, created_at desc);

create index if not exists commission_ledger_entries_event_chain_idx
  on public.commission_ledger_entries (organization_id, normalized_event_id, created_at desc);

alter table public.payout_batch_items
  add column if not exists commission_chain_id uuid;

update public.payout_batch_items as item
set commission_chain_id = ledger.chain_id
from public.commission_ledger_entries as ledger
where item.commission_ledger_entry_id = ledger.id
  and item.commission_chain_id is null;

alter table public.payout_batch_items
  drop constraint if exists payout_batch_items_commission_ledger_entry_id_key;

create index if not exists payout_batch_items_chain_id_idx
  on public.payout_batch_items (organization_id, commission_chain_id, created_at desc);

create or replace function public.create_organization_with_owner(
  owner_user_id uuid,
  organization_name text,
  organization_slug text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_name text := trim(coalesce(organization_name, ''));
  slug_base text := public.slugify_text(coalesce(organization_slug, organization_name));
  candidate_slug text;
  created_organization_id uuid;
  slug_attempt integer := 0;
begin
  if not public.is_service_role() then
    raise exception 'Only the service role can bootstrap a new organization.';
  end if;

  if owner_user_id is null then
    raise exception 'Owner user id is required.';
  end if;

  if normalized_name = '' then
    raise exception 'Organization name is required.';
  end if;

  loop
    candidate_slug :=
      case
        when slug_attempt = 0 then slug_base
        else slug_base || '-' || (slug_attempt + 1)::text
      end;

    begin
      insert into public.organizations (slug, name)
      values (candidate_slug, normalized_name)
      returning id into created_organization_id;
      exit;
    exception
      when unique_violation then
        slug_attempt := slug_attempt + 1;
        if slug_attempt >= 20 then
          raise exception 'Unable to reserve a unique organization slug.';
        end if;
    end;
  end loop;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role_key,
    status
  )
  values (
    created_organization_id,
    owner_user_id,
    'owner',
    'active'
  )
  on conflict (organization_id, user_id) do update
  set
    role_key = excluded.role_key,
    status = excluded.status;

  return created_organization_id;
end;
$$;

comment on function public.create_organization_with_owner(uuid, text, text) is
'Creates a new organization and attaches the provided user as the active owner.';

create or replace function public.latest_commission_chain_entry(
  target_organization_id uuid,
  target_chain_id uuid
)
returns public.commission_ledger_entries
language sql
stable
security definer
set search_path = public
as $$
  select entry.*
  from public.commission_ledger_entries as entry
  where entry.organization_id = target_organization_id
    and entry.chain_id = target_chain_id
  order by entry.created_at desc, entry.id desc
  limit 1;
$$;

comment on function public.latest_commission_chain_entry(uuid, uuid) is
'Returns the most recent commission ledger entry for a chain inside an organization.';

create or replace function public.approve_commission_event(
  target_organization_id uuid,
  target_event_id uuid,
  target_amount numeric,
  target_currency text,
  target_note text default null,
  target_rule_id uuid default null,
  target_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row public.normalized_events%rowtype;
  latest_entry public.commission_ledger_entries%rowtype;
  next_chain_id uuid;
  new_entry_id uuid;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  if target_amount is null or target_amount < 0 then
    raise exception 'Commission amount must be zero or greater.';
  end if;

  select *
  into event_row
  from public.normalized_events
  where organization_id = target_organization_id
    and id = target_event_id
    and attribution_status = 'attributed'
  limit 1;

  if event_row.id is null then
    raise exception 'The commission event was not found.';
  end if;

  select *
  into latest_entry
  from public.commission_ledger_entries
  where organization_id = target_organization_id
    and normalized_event_id = target_event_id
  order by created_at desc, id desc
  limit 1;

  if latest_entry.id is not null and latest_entry.transition_type = 'paid' then
    raise exception 'Paid commission chains cannot be re-approved.';
  end if;

  next_chain_id := coalesce(latest_entry.chain_id, gen_random_uuid());

  insert into public.commission_ledger_entries (
    organization_id,
    normalized_event_id,
    commission_rule_id,
    partner_id,
    promo_code_id,
    entry_type,
    status,
    transition_type,
    chain_id,
    related_entry_id,
    payout_batch_id,
    actor_membership_id,
    currency,
    amount,
    effective_at,
    notes,
    metadata
  )
  values (
    target_organization_id,
    event_row.id,
    target_rule_id,
    event_row.partner_id,
    event_row.promo_code_id,
    'accrual',
    'approved',
    'approved',
    next_chain_id,
    latest_entry.id,
    null,
    actor_membership,
    upper(coalesce(nullif(trim(target_currency), ''), event_row.currency, 'USD')),
    round(target_amount::numeric, 2),
    coalesce(event_row.received_at, event_row.event_at, timezone('utc', now())),
    nullif(trim(coalesce(target_note, '')), ''),
    coalesce(target_metadata, '{}'::jsonb)
  )
  returning id into new_entry_id;

  return new_entry_id;
end;
$$;

create or replace function public.reject_commission_event(
  target_organization_id uuid,
  target_event_id uuid,
  target_note text default null,
  target_rule_id uuid default null,
  target_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  event_row public.normalized_events%rowtype;
  latest_entry public.commission_ledger_entries%rowtype;
  next_chain_id uuid;
  new_entry_id uuid;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  select *
  into event_row
  from public.normalized_events
  where organization_id = target_organization_id
    and id = target_event_id
    and attribution_status = 'attributed'
  limit 1;

  if event_row.id is null then
    raise exception 'The commission event was not found.';
  end if;

  select *
  into latest_entry
  from public.commission_ledger_entries
  where organization_id = target_organization_id
    and normalized_event_id = target_event_id
  order by created_at desc, id desc
  limit 1;

  if latest_entry.id is not null and latest_entry.transition_type = 'paid' then
    raise exception 'Paid commission chains cannot be rejected.';
  end if;

  next_chain_id := coalesce(latest_entry.chain_id, gen_random_uuid());

  insert into public.commission_ledger_entries (
    organization_id,
    normalized_event_id,
    commission_rule_id,
    partner_id,
    promo_code_id,
    entry_type,
    status,
    transition_type,
    chain_id,
    related_entry_id,
    payout_batch_id,
    actor_membership_id,
    currency,
    amount,
    effective_at,
    notes,
    metadata
  )
  values (
    target_organization_id,
    event_row.id,
    coalesce(target_rule_id, latest_entry.commission_rule_id),
    event_row.partner_id,
    event_row.promo_code_id,
    'adjustment',
    'void',
    'rejected',
    next_chain_id,
    latest_entry.id,
    null,
    actor_membership,
    upper(coalesce(latest_entry.currency, event_row.currency, 'USD')),
    0,
    timezone('utc', now()),
    nullif(trim(coalesce(target_note, '')), ''),
    coalesce(target_metadata, '{}'::jsonb)
  )
  returning id into new_entry_id;

  return new_entry_id;
end;
$$;

create or replace function public.create_payout_batch_from_group(
  target_organization_id uuid,
  target_partner_id uuid,
  target_currency text,
  target_name text,
  target_period_start date,
  target_period_end date,
  target_note text default null,
  target_chain_ids uuid[] default array[]::uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  batch_id uuid;
  target_chain_id uuid;
  latest_entry public.commission_ledger_entries%rowtype;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  if coalesce(array_length(target_chain_ids, 1), 0) = 0 then
    raise exception 'At least one approved chain is required.';
  end if;

  insert into public.payout_batches (
    organization_id,
    name,
    status,
    currency,
    period_start,
    period_end,
    notes
  )
  values (
    target_organization_id,
    trim(target_name),
    'draft',
    upper(coalesce(nullif(trim(target_currency), ''), 'USD')),
    target_period_start,
    target_period_end,
    nullif(trim(coalesce(target_note, '')), '')
  )
  returning id into batch_id;

  foreach target_chain_id in array target_chain_ids
  loop
    select *
    into latest_entry
    from public.commission_ledger_entries
    where organization_id = target_organization_id
      and chain_id = target_chain_id
    order by created_at desc, id desc
    limit 1;

    if latest_entry.id is null then
      raise exception 'A payout-ready chain was not found.';
    end if;

    if latest_entry.transition_type <> 'approved' then
      raise exception 'Only approved chains can be reserved into a batch.';
    end if;

    insert into public.commission_ledger_entries (
      organization_id,
      normalized_event_id,
      commission_rule_id,
      partner_id,
      promo_code_id,
      entry_type,
      status,
      transition_type,
      chain_id,
      related_entry_id,
      payout_batch_id,
      actor_membership_id,
      currency,
      amount,
      effective_at,
      notes,
      metadata
    )
    values (
      target_organization_id,
      latest_entry.normalized_event_id,
      latest_entry.commission_rule_id,
      latest_entry.partner_id,
      latest_entry.promo_code_id,
      'payout_hold',
      'held',
      'reserved',
      latest_entry.chain_id,
      latest_entry.id,
      batch_id,
      actor_membership,
      latest_entry.currency,
      0,
      timezone('utc', now()),
      nullif(trim(coalesce(target_note, '')), ''),
      jsonb_build_object('reserved_from_entry_id', latest_entry.id)
    );

    insert into public.payout_batch_items (
      organization_id,
      payout_batch_id,
      commission_ledger_entry_id,
      commission_chain_id,
      partner_id,
      amount,
      status
    )
    values (
      target_organization_id,
      batch_id,
      latest_entry.id,
      latest_entry.chain_id,
      coalesce(target_partner_id, latest_entry.partner_id),
      latest_entry.amount,
      'pending'
    );
  end loop;

  return batch_id;
end;
$$;

create or replace function public.export_payout_batch(
  target_organization_id uuid,
  target_batch_id uuid,
  target_external_reference text default null,
  target_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_batch public.payout_batches%rowtype;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  select *
  into existing_batch
  from public.payout_batches
  where organization_id = target_organization_id
    and id = target_batch_id
  limit 1;

  if existing_batch.id is null then
    raise exception 'Payout batch was not found.';
  end if;

  if existing_batch.status <> 'draft' then
    raise exception 'Only draft payout batches can be exported.';
  end if;

  update public.payout_batches
  set
    status = 'exported',
    external_reference = nullif(trim(coalesce(target_external_reference, '')), ''),
    notes = coalesce(nullif(trim(coalesce(target_note, '')), ''), notes),
    approved_at = timezone('utc', now()),
    approved_by_membership_id = actor_membership
  where organization_id = target_organization_id
    and id = target_batch_id;

  update public.payout_batch_items
  set status = 'exported'
  where organization_id = target_organization_id
    and payout_batch_id = target_batch_id;

  return target_batch_id;
end;
$$;

create or replace function public.mark_payout_batch_paid(
  target_organization_id uuid,
  target_batch_id uuid,
  target_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_batch public.payout_batches%rowtype;
  batch_item record;
  latest_entry public.commission_ledger_entries%rowtype;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  select *
  into existing_batch
  from public.payout_batches
  where organization_id = target_organization_id
    and id = target_batch_id
  limit 1;

  if existing_batch.id is null then
    raise exception 'Payout batch was not found.';
  end if;

  if existing_batch.status <> 'exported' then
    raise exception 'Only exported payout batches can be marked paid.';
  end if;

  for batch_item in
    select *
    from public.payout_batch_items
    where organization_id = target_organization_id
      and payout_batch_id = target_batch_id
  loop
    select *
    into latest_entry
    from public.commission_ledger_entries
    where organization_id = target_organization_id
      and chain_id = batch_item.commission_chain_id
    order by created_at desc, id desc
    limit 1;

    if latest_entry.id is null or latest_entry.transition_type <> 'reserved' then
      raise exception 'Only reserved chains can be marked paid.';
    end if;

    if latest_entry.payout_batch_id <> target_batch_id then
      raise exception 'Reserved chain does not belong to the requested payout batch.';
    end if;

    insert into public.commission_ledger_entries (
      organization_id,
      normalized_event_id,
      commission_rule_id,
      partner_id,
      promo_code_id,
      entry_type,
      status,
      transition_type,
      chain_id,
      related_entry_id,
      payout_batch_id,
      actor_membership_id,
      currency,
      amount,
      effective_at,
      notes,
      metadata
    )
    values (
      target_organization_id,
      latest_entry.normalized_event_id,
      latest_entry.commission_rule_id,
      latest_entry.partner_id,
      latest_entry.promo_code_id,
      'adjustment',
      'paid',
      'paid',
      latest_entry.chain_id,
      latest_entry.id,
      target_batch_id,
      actor_membership,
      latest_entry.currency,
      0,
      timezone('utc', now()),
      nullif(trim(coalesce(target_note, '')), ''),
      jsonb_build_object('paid_from_batch_id', target_batch_id)
    );
  end loop;

  update public.payout_batches
  set
    status = 'paid',
    notes = coalesce(nullif(trim(coalesce(target_note, '')), ''), notes),
    approved_at = coalesce(approved_at, timezone('utc', now())),
    approved_by_membership_id = actor_membership
  where organization_id = target_organization_id
    and id = target_batch_id;

  update public.payout_batch_items
  set status = 'paid'
  where organization_id = target_organization_id
    and payout_batch_id = target_batch_id;

  return target_batch_id;
end;
$$;

create or replace function public.cancel_payout_batch(
  target_organization_id uuid,
  target_batch_id uuid,
  target_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_batch public.payout_batches%rowtype;
  batch_item record;
  latest_entry public.commission_ledger_entries%rowtype;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  select *
  into existing_batch
  from public.payout_batches
  where organization_id = target_organization_id
    and id = target_batch_id
  limit 1;

  if existing_batch.id is null then
    raise exception 'Payout batch was not found.';
  end if;

  if existing_batch.status = 'paid' then
    raise exception 'Paid payout batches cannot be cancelled.';
  end if;

  if existing_batch.status = 'cancelled' then
    return target_batch_id;
  end if;

  for batch_item in
    select *
    from public.payout_batch_items
    where organization_id = target_organization_id
      and payout_batch_id = target_batch_id
      and status <> 'cancelled'
  loop
    select *
    into latest_entry
    from public.commission_ledger_entries
    where organization_id = target_organization_id
      and chain_id = batch_item.commission_chain_id
    order by created_at desc, id desc
    limit 1;

    if latest_entry.id is not null and latest_entry.transition_type = 'reserved' then
      insert into public.commission_ledger_entries (
        organization_id,
        normalized_event_id,
        commission_rule_id,
        partner_id,
        promo_code_id,
        entry_type,
        status,
        transition_type,
        chain_id,
        related_entry_id,
        payout_batch_id,
        actor_membership_id,
        currency,
        amount,
        effective_at,
        notes,
        metadata
      )
      values (
        target_organization_id,
        latest_entry.normalized_event_id,
        latest_entry.commission_rule_id,
        latest_entry.partner_id,
        latest_entry.promo_code_id,
        'adjustment',
        'approved',
        'released',
        latest_entry.chain_id,
        latest_entry.id,
        target_batch_id,
        actor_membership,
        latest_entry.currency,
        0,
        timezone('utc', now()),
        nullif(trim(coalesce(target_note, '')), ''),
        jsonb_build_object('released_from_batch_id', target_batch_id)
      );
    end if;
  end loop;

  update public.payout_batches
  set
    status = 'cancelled',
    notes = coalesce(nullif(trim(coalesce(target_note, '')), ''), notes)
  where organization_id = target_organization_id
    and id = target_batch_id;

  update public.payout_batch_items
  set status = 'cancelled'
  where organization_id = target_organization_id
    and payout_batch_id = target_batch_id;

  return target_batch_id;
end;
$$;

create or replace function public.reverse_commission_for_refund(
  target_organization_id uuid,
  target_chain_id uuid,
  target_event_id uuid,
  target_amount numeric,
  target_currency text,
  target_note text default null,
  target_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  latest_entry public.commission_ledger_entries%rowtype;
  new_entry_id uuid;
  actor_membership uuid := public.current_active_membership_id(target_organization_id);
begin
  if not (
    public.is_service_role()
    or public.can_read_financial_records(target_organization_id)
  ) then
    raise exception 'Finance access is required.';
  end if;

  if target_chain_id is null then
    raise exception 'A commission chain id is required for reversal.';
  end if;

  select *
  into latest_entry
  from public.commission_ledger_entries
  where organization_id = target_organization_id
    and chain_id = target_chain_id
  order by created_at desc, id desc
  limit 1;

  if latest_entry.id is null then
    raise exception 'The commission chain was not found.';
  end if;

  if latest_entry.transition_type = 'reversed' then
    return latest_entry.id;
  end if;

  insert into public.commission_ledger_entries (
    organization_id,
    normalized_event_id,
    commission_rule_id,
    partner_id,
    promo_code_id,
    entry_type,
    status,
    transition_type,
    chain_id,
    related_entry_id,
    payout_batch_id,
    actor_membership_id,
    currency,
    amount,
    effective_at,
    notes,
    metadata
  )
  values (
    target_organization_id,
    target_event_id,
    latest_entry.commission_rule_id,
    latest_entry.partner_id,
    latest_entry.promo_code_id,
    'reversal',
    'reversed',
    'reversed',
    latest_entry.chain_id,
    latest_entry.id,
    latest_entry.payout_batch_id,
    actor_membership,
    upper(coalesce(nullif(trim(target_currency), ''), latest_entry.currency, 'USD')),
    round(abs(coalesce(target_amount, latest_entry.amount))::numeric * -1, 2),
    timezone('utc', now()),
    nullif(trim(coalesce(target_note, '')), ''),
    coalesce(target_metadata, '{}'::jsonb)
  )
  returning id into new_entry_id;

  return new_entry_id;
end;
$$;

grant execute on function public.create_organization_with_owner(uuid, text, text) to service_role;
grant execute on function public.approve_commission_event(uuid, uuid, numeric, text, text, uuid, jsonb) to authenticated, service_role;
grant execute on function public.reject_commission_event(uuid, uuid, text, uuid, jsonb) to authenticated, service_role;
grant execute on function public.create_payout_batch_from_group(uuid, uuid, text, text, date, date, text, uuid[]) to authenticated, service_role;
grant execute on function public.export_payout_batch(uuid, uuid, text, text) to authenticated, service_role;
grant execute on function public.mark_payout_batch_paid(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.cancel_payout_batch(uuid, uuid, text) to authenticated, service_role;
grant execute on function public.reverse_commission_for_refund(uuid, uuid, uuid, numeric, text, text, jsonb) to authenticated, service_role;
