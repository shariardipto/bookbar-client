"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { libraryQueries } from "@/lib/library-queries";
import { catalogBook } from "@/lib/library-types";
import { BookGrid } from "./book-grid";
import { BookGridSkeleton } from "./book-grid-skeleton";
import { LibraryEmpty, LibraryError } from "./library-state";
import { Button } from "@/components/ui/button";
export function LatestBooks() {
  const query = useQuery(libraryQueries.latest());
  if (query.isPending) return <BookGridSkeleton />;
  if (query.isError)
    return (
      <LibraryError
        error={query.error}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  if (!query.data.length)
    return (
      <LibraryEmpty
        title="The next chapter starts with you."
        description="Share a favorite and help our little library grow."
        action={
          <Button asChild>
            <Link href="/add-book">Add a book</Link>
          </Button>
        }
      />
    );
  return <BookGrid books={query.data.map(catalogBook)} />;
}
