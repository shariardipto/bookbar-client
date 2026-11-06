import { test } from "node:test";
import assert from "node:assert/strict";
import { demoBooks } from "./data/demo-books.mjs";
import { bookKey, planDemoBooks, coverSvg } from "./seed-demo-books.mjs";

test("the extension contains 14 unique, complete books across all five categories", () => {
  assert.equal(demoBooks.length, 14);
  assert.equal(new Set(demoBooks.map(bookKey)).size, 14);
  assert.deepEqual(
    [...new Set(demoBooks.map((book) => book.category))].sort(),
    ["Fiction", "History", "Kids", "Others", "Science"],
  );
  for (const book of demoBooks) {
    assert.ok(
      book.title.length > 3 &&
        book.author.length > 3 &&
        book.description.length > 100,
    );
    assert.ok(Number.isInteger(book.totalCopies) && book.totalCopies > 0);
  }
});
test("reruns skip normalized title/author pairs without changing existing user data", () => {
  const existing = [
    {
      ...demoBooks[0],
      title: "  JANE   EYRE ",
      author: "Charlotte Bronte\u0308",
      copies: 1,
      description: "A member's custom description",
    },
    { title: "A user's unrelated book", author: "A member", copies: 2 },
  ];
  const snapshot = JSON.stringify(existing);
  const planned = planDemoBooks(existing);
  assert.equal(planned.length, 13);
  assert.ok(!planned.some((book) => book.key === demoBooks[0].key));
  assert.equal(JSON.stringify(existing), snapshot);
  assert.equal(planDemoBooks([...existing, ...planned]).length, 0);
});
test("a duplicate seed definition fails before a mutation could be planned", () => {
  assert.throws(
    () => planDemoBooks([], [demoBooks[0], demoBooks[0]]),
    /duplicate/,
  );
});
test("cover text is escaped and covers contain original vector artwork", () => {
  const svg = coverSvg(
    {
      ...demoBooks[0],
      title: 'A <Title> & "Story"',
      author: "O'Connor",
      coverLines: ["A <Title> & Story"],
    },
    0,
  );
  assert.ok(svg.includes("&lt;Title&gt; &amp;"));
  assert.ok(svg.includes("O&apos;CONNOR"));
  assert.ok(!svg.includes("<image") && !svg.includes("https://"));
});
