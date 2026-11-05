"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { libraryDate } from "@/lib/library-date";
import { libraryKey, libraryQueries } from "@/lib/library-queries";
import type { LibraryBorrow } from "@/lib/library-types";
import { Button } from "@/components/ui/button";
import { BookCover } from "./book-cover";
import { LibraryEmpty, LibraryError, libraryMessage } from "./library-state";
import { ConfirmDialog } from "./library-dialog";

export function MyBorrows({ userId }: { userId: string }) {
  const loans = useQuery(libraryQueries.borrows(userId)),
    queryClient = useQueryClient();
  const [returning, setReturning] = useState<LibraryBorrow | null>(null);
  const giveBack = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/borrows/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryKey });
      setReturning(null);
      toast.success("Book returned. There’s another story waiting for you.");
    },
    onError: (error) => {
      toast.error(libraryMessage(error));
      void queryClient.invalidateQueries({ queryKey: libraryKey });
    },
  });
  return (
    <section className="site-container member-workspace">
      <p className="section-eyebrow">Your reading life</p>
      <h1 className="section-title mt-4">Your reading shelf.</h1>
      <p className="body-copy mt-5">
        Keep track of your current reads and make room for your next discovery.
      </p>
      <div className="mt-10">
        {loans.isPending ? (
          <div className="library-state" role="status">
            Opening your reading shelf…
          </div>
        ) : loans.isError ? (
          <LibraryError
            error={loans.error}
            retry={() => void loans.refetch()}
          />
        ) : !loans.data.length ? (
          <LibraryEmpty
            title="An open shelf. Endless possibilities."
            description="Find a book that speaks to you and make it your next read."
            action={
              <Button asChild>
                <Link href="/books">Browse the collection</Link>
              </Button>
            }
          />
        ) : (
          <div
            className="library-table-scroll"
            role="region"
            aria-label="Active borrowed books"
            tabIndex={0}
          >
            <table className="library-table">
              <caption className="sr-only">
                Your active borrowed books and return dates
              </caption>
              <thead>
                <tr>
                  <th scope="col">Book</th>
                  <th scope="col">Borrowed</th>
                  <th scope="col">Due back</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.data.map((loan) => (
                  <tr key={loan._id}>
                    <td>
                      <Link
                        href={`/books/${loan.bookId}`}
                        className="borrowed-book"
                      >
                        <BookCover
                          src={loan.bookImage}
                          title={loan.bookTitle}
                        />
                        <span>{loan.bookTitle}</span>
                      </Link>
                    </td>
                    <td>
                      <time dateTime={loan.borrowDate}>
                        {libraryDate(loan.borrowDate)}
                      </time>
                    </td>
                    <td>
                      <time dateTime={loan.returnDate}>
                        {libraryDate(loan.returnDate)}
                      </time>
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        aria-label={`Return ${loan.bookTitle}`}
                        onClick={() => {
                          giveBack.reset();
                          setReturning(loan);
                        }}
                      >
                        Return
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(returning)}
        onOpenChange={(open) => {
          if (!open) setReturning(null);
        }}
        title="Ready for the next reader?"
        description={`Return “${returning?.bookTitle ?? "this book"}” to make its copy available in the collection again.`}
        confirmLabel="Return book"
        pending={giveBack.isPending}
        error={giveBack.isError ? libraryMessage(giveBack.error) : undefined}
        onConfirm={() => {
          if (returning && !giveBack.isPending) giveBack.mutate(returning._id);
        }}
      />
    </section>
  );
}
