import type { Metadata } from "next";
import { requireMember } from "@/lib/member-session";
import { MemberWorkspace } from "@/components/auth/member-workspace";

export const metadata: Metadata = { title: "Add Book" };
export default async function AddBookPage() {
  await requireMember("/add-book");
  return (
    <MemberWorkspace
      title="Share a good book."
      description="You will soon be able to add books to the library. For now, discover the sample collection and find your next read."
    />
  );
}
