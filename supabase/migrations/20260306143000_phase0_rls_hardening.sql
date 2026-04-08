-- Prompt 05: strengthen row level security with clearer role-aware helpers.
-- This stays intentionally Phase 0:
-- - read-focused policies
-- - simple role groupings
-- - narrow partner_user visibility
-- - no final write authorization model yet

-- ---------------------------------------------------------------------------
-- Membership helper functions
-- ---------------------------------------------------------------------------

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

comment on function public.is_organization_member(uuid) is
'Returns true when the current authenticated user has an active membership in the target organization.';

create or replace function public.has_organization_role(
  target_organization_id uuid,
  allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and status = 'active'
      and role_key = any(allowed_roles)
  );
$$;

comment on function public.has_organization_role(uuid, text[]) is
'Checks whether the current authenticated user has one of the allowed active roles inside an organization.';

create or replace function public.is_internal_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_organization_role(
    target_organization_id,
    array['owner', 'admin', 'finance', 'analyst']
  );
$$;

comment on function public.is_internal_organization_member(uuid) is
'Internal members are owner, admin, finance, or analyst. Partner users are intentionally excluded.';

create or replace function public.can_read_financial_records(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_organization_role(
    target_organization_id,
    array['owner', 'admin', 'finance']
  );
$$;

comment on function public.can_read_financial_records(uuid) is
'Finance visibility is limited to owner, admin, and finance roles in Phase 0.';

create or replace function public.is_partner_user_in_organization(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_organization_role(
    target_organization_id,
    array['partner_user']
  );
$$;

comment on function public.is_partner_user_in_organization(uuid) is
'Returns true when the current authenticated user is an active partner_user in the target organization.';

-- ---------------------------------------------------------------------------
-- Workspace policies
-- ---------------------------------------------------------------------------

drop policy if exists "authenticated users can read roles" on public.roles;
create policy "authenticated users can read roles"
on public.roles
for select
to authenticated
using (true);

drop policy if exists "members can read their organizations" on public.organizations;
create policy "members can read their organizations"
on public.organizations
for select
to authenticated
using (public.is_organization_member(id));

drop policy if exists "users can read their own memberships" on public.organization_memberships;
create policy "users can read their own memberships"
on public.organization_memberships
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "organization admins can read memberships in their organization" on public.organization_memberships;
create policy "organization admins can read memberships in their organization"
on public.organization_memberships
for select
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin']
  )
);

drop policy if exists "members can read partner users in their organization" on public.partner_users;
drop policy if exists "internal members can read partner users in their organization" on public.partner_users;
create policy "internal members can read partner users in their organization"
on public.partner_users
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "partner users can read their own partner profile" on public.partner_users;
create policy "partner users can read their own partner profile"
on public.partner_users
for select
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Internal product data: readable by internal members only
-- ---------------------------------------------------------------------------

drop policy if exists "members can read apps in their organization" on public.apps;
drop policy if exists "internal members can read apps in their organization" on public.apps;
create policy "internal members can read apps in their organization"
on public.apps
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read partners in their organization" on public.partners;
drop policy if exists "internal members can read partners in their organization" on public.partners;
create policy "internal members can read partners in their organization"
on public.partners
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read promo codes in their organization" on public.promo_codes;
drop policy if exists "internal members can read promo codes in their organization" on public.promo_codes;
create policy "internal members can read promo codes in their organization"
on public.promo_codes
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read commission rules in their organization" on public.commission_rules;
drop policy if exists "internal members can read commission rules in their organization" on public.commission_rules;
create policy "internal members can read commission rules in their organization"
on public.commission_rules
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read apple receipts in their organization" on public.apple_notification_receipts;
drop policy if exists "internal members can read apple receipts in their organization" on public.apple_notification_receipts;
create policy "internal members can read apple receipts in their organization"
on public.apple_notification_receipts
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read normalized events in their organization" on public.normalized_events;
drop policy if exists "internal members can read normalized events in their organization" on public.normalized_events;
create policy "internal members can read normalized events in their organization"
on public.normalized_events
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read unattributed queue in their organization" on public.unattributed_queue;
drop policy if exists "internal members can read unattributed queue in their organization" on public.unattributed_queue;
create policy "internal members can read unattributed queue in their organization"
on public.unattributed_queue
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read attribution decisions in their organization" on public.attribution_decisions;
drop policy if exists "internal members can read attribution decisions in their organization" on public.attribution_decisions;
create policy "internal members can read attribution decisions in their organization"
on public.attribution_decisions
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read job runs in their organization" on public.job_runs;
drop policy if exists "internal members can read job runs in their organization" on public.job_runs;
create policy "internal members can read job runs in their organization"
on public.job_runs
for select
to authenticated
using (
  organization_id is not null
  and public.is_internal_organization_member(organization_id)
);

drop policy if exists "members can read idempotency keys in their organization" on public.idempotency_keys;
drop policy if exists "internal members can read idempotency keys in their organization" on public.idempotency_keys;
create policy "internal members can read idempotency keys in their organization"
on public.idempotency_keys
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

drop policy if exists "members can read audit logs in their organization" on public.audit_logs;
drop policy if exists "internal members can read audit logs in their organization" on public.audit_logs;
create policy "internal members can read audit logs in their organization"
on public.audit_logs
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

-- ---------------------------------------------------------------------------
-- Finance-sensitive data: readable by owner/admin/finance only
-- ---------------------------------------------------------------------------

drop policy if exists "members can read ledger entries in their organization" on public.commission_ledger_entries;
drop policy if exists "finance roles can read ledger entries in their organization" on public.commission_ledger_entries;
create policy "finance roles can read ledger entries in their organization"
on public.commission_ledger_entries
for select
to authenticated
using (public.can_read_financial_records(organization_id));

drop policy if exists "members can read payout batches in their organization" on public.payout_batches;
drop policy if exists "finance roles can read payout batches in their organization" on public.payout_batches;
create policy "finance roles can read payout batches in their organization"
on public.payout_batches
for select
to authenticated
using (public.can_read_financial_records(organization_id));

drop policy if exists "members can read payout batch items in their organization" on public.payout_batch_items;
drop policy if exists "finance roles can read payout batch items in their organization" on public.payout_batch_items;
create policy "finance roles can read payout batch items in their organization"
on public.payout_batch_items
for select
to authenticated
using (public.can_read_financial_records(organization_id));
