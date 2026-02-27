import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-40 rounded-full" />
      </div>

      <div className="p-4 rounded-2xl bg-card border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <Skeleton className="h-10 w-full lg:w-125 rounded-full" />

        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>

      <div className="rounded-2xl bg-card border overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-4 border-b">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-24" />
          ))}
        </div>

        {Array.from({ length: 3 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-8 gap-4 p-4 border-b last:border-0 items-center"
          >
            <Skeleton className="h-5 w-20" />

            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-28" />
            </div>

            <Skeleton className="h-5 w-36" />

            <Skeleton className="h-5 w-40" />

            <Skeleton className="h-8 w-8 rounded-full" />

            <Skeleton className="h-8 w-8 rounded-full" />

            <Skeleton className="h-5 w-24" />

            <div className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-6 rounded-2xl bg-card border space-y-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
