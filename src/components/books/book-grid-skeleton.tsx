import { Skeleton } from "@/components/ui/skeleton";
import { LoaderCircle } from "lucide-react";

export function BookGridSkeleton() {
  return (
    <div role="status" aria-label="Loading books">
      <span className="sr-only">Loading the shelves…</span>
      <LoaderCircle
        data-loading-spinner
        className="mx-auto mb-6 size-7 animate-spin text-slate motion-reduce:animate-none"
        aria-hidden="true"
      />
      <div className="book-grid" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-xl border bg-white p-3.5">
            <Skeleton className="h-66 rounded-lg" />
            <div className="px-1.5 pt-5">
              <Skeleton className="h-3 w-14" />
              <Skeleton className="mt-3 h-7 w-3/4" />
              <Skeleton className="mt-3 h-4 w-1/2" />
              <Skeleton className="mt-7 h-11 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
