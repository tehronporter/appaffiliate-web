import { PageContainer } from "@/components/app-shell";
import {
  DetailList,
  EmptyState,
  InfoPanel,
  SectionCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
import {
  PortalHelpCard,
  PortalMetricCard,
  PortalPageHeader,
  PortalRecordCard,
} from "@/components/portal-ui";
import { listPortalCodes } from "@/lib/services/portal";

function codeTone(status: string) {
  if (status === "Active") {
    return "success" as const;
  }

  if (status === "Inactive") {
    return "neutral" as const;
  }

  return "primary" as const;
}

function formatDateLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function PartnerPortalCodesPage() {
  const data = await listPortalCodes();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;
  const appCount = new Set(data.codes.map((code) => code.appName)).size;

  return (
    <PageContainer className="max-w-[var(--portal-max-width)] space-y-5 py-6 lg:py-8">
      <PortalPageHeader
        eyebrow="Creator assets"
        title="Codes and links"
        description="Review the codes and links that belong to your creator profile, which apps they are tied to, and how they are performing."
      >
        <StatusBadge tone="success">Read-only ownership view</StatusBadge>
        {data.viewer.isLinkedToPartner ? (
          <>
            <StatusBadge tone="primary">{data.codes.length} visible assets</StatusBadge>
            <StatusBadge>{appCount} linked app{appCount === 1 ? "" : "s"}</StatusBadge>
          </>
        ) : data.viewer.hasPortalRole ? (
          <StatusBadge tone="warning">Creator link required</StatusBadge>
        ) : data.viewer.isAuthenticated ? (
          <StatusBadge tone="warning">Portal access required</StatusBadge>
        ) : (
          <StatusBadge tone="primary">Sign in required</StatusBadge>
        )}
      </PortalPageHeader>

      {boundary}

      {data.viewer.isLinkedToPartner ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <PortalMetricCard
              label="Active assets"
              value={String(data.stats.activeCodes)}
              detail="Codes that are active for your linked creator profile."
              tone="success"
            />
            <PortalMetricCard
              label="Linked apps"
              value={String(appCount)}
              detail="Apps currently connected to your visible codes and links."
              tone="primary"
            />
            <PortalMetricCard
              label="Approved results"
              value={String(data.stats.approvedCount)}
              detail="Creator-linked results that already have approved earnings."
              tone="primary"
            />
            <PortalMetricCard
              label="Paid results"
              value={String(data.stats.paidCount)}
              detail="Results tied to payouts that are already marked paid."
              tone="success"
            />
          </div>

          <SurfaceCard tone="portal" density="compact">
            <div className="grid gap-4 lg:grid-cols-3">
              <InfoPanel
                title="Ownership first"
                description="Everything on this page belongs to your linked creator profile. If a code is not shown here, it is not currently tied to your portal view."
              />
              <InfoPanel
                title="Performance context"
                description="You will see lightweight result context here, but not workspace controls, exports, or internal routing detail."
              />
              <InfoPanel
                title="Read-only clarity"
                description="This page is designed to confirm ownership and status quickly, especially on smaller screens."
              />
            </div>
          </SurfaceCard>

          <SectionCard
            tone="portal"
            title="Your codes and links"
            description="Each card shows the asset, the linked app, its current status, and a short performance summary."
          >
            {data.codes.length === 0 ? (
              <EmptyState
                eyebrow="No tracked activity yet"
                title="No tracked activity yet"
                description="Once your audience starts converting, results and earnings will appear here."
              />
            ) : (
              <div className="space-y-3">
                {data.codes.map((code) => (
                  <PortalRecordCard
                    key={code.id}
                    title={code.code}
                    description={`${code.appName} • ${code.codeType}`}
                    badge={<StatusBadge tone={codeTone(code.status)}>{code.status}</StatusBadge>}
                  >
                    <DetailList
                      columns={3}
                      items={[
                        {
                          label: "Created",
                          value: formatDateLabel(code.createdAt),
                        },
                        {
                          label: "Tracked results",
                          value: String(code.attributedEventsCount),
                        },
                        {
                          label: "Approved / paid",
                          value: `${code.approvedCount} / ${code.paidCount}`,
                        },
                      ]}
                    />
                  </PortalRecordCard>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard
            tone="portal"
            title="How to read this page"
            description="A few quick reminders to make code ownership and status easier to trust."
          >
            <div className="grid gap-3 lg:grid-cols-3">
              <PortalHelpCard
                title="Active"
                description="The code is active and still connected to your creator profile."
              />
              <PortalHelpCard
                title="Inactive"
                description="The code stays visible in your history even if it is not currently active."
              />
              <PortalHelpCard
                title="Why no edit controls?"
                description="The portal only shows the information you need to confirm ownership, results, and payout progress."
              />
            </div>
          </SectionCard>
        </>
      ) : null}
    </PageContainer>
  );
}
