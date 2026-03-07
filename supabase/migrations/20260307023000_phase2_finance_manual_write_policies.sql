-- Phase 2: manual finance write policies for commission review, payout batches,
-- and payout tracking updates.

drop policy if exists "finance roles can insert ledger entries in their organization" on public.commission_ledger_entries;
create policy "finance roles can insert ledger entries in their organization"
on public.commission_ledger_entries
for insert
to authenticated
with check (public.can_read_financial_records(organization_id));

drop policy if exists "finance roles can update ledger entries in their organization" on public.commission_ledger_entries;
create policy "finance roles can update ledger entries in their organization"
on public.commission_ledger_entries
for update
to authenticated
using (public.can_read_financial_records(organization_id))
with check (public.can_read_financial_records(organization_id));

drop policy if exists "finance roles can insert payout batches in their organization" on public.payout_batches;
create policy "finance roles can insert payout batches in their organization"
on public.payout_batches
for insert
to authenticated
with check (
  public.can_read_financial_records(organization_id)
  and (
    approved_by_membership_id is null
    or approved_by_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "finance roles can update payout batches in their organization" on public.payout_batches;
create policy "finance roles can update payout batches in their organization"
on public.payout_batches
for update
to authenticated
using (public.can_read_financial_records(organization_id))
with check (
  public.can_read_financial_records(organization_id)
  and (
    approved_by_membership_id is null
    or approved_by_membership_id = public.current_active_membership_id(organization_id)
  )
);

drop policy if exists "finance roles can insert payout batch items in their organization" on public.payout_batch_items;
create policy "finance roles can insert payout batch items in their organization"
on public.payout_batch_items
for insert
to authenticated
with check (public.can_read_financial_records(organization_id));

drop policy if exists "finance roles can update payout batch items in their organization" on public.payout_batch_items;
create policy "finance roles can update payout batch items in their organization"
on public.payout_batch_items
for update
to authenticated
using (public.can_read_financial_records(organization_id))
with check (public.can_read_financial_records(organization_id));
