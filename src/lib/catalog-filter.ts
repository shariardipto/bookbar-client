import type { CatalogCategory, CatalogSort, CatalogBook } from "./catalog";

const collator = new Intl.Collator("en", {
  sensitivity: "base",
  numeric: true,
});

export function filterBooks(
  books: readonly CatalogBook[],
  {
    query = "",
    category = "All",
    sort = "latest",
  }: { query?: string; category?: CatalogCategory; sort?: CatalogSort } = {},
): CatalogBook[] {
  const search = query.trim().toLocaleLowerCase("en");

  return books
    .filter(
      (book) =>
        (category === "All" || book.category === category) &&
        (!search ||
          `${book.title} ${book.author}`
            .toLocaleLowerCase("en")
            .includes(search)),
    )
    .sort((a, b) => {
      if (sort === "title") return collator.compare(a.title, b.title);
      if (sort === "author")
        return (
          collator.compare(a.author, b.author) ||
          collator.compare(a.title, b.title)
        );
      return b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id);
    });
}
