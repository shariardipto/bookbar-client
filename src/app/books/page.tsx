import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Catalog } from "@/components/books/catalog";
import { PreviewNotice } from "@/components/books/preview-notice";
import { isCategory, type CatalogSort } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "All Books",
  description:
    "Browse the BookBar collection preview by title, author, or category and discover your next great read.",
};

export default async function BooksPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" && isCategory(params.category)
      ? params.category
      : "All";
  const query = typeof params.q === "string" ? params.q.slice(0, 200) : "";
  const sort: CatalogSort =
    params.sort === "title" || params.sort === "author"
      ? params.sort
      : "latest";

  return (
    <>
      <div className="catalog-heading">
        <div className="site-container">
          <nav
            aria-label="Breadcrumb"
            className="mb-9 flex items-center gap-2 text-[11px] text-slate"
          >
            <Link href="/">Home</Link>
            <ChevronRight className="size-3" aria-hidden="true" />
            <span aria-current="page">All Books</span>
          </nav>
          <p className="section-eyebrow mb-4">The BookBar collection</p>
          <h1 className="section-title text-[clamp(2.5rem,5vw,3.6rem)]!">
            Find your next great read.
          </h1>
          <p className="body-copy mt-5 max-w-xl">
            Old favorites. New perspectives. A little something for every kind
            of reader. Take a look around and see what finds you.
          </p>
          <div className="mt-6">
            <PreviewNotice />
          </div>
        </div>
      </div>
      <Catalog
        key={`${category}:${query}:${sort}`}
        initialCategory={category}
        initialQuery={query}
        initialSort={sort}
      />
    </>
  );
}
