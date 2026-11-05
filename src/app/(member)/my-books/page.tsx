import type { Metadata } from "next";
import { requireMember } from "@/lib/member-session";
import { MemberWorkspace } from "@/components/auth/member-workspace";

export const metadata: Metadata = { title: "My Books" };
export default async function MyBooksPage() {
  await requireMember("/my-books");
  return <MemberWorkspace title="Your books, shared." description="This is where the books you contribute will live. Sharing and managing books will be available when the library opens." />;
}
