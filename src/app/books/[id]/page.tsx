import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { previewBooks } from "@/lib/preview-books";
import { requireMember } from "@/lib/member-session";
import { BookCover } from "@/components/books/book-cover";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title:
      previewBooks.find((book) => book.id === id)?.title ?? "Book Not Found",
  };
}

export default async function BookDetailsEntry({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = previewBooks.find((item) => item.id === id);
  if (!book) notFound();
  await requireMember(`/books/${book.id}`);
  // P06 replaces this labeled preview with the authenticated API record.
  return <article className="site-container member-workspace">
    <Link href="/books" className="auth-back-link mt-0 mb-8">← Back to the collection</Link>
    <div className="member-book-detail">
      <BookCover src={book.imageUrl} title={book.title} />
      <div>
        <p className="section-eyebrow">{book.category} / Collection preview</p>
        <h1 className="section-title mt-5">{book.title}</h1>
        <p className="body-copy mt-4">By {book.author}</p>
        <p className="auth-status mt-8">This is a sample title from the collection preview. Borrowing is not available yet.</p>
      </div>
    </div>
  </article>;
}
