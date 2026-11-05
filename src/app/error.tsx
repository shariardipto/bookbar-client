"use client";

import Link from "next/link";
import { BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="site-container page-error" role="alert">
      <BookOpen
        className="mb-7 size-12 text-copper"
        strokeWidth={1.2}
        aria-hidden="true"
      />
      <p className="section-eyebrow mb-4">A pause between chapters</p>
      <h1 className="section-title">The shelf needs a moment.</h1>
      <p className="body-copy mt-5 max-w-md">
        We couldn’t load this page. Give it another try, or head home to start a
        new chapter.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>
          <RotateCcw aria-hidden="true" />
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </section>
  );
}
