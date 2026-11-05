import type { PreviewBook } from "@/lib/catalog";
import { BookCard } from "./book-card";

export function BookGrid({ books }: { books: readonly PreviewBook[] }) {
  return (
    <div className="book-grid" data-book-grid>
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}
