import { Skeleton } from "@/components/ui/skeleton";

function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border border-line bg-card p-[18px]">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-28 bg-surface-2" />
        <Skeleton className="size-[26px] rounded-md bg-surface-2" />
      </div>
      <div className="mt-3.5 flex items-baseline gap-2.5">
        <Skeleton className="h-8 w-16 bg-surface-2" />
        <Skeleton className="h-4 w-10 rounded-sm bg-surface-2" />
      </div>
    </div>
  );
}

function RecentRowSkeleton({ first }: { first?: boolean }) {
  return (
    <div
      className={`grid grid-cols-[28px_180px_1fr_auto_70px] items-center gap-3 px-0.5 py-2.5 ${
        first ? "" : "border-t border-line"
      }`}
    >
      <Skeleton className="size-7 rounded-full bg-surface-2" />
      <div className="space-y-1.5">
        <Skeleton className="h-3 w-28 bg-surface-2" />
        <Skeleton className="h-2.5 w-20 bg-surface-2" />
      </div>
      <Skeleton className="h-3 w-48 bg-surface-2" />
      <Skeleton className="h-5 w-16 rounded-full bg-surface-2" />
      <Skeleton className="ml-auto h-3 w-8 bg-surface-2" />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-5">
        <div className="space-y-2">
          <Skeleton className="h-9 w-52 bg-surface-2" />
          <Skeleton className="h-4 w-72 bg-surface-2" />
        </div>
        <div className="flex shrink-0 gap-2">
          <Skeleton className="h-8 w-24 rounded-md bg-surface-2" />
          <Skeleton className="h-8 w-24 rounded-md bg-surface-2" />
        </div>
      </div>

      {/* Metric cards */}
      <div className="mb-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Chart + Intents */}
      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-lg border border-line bg-card p-[22px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40 bg-surface-2" />
              <Skeleton className="h-3 w-20 bg-surface-2" />
            </div>
            <div className="flex gap-3.5">
              <Skeleton className="h-3 w-8 bg-surface-2" />
              <Skeleton className="h-3 w-14 bg-surface-2" />
            </div>
          </div>
          <Skeleton className="mt-5 h-[180px] w-full rounded-md bg-surface-2" />
        </div>

        <div className="rounded-lg border border-line bg-card p-[22px]">
          <Skeleton className="h-4 w-44 bg-surface-2" />
          <Skeleton className="mt-1.5 mb-3.5 h-3 w-28 bg-surface-2" />
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-28 bg-surface-2" />
                  <Skeleton className="h-3 w-6 bg-surface-2" />
                </div>
                <Skeleton className="h-1 w-full rounded-full bg-surface-2" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent conversations */}
      <div className="mt-3.5 rounded-lg border border-line bg-card p-[22px]">
        <div className="mb-3.5 flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36 bg-surface-2" />
            <Skeleton className="h-3 w-28 bg-surface-2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-md bg-surface-2" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <RecentRowSkeleton key={i} first={i === 0} />
        ))}
      </div>
    </div>
  );
}
