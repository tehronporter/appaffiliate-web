-- Manual partner portal linkage helpers.
-- Use these only when a real partner_user exists but partner_users.partner_id is still null.

-- Inspect missing partner linkage and exact-name matches.
select
  partner_user.id as partner_user_id,
  partner_user.organization_id,
  partner_user.user_id,
  partner_user.partner_id,
  partner_user.partner_name,
  partner.id as matched_partner_id,
  partner.name as matched_partner_name
from public.partner_users as partner_user
left join public.partners as partner
  on partner.organization_id = partner_user.organization_id
 and lower(trim(partner.name)) = lower(trim(partner_user.partner_name))
where partner_user.partner_id is null
order by partner_user.created_at asc;

-- Fix one known user -> partner link directly.
-- Replace both TODO values before running.
-- Safe to execute unchanged: the update becomes a no-op until both values are valid UUIDs.
with direct_fix_params as (
  select
    case
      when nullif('TODO_USER_UUID', 'TODO_USER_UUID') is null then null::uuid
      when nullif('TODO_USER_UUID', 'TODO_USER_UUID') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then nullif('TODO_USER_UUID', 'TODO_USER_UUID')::uuid
      else null::uuid
    end as user_id,
    case
      when nullif('TODO_PARTNER_UUID', 'TODO_PARTNER_UUID') is null then null::uuid
      when nullif('TODO_PARTNER_UUID', 'TODO_PARTNER_UUID') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        then nullif('TODO_PARTNER_UUID', 'TODO_PARTNER_UUID')::uuid
      else null::uuid
    end as partner_id
)
update public.partner_users as partner_user
set
  partner_id = partner.id,
  partner_name = partner.name
from public.partners as partner
cross join direct_fix_params as params
where partner_user.organization_id = partner.organization_id
  and params.user_id is not null
  and params.partner_id is not null
  and partner_user.user_id = params.user_id
  and partner.id = params.partner_id
  and partner_user.partner_id is null;

-- Optional bulk backfill for exact one-to-one name matches.
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
