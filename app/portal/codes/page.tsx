import { PageContainer } from "@/components/app-shell";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  SurfaceCard,
} from "@/components/admin-ui";
import { PartnerPortalBoundary } from "@/components/partner-portal-boundary";
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

export default async function PartnerPortalCodesPage() {
  const data = await listPortalCodes();
  const boundary = <PartnerPortalBoundary viewer={data.viewer} />;
  const appCount = new Set(data.codes.map((code) => code.appName)).size;

  return (
    <PageContainer className="max-w-[1180px] py-8 lg:py-10">
      <PageHeader
        eyebrow="Partner portal"
        title="Codes"
        description="Review the codes currently linked to your partner record. This view stays read-only and excludes internal admin metadata."
      >
        <div className="flex flex-wrap gap-3">
          <StatusBadge tone="success">Read-only</StatusBadge>
          {data.viewer.isLinkedToPartner ? (
            <>
              <StatusBadge tone="primary">{data.codes.length} codes visible</StatusBadge>
              <StatusBadge>{appCount} apps linked</StatusBadge>
            </>
          ) : data.viewer.hasPortalRole ? (
            <StatusBadge tone="warning">Partner link required</StatusBadge>
          ) : data.viewer.isAuthenticated ? (
            <StatusBadge tone="warning">Portal role required</StatusBadge>
          ) : (
            <StatusBadge tone="primary">Sign in required</StatusBadge>
          )}
        </div>
      </PageHeader>

      {boundary}

      {data.viewer.isLinkedToPartner ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              label="Active codes"
              value={String(data.stats.activeCodes)}
              detail="Codes marked active for your current partner mapping."
              tone="success"
            />
            <StatCard
              label="Approved items"
              value={String(data.stats.approvedCount)}
              detail="Approved commission items tied to your visible codes."
              tone="primary"
            />
            <StatCard
              label="Paid items"
              value={String(data.stats.paidCount)}
              detail="Paid commission items tied to your visible codes."
              tone="success"
            />
          </div>

          <SurfaceCard>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Code coverage
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  {data.codes.length > 0
                    ? `${data.codes.length} linked codes are visible across ${appCount} app${appCount === 1 ? "" : "s"}.`
                    : "No linked codes are visible yet."}
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  Performance context
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  Attributed event and payout status appears here as lightweight context, not as an internal operations view.
                </p>
              </div>
              <div className="rounded-[18px] border border-[#E8EDF3] bg-[#FAFBFC] px-4 py-4">
                <p className="text-sm font-semibold tracking-[-0.01em] text-ink">
                  What stays out
                </p>
                <p className="mt-2 text-sm leading-7 text-ink-muted">
                  Internal ownership notes, admin-only routing context, and workspace controls stay outside the portal.
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SectionCard
            title="Code directory"
            description="Only partner-safe code fields and lightweight performance context are shown here."
          >
            {data.codes.length === 0 ? (
              <EmptyState
                eyebrow="No codes"
                title="No partner-linked codes are visible yet"
                description="This may be normal if code assignment has not happened yet. Once codes are linked to your partner record, they will appear here automatically."
              />
            ) : (
              <div className="space-y-3">
                {data.codes.map((code) => (
                  <div
                    key={code.id}
                    className="rounded-[24px] border border-border bg-surface px-5 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-base font-semibold text-ink">{code.code}</p>
                        <p className="mt-1 text-sm text-ink-muted">
                          {code.appName} • {code.codeType}
                        </p>
                      </div>
                      <StatusBadge tone={codeTone(code.status)}>{code.status}</StatusBadge>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Created
                        </p>
                        <p className="mt-2 text-sm text-ink">{new Date(code.createdAt).toLocaleDateString("en-US")}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Attributed events
                        </p>
                        <p className="mt-2 text-sm text-ink">{code.attributedEventsCount}</p>
                      </div>
                      <div className="rounded-2xl border border-border bg-surface-elevated px-4 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-subtle">
                          Approved / paid
                        </p>
                        <p className="mt-2 text-sm text-ink">
                          {code.approvedCount} approved • {code.paidCount} paid
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </>
      ) : null}
    </PageContainer>
  );
}
