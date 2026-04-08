import Link from "next/link";
import { AppWindow } from "lucide-react";

import { createWorkspaceAppAction } from "@/app/(workspace)/apps/actions";
import { ActionLink, PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  ListTable,
  MetricChip,
  NoticeBanner,
  PageHeader,
  StatusBadge,
  SummaryBar,
  WorkspaceDrawer,
} from "@/components/admin-ui";
import { listWorkspaceApps } from "@/lib/services/apps";
import { getLaunchReadinessData } from "@/lib/services/launch-readiness";
import { toneForSystemStatus, toneForWorkspaceLabel } from "@/lib/status-badges";

type AppsPageProps = {
  searchParams: Promise<{
    drawer?: string;
    notice?: string;
  }>;
};

function noticeCopy(notice: string | undefined) {
  if (notice === "app-error") {
    return {
      tone: "red" as const,
      title: "App change failed",
      detail: "Review the submitted fields and try again.",
    };
  }

  if (notice === "app-deleted") {
    return {
      tone: "green" as const,
      title: "App deleted",
      detail: "The app and all its associated data have been permanently removed.",
    };
  }

  return null;
}

function AppFormFields() {
  return (
    <div className="grid gap-4">
      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">App name</span>
        <input name="name" type="text" required placeholder="My App" className="aa-field" />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="create-bundleId">Bundle ID</label>
          <input id="create-bundleId" name="bundleId" type="text" placeholder="com.company.appname" className="aa-field" />
          <p className="text-xs text-ink-muted">Found in Xcode → Target → General, or App Store Connect → App Information.</p>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="create-appStoreId">App Store ID</label>
          <input id="create-appStoreId" name="appStoreId" type="text" placeholder="1234567890" className="aa-field" />
          <p className="text-xs text-ink-muted">The numeric ID at the end of your App Store URL: apps.apple.com/app/id<strong>1234567890</strong></p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="create-appleTeamId">Apple Team ID</label>
          <input id="create-appleTeamId" name="appleTeamId" type="text" placeholder="A1B2C3D4E5" className="aa-field" />
          <p className="text-xs text-ink-muted">10-character ID. Find it at <strong>developer.apple.com</strong> → Account → Membership → Team ID.</p>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="create-timezone">Timezone</label>
          <input id="create-timezone" name="timezone" type="text" defaultValue="UTC" className="aa-field" />
          <p className="text-xs text-ink-muted">IANA timezone for event timestamps. Example: America/New_York</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="create-appleFeeMode">Apple fee mode</label>
          <select id="create-appleFeeMode" name="appleFeeMode" defaultValue="standard_30" className="aa-field">
            <option value="standard_30">Standard 30%</option>
            <option value="small_business_15">Small Business 15%</option>
            <option value="custom">Custom</option>
          </select>
          <p className="text-xs text-ink-muted">Used to calculate net revenue. Most apps use Standard 30%. Small Business Program members use 15%.</p>
        </div>
        <label className="grid gap-2">
          <span className="text-sm font-medium text-ink">Status</span>
          <select name="status" defaultValue="active" className="aa-field">
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="paused">Paused</option>
            <option value="archived">Archived</option>
          </select>
        </label>
      </div>

      <label className="grid gap-2">
        <span className="text-sm font-medium text-ink">Custom fee bps</span>
        <input name="appleFeeBps" type="number" min="0" max="10000" placeholder="e.g. 2000 for 20%" className="aa-field" />
        <p className="text-xs text-ink-muted">Only required if Apple fee mode is set to Custom. Enter basis points (100 bps = 1%).</p>
      </label>
    </div>
  );
}

