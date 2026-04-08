alter table public.partner_users
add column if not exists partner_id uuid references public.partners(id) on delete set null;

create index if not exists partner_users_partner_id_idx
  on public.partner_users (partner_id);

update public.partner_users as partner_user
set partner_id = matched.partner_id
from (
  select partner_user_id, partner_id
  from (
    select
      partner_user_inner.id as partner_user_id,
      partner.id as partner_id,
      count(*) over (partition by partner_user_inner.id) as match_count,
      row_number() over (
        partition by partner_user_inner.id
        order by partner.id::text
      ) as match_rank
    from public.partner_users as partner_user_inner
    join public.partners as partner
      on partner.organization_id = partner_user_inner.organization_id
     and lower(trim(partner.name)) = lower(trim(partner_user_inner.partner_name))
    where partner_user_inner.partner_id is null
      and partner_user_inner.partner_name is not null
  ) as candidate_matches
  where match_count = 1
    and match_rank = 1
) as matched
where partner_user.id = matched.partner_user_id
  and partner_user.partner_id is null;

create or replace function public.current_partner_id_in_organization(target_organization_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select partner_user.partner_id
  from public.partner_users as partner_user
  join public.organization_memberships as membership
    on membership.organization_id = partner_user.organization_id
   and membership.user_id = partner_user.user_id
   and membership.status = 'active'
   and membership.role_key = 'partner_user'
  where partner_user.organization_id = target_organization_id
    and partner_user.user_id = auth.uid()
    and partner_user.partner_id is not null
  limit 1;
$$;

comment on function public.current_partner_id_in_organization(uuid) is
'Returns the linked partner id for the current authenticated partner user within the target organization.';

create or replace function public.can_read_partner_scoped_record(
  target_organization_id uuid,
  target_partner_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    target_partner_id is not null
    and public.current_partner_id_in_organization(target_organization_id) = target_partner_id;
$$;

comment on function public.can_read_partner_scoped_record(uuid, uuid) is
'Returns true when the current authenticated partner user is linked to the record partner inside the target organization.';

create or replace function public.is_app_visible_to_current_partner(
  target_organization_id uuid,
  target_app_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.promo_codes
    where organization_id = target_organization_id
      and app_id = target_app_id
      and public.can_read_partner_scoped_record(target_organization_id, partner_id)
  )
  or exists (
    select 1
    from public.normalized_events
    where organization_id = target_organization_id
      and app_id = target_app_id
      and attribution_status = 'attributed'
      and public.can_read_partner_scoped_record(target_organization_id, partner_id)
  );
$$;

comment on function public.is_app_visible_to_current_partner(uuid, uuid) is
'Allows partner users to read only apps that are linked to their own codes or attributed events.';

create or replace function public.is_payout_batch_visible_to_current_partner(
  target_organization_id uuid,
  target_payout_batch_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.payout_batch_items
    where organization_id = target_organization_id
      and payout_batch_id = target_payout_batch_id
      and public.can_read_partner_scoped_record(target_organization_id, partner_id)
  );
$$;

comment on function public.is_payout_batch_visible_to_current_partner(uuid, uuid) is
'Allows partner users to read payout batches only when the batch contains one of their own payout items.';

drop policy if exists "partner users can read their linked partner" on public.partners;
create policy "partner users can read their linked partner"
on public.partners
for select
to authenticated
using (public.can_read_partner_scoped_record(organization_id, id));

drop policy if exists "partner users can read apps linked to their activity" on public.apps;
create policy "partner users can read apps linked to their activity"
on public.apps
for select
to authenticated
using (public.is_app_visible_to_current_partner(organization_id, id));

drop policy if exists "partner users can read their own promo codes" on public.promo_codes;
create policy "partner users can read their own promo codes"
on public.promo_codes
for select
to authenticated
using (public.can_read_partner_scoped_record(organization_id, partner_id));

drop policy if exists "partner users can read their own attributed events" on public.normalized_events;
create policy "partner users can read their own attributed events"
on public.normalized_events
for select
to authenticated
using (
  attribution_status = 'attributed'
  and public.can_read_partner_scoped_record(organization_id, partner_id)
);

drop policy if exists "partner users can read their own ledger entries" on public.commission_ledger_entries;
create policy "partner users can read their own ledger entries"
on public.commission_ledger_entries
for select
to authenticated
using (public.can_read_partner_scoped_record(organization_id, partner_id));

drop policy if exists "partner users can read their own payout batch items" on public.payout_batch_items;
create policy "partner users can read their own payout batch items"
on public.payout_batch_items
for select
to authenticated
using (public.can_read_partner_scoped_record(organization_id, partner_id));

drop policy if exists "partner users can read their own payout batches" on public.payout_batches;
create policy "partner users can read their own payout batches"
on public.payout_batches
for select
to authenticated
using (public.is_payout_batch_visible_to_current_partner(organization_id, id));
