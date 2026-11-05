"use client";

import { useMemo, useState } from "react";
import { BookSearch, Search, X } from "lucide-react";
import {
  categories,
  type CatalogCategory,
  type CatalogSort,
} from "@/lib/catalog";
import { previewBooks } from "@/lib/preview-books";
import { filterBooks } from "@/lib/catalog-filter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookGrid } from "./book-grid";

function updateQuery(values: Record<string, string>) {
  const url = new URL(window.location.href);
  for (const [name, value] of Object.entries(values)) {
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
  }
  window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

export function Catalog({
  initialCategory,
  initialQuery,
  initialSort,
}: {
  initialCategory: CatalogCategory;
  initialQuery: string;
  initialSort: CatalogSort;
}) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState(initialSort);
  const books = useMemo(
    () => filterBooks(previewBooks, { category, query, sort }),
    [category, query, sort],
  );

  function reset() {
    setCategory("All");
    setQuery("");
    setSort("latest");
    updateQuery({ category: "", q: "", sort: "" });
  }

  return (
    <section
      className="site-container catalog-section"
      aria-label="Browse the sample collection"
    >
      <div className="catalog-toolbar">
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="catalog-search"
        >
          <Search className="size-4" aria-hidden="true" />
          <label htmlFor="catalog-search" className="sr-only">
            Search books by title or author
          </label>
          <Input
            id="catalog-search"
            type="search"
            placeholder="Search by title or author…"
            value={query}
            maxLength={200}
            onChange={(event) => {
              setQuery(event.target.value);
              updateQuery({ q: event.target.value });
            }}
            className="h-12 rounded-lg border-0 bg-white pr-11 pl-11 text-sm shadow-none focus-visible:ring-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                updateQuery({ q: "" });
              }}
              aria-label="Clear search"
              className="catalog-clear"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}
        </form>
        <div className="catalog-sort">
          <span className="text-xs text-slate" id="sort-label">
            Sort by
          </span>
          <Select
            value={sort}
            onValueChange={(value) => {
              if (
                value === "latest" ||
                value === "title" ||
                value === "author"
              ) {
                setSort(value);
                updateQuery({ sort: value === "latest" ? "" : value });
              }
            }}
          >
            <SelectTrigger
              aria-label="Sort books"
              className="h-12! min-w-40 bg-white px-4"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="latest">Recently added</SelectItem>
              <SelectItem value="title">Title A–Z</SelectItem>
              <SelectItem value="author">Author A–Z</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="catalog-filter-row">
        <div className="category-chips" aria-label="Filter by category">
          {(["All", ...categories] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={category === item}
              className="category-chip"
              onClick={() => {
                setCategory(item);
                updateQuery({ category: item === "All" ? "" : item });
              }}
            >
              {item === "All" ? "All Books" : item}
            </button>
          ))}
        </div>
        <p
          className="catalog-count"
          aria-live="polite"
          aria-atomic="true"
          data-testid="catalog-count"
        >
          {books.length} {books.length === 1 ? "book" : "books"} to explore
        </p>
      </div>
      {books.length ? (
        <BookGrid books={books} />
      ) : (
        <div className="empty-catalog">
          <span className="empty-icon">
            <BookSearch
              className="size-8"
              strokeWidth={1.2}
              aria-hidden="true"
            />
          </span>
          <h2 className="display-heading mt-6 text-3xl text-navy">
            No matching books.
          </h2>
          <p className="body-copy mt-3 max-w-xs">
            Try a different title, author, or category. A good story is waiting
            somewhere.
          </p>
          <Button variant="outline" className="mt-6 bg-white" onClick={reset}>
            Reset filters
          </Button>
        </div>
      )}
    </section>
  );
}
