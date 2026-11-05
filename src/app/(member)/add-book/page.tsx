import type { Metadata } from "next";
import { requireMember } from "@/lib/member-session";
import { BookForm } from "@/components/books/book-form";

export const metadata: Metadata = { title: "Add Book" };
export default async function AddBookPage() {
  const { user } = await requireMember("/add-book");
  return (
    <section className="site-container member-workspace">
      <p className="section-eyebrow">Add to the shelves</p>
      <h1 className="section-title mt-4">Share a good book.</h1>
      <p className="body-copy mt-4 max-w-xl">
        A well-loved story deserves another reader. Tell us about the book you
        would like to share.
      </p>
      <div className="library-form-card mt-9">
        <BookForm
          member={{ id: user.id, name: user.name, email: user.email }}
        />
      </div>
    </section>
  );
}
