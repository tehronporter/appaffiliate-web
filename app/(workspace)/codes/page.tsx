import Link from "next/link";
import { Code2 } from "lucide-react";

import { ActionLink, PageContainer } from "@/components/app-shell";
import { CodeFormFields } from "@/components/code-form-fields";
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
  SummaryBar,
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
        description="Use codes as the ownership register."
        actions={
          <>
            <ActionLink href="/review?view=needs-review">Review queue</ActionLink>
            <ActionLink
              href={buildHref({ status, ownership, drawer: "create" })}
              variant="primary"
            >
              Create code
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>Code ownership register</StatusBadge>
          {data.stats.duplicateActive > 0 ? <StatusBadge tone="amber">Needs review</StatusBadge> : null}
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <section>
        <div className="aa-stat-grid">
          <MetricChip label="Active" value={String(data.stats.active)} detail="In register" tone="green" />
          <MetricChip
            label="Assigned"
            value={`${data.stats.assigned}/${data.codes.length}`}
            detail={`${unassignedCount} unassigned`}
            tone="blue"
          />
          <MetricChip
            label="Needs review"
            value={String(data.stats.duplicateActive)}
            detail={`${appCoverageCount} apps`}
            tone="amber"
          />
        </div>
      </section>

      <div className="space-y-3">
        <SummaryBar
          items={[
            {
              label: "Ownership",
              value: unassignedCount > 0 ? `${unassignedCount} unassigned` : "Ownership calm",
            },
            {
              label: "Apps",
              value: `${appCoverageCount} represented`,
            },
          ]}
        />

        <FilterBar
          title="Filters"
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

        <ListTable eyebrow="Register" title="Codes" description="Select a row to inspect or edit.">
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
                      ? "Create your first code"
                      : "Sign in to review code records"
                  }
                  description={
                    data.hasWorkspaceAccess
                      ? "Trackable assets appear here after the first code is created."
                      : "An internal workspace membership is required."
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
                className="grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] md:items-center md:gap-4 md:px-5 md:py-3"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{code.code}</h3>
                    {code.duplicateActive ? <StatusBadge tone="red">Duplicate active</StatusBadge> : null}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{code.channel ?? "No channel note"}</p>
                </div>

                <div>
                  <span className="aa-mobile-label md:hidden">Owner</span>
                  <div className="text-sm text-ink-muted">{code.partnerName ?? "Unassigned"}</div>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">App</span>
                  <div className="text-sm text-ink-muted">{code.appName}</div>
                </div>
                <div className="flex justify-start md:justify-end">
                  <span className="aa-mobile-label mr-2 md:hidden">Status</span>
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
          description="Add the next trackable asset."
        >
          <SectionCard
            title="Code details"
            description="Keep the setup short and direct."
          >
            {data.appOptions.length === 0 ? (
              <EmptyState
                icon={Code2}
                eyebrow="Apps required"
                title="Add your app before you create a code or link"
                description="Trackable assets appear after an app lane is ready."
                action={
                  <ActionLink href="/setup" variant="primary">
                    Open setup
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
          description={selectedCode.channel ?? "No channel note yet."}
          status={
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone={statusTone(selectedCode.status)}>{statusLabel(selectedCode.status)}</StatusBadge>
              {selectedCode.duplicateActive ? <StatusBadge tone="red">Duplicate active</StatusBadge> : null}
            </div>
          }
        >
          <SectionCard
            title="Context"
            description="Current owner, app, and channel."
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
            title="Edit code"
            description="Update status, app, owner, or channel."
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
