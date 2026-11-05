import { BookGridSkeleton } from "@/components/books/book-grid-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function BooksLoading() {
  return (
    <div className="site-container py-14">
      <Skeleton className="mb-4 h-3 w-40" />
      <Skeleton className="mb-12 h-12 w-3/4 max-w-lg" />
      <BookGridSkeleton />
    </div>
  );
}
