export const categories = [
  "Fiction",
  "Science",
  "History",
  "Kids",
  "Others",
] as const;

export type Category = (typeof categories)[number];
export type CatalogCategory = Category | "All";
export type CatalogSort = "latest" | "title" | "author";

export type PreviewBook = {
  id: string;
  title: string;
  author: string;
  category: Category;
  imageUrl: string;
  createdAt: string;
};

export function isCategory(value: string | undefined): value is Category {
  return categories.some((category) => category === value);
}
