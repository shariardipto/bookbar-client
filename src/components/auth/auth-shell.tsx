import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export function AuthShell({
  mode,
  children,
}: {
  mode: "login" | "register";
  children: React.ReactNode;
}) {
  return (
    <div className="site-container membership-page auth-page">
      <div className="membership-art" aria-hidden="true">
        <span className="display-heading">
          One more
          <br />
          chapter.
        </span>
        <BookOpen strokeWidth={0.7} />
        <p>
          For curious minds
          <br />
          and well-loved stories.
        </p>
      </div>
      <section className="membership-copy" aria-labelledby="membership-title">
        <p className="section-eyebrow mb-4">
          {mode === "login" ? "Welcome back" : "Join BookBar"}
        </p>
        <h1 id="membership-title" className="section-title">
          {mode === "login"
            ? "Your next chapter awaits."
            : "Make room for a good book."}
        </h1>
        <p className="body-copy mt-4 mb-6">
          {mode === "login"
            ? "Log in to your own little corner of the library."
            : "A place for your books, your discoveries, and the stories you share."}
        </p>
        {children}
        <Link href="/books" className="auth-back-link">
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to the collection
        </Link>
      </section>
    </div>
  );
}
