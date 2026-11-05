import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CatalogBook } from "@/lib/catalog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCover } from "./book-cover";

export function BookCard({ book }: { book: CatalogBook }) {
  return (
    <Card
      className="book-card group gap-0 overflow-hidden rounded-xl border bg-white p-3.5 shadow-none"
      data-book-card
      data-book-id={book.id}
    >
      <div className={`book-stage cover-stage-${book.category.toLowerCase()}`}>
        <BookCover src={book.imageUrl} title={book.title} />
        <span className="book-stage-line" aria-hidden="true" />
      </div>
      <CardContent className="flex flex-1 flex-col px-1.5 pt-5 pb-1.5">
        <p className="text-[10px] font-bold tracking-[0.16em] text-copper uppercase">
          {book.category}
        </p>
        <h3 className="book-title display-heading mt-2 text-[1.65rem] leading-[1.15] text-navy">
          {book.title}
        </h3>
        <p className="mt-2 text-[13px] leading-6 text-slate">{book.author}</p>
        {book.copies !== undefined && (
          <p
            className={`book-stock ${book.copies === 0 ? "book-stock-empty" : ""}`}
          >
            {book.copies > 0
              ? `${book.copies} of ${book.totalCopies} copies available`
              : "All copies are out reading"}
          </p>
        )}
        <Button
          variant="outline"
          asChild
          className="mt-5 w-full justify-between bg-white text-[13px]"
        >
          <Link href={`/books/${book.id}`}>
            View details<span className="sr-only"> for {book.title}</span>
            <ArrowUpRight
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
