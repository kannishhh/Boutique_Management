import { Skeleton } from "@/components/ui/skeleton";

export default function MeasurementsSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      <div className="rounded-2xl bg-card border overflow-hidden">
        <div className="p-6 border-b">
          <Skeleton className="h-6 w-56" />
        </div>

        <div className="grid grid-cols-6 gap-4 p-4 border-b">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-28" />
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-6 gap-4 p-4 border-b last:border-0 items-center"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-5 w-32" />
            </div>

            <Skeleton className="h-7 w-24 rounded-full" />

            <Skeleton className="h-7 w-20 rounded-full" />

            <Skeleton className="h-5 w-20" />

            <Skeleton className="h-5 w-24" />

            <div className="flex gap-3 justify-start">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
