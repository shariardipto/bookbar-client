import Link from "next/link";
import { ArrowUpRight, BookOpen, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MembershipPreview({ mode }: { mode: "login" | "register" }) {
  return (
    <div className="site-container membership-page">
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
        <p className="section-eyebrow mb-5">
          {mode === "login" ? "Member login" : "Join BookBar"}
        </p>
        <h1 id="membership-title" className="section-title">
          {mode === "login"
            ? "Your reading life, all in one place."
            : "Make room for a good book."}
        </h1>
        <span className="membership-label">Membership opens soon</span>
        <p className="body-copy mt-5">
          Accounts aren’t available during this collection preview. For now,
          find a few favorites on the shelves. We’ll save the next chapter for
          you.
        </p>
        <Button size="lg" asChild className="mt-7">
          <Link href="/books">
            Explore the collection <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-11 items-center gap-2 text-xs text-slate"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back to Home
        </Link>
      </section>
    </div>
  );
}
