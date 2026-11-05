import type { Category, CatalogBook } from "./catalog";
export type BookSummary = {
  _id: string;
  title: string;
  author: string;
  category: Category;
  imageUrl: string;
  copies: number;
  totalCopies: number;
  createdAt: string;
};
export type LibraryBook = BookSummary & {
  description: string;
  addedByUserId: string;
  addedByName: string;
  addedByEmail: string;
  updatedAt: string;
};
export type LibraryBorrow = {
  _id: string;
  bookId: string;
  bookTitle: string;
  bookImage: string;
  userId: string;
  userEmail: string;
  borrowDate: string;
  returnDate: string;
};
export type LibraryMember = { id: string; name: string; email: string };
export function catalogBook(book: BookSummary): CatalogBook {
  return { ...book, id: book._id };
}
