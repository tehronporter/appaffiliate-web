-- Workspace billing state foundation for self-serve pricing before Stripe.

create table if not exists public.workspace_billing_states (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  plan_key text not null check (plan_key in ('starter', 'growth', 'scale', 'enterprise')),
  billing_interval text not null check (billing_interval in ('monthly', 'annual', 'custom')),
  status text not null check (status in ('trialing', 'trial_expired', 'manual_contact')),
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

comment on table public.workspace_billing_states is
'Workspace-level pricing state for self-serve trials before Stripe billing goes live.';

create trigger set_updated_at_on_workspace_billing_states
before update on public.workspace_billing_states
for each row
execute function public.set_updated_at();

create index if not exists workspace_billing_states_status_idx
  on public.workspace_billing_states (status, trial_ends_at);

insert into public.workspace_billing_states (
  organization_id,
  plan_key,
  billing_interval,
  status,
  trial_started_at,
  trial_ends_at
)
select
  organization.id,
  'growth',
  'monthly',
  case
    when organization.created_at + interval '14 days' > timezone('utc', now()) then 'trialing'
    else 'trial_expired'
  end,
  organization.created_at,
  organization.created_at + interval '14 days'
from public.organizations as organization
where not exists (
  select 1
  from public.workspace_billing_states as billing
  where billing.organization_id = organization.id
);

alter table public.workspace_billing_states enable row level security;

drop policy if exists "internal members can read workspace billing states in their organization" on public.workspace_billing_states;
create policy "internal members can read workspace billing states in their organization"
on public.workspace_billing_states
for select
to authenticated
using (public.is_internal_organization_member(organization_id));

create or replace function public.create_self_serve_workspace_with_owner(
  owner_user_id uuid,
  organization_name text,
  organization_slug text default null,
  selected_plan_key text default 'growth',
  selected_billing_interval text default 'monthly',
  trial_length_days integer default 14
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
  normalized_plan_key text := lower(trim(coalesce(selected_plan_key, 'growth')));
  normalized_billing_interval text := lower(trim(coalesce(selected_billing_interval, 'monthly')));
  trial_started timestamptz;
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

  if normalized_plan_key not in ('starter', 'growth', 'scale', 'enterprise') then
    raise exception 'Unsupported plan key.';
  end if;

  if normalized_billing_interval not in ('monthly', 'annual', 'custom') then
    raise exception 'Unsupported billing interval.';
  end if;

  if normalized_plan_key = 'enterprise' and normalized_billing_interval <> 'custom' then
    raise exception 'Enterprise workspaces must use the custom billing interval.';
  end if;

  if normalized_plan_key <> 'enterprise' and normalized_billing_interval = 'custom' then
    raise exception 'Only enterprise workspaces can use the custom billing interval.';
  end if;

  if trial_length_days < 0 then
    raise exception 'Trial length must be zero or greater.';
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

  trial_started := timezone('utc', now());

  insert into public.workspace_billing_states (
    organization_id,
    plan_key,
    billing_interval,
    status,
    trial_started_at,
    trial_ends_at
  )
  values (
    created_organization_id,
    normalized_plan_key,
    normalized_billing_interval,
    case
      when normalized_plan_key = 'enterprise' then 'manual_contact'
      when trial_length_days = 0 then 'trial_expired'
      else 'trialing'
    end,
    case
      when normalized_plan_key = 'enterprise' then null
      else trial_started
    end,
    case
      when normalized_plan_key = 'enterprise' then null
      else trial_started + make_interval(days => trial_length_days)
    end
  )
  on conflict (organization_id) do update
  set
    plan_key = excluded.plan_key,
    billing_interval = excluded.billing_interval,
    status = excluded.status,
    trial_started_at = excluded.trial_started_at,
    trial_ends_at = excluded.trial_ends_at;

  return created_organization_id;
end;
$$;

comment on function public.create_self_serve_workspace_with_owner(uuid, text, text, text, text, integer) is
'Creates an organization, assigns the owner membership, and persists the initial workspace billing state for the self-serve path.';

grant execute on function public.create_self_serve_workspace_with_owner(uuid, text, text, text, text, integer) to service_role;