export default async function AppsPage({ searchParams }: AppsPageProps) {
  const { drawer, notice } = await searchParams;
  const [appsData, launch] = await Promise.all([
    listWorkspaceApps(),
    getLaunchReadinessData(),
  ]);
  const banner = noticeCopy(notice);
  const readinessById = new Map(
    (launch.rules?.appleReadiness ?? []).map((app) => [app.id, app]),
  );
  const activeApps = appsData.apps.filter((app) => app.status === "active").length;
  const ingestReadyApps = (launch.rules?.appleReadiness ?? []).filter((app) => app.ingestReady)
    .length;
  const receiptAttentionCount =
    launch.overview.monitoring.failedReceiptCount + launch.overview.monitoring.pendingReceiptCount;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Program management"
        title="Apps"
        description="Manage each app lane, its readiness, and the next operator follow-up."
        actions={
          <>
            <ActionLink href="/setup">Open setup</ActionLink>
            <ActionLink href="/apps?drawer=create" variant="primary">
              Add app
            </ActionLink>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone={toneForWorkspaceLabel()}>App lanes</StatusBadge>
          {receiptAttentionCount > 0 ? (
            <StatusBadge tone="amber">Health attention visible</StatusBadge>
          ) : null}
        </div>
      </PageHeader>

      {banner ? <NoticeBanner title={banner.title} detail={banner.detail} tone={banner.tone} /> : null}

      <section className="aa-stat-grid">
        <MetricChip label="Apps" value={String(appsData.apps.length)} detail="Configured lanes" tone="blue" />
        <MetricChip label="Active" value={String(activeApps)} detail="Live app records" tone="green" />
        <MetricChip
          label="Ingest ready"
          value={String(ingestReadyApps)}
          detail={`${appsData.apps.length - ingestReadyApps} still need attention`}
          tone={ingestReadyApps === appsData.apps.length && appsData.apps.length > 0 ? "green" : "amber"}
        />
        <MetricChip
          label="Receipt issues"
          value={String(receiptAttentionCount)}
          detail="Pending or failed Apple receipts"
          tone={receiptAttentionCount > 0 ? "amber" : "green"}
        />
      </section>

      <SummaryBar
        items={[
          {
            label: "Launch posture",
            value: launch.overallLabel,
          },
          {
            label: "Next follow-up",
            value:
              launch.checklist.find((check) => check.status === "blocked" || check.status === "attention")
                ?.title ?? "No blocking app issue",
          },
        ]}
      />

      <ListTable
        eyebrow="Inventory"
        title="Apps"
        description="Open an app to review readiness, health, creators, and recent results."
      >
        <div className="hidden grid-cols-[minmax(0,1.25fr)_130px_150px_170px_120px] gap-4 border-b border-border bg-surface-muted px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-ink-subtle md:grid">
          <span>App</span>
          <span>Status</span>
          <span>Health</span>
          <span>Latest receipt</span>
          <span>Action</span>
        </div>

        <div className="divide-y divide-border bg-surface-elevated">
          {appsData.apps.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={AppWindow}
                eyebrow={appsData.hasWorkspaceAccess ? "App lanes" : "Access required"}
                title={appsData.hasWorkspaceAccess ? "Add the first app lane" : "Sign in to manage apps"}
                description={
                  appsData.hasWorkspaceAccess
                    ? "Each app gets its own readiness, review, and creator coverage view."
                    : "Internal workspace access is required before app lanes can be configured."
                }
                action={
                  appsData.hasWorkspaceAccess ? (
                    <ActionLink href="/apps?drawer=create" variant="primary">
                      Add app
                    </ActionLink>
                  ) : null
                }
              />
            </div>
          ) : null}

          {appsData.apps.map((app) => {
            const readiness = readinessById.get(app.id);

            return (
              <Link
                key={app.id}
                href={`/apps/${app.slug}`}
                className="grid gap-3 px-4 py-4 transition odd:bg-white even:bg-[rgba(245,245,245,0.45)] hover:bg-surface md:grid-cols-[minmax(0,1.25fr)_130px_150px_170px_120px] md:items-center md:gap-4 md:px-5 md:py-3"
              >
                <div>
                  <span className="aa-mobile-label md:hidden">App</span>
                  <h3 className="text-sm font-semibold text-ink">{app.name}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    {app.bundleId ?? "Bundle ID not set"}
                  </p>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Status</span>
                  <StatusBadge tone={app.status === "active" ? "green" : "gray"}>
                    {app.status}
                  </StatusBadge>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Health</span>
                  <StatusBadge
                    tone={toneForSystemStatus(readiness?.healthLabel ?? "No receipts yet")}
                  >
                    {readiness?.healthLabel ?? "No receipts yet"}
                  </StatusBadge>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Latest receipt</span>
                  <p className="text-sm text-ink-muted">
                    {readiness?.latestReceiptAt
                      ? new Intl.DateTimeFormat("en-US", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        }).format(new Date(readiness.latestReceiptAt))
                      : "No receipts yet"}
                  </p>
                </div>
                <div>
                  <span className="aa-mobile-label md:hidden">Action</span>
                  <p className="text-sm font-semibold text-primary">Open app</p>
                </div>
              </Link>
            );
          })}
        </div>
      </ListTable>

      {drawer === "create" ? (
        <WorkspaceDrawer
          closeHref="/apps"
          eyebrow="Add app"
          title="Create app lane"
          description="Add the next app so health, creator coverage, and review can be tracked in one place."
        >
          <form action={createWorkspaceAppAction} className="space-y-4">
            <AppFormFields />
            <div className="flex flex-wrap gap-3">
              <button type="submit" className="aa-button aa-button-primary">
                Save app
              </button>
              <Link href="/apps" className="aa-button aa-button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
