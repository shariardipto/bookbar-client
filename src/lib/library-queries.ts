"use client";
import { queryOptions } from "@tanstack/react-query";
import { apiRequest } from "./api-client";
import type { BookSummary, LibraryBook, LibraryBorrow } from "./library-types";
export const libraryKey = ["library"] as const;
export const libraryQueries = {
  latest: () =>
    queryOptions({
      queryKey: [...libraryKey, "latest"],
      queryFn: ({ signal }) =>
        apiRequest<BookSummary[]>("/books?sort=latest&limit=6", {
          authenticated: false,
          signal,
        }),
    }),
  books: () =>
    queryOptions({
      queryKey: [...libraryKey, "books"],
      queryFn: ({ signal }) =>
        apiRequest<BookSummary[]>("/books", { authenticated: false, signal }),
    }),
  mine: (userId: string) =>
    queryOptions({
      queryKey: [...libraryKey, "mine", userId],
      queryFn: ({ signal }) =>
        apiRequest<BookSummary[]>("/books?mine=true", { signal }),
    }),
  book: (id: string, userId: string) =>
    queryOptions({
      queryKey: [...libraryKey, "book", userId, id],
      queryFn: ({ signal }) =>
        apiRequest<LibraryBook>(`/books/${id}`, { signal }),
    }),
  borrows: (userId: string) =>
    queryOptions({
      queryKey: [...libraryKey, "borrows", userId],
      queryFn: ({ signal }) =>
        apiRequest<LibraryBorrow[]>("/borrows", { signal }),
    }),
};
