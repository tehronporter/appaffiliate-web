import { PageContainer } from "@/components/app-shell";
import { LoadingSkeleton, SurfaceCard } from "@/components/admin-ui";

function HeaderSkeleton() {
  return (
    <SurfaceCard density="compact" className="shadow-none">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="space-y-2">
          <LoadingSkeleton className="h-3 w-20" />
          <LoadingSkeleton className="h-8 w-40" />
          <LoadingSkeleton className="h-5 w-full max-w-[420px]" />
          <div className="flex flex-wrap gap-2 pt-1">
            <LoadingSkeleton className="h-6 w-24 rounded-full" />
            <LoadingSkeleton className="h-6 w-20 rounded-full" />
            <LoadingSkeleton className="h-6 w-28 rounded-full" />
          </div>
        </div>
        <div className="flex gap-2 xl:justify-end">
          <LoadingSkeleton className="h-11 w-24 rounded-full" />
          <LoadingSkeleton className="h-11 w-32 rounded-full" />
        </div>
      </div>
    </SurfaceCard>
  );
}

export function DashboardLoadingState() {
  return (
    <PageContainer>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <LoadingSkeleton className="h-8 w-36" />
          <LoadingSkeleton className="h-11 w-32 rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          <LoadingSkeleton className="h-6 w-32 rounded-full" />
          <LoadingSkeleton className="h-6 w-16 rounded-full" />
          <LoadingSkeleton className="h-6 w-28 rounded-full" />
        </div>
      </section>

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-[96px] w-[160px]" />
          ))}
        </div>
      </section>

      <LoadingSkeleton className="h-[56px] w-full rounded-[var(--radius-card)]" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.65fr)_minmax(320px,0.35fr)]">
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, panelIndex) => (
            <SurfaceCard key={panelIndex}>
              <div className="flex items-center justify-between gap-3">
                <LoadingSkeleton className="h-3 w-28" />
                <LoadingSkeleton className="h-4 w-20" />
              </div>
              <div className="mt-4 space-y-3">
                {Array.from({ length: panelIndex === 1 ? 5 : 2 }).map((__, rowIndex) => (
                  <LoadingSkeleton
                    key={rowIndex}
                    className={panelIndex === 1 ? "h-12 w-full" : "h-[72px] w-full"}
                  />
                ))}
              </div>
            </SurfaceCard>
          ))}
        </div>

        <div className="space-y-6">
          <SurfaceCard>
            <LoadingSkeleton className="h-3 w-16" />
            <div className="mt-4 space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard>
            <div className="flex items-center justify-between gap-3">
              <LoadingSkeleton className="h-4 w-40" />
              <LoadingSkeleton className="h-6 w-12 rounded-full" />
            </div>
            <LoadingSkeleton className="mt-3 h-4 w-full max-w-[240px]" />
            <div className="mt-4 flex gap-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <LoadingSkeleton key={index} className="h-1.5 flex-1 rounded-full" />
              ))}
            </div>
            <LoadingSkeleton className="mt-4 h-11 w-40 rounded-full" />
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}

export function TableWorkspaceLoadingState({
  statCount = 4,
  showSecondaryAction = true,
}: {
  statCount?: number;
  showSecondaryAction?: boolean;
}) {
  return (
    <PageContainer>
      <HeaderSkeleton />

      <section className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-3">
          {Array.from({ length: statCount }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-[88px] w-[160px]" />
          ))}
        </div>
      </section>

      <SurfaceCard density="compact" className="shadow-none">
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="min-w-[180px] space-y-2">
              <LoadingSkeleton className="h-3 w-20" />
              <LoadingSkeleton className="h-4 w-44" />
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <div className="space-y-2">
          <LoadingSkeleton className="h-3 w-24" />
          <LoadingSkeleton className="h-4 w-full max-w-[320px]" />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingSkeleton key={index} className="h-11 w-24 rounded-full" />
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard>
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
          <div className="space-y-2">
            <LoadingSkeleton className="h-3 w-20" />
            <LoadingSkeleton className="h-5 w-40" />
            <LoadingSkeleton className="h-4 w-full max-w-[420px]" />
          </div>
          <div className="flex gap-2 xl:justify-end">
            {showSecondaryAction ? (
              <LoadingSkeleton className="h-11 w-24 rounded-full" />
            ) : null}
            <LoadingSkeleton className="h-11 w-32 rounded-full" />
          </div>
        </div>

        <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--aa-shell-border)] bg-[var(--aa-shell-panel-muted)]">
          <div className="hidden grid-cols-4 gap-4 border-b border-[var(--aa-shell-border)] px-5 py-3 md:grid">
            {Array.from({ length: 4 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-3 w-20" />
            ))}
          </div>
          <div className="divide-y divide-[var(--aa-shell-border)] bg-white">
            {Array.from({ length: 7 }).map((_, index) => (
              <LoadingSkeleton key={index} className="h-[68px] w-full rounded-none" />
            ))}
          </div>
        </div>
      </SurfaceCard>
    </PageContainer>
  );
}
