import { describe, expect, it } from "vitest";
import { filterBooks } from "./catalog-filter";
import { previewBooks } from "./preview-books";

describe("preview catalog browsing", () => {
  it("searches titles and authors without case or surrounding-space sensitivity", () => {
    expect(
      filterBooks(previewBooks, { query: "  AUSTEN " }).map(
        (book) => book.title,
      ),
    ).toEqual(["Pride and Prejudice"]);
    expect(
      filterBooks(previewBooks, { query: "secret garden" }).map(
        (book) => book.id,
      ),
    ).toEqual(["preview-secret-garden"]);
  });

  it("combines category and search instead of ignoring either filter", () => {
    expect(
      filterBooks(previewBooks, { query: "Wells", category: "History" }).map(
        (book) => book.id,
      ),
    ).toEqual(["preview-short-history"]);
    expect(
      filterBooks(previewBooks, { query: "Austen", category: "Science" }),
    ).toEqual([]);
  });

  it("sorts titles alphabetically and authors with deterministic title ordering", () => {
    const byTitle = filterBooks(previewBooks, { sort: "title" });
    expect(byTitle[0]?.title).toBe("A Room of One’s Own");
    const byAuthor = filterBooks(previewBooks, {
      query: "Wells",
      sort: "author",
    });
    expect(byAuthor.map((book) => book.id)).toEqual([
      "preview-short-history",
      "preview-time-machine",
    ]);
  });

  it("provides the latest six without mutating the shared fixtures", () => {
    const before = previewBooks.map((book) => book.id);
    const latest = filterBooks([...previewBooks].reverse()).slice(0, 6);
    expect(latest).toHaveLength(6);
    expect(latest[0]?.id).toBe("preview-secret-garden");
    expect(latest[5]?.id).toBe("preview-alice");
    expect(previewBooks.map((book) => book.id)).toEqual(before);
  });
});
