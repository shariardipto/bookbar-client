"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { libraryKey, libraryQueries } from "@/lib/library-queries";
import { libraryDate } from "@/lib/library-date";
import type { LibraryMember } from "@/lib/library-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/auth/form-field";
import { BookCover } from "./book-cover";
import { BookGridSkeleton } from "./book-grid-skeleton";
import { LibraryError, libraryMessage } from "./library-state";
import { LibraryDialog } from "./library-dialog";

export function BookDetails({
  id,
  member,
}: {
  id: string;
  member: LibraryMember;
}) {
  const book = useQuery(libraryQueries.book(id, member.id));
  const loans = useQuery(libraryQueries.borrows(member.id));
  const queryClient = useQueryClient();
  const [borrowDate, setBorrowDate] = useState<Date | null>(null);
  const borrow = useMutation({
    mutationFn: () =>
      apiRequest("/borrows", { method: "POST", body: { bookId: id } }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryKey });
      setBorrowDate(null);
      toast.success("Your next read is ready. Enjoy your book!");
    },
    onError: (error) => {
      toast.error(libraryMessage(error));
      void queryClient.invalidateQueries({ queryKey: libraryKey });
    },
  });
  useEffect(() => {
    if (book.data) document.title = `${book.data.title} | BookBar`;
  }, [book.data]);
  if (book.isPending)
    return (
      <div className="site-container member-workspace">
        <BookGridSkeleton />
      </div>
    );
  if (book.isError)
    return (
      <div className="site-container member-workspace">
        <LibraryError error={book.error} retry={() => void book.refetch()} />
      </div>
    );
  const item = book.data,
    alreadyBorrowed = loans.data?.some((loan) => loan.bookId === id);
  return (
    <article className="site-container member-workspace">
      <Link href="/books" className="auth-back-link mt-0 mb-8">
        ← Back to the collection
      </Link>
      <div className="member-book-detail">
        <BookCover src={item.imageUrl} title={item.title} />
        <div>
          <p className="section-eyebrow">{item.category}</p>
          <h1 className="section-title mt-5">{item.title}</h1>
          <p className="body-copy mt-4">By {item.author}</p>
          <p
            className={`detail-stock mt-7${item.copies === 0 ? " book-stock-empty" : ""}`}
          >
            {item.copies} of {item.totalCopies} copies available
          </p>
          <p className="body-copy mt-6 whitespace-pre-line">
            {item.description}
          </p>
          <dl className="book-owner-details">
            <div>
              <dt>Shared by</dt>
              <dd>{item.addedByName}</dd>
            </div>
            <div>
              <dt>Contributor email</dt>
              <dd>{item.addedByEmail}</dd>
            </div>
            <div>
              <dt>On the shelf since</dt>
              <dd>{libraryDate(item.createdAt)}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button
              disabled={!item.copies || alreadyBorrowed || !loans.isSuccess}
              onClick={() => {
                borrow.reset();
                setBorrowDate(new Date());
              }}
            >
              {alreadyBorrowed
                ? "Already on your reading shelf"
                : !item.copies
                  ? "All copies are being read"
                  : loans.isPending
                    ? "Checking your shelf…"
                    : "Borrow this book"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/my-borrows">My Borrows</Link>
            </Button>
            {item.addedByUserId === member.id && (
              <Button asChild variant="ghost">
                <Link href="/my-books">Manage your book</Link>
              </Button>
            )}
          </div>
          {loans.isError && (
            <div className="mt-5">
              <p className="auth-error">
                We couldn’t check your borrowed books.
              </p>
              <Button variant="outline" onClick={() => void loans.refetch()}>
                Retry shelf check
              </Button>
            </div>
          )}
        </div>
      </div>
      <LibraryDialog
        open={Boolean(borrowDate)}
        onOpenChange={(open) => {
          if (!open) setBorrowDate(null);
        }}
        title="A new chapter awaits."
        description={`Borrow ${item.title} for seven days. Your return date is saved when you confirm.`}
        busy={borrow.isPending}
      >
        <form
          className="book-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!borrow.isPending) borrow.mutate();
          }}
        >
          <FormField id="borrow-name" label="Your name">
            <Input
              id="borrow-name"
              value={member.name}
              readOnly
              className="library-readonly"
            />
          </FormField>
          <FormField id="borrow-email" label="Your email">
            <Input
              id="borrow-email"
              value={member.email}
              readOnly
              className="library-readonly"
            />
          </FormField>
          {borrowDate && (
            <dl className="borrow-dates">
              <div>
                <dt>Borrow date</dt>
                <dd>{libraryDate(borrowDate)}</dd>
              </div>
              <div>
                <dt>Return by</dt>
                <dd>
                  {libraryDate(new Date(borrowDate.getTime() + 7 * 86400000))}
                </dd>
              </div>
            </dl>
          )}
          {borrow.isError && (
            <p role="alert" className="auth-error">
              {libraryMessage(borrow.error)}
            </p>
          )}
          <Button
            type="submit"
            disabled={borrow.isPending || !item.copies || alreadyBorrowed}
          >
            {borrow.isPending ? "Reserving your copy…" : "Confirm borrow"}
          </Button>
        </form>
      </LibraryDialog>
    </article>
  );
}
