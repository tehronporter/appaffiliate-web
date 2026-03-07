import Link from "next/link";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailPanel,
  EmptyState,
  FilterBar,
  FilterChipLink,
  ListTable,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
  type StatusTone,
} from "@/components/admin-ui";
import {
  createPromoCodeAction,
  updatePromoCodeAction,
} from "@/app/(workspace)/codes/actions";
import {
  listWorkspacePromoCodes,
  type PromoCodeStatus,
  type PromoCodeType,
} from "@/lib/services/codes";

type CodesPageProps = {
  searchParams: Promise<{
    status?: string;
    ownership?: string;
    code?: string;
    notice?: string;
  }>;
};

const VALID_STATUSES = new Set<PromoCodeStatus>([
  "draft",
  "active",
  "paused",
  "expired",
  "archived",
]);

function statusTone(status: PromoCodeStatus): StatusTone {
  if (status === "active") {
    return "success";
  }

  if (status === "draft" || status === "paused") {
    return "warning";
  }

  return "danger";
}

function buildHref(params: {
  status: string;
  ownership: string;
  code?: string;
}) {
  const search = new URLSearchParams();

  if (params.status !== "all") {
    search.set("status", params.status);
  }

  if (params.ownership !== "all") {
    search.set("ownership", params.ownership);
  }

  if (params.code) {
    search.set("code", params.code);
  }

  const query = search.toString();
  return query ? `/codes?${query}` : "/codes";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "code-created") {
    return {
      tone: "success" as const,
      title: "Code created",
      detail: "The promo code register now includes the new record.",
    };
  }

  if (notice === "code-updated") {
    return {
      tone: "success" as const,
      title: "Code updated",
      detail: "The code details were saved successfully.",
    };
  }

  if (notice === "code-error") {
    return {
      tone: "danger" as const,
      title: "Code change failed",
      detail: "Review the submitted fields and confirm the app/code combination is unique.",
    };
  }

  return null;
}

