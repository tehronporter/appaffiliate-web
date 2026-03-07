-- Phase 2: narrow write policies for real organization settings and safe
-- workspace role updates.

drop policy if exists "owners and admins can update their organization" on public.organizations;
create policy "owners and admins can update their organization"
on public.organizations
for update
to authenticated
using (
  public.has_organization_role(
    id,
    array['owner', 'admin']
  )
)
with check (
  public.has_organization_role(
    id,
    array['owner', 'admin']
  )
);

drop policy if exists "owners and admins can update memberships in their organization" on public.organization_memberships;
create policy "owners and admins can update memberships in their organization"
on public.organization_memberships
for update
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin']
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['owner', 'admin']
  )
);
