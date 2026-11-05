import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireMember } from "@/lib/member-session";
import { BookDetails } from "@/components/books/book-details";

export const metadata: Metadata = { title: "Book Details" };

export default async function BookDetailsEntry({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();
  const { user } = await requireMember(`/books/${id}`);
  return (
    <BookDetails
      id={id.toLowerCase()}
      member={{ id: user.id, name: user.name, email: user.email }}
    />
  );
}
