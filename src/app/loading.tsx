import { BookGridSkeleton } from "@/components/books/book-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="site-container py-8">
      <Skeleton className="mb-12 h-96 rounded-2xl" />
      <BookGridSkeleton />
    </div>
  );
}
