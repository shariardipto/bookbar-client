import { expect, it } from "vitest";
import { bookFormSchema } from "./book-validation";
const valid = {
  title: "A story",
  author: "A writer",
  category: "Fiction",
  imageUrl: "https://i.ibb.co/test/cover.png",
  description: "A book worth sharing.",
  totalCopies: 2,
};
it("trims text and sends only editable fields", () => {
  expect(
    bookFormSchema.parse({
      ...valid,
      title: " A story ",
      addedByEmail: "untrusted@example.invalid",
      copies: 99,
    }),
  ).toEqual(valid);
});
it.each([0, -1, 1.5, NaN, 2147483648])(
  "rejects invalid stock %s",
  (totalCopies) => {
    expect(bookFormSchema.safeParse({ ...valid, totalCopies }).success).toBe(
      false,
    );
  },
);
it.each(["title", "author", "description", "imageUrl"])(
  "requires %s",
  (field) => {
    expect(bookFormSchema.safeParse({ ...valid, [field]: "" }).success).toBe(
      false,
    );
  },
);
it("rejects unknown categories and executable image URLs", () => {
  expect(
    bookFormSchema.safeParse({ ...valid, category: "Unknown" }).success,
  ).toBe(false);
  expect(
    bookFormSchema.safeParse({ ...valid, imageUrl: "javascript:alert(1)" })
      .success,
  ).toBe(false);
});
