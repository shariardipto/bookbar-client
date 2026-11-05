import type { Metadata } from "next";
import { requireMember } from "@/lib/member-session";
import { MyBooks } from "@/components/books/my-books";

export const metadata: Metadata = { title: "My Books" };
export default async function MyBooksPage() {
  const { user } = await requireMember("/my-books");
  return (
    <MyBooks member={{ id: user.id, name: user.name, email: user.email }} />
  );
}
