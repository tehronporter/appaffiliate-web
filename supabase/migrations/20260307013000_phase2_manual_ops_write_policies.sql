-- Phase 2: minimal internal write policies for partner, code, and
-- manual attribution operations.

drop policy if exists "internal members can insert partners in their organization" on public.partners;
create policy "internal members can insert partners in their organization"
on public.partners
for insert
to authenticated
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can update partners in their organization" on public.partners;
create policy "internal members can update partners in their organization"
on public.partners
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can insert promo codes in their organization" on public.promo_codes;
create policy "internal members can insert promo codes in their organization"
on public.promo_codes
for insert
to authenticated
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can update promo codes in their organization" on public.promo_codes;
create policy "internal members can update promo codes in their organization"
on public.promo_codes
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (public.is_internal_organization_member(organization_id));

drop policy if exists "internal members can insert unattributed queue items in their organization" on public.unattributed_queue;
create policy "internal members can insert unattributed queue items in their organization"
on public.unattributed_queue
for insert
to authenticated
with check (
  public.is_internal_organization_member(organization_id)
  and (
    assigned_membership_id is null
    or assigned_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "internal members can update unattributed queue items in their organization" on public.unattributed_queue;
create policy "internal members can update unattributed queue items in their organization"
on public.unattributed_queue
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (
  public.is_internal_organization_member(organization_id)
  and (
    assigned_membership_id is null
    or assigned_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "internal members can insert attribution decisions in their organization" on public.attribution_decisions;
create policy "internal members can insert attribution decisions in their organization"
on public.attribution_decisions
for insert
to authenticated
with check (
  public.is_internal_organization_member(organization_id)
  and (
    decided_by_membership_id is null
    or decided_by_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "internal members can update normalized events in their organization" on public.normalized_events;
create policy "internal members can update normalized events in their organization"
on public.normalized_events
for update
to authenticated
using (public.is_internal_organization_member(organization_id))
with check (public.is_internal_organization_member(organization_id));
