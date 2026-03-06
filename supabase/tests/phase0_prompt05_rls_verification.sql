-- Prompt 05 verification queries.
-- This script is meant to be run manually after replacing the NULL values in
-- temp_rls_context with real UUIDs from your project.
--
-- What it helps confirm:
-- 1. Internal members can read records from their own organization.
-- 2. Internal members cannot read records from another organization.
-- 3. Partner users only see their own narrow workspace records.
-- 4. Partner users do not get broad access to internal or finance tables.

begin;

create temp table temp_rls_context (
  organization_a_id uuid,
  organization_b_id uuid,
  internal_user_id uuid,
  partner_user_id uuid
);

insert into temp_rls_context (
  organization_a_id,
  organization_b_id,
  internal_user_id,
  partner_user_id
)
values (
  null::uuid,
  null::uuid,
  null::uuid,
  null::uuid
);

-- Replace the NULL values above before using the queries below.
-- organization_a_id: an organization the test user belongs to
-- organization_b_id: a different organization
-- internal_user_id: a user in organization_a_id with owner/admin/finance/analyst
-- partner_user_id: a user in organization_a_id with partner_user role

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);

-- ---------------------------------------------------------------------------
-- Internal member checks
-- ---------------------------------------------------------------------------

select set_config(
  'request.jwt.claim.sub',
  coalesce(
    (select internal_user_id::text from temp_rls_context),
    '00000000-0000-0000-0000-000000000000'
  ),
  true
);

-- Expect:
-- can_read_org_a = true
-- can_read_org_b = false
select
  exists(
    select 1
    from public.organizations
    where id = (select organization_a_id from temp_rls_context)
  ) as can_read_org_a,
  exists(
    select 1
    from public.organizations
    where id = (select organization_b_id from temp_rls_context)
  ) as can_read_org_b;

-- Expect:
-- memberships_in_org_a >= 1
-- memberships_in_org_b = 0
select
  count(*) filter (
    where organization_id = (select organization_a_id from temp_rls_context)
  ) as memberships_in_org_a,
  count(*) filter (
    where organization_id = (select organization_b_id from temp_rls_context)
  ) as memberships_in_org_b
from public.organization_memberships;

-- Expect:
-- own_org_apps_visible >= 0
-- other_org_apps_visible = 0
select
  count(*) filter (
    where organization_id = (select organization_a_id from temp_rls_context)
  ) as own_org_apps_visible,
  count(*) filter (
    where organization_id = (select organization_b_id from temp_rls_context)
  ) as other_org_apps_visible
from public.apps;

-- Finance tables should only be visible when the internal user is owner/admin/finance.
select count(*) as visible_payout_batches
from public.payout_batches;

-- ---------------------------------------------------------------------------
-- Partner user checks
-- ---------------------------------------------------------------------------

select set_config(
  'request.jwt.claim.sub',
  coalesce(
    (select partner_user_id::text from temp_rls_context),
    '00000000-0000-0000-0000-000000000000'
  ),
  true
);

-- Expect:
-- own_memberships_visible = 1
-- other_memberships_visible = 0
select
  count(*) filter (
    where user_id = (select partner_user_id from temp_rls_context)
  ) as own_memberships_visible,
  count(*) filter (
    where user_id <> (select partner_user_id from temp_rls_context)
  ) as other_memberships_visible
from public.organization_memberships;

-- Expect:
-- own_partner_profile_rows = 1
-- other_partner_profile_rows = 0
select
  count(*) filter (
    where user_id = (select partner_user_id from temp_rls_context)
  ) as own_partner_profile_rows,
  count(*) filter (
    where user_id <> (select partner_user_id from temp_rls_context)
  ) as other_partner_profile_rows
from public.partner_users;

-- Expect:
-- partner users should not see internal operational data
select count(*) as apps_visible_to_partner_user
from public.apps;

select count(*) as normalized_events_visible_to_partner_user
from public.normalized_events;

select count(*) as payout_batches_visible_to_partner_user
from public.payout_batches;

rollback;
