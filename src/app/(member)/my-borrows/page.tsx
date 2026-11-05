import type { Metadata } from "next";
import { requireMember } from "@/lib/member-session";
import { MyBorrows } from "@/components/books/my-borrows";

export const metadata: Metadata = { title: "My Borrows" };
export default async function MyBorrowsPage() {
  const { user } = await requireMember("/my-borrows");
  return <MyBorrows userId={user.id} />;
}
