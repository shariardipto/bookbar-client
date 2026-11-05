import type { Metadata } from "next";
import { requireMember } from "@/lib/member-session";
import { MemberWorkspace } from "@/components/auth/member-workspace";

export const metadata: Metadata = { title: "My Borrows" };
export default async function MyBorrowsPage() {
  await requireMember("/my-borrows");
  return <MemberWorkspace title="Your reading shelf." description="Your borrowed books and due dates will appear here. Borrowing is not available during the collection preview." />;
}
