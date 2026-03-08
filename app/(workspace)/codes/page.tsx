import Link from "next/link";
import { Code2 } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  ActionButton,
  DetailList,
  EmptyState,
  FilterBar,
  FilterChipLink,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  SectionCard,
  StatusBadge,
  WorkspaceDrawer,
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
import {
  toneForPromoCodeStatus,
  toneForWorkspaceLabel,
} from "@/lib/status-badges";

type CodesPageProps = {
  searchParams: Promise<{
    status?: string;
    ownership?: string;
    code?: string;
    notice?: string;
    drawer?: string;
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
  return toneForPromoCodeStatus(status);
}

function statusLabel(status: PromoCodeStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function buildHref(params: {
  status: string;
  ownership: string;
  code?: string;
  drawer?: string;
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

  if (params.drawer) {
    search.set("drawer", params.drawer);
  }

  const query = search.toString();
  return query ? `/codes?${query}` : "/codes";
}

function noticeCopy(notice: string | undefined) {
  if (notice === "code-created") {
    return {
      tone: "green" as const,
      title: "Code created",
      detail: "The promo code register now includes the new record.",
    };
  }

  if (notice === "code-updated") {
    return {
      tone: "green" as const,
      title: "Code updated",
      detail: "The code details were saved successfully.",
    };
  }

  if (notice === "code-error") {
    return {
      tone: "red" as const,
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
          className="aa-field"
        >
          {props.appOptions.map((app) => (
            <option key={app.id} value={app.id}>
              {app.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Creator owner</span>
        <select
          name="partnerId"
          defaultValue={props.defaultPartnerId ?? "none"}
          className="aa-field"
        >
          <option value="none">Choose later</option>
          {props.partnerOptions.map((partner) => (
            <option key={partner.id} value={partner.id}>
              {partner.label}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Code or link label</span>
        <input
          name="code"
          type="text"
          required
          defaultValue={props.defaultCode ?? ""}
          className="aa-field uppercase"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select
            name="status"
            defaultValue={props.defaultStatus ?? "active"}
            className="aa-field"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Asset type</span>
          <select
            name="codeType"
            defaultValue={props.defaultCodeType ?? "promo"}
            className="aa-field"
          >
            <option value="promo">Promo</option>
            <option value="referral">Referral</option>
            <option value="campaign">Campaign</option>
            <option value="vanity">Vanity</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Channel note</span>
        <input
          name="channel"
          type="text"
          defaultValue={props.defaultChannel ?? ""}
          className="aa-field"
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
    drawer,
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
    filteredCodes.find((code) => code.id === selectedCodeId) ?? null;
  const banner = noticeCopy(notice);
  const unassignedCount = data.codes.filter((code) => !code.ownerAssigned).length;
  const appCoverageCount = new Set(data.codes.map((code) => code.appId)).size;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program"
        title="Codes"
        description="Use codes as the ownership register for attribution and app mapping."
        actions={
          <>
            <ActionLink href="/unattributed">Review queue</ActionLink>
            <ActionLink
              href={buildHref({ status, ownership, drawer: "create" })}
              variant="primary"
            >
              Create code
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone={toneForWorkspaceLabel()}>Code ownership register</StatusBadge>
          <StatusBadge tone="amber">Needs review</StatusBadge>
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          <MetricChip label="Active" value={String(data.stats.active)} detail="Visible in the register" tone="green" />
          <MetricChip
            label="Assigned"
            value={`${data.stats.assigned}/${data.codes.length}`}
            detail={`${unassignedCount} unassigned`}
            tone="blue"
          />
          <MetricChip
            label="Needs review"
            value={String(data.stats.duplicateActive)}
            detail={`${appCoverageCount} apps represented`}
            tone="amber"
          />
        </div>
      </section>

      <div className="space-y-3">
        <FilterBar
          title="Code filters"
          description={
            data.stats.duplicateActive > 0
              ? `${data.stats.duplicateActive} active code lanes still overlap.`
              : `${appCoverageCount} apps are represented in the visible register.`
          }
        >
          <FilterChipLink href={buildHref({ status: "all", ownership })} active={status === "all"}>
            All states
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status: "active", ownership })} active={status === "active"}>
            Active
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status: "draft", ownership })} active={status === "draft"}>
            Draft
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status: "paused", ownership })} active={status === "paused"}>
            Paused
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status: "archived", ownership })} active={status === "archived"}>
            Archived
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status, ownership: "all" })} active={ownership === "all"}>
            All ownership
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status, ownership: "assigned" })} active={ownership === "assigned"}>
            Assigned
          </FilterChipLink>
          <FilterChipLink href={buildHref({ status, ownership: "unassigned" })} active={ownership === "unassigned"}>
            Unassigned
          </FilterChipLink>
        </FilterBar>

        <ListTable eyebrow="Register" title="Codes table" description="Click a row to inspect ownership, app mapping, and status.">
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
                  icon={Code2}
                  eyebrow={data.hasWorkspaceAccess ? "Register" : "Access required"}
                  title={
                    data.hasWorkspaceAccess
                      ? "Create a code or link so AppAffiliate can connect promotion to results"
                      : "Sign in to review code records"
                  }
                  description={
                    data.hasWorkspaceAccess
                      ? "The ownership register fills with trackable assets once a code exists or you return to a wider filter view."
                      : "An internal workspace membership is required before code records can be read."
                  }
                  action={
                    data.hasWorkspaceAccess ? (
                      <ActionLink
                        href={buildHref({ status, ownership, drawer: "create" })}
                        variant="primary"
                      >
                        Create first code
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
                className="grid gap-4 px-5 py-3 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] md:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{code.code}</h3>
                    {code.duplicateActive ? <StatusBadge tone="red">Duplicate active</StatusBadge> : null}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{code.channel ?? "No channel note yet"}</p>
                </div>

                <div className="text-sm text-ink-muted">{code.partnerName ?? "Unassigned"}</div>
                <div className="text-sm text-ink-muted">{code.appName}</div>
                <div className="flex justify-start md:justify-end">
                  <StatusBadge tone={statusTone(code.status)}>{statusLabel(code.status)}</StatusBadge>
                </div>
              </Link>
            ))}
          </div>
        </ListTable>
      </div>

      {drawer === "create" ? (
        <WorkspaceDrawer
          closeHref={buildHref({ status, ownership })}
          eyebrow="Create"
          title="Create code"
          description="Add the next trackable asset without leaving the register."
        >
          <SectionCard
            title="Set up your first code or link"
            description="Create the first trackable asset that connects a creator to real subscription results."
          >
            {data.appOptions.length === 0 ? (
              <EmptyState
                icon={Code2}
                eyebrow="Apps required"
                title="Add your app before you create a code or link"
                description="Trackable assets appear here after there is an app lane ready to receive creator-driven results."
                action={
                  <ActionLink href="/onboarding" variant="primary">
                    Open activation guide
                  </ActionLink>
                }
              />
            ) : (
              <form action={createPromoCodeAction} className="space-y-4">
                <CodeFormFields
                  appOptions={data.appOptions}
                  partnerOptions={data.partnerOptions}
                />
                <div className="flex justify-end">
                  <ActionButton type="submit" variant="primary">
                    Create code
                  </ActionButton>
                </div>
              </form>
            )}
          </SectionCard>
        </WorkspaceDrawer>
      ) : null}

      {selectedCode ? (
        <WorkspaceDrawer
          closeHref={buildHref({ status, ownership })}
          eyebrow="Code detail"
          title={selectedCode.code}
          description={selectedCode.channel ?? "No channel note has been added for this code yet."}
          status={
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={statusTone(selectedCode.status)}>{statusLabel(selectedCode.status)}</StatusBadge>
              {selectedCode.duplicateActive ? <StatusBadge tone="red">Duplicate active</StatusBadge> : null}
            </div>
          }
        >
          <SectionCard
            title="Ownership context"
            description="Keep the linked app, owner, and channel context visible before editing the code record."
          >
            <DetailList
              items={[
                { label: "Code owner", value: selectedCode.partnerName ?? "Unassigned" },
                { label: "Linked app", value: selectedCode.appName },
                { label: "Status", value: statusLabel(selectedCode.status) },
                { label: "Channel", value: selectedCode.channel ?? "No channel note yet" },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Update code"
            description="Update status, linked app, owner, or channel context without leaving the workspace."
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
                <ActionButton type="submit" variant="primary">
                  Save changes
                </ActionButton>
              </div>
            </form>
          </SectionCard>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
