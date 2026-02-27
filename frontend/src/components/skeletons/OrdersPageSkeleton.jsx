import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersSkeleton() {
  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>

      <div className="p-4 rounded-2xl bg-card border flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <Skeleton className="h-10 w-full lg:w-96 rounded-full" />

        <div className="flex gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-card border overflow-hidden">
        <div className="grid grid-cols-8 gap-4 p-4 border-b">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-20" />
          ))}
        </div>

        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-8 gap-4 p-4 border-b last:border-0 items-center"
          >
            <Skeleton className="h-5 w-20" />

            <Skeleton className="h-5 w-28" />

            <Skeleton className="h-5 w-24" />

            <Skeleton className="h-5 w-24" />

            <Skeleton className="h-6 w-24 rounded-full" />

            <Skeleton className="h-6 w-20 rounded-full" />

            <Skeleton className="h-5 w-20" />

            <div className="flex gap-3">
              <Skeleton className="h-5 w-5 rounded-full" />
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
