import { Skeleton } from "@/components/ui/skeleton";

export default function RevenueReportsSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>

        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-32 rounded-full" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border space-y-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-card border space-y-4">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-card border space-y-4">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-64" />
          <div className="flex justify-center pt-6">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-card border space-y-6">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-72" />

          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-card border space-y-6">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />

        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="flex justify-between items-center p-4 rounded-xl bg-muted/40"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            <div className="space-y-2 text-right">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
