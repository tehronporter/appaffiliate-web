import Link from "next/link";
import { notFound } from "next/navigation";

import { updateWorkspaceAppAction, deleteWorkspaceAppAction } from "@/app/(workspace)/apps/actions";
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
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="edit-bundleId">Bundle ID</label>
          <input id="edit-bundleId" name="bundleId" type="text" defaultValue={props.bundleId ?? ""} placeholder="com.company.appname" className="aa-field" />
          <p className="text-xs text-ink-muted">Found in Xcode → Target → General, or App Store Connect → App Information.</p>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="edit-appStoreId">App Store ID</label>
          <input id="edit-appStoreId" name="appStoreId" type="text" defaultValue={props.appStoreId ?? ""} placeholder="1234567890" className="aa-field" />
          <p className="text-xs text-ink-muted">The numeric ID at the end of your App Store URL: apps.apple.com/app/id<strong>1234567890</strong></p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="edit-appleTeamId">Apple Team ID</label>
          <input id="edit-appleTeamId" name="appleTeamId" type="text" defaultValue={props.appleTeamId ?? ""} placeholder="A1B2C3D4E5" className="aa-field" />
          <p className="text-xs text-ink-muted">10-character ID. Find it at <strong>developer.apple.com</strong> → Account → Membership → Team ID.</p>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="edit-timezone">Timezone</label>
          <input id="edit-timezone" name="timezone" type="text" defaultValue={props.timezone} className="aa-field" />
          <p className="text-xs text-ink-muted">IANA timezone for event timestamps. Example: America/New_York</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <label className="text-sm font-medium text-ink" htmlFor="edit-appleFeeMode">Apple fee mode</label>
          <select id="edit-appleFeeMode" name="appleFeeMode" defaultValue={props.appleFeeMode} className="aa-field">
            <option value="standard_30">Standard 30%</option>
            <option value="small_business_15">Small Business 15%</option>
            <option value="custom">Custom</option>
          </select>
          <p className="text-xs text-ink-muted">Used to calculate net revenue. Most apps use Standard 30%. Small Business Program members use 15%.</p>
        </div>
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
          placeholder="e.g. 2000 for 20%"
          className="aa-field"
        />
        <p className="text-xs text-ink-muted">Only required if Apple fee mode is set to Custom. Enter basis points (100 bps = 1%).</p>
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

  if (notice === "delete-error") {
    return {
      tone: "red" as const,
      title: "Delete failed",
      detail: "Unable to delete the app. Please try again.",
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
  const endpointValue = readiness.webhookSetup.endpointUrl ?? "Configure app URL and ingest key";
  const endpointDetail =
    readiness.webhookSetup.endpointPath ?? "Webhook endpoint appears after App URL and ingest key are configured.";

  const setupSteps = [
    {
      id: "app-details",
      label: "Complete app details",
      detail: "Fill in your Bundle ID, App Store ID, and Apple Team ID so AppAffiliate can verify receipts for the right app.",
      done: Boolean(resolvedApp.bundleId && resolvedApp.appStoreId && resolvedApp.appleTeamId),
      action: { label: "Edit app", href: `?drawer=edit` },
    },
    {
      id: "apple-certs",
      label: "Add Apple root certificate",
      detail: "In your Vercel project, add the environment variable APPLE_ROOT_CA_BASE64. Download Apple's G3 root certificate from developer.apple.com → Certificates → Root Certificates, base64-encode it, and paste it as the value. Set APPLE_ENABLE_ONLINE_CHECKS to false.",
      done: readiness.webhookSetup.hasVerificationConfig,
      action: { label: "Open Apple health", href: `/apps/${resolvedApp.slug}/apple-health` },
    },
    {
      id: "server-notifications",
      label: "Point Apple Server Notifications to your webhook",
      detail: readiness.webhookSetup.endpointUrl
        ? `In App Store Connect → your app → App Information → App Store Server Notifications, paste this URL for both Production and Sandbox:`
        : "Your webhook URL will appear here once the app URL is configured. Check NEXT_PUBLIC_APP_URL in your Vercel environment variables.",
      webhookUrl: readiness.webhookSetup.endpointUrl ?? null,
      done: Boolean(readiness.latestReceiptAt),
      action: { label: "Open Apple health", href: `/apps/${resolvedApp.slug}/apple-health` },
    },
    {
      id: "creator-code",
      label: "Add a creator and assign a promo code",
      detail: "Create a creator record, then create a promo code that matches your Apple Offer Code identifier and link it to the creator. This is what attribution uses to identify who drove each purchase.",
      done: linkedCreators.length > 0 && appCodes.length > 0,
      action: { label: "Add creator", href: `/creators` },
      secondaryAction: { label: "Create code", href: `/codes?drawer=create` },
    },
  ];

  const currentStepIndex = setupSteps.findIndex((s) => !s.done);
  const allSetupDone = currentStepIndex === -1;

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Apps"
        title={resolvedApp.name}
        description="Manage this app lane, its readiness, linked creators, and the latest earning context."
        actions={
          <>
            <ActionLink href={`/apps/${resolvedApp.slug}/apple-health`}>Open health</ActionLink>
            <ActionLink href={`/apps/${resolvedApp.slug}?drawer=delete`} variant="secondary">
              Delete app
            </ActionLink>
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

      {!allSetupDone && (
        <section className="rounded-xl border border-primary/20 bg-[linear-gradient(160deg,rgba(238,243,255,0.7)_0%,rgba(255,255,255,0.95)_100%)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Get connected
              </p>
              <p className="mt-1 text-sm text-ink-muted">
                {currentStepIndex + 1} of {setupSteps.length} steps complete — follow these in order to start receiving live attribution data.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Step {currentStepIndex + 1} of {setupSteps.length}
            </span>
          </div>

          <ol className="mt-5 space-y-2">
            {setupSteps.map((step, index) => {
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <li
                  key={step.id}
                  className={[
                    "rounded-lg border px-4 py-3 transition-all",
                    isActive
                      ? "border-primary/30 bg-white shadow-[0_2px_12px_rgba(46,83,255,0.08)]"
                      : isPast
                        ? "border-transparent bg-transparent opacity-60"
                        : "border-transparent bg-transparent opacity-40",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={[
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                        isPast
                          ? "bg-green-100 text-green-700"
                          : isActive
                            ? "bg-primary text-white"
                            : "bg-border text-ink-subtle",
                      ].join(" ")}
                    >
                      {isPast ? "✓" : index + 1}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p
                        className={[
                          "text-sm font-semibold",
                          isPast ? "text-ink-muted line-through" : "text-ink",
                        ].join(" ")}
                      >
                        {step.label}
                      </p>

                      {isActive && (
                        <>
                          <p className="mt-1 text-sm leading-5 text-ink-muted">{step.detail}</p>

                          {"webhookUrl" in step && step.webhookUrl && (
                            <div className="mt-3 rounded-md border border-primary/20 bg-[rgba(46,83,255,0.04)] px-3 py-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                                Webhook URL — copy and paste into App Store Connect
                              </p>
                              <p className="mt-1 break-all font-mono text-xs text-ink">
                                {step.webhookUrl}
                              </p>
                            </div>
                          )}

                          <div className="mt-3 flex flex-wrap gap-2">
                            <Link
                              href={step.action.href}
                              className="aa-button aa-button-primary text-xs"
                            >
                              {step.action.label}
                            </Link>
                            {"secondaryAction" in step && step.secondaryAction && (
                              <Link
                                href={step.secondaryAction.href}
                                className="aa-button aa-button-secondary text-xs"
                              >
                                {step.secondaryAction.label}
                              </Link>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

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
                { label: "Webhook endpoint", value: endpointValue },
                {
                  label: "Verification config",
                  value: readiness.webhookSetup.hasVerificationConfig
                    ? "Configured"
                    : "Needs attention",
                },
              ]}
            />
          </SectionCard>

          <SectionCard
            title="Webhook setup"
            description="Copy the real endpoint, confirm environment prerequisites, and keep the expected request shape visible."
            actions={<ActionLink href={`/apps/${resolvedApp.slug}/apple-health`}>Open Apple health</ActionLink>}
          >
            <div className="space-y-4">
              <InsetPanel tone={readiness.webhookSetup.endpointUrl ? "blue" : "amber"}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-subtle">
                  Notification endpoint
                </p>
                <p className="mt-2 break-all text-sm font-medium text-ink">{endpointValue}</p>
                <p className="mt-2 text-sm leading-5 text-ink-muted">{endpointDetail}</p>
              </InsetPanel>

              <DetailList
                columns={1}
                items={[
                  {
                    label: "Expected request",
                    value: `${readiness.webhookSetup.requestMethod} ${readiness.webhookSetup.requestBodyExample}`,
                  },
                  {
                    label: "App URL",
                    value: readiness.webhookSetup.appUrl ?? "Missing NEXT_PUBLIC_APP_URL",
                  },
                  {
                    label: "Apple verification",
                    value: readiness.webhookSetup.verificationDetail,
                  },
                ]}
              />
            </div>
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

      {drawer === "delete" ? (
        <WorkspaceDrawer
          closeHref={`/apps/${resolvedApp.slug}`}
          eyebrow="Delete app"
          title={resolvedApp.name}
          description="This action cannot be undone. All associated data will be permanently deleted."
        >
          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-900">
                Are you sure you want to delete <strong>{resolvedApp.name}</strong>? This will permanently remove the app and all its associated data, including codes, creators, and earnings data.
              </p>
            </div>
            <form action={deleteWorkspaceAppAction} className="space-y-4">
              <input type="hidden" name="appId" value={resolvedApp.id} />
              <input type="hidden" name="appSlug" value={resolvedApp.slug} />
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="aa-button aa-button-danger">
                  Delete app
                </button>
                <Link href={`/apps/${resolvedApp.slug}`} className="aa-button aa-button-secondary">
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </WorkspaceDrawer>
      ) : null}
    </PageContainer>
  );
}
