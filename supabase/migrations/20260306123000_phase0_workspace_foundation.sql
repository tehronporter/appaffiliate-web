create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  key text primary key,
  name text not null,
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null references public.roles(key),
  status text not null default 'active' check (status in ('active', 'invited', 'disabled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create table if not exists public.partner_users (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text,
  partner_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (organization_id, user_id)
);

create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships (user_id);

create index if not exists organization_memberships_organization_id_idx
  on public.organization_memberships (organization_id);

create index if not exists partner_users_user_id_idx
  on public.partner_users (user_id);

create trigger set_updated_at_on_organizations
before update on public.organizations
for each row
execute function public.set_updated_at();

create trigger set_updated_at_on_organization_memberships
before update on public.organization_memberships
for each row
execute function public.set_updated_at();

create trigger set_updated_at_on_partner_users
before update on public.partner_users
for each row
execute function public.set_updated_at();

insert into public.roles (key, name, description)
values
  ('owner', 'Owner', 'Primary workspace owner with full control.'),
  ('admin', 'Admin', 'Team member who can manage workspace setup and members.'),
  ('finance', 'Finance', 'Team member focused on payout review and finance operations.'),
  ('analyst', 'Analyst', 'Team member who reviews attribution and reporting data.'),
  ('partner_user', 'Partner User', 'External or partner-facing user tied to an organization.')
on conflict (key) do update
set
  name = excluded.name,
  description = excluded.description;

insert into public.organizations (slug, name)
values ('appaffiliate-demo', 'AppAffiliate Demo')
on conflict (slug) do update
set name = excluded.name;

alter table public.organizations enable row level security;
alter table public.roles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.partner_users enable row level security;

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_memberships
    where organization_id = target_organization_id
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

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

drop policy if exists "members can read partner users in their organization" on public.partner_users;
create policy "members can read partner users in their organization"
on public.partner_users
for select
to authenticated
using (public.is_organization_member(organization_id));

create or replace function public.bootstrap_phase0_demo_workspace(owner_user_id uuid)
returns uuid
language plpgsql
as $$
declare
  demo_organization_id uuid;
begin
  insert into public.organizations (slug, name)
  values ('appaffiliate-demo', 'AppAffiliate Demo')
  on conflict (slug) do update
  set name = excluded.name
  returning id into demo_organization_id;

  insert into public.organization_memberships (
    organization_id,
    user_id,
    role_key,
    status
  )
  values (
    demo_organization_id,
    owner_user_id,
    'owner',
    'active'
  )
  on conflict (organization_id, user_id) do update
  set
    role_key = excluded.role_key,
    status = excluded.status;

  return demo_organization_id;
end;
$$;

comment on function public.bootstrap_phase0_demo_workspace(uuid) is
'Call this once after creating your first auth user to attach that user as the owner of the AppAffiliate Demo organization.';
