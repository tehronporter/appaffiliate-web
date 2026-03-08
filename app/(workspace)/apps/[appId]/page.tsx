import Link from "next/link";
import { notFound } from "next/navigation";

import { updateWorkspaceAppAction } from "@/app/(workspace)/apps/actions";
import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  DetailList,
  InsetPanel,
  ListTable,
  NoticeBanner,
  PageHeader,
  QuickActionTile,
  SectionCard,
  StatusBadge,
  SummaryBar,
  WorkspaceDrawer,
} from "@/components/admin-ui";
import { getAppleHealthReadinessData } from "@/lib/services/apple-read-model";
import { listWorkspaceApps } from "@/lib/services/apps";
import { listWorkspacePromoCodes } from "@/lib/services/codes";
import { listCommissionItems } from "@/lib/services/finance";
import { listWorkspacePartners } from "@/lib/services/partners";
import { getSetupGuideData } from "@/lib/setup-guide";
import { toneForSystemStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

type AppDetailPageProps = {
  params: Promise<{
    appId: string;
  }>;
  searchParams: Promise<{
    notice?: string;
    drawer?: string;
  }>;
};

function AppFormFields(props: {
  appId: string;
  appSlug: string;
  name: string;
  bundleId: string | null;
  appStoreId: string | null;
  appleTeamId: string | null;
  timezone: string;
  appleFeeMode: "standard_30" | "small_business_15" | "custom";
  appleFeeBps: number | null;
  status: "draft" | "active" | "paused" | "archived";
}) {
  return (
    <div className="grid gap-4">
      <input type="hidden" name="appId" value={props.appId} />
      <input type="hidden" name="appSlug" value={props.appSlug} />

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">App name</span>
        <input name="name" type="text" required defaultValue={props.name} className="aa-field" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Bundle ID</span>
          <input name="bundleId" type="text" defaultValue={props.bundleId ?? ""} className="aa-field" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">App Store ID</span>
          <input name="appStoreId" type="text" defaultValue={props.appStoreId ?? ""} className="aa-field" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Apple team ID</span>
          <input name="appleTeamId" type="text" defaultValue={props.appleTeamId ?? ""} className="aa-field" />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Timezone</span>
          <input name="timezone" type="text" defaultValue={props.timezone} className="aa-field" />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Apple fee mode</span>
          <select name="appleFeeMode" defaultValue={props.appleFeeMode} className="aa-field">
            <option value="standard_30">Standard 30%</option>
            <option value="small_business_15">Small business 15%</option>
            <option value="custom">Custom</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue={props.status} className="aa-field">
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Custom fee bps</span>
        <input
          name="appleFeeBps"
          type="number"
          min="0"
          max="10000"
          defaultValue={props.appleFeeBps ?? ""}
          className="aa-field"
        />
      </label>
    </div>
  );
}

function noticeCopy(notice: string | undefined) {
  if (notice === "app-created") {
    return {
      tone: "green" as const,
      title: "App created",
      detail: "The new app lane is ready for creator coverage and health review.",
    };
  }

  if (notice === "app-updated") {
    return {
      tone: "green" as const,
      title: "App updated",
      detail: "The app settings were saved successfully.",
    };
  }

  if (notice === "app-error") {
    return {
      tone: "red" as const,
      title: "App change failed",
      detail: "Review the submitted fields and try again.",
    };
  }

  return null;
}

export default async function AppDetailPage({
  params,
  searchParams,
}: AppDetailPageProps) {
  const { appId } = await params;
  const { notice, drawer } = await searchParams;
  const decodedAppId = decodeURIComponent(appId);
  const [appsData, readiness, partnersData, codesData, commissions, setup] = await Promise.all([
    listWorkspaceApps(),
    getAppleHealthReadinessData(decodedAppId),
    listWorkspacePartners(),
    listWorkspacePromoCodes(),
    listCommissionItems(),
    getSetupGuideData(),
  ]);
  const app =
    appsData.apps.find((item) => item.id === decodedAppId || item.slug === decodedAppId) ?? null;

  if (!app && !readiness.app) {
    notFound();
  }

  const resolvedApp = app ?? {
    id: readiness.app!.id,
    slug: readiness.app!.slug,
    name: readiness.app!.name,
    status: readiness.app!.status as "draft" | "active" | "paused" | "archived",
    bundleId: null,
    appStoreId: null,
    appleTeamId: null,
    timezone: "UTC",
    ingestKey: readiness.app!.ingest_key,
    appleFeeMode: "standard_30" as const,
    appleFeeBps: null,
    createdAt: "",
    updatedAt: "",
  };
  const banner = noticeCopy(notice);
  const appCodes = codesData.codes.filter((code) => code.appId === resolvedApp.id);
  const linkedPartnerIds = new Set(
    appCodes.map((code) => code.partnerId).filter((value): value is string => Boolean(value)),
  );
  const linkedCreators = partnersData.partners.filter((partner) => linkedPartnerIds.has(partner.id));
  const appCommissionItems = commissions.items.filter((item) => item.appSlug === resolvedApp.slug);
  const appGuide = setup.appGuides.find((item) => item.id === resolvedApp.id) ?? null;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Apps"
        title={resolvedApp.name}
        description="Manage this app lane, its readiness, linked creators, and the latest earning context."
        actions={
          <>
            <ActionLink href={`/apps/${resolvedApp.slug}/apple-health`}>Open health</ActionLink>
            <ActionLink href={`/apps/${resolvedApp.slug}?drawer=edit`} variant="primary">
              Edit app
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>App center</StatusBadge>
          <StatusBadge tone={toneForSystemStatus(readiness.readinessLabel)}>
            {readiness.readinessLabel}
          </StatusBadge>
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <SummaryBar
        items={[
          {
            label: "Setup",
            value: appGuide ? `${appGuide.completeCount}/${appGuide.totalCount} complete` : "No setup data",
          },
          {
            label: "Creators",
            value: linkedCreators.length > 0 ? `${linkedCreators.length} linked` : "No creators linked",
          },
          {
            label: "Codes",
            value: appCodes.length > 0 ? `${appCodes.length} active register rows` : "No codes yet",
          },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-5">
          <SectionCard
            title="Overview"
            description="Core app lane settings and operator-visible status."
          >
            <DetailList
              items={[
                { label: "Status", value: resolvedApp.status },
                { label: "Bundle ID", value: resolvedApp.bundleId ?? "Not set" },
                { label: "App Store ID", value: resolvedApp.appStoreId ?? "Not set" },
                { label: "Apple team ID", value: resolvedApp.appleTeamId ?? "Not set" },
                { label: "Timezone", value: resolvedApp.timezone },
                { label: "Ingest key", value: resolvedApp.ingestKey ?? "Missing" },
              ]}
            />
          </SectionCard>

          <ListTable
            eyebrow="Setup"
            title="App checklist"
            description="Each app should have ingest, creator coverage, codes, and live result flow."
          >
            {(appGuide?.steps ?? []).map((step) => (
              <div
                key={step.id}
                className="flex flex-col gap-3 border-b border-[var(--aa-shell-border)] px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[15px] font-semibold tracking-[-0.01em] text-ink">
                      {step.label}
                    </p>
                    <StatusBadge tone={step.complete ? "green" : "amber"}>
                      {step.complete ? "Complete" : "Next step"}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm leading-5 text-ink-muted">{step.detail}</p>
                </div>
                <ActionLink href={step.href}>Open</ActionLink>
              </div>
            ))}
          </ListTable>

          <ListTable
            eyebrow="Creators"
            title="Assigned creators"
            description="Creators linked through the code register for this app."
          >
            {linkedCreators.length === 0 ? (
              <div className="p-4">
                <InsetPanel tone="amber">
                  <p className="text-sm text-ink-muted">
                    No creator is linked to this app yet. Add a creator or assign a code to create coverage.
                  </p>
                </InsetPanel>
              </div>
            ) : (
              linkedCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creators/${creator.slug}`}
                  className="flex items-center justify-between gap-3 border-b border-[var(--aa-shell-border)] px-4 py-3 last:border-b-0 hover:bg-[var(--aa-shell-panel-muted)]"
                >
                  <div>
                    <p className="text-sm font-semibold text-ink">{creator.name}</p>
                    <p className="mt-1 text-sm text-ink-muted">
                      {creator.contactEmail ?? "No email on file"}
                    </p>
                  </div>
                  <StatusBadge tone={creator.status === "active" ? "green" : "gray"}>
                    {creator.status}
                  </StatusBadge>
                </Link>
              ))
            )}
          </ListTable>
        </div>

        <div className="space-y-5">
          <QuickActionTile
            href={`/apps/${resolvedApp.slug}/apple-health`}
            title="Open Apple health"
            description="Inspect receipt intake, normalization status, and the next operator follow-up."
          />
          <QuickActionTile
            href="/codes?drawer=create"
            title="Create code for this app"
            description="Add the next creator-linked code so attribution can resolve ownership."
          />
          <QuickActionTile
            href="/review?view=all"
            title="Review app results"
            description="Open the unified review surface and inspect tracked results for this app."
          />

          <SectionCard
            title="Earnings summary"
            description="Read-only earning posture scoped to this app lane."
          >
            <DetailList
              columns={1}
              items={[
                {
                  label: "Tracked earning rows",
                  value: String(appCommissionItems.length),
                },
                {
                  label: "Approved or payout-ready",
                  value: String(
                    appCommissionItems.filter(
                      (item) =>
                        item.reviewState === "approved" ||
                        item.reviewState === "payout_ready" ||
                        item.reviewState === "paid",
                    ).length,
                  ),
                },
                {
                  label: "Latest event",
                  value: appCommissionItems[0]?.occurredAt
                    ? new Intl.DateTimeFormat("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(appCommissionItems[0].occurredAt))
                    : "No earning rows yet",
                },
              ]}
            />
          </SectionCard>
        </div>
      </div>

      {drawer === "edit" ? (
        <WorkspaceDrawer
          closeHref={`/apps/${resolvedApp.slug}`}
          eyebrow="Edit app"
          title={resolvedApp.name}
          description="Update the app lane settings without leaving the management view."
        >
          <form action={updateWorkspaceAppAction} className="space-y-4">
            <AppFormFields
              appId={resolvedApp.id}
              appSlug={resolvedApp.slug}
              name={resolvedApp.name}
              bundleId={resolvedApp.bundleId}
              appStoreId={resolvedApp.appStoreId}
              appleTeamId={resolvedApp.appleTeamId}
              timezone={resolvedApp.timezone}
              appleFeeMode={resolvedApp.appleFeeMode}
              appleFeeBps={resolvedApp.appleFeeBps}
              status={resolvedApp.status}
            />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="aa-button aa-button-primary">
                Save changes
              </button>
              <Link href={`/apps/${resolvedApp.slug}`} className="aa-button aa-button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
