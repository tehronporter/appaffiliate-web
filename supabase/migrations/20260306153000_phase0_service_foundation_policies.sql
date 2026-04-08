-- Prompt 07: minimal write policies and helper functions for service-layer
-- foundations like audit logging and idempotency.

create or replace function public.current_active_membership_id(
  target_organization_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id
  from public.organization_memberships
  where organization_id = target_organization_id
    and user_id = auth.uid()
    and status = 'active'
  order by created_at asc
  limit 1
$$;

comment on function public.current_active_membership_id(uuid) is
'Returns the current authenticated user''s active membership id for an organization, when one exists.';

drop policy if exists "internal members can insert audit logs in their organization" on public.audit_logs;
create policy "internal members can insert audit logs in their organization"
on public.audit_logs
for insert
to authenticated
with check (
  public.is_internal_organization_member(organization_id)
  and (
    actor_user_id is null
    or actor_user_id = auth.uid()
  )
  and (
    actor_membership_id is null
    or actor_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "internal members can insert idempotency keys in their organization" on public.idempotency_keys;
create policy "internal members can insert idempotency keys in their organization"
on public.idempotency_keys
for insert
to authenticated
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can update idempotency keys in their organization" on public.idempotency_keys;
create policy "internal members can update idempotency keys in their organization"
on public.idempotency_keys
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (public.is_internal_organization_member(organization_id));