function CodeFormFields(props: {
  appOptions: Array<{ id: string; label: string }>;
  partnerOptions: Array<{ id: string; label: string }>;
  defaultAppId?: string;
  defaultPartnerId?: string | null;
  defaultCode?: string;
  defaultStatus?: PromoCodeStatus;
  defaultCodeType?: PromoCodeType;
  defaultChannel?: string | null;
}) {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">App</span>
        <select
          name="appId"
          required
          defaultValue={props.defaultAppId ?? props.appOptions[0]?.id ?? ""}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        >
          {props.appOptions.map((app) => (
            <option key={app.id} value={app.id}>
              {app.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Partner</span>
        <select
          name="partnerId"
          defaultValue={props.defaultPartnerId ?? "none"}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        >
          <option value="none">Unassigned</option>
          {props.partnerOptions.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Code</span>
        <input
          name="code"
          type="text"
          required
          defaultValue={props.defaultCode ?? ""}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm uppercase text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={props.defaultStatus ?? "active"}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Type</span>
          <select
            name="codeType"
            defaultValue={props.defaultCodeType ?? "promo"}
            className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
          >
            <option value="promo">Promo</option>
            <option value="referral">Referral</option>
            <option value="campaign">Campaign</option>
            <option value="vanity">Vanity</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Channel</span>
        <input
          name="channel"
          type="text"
          defaultValue={props.defaultChannel ?? ""}
          className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:bg-surface-elevated"
        />
      </label>
    </div>
  );
}

export default async function CodesPage({ searchParams }: CodesPageProps) {
  const {
    status: rawStatus = "all",
    ownership = "all",
    code: selectedCodeId,
    notice,
  } = await searchParams;
  const status = VALID_STATUSES.has(rawStatus as PromoCodeStatus)
    ? (rawStatus as PromoCodeStatus)
    : "all";
  const data = await listWorkspacePromoCodes();
  const filteredCodes = data.codes.filter((code) => {
    const matchesStatus = status === "all" || code.status === status;
    const matchesOwnership =
      ownership === "all" ||
      (ownership === "assigned" && code.ownerAssigned) ||
      (ownership === "unassigned" && !code.ownerAssigned);

    return matchesStatus && matchesOwnership;
  });
  const selectedCode =
    filteredCodes.find((code) => code.id === selectedCodeId) ??
    filteredCodes[0] ??
    null;
  const banner = noticeCopy(notice);

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Codes"
        description="Treat codes as the manual-first attribution register: which app they belong to, whether a partner owns them, and where duplicate active coverage should trigger operator review."
        actions={
          <>
            <ActionLink href="/partners">Open partners</ActionLink>
            <ActionLink href="/unattributed" variant="primary">
              Review unattributed
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="primary">Real promo code register</StatusBadge>
          <StatusBadge tone="warning">Duplicate active warnings</StatusBadge>
          <StatusBadge>App and partner scoped</StatusBadge>
        </div>
      </PageHeader>

      {banner ? (
        <SurfaceCard>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">{banner.title}</p>
              <p className="mt-1 text-sm text-ink-muted">{banner.detail}</p>
            </div>
            <StatusBadge tone={banner.tone}>{banner.title}</StatusBadge>
          </div>
        </SurfaceCard>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active"
          value={String(data.stats.active)}
          detail="Active codes stay visible because they anchor attribution coverage."
          tone="success"
        />
        <StatCard
          label="Assigned"
          value={`${data.stats.assigned}/${data.codes.length}`}
          detail="Ownership should stay explicit whenever a code already belongs to a partner."
          tone="primary"
        />
        <StatCard
          label="Duplicate active"
          value={String(data.stats.duplicateActive)}
          detail="Duplicate active lanes should stand out before they create attribution ambiguity."
          tone="warning"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <SectionCard
            eyebrow="Create"
            title="Add code"
            description="Create a code against an app, with optional partner ownership, without inventing a broader code system."
          >
            {data.appOptions.length === 0 ? (
              <EmptyState
                eyebrow="Apps required"
                title="Create an app before adding codes"
                description="Codes must belong to a workspace app, so this form becomes useful after at least one app record exists."
                action={<ActionLink href="/dashboard">Open overview</ActionLink>}
              />
            ) : (
              <form action={createPromoCodeAction} className="space-y-4">
                <CodeFormFields
                  appOptions={data.appOptions}
                  partnerOptions={data.partnerOptions}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                  >
                    Create code
                  </button>
                </div>
              </form>
            )}
          </SectionCard>

          <FilterBar
            title="Sticky filters"
            description="Review codes by lifecycle and ownership without leaving the list-and-detail flow."
          >
            <FilterChipLink
              href={buildHref({ status: "all", ownership, code: selectedCode?.id })}
              active={status === "all"}
            >
              All states
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "active", ownership, code: selectedCode?.id })}
              active={status === "active"}
            >
              Active
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "draft", ownership, code: selectedCode?.id })}
              active={status === "draft"}
            >
              Draft
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "paused", ownership, code: selectedCode?.id })}
              active={status === "paused"}
            >
              Paused
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status: "archived", ownership, code: selectedCode?.id })}
              active={status === "archived"}
            >
              Archived
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status, ownership: "all", code: selectedCode?.id })}
              active={ownership === "all"}
            >
              All ownership
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status, ownership: "assigned", code: selectedCode?.id })}
              active={ownership === "assigned"}
            >
              Assigned
            </FilterChipLink>
            <FilterChipLink
              href={buildHref({ status, ownership: "unassigned", code: selectedCode?.id })}
              active={ownership === "unassigned"}
            >
              Unassigned
            </FilterChipLink>
          </FilterBar>

          <ListTable
            eyebrow="Register"
            title="Workspace codes"
            description="Use the code register as the real source of truth for app/partner coverage and manual attribution review."
          >
            <div className="hidden grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
              <span>Code</span>
              <span>Owner</span>
              <span>App</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border bg-surface-elevated">
              {filteredCodes.length === 0 ? (
                <div className="p-5">
                  <EmptyState
                    eyebrow={data.hasWorkspaceAccess ? "No codes yet" : "Access required"}
                    title={
                      data.hasWorkspaceAccess
                        ? "No code records match this view"
                        : "Sign in to review codes"
                    }
                    description={
                      data.hasWorkspaceAccess
                        ? "Create the first code or reset filters to widen the register."
                        : "An internal workspace membership is required before code records can be read."
                    }
                    action={
                      data.hasWorkspaceAccess ? (
                        <ActionLink href="/codes" variant="primary">
                          Reset filters
                        </ActionLink>
                      ) : null
                    }
                  />
                </div>
              ) : null}

              {filteredCodes.map((code) => (
                <Link
                  key={code.id}
                  href={buildHref({ status, ownership, code: code.id })}
                  className={`grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] md:items-center ${
                    code.id === selectedCode?.id
                      ? "bg-primary-soft/40"
                      : "hover:bg-surface"
                  }`}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold text-ink">{code.code}</h3>
                      {code.duplicateActive ? (
                        <StatusBadge tone="danger">Duplicate active</StatusBadge>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-ink-muted">
                      {code.channel ?? "No channel note yet"}
                    </p>
                  </div>

                  <div className="text-sm text-ink-muted">
                    {code.partnerName ?? "Unassigned"}
                  </div>

                  <div className="text-sm text-ink-muted">{code.appName}</div>

                  <div className="flex justify-start md:justify-end">
                    <StatusBadge tone={statusTone(code.status)}>{code.status}</StatusBadge>
                  </div>
                </Link>
              ))}
            </div>
          </ListTable>
        </div>

        {selectedCode ? (
          <DetailPanel
            eyebrow="Code detail"
            title={selectedCode.code}
            description={
              selectedCode.channel ??
              "No channel note has been added for this code yet."
            }
            status={
              <div className="flex flex-wrap gap-2">
                <StatusBadge tone={statusTone(selectedCode.status)}>
                  {selectedCode.status}
                </StatusBadge>
                {selectedCode.duplicateActive ? (
                  <StatusBadge tone="danger">Duplicate active</StatusBadge>
                ) : null}
              </div>
            }
          >
            <SectionCard
              title="Operational context"
              description="Keep the app and ownership context visible before editing the code record."
              items={[
                `App: ${selectedCode.appName}.`,
                `Partner: ${selectedCode.partnerName ?? "Unassigned"}.`,
                `Type: ${selectedCode.codeType}.`,
                `Channel: ${selectedCode.channel ?? "No channel note yet"}.`,
              ]}
            />

            <SectionCard
              title="Update code"
              description="Make narrow operational changes to status, app, ownership, or channel metadata."
            >
              <form action={updatePromoCodeAction} className="space-y-4">
                <input type="hidden" name="promoCodeId" value={selectedCode.id} />
                <CodeFormFields
                  appOptions={data.appOptions}
                  partnerOptions={data.partnerOptions}
                  defaultAppId={selectedCode.appId}
                  defaultPartnerId={selectedCode.partnerId}
                  defaultCode={selectedCode.code}
                  defaultStatus={selectedCode.status}
                  defaultCodeType={selectedCode.codeType}
                  defaultChannel={selectedCode.channel}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-[color:color-mix(in_srgb,var(--color-primary)_88%,black)]"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </SectionCard>
          </DetailPanel>
        ) : (
          <DetailPanel
            eyebrow="Code detail"
            title="No code selected"
            description="Create a code or reset filters to inspect a record."
          >
            <EmptyState
              eyebrow="Empty detail"
              title="No code record is available"
              description="The detail panel will show the app, owner, and duplicate-active context once a code is available in the current view."
              action={
                <ActionLink href="/codes" variant="primary">
                  Reset filters
                </ActionLink>
              }
            />
          </DetailPanel>
        )}
      </div>
    </PageContainer>
  );
}
