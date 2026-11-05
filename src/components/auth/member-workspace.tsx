import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MemberWorkspace({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="site-container member-workspace">
      <p className="section-eyebrow">Your BookBar</p>
      <h1 className="section-title mt-4">{title}</h1>
      <div className="member-placeholder">
        <BookOpen
          className="size-9 mb-5 text-copper"
          strokeWidth={1.2}
          aria-hidden="true"
        />
        <h2 className="display-heading text-3xl">
          A new chapter is on its way.
        </h2>
        <p className="body-copy mt-4 max-w-md">{description}</p>
        <Button asChild className="mt-7">
          <Link href="/books">Explore the collection</Link>
        </Button>
      </div>
    </section>
  );
}
