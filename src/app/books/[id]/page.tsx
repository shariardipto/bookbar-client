import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { previewBooks } from "@/lib/preview-books";

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
  // P01 has no auth session. P03 must replace this temporary entry gate with
  // a real server-side Better Auth session check; P06 loads the book from the API.
  redirect(`/login?callbackUrl=${encodeURIComponent(`/books/${book.id}`)}`);
}
