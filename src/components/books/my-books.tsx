"use client";
import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api-client";
import { libraryKey, libraryQueries } from "@/lib/library-queries";
import type { BookSummary, LibraryMember } from "@/lib/library-types";
import { Button } from "@/components/ui/button";
import { BookCover } from "./book-cover";
import { BookForm } from "./book-form";
import { BookGridSkeleton } from "./book-grid-skeleton";
import { LibraryEmpty, LibraryError, libraryMessage } from "./library-state";
import { ConfirmDialog, LibraryDialog } from "./library-dialog";

function EditBook({
  id,
  member,
  onDone,
  onBusyChange,
}: {
  id: string;
  member: LibraryMember;
  onDone: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const book = useQuery(libraryQueries.book(id, member.id));
  if (book.isPending)
    return (
      <p role="status" className="body-copy">
        Opening your book…
      </p>
    );
  if (book.isError)
    return (
      <LibraryError error={book.error} retry={() => void book.refetch()} />
    );
  return (
    <BookForm
      member={member}
      book={book.data}
      onSaved={onDone}
      onCancel={onDone}
      onBusyChange={onBusyChange}
    />
  );
}

export function MyBooks({ member }: { member: LibraryMember }) {
  const books = useQuery(libraryQueries.mine(member.id)),
    queryClient = useQueryClient();
  const [editing, setEditing] = useState<BookSummary | null>(null),
    [deleting, setDeleting] = useState<BookSummary | null>(null),
    [formBusy, setFormBusy] = useState(false);
  const remove = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/books/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: libraryKey });
      setDeleting(null);
      toast.success("Your book has been removed from the collection.");
    },
    onError: (error) => {
      toast.error(libraryMessage(error));
      void queryClient.invalidateQueries({ queryKey: libraryKey });
    },
  });
  function closeEdit() {
    setEditing(null);
    setFormBusy(false);
  }
  return (
    <section className="site-container member-workspace">
      <div className="section-heading-row">
        <div>
          <p className="section-eyebrow">Your contributions</p>
          <h1 className="section-title mt-4">Your books, shared.</h1>
          <p className="body-copy mt-5">
            A little care keeps every story ready for its next reader.
          </p>
        </div>
        <Button asChild>
          <Link href="/add-book">Add a book</Link>
        </Button>
      </div>
      <div className="mt-10">
        {books.isPending ? (
          <BookGridSkeleton />
        ) : books.isError ? (
          <LibraryError
            error={books.error}
            retry={() => void books.refetch()}
          />
        ) : !books.data.length ? (
          <LibraryEmpty
            title="Your first story starts here."
            description="Share a book you love and give another reader a new discovery."
            action={
              <Button asChild>
                <Link href="/add-book">Add your first book</Link>
              </Button>
            }
          />
        ) : (
          <div className="book-grid">
            {books.data.map((book) => (
              <article className="managed-book" key={book._id}>
                <Link
                  href={`/books/${book._id}`}
                  className="managed-book-cover"
                >
                  <BookCover src={book.imageUrl} title={book.title} />
                </Link>
                <div className="managed-book-body">
                  <p className="section-eyebrow">{book.category}</p>
                  <h2 className="font-display text-2xl mt-3">
                    <Link href={`/books/${book._id}`}>{book.title}</Link>
                  </h2>
                  <p className="body-copy text-sm! mt-2">By {book.author}</p>
                  <p className="book-stock mt-3">
                    {book.copies} of {book.totalCopies} copies available
                  </p>
                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setEditing(book)}
                      aria-label={`Edit ${book.title}`}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        remove.reset();
                        setDeleting(book);
                      }}
                      aria-label={`Delete ${book.title}`}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <LibraryDialog
        open={Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
        title="Care for your collection."
        description="Update the details below. Copies already borrowed stay with their readers."
        wide
        busy={formBusy}
      >
        {editing && (
          <EditBook
            key={editing._id}
            id={editing._id}
            member={member}
            onDone={closeEdit}
            onBusyChange={setFormBusy}
          />
        )}
      </LibraryDialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        title="Remove this book?"
        description={`“${deleting?.title ?? "This book"}” will leave the collection. This cannot be undone. Books with active borrows must be returned first.`}
        confirmLabel="Delete book"
        pending={remove.isPending}
        error={remove.isError ? libraryMessage(remove.error) : undefined}
        onConfirm={() => {
          if (deleting && !remove.isPending) remove.mutate(deleting._id);
        }}
      />
    </section>
  );
}
