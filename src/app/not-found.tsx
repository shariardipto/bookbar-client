import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return (
    <section className="site-container not-found-page">
      <div className="not-found-art" aria-hidden="true">
        <span className="display-heading">
          4<BookOpen strokeWidth={0.8} />4
        </span>
        <p>A little lost between the pages.</p>
      </div>
      <div className="max-w-lg">
        <p className="section-eyebrow mb-5">Chapter not found · 404</p>
        <h1 className="section-title">This page wandered off.</h1>
        <p className="body-copy mt-5">
          It might have found another shelf, or the address may be a little off.
          There are plenty of good stories waiting back at home.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/books">
              Browse books <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
