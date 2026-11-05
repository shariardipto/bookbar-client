import type { PreviewBook } from "./catalog";

/** P01 fixtures only. P06 must replace every consumer with the MongoDB-backed API.
 * IDs deliberately use a preview prefix and are not persistent database IDs.
 * Cover artwork is original BookBar artwork, not a reproduction of a publisher's edition.
 */
export const previewBooks: readonly PreviewBook[] = [
  {
    id: "preview-secret-garden",
    title: "The Secret Garden",
    author: "Frances Hodgson Burnett",
    category: "Kids",
    imageUrl: "/covers/secret-garden.svg",
    createdAt: "2026-11-05T09:00:00Z",
  },
  {
    id: "preview-time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    category: "Science",
    imageUrl: "/covers/time-machine.svg",
    createdAt: "2026-11-04T09:00:00Z",
  },
  {
    id: "preview-pride-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Fiction",
    imageUrl: "/covers/pride-prejudice.svg",
    createdAt: "2026-11-03T09:00:00Z",
  },
  {
    id: "preview-room-own",
    title: "A Room of One’s Own",
    author: "Virginia Woolf",
    category: "Others",
    imageUrl: "/covers/room-own.svg",
    createdAt: "2026-11-02T09:00:00Z",
  },
  {
    id: "preview-origin-species",
    title: "On the Origin of Species",
    author: "Charles Darwin",
    category: "Science",
    imageUrl: "/covers/origin-species.svg",
    createdAt: "2026-11-01T09:00:00Z",
  },
  {
    id: "preview-alice",
    title: "Alice’s Adventures in Wonderland",
    author: "Lewis Carroll",
    category: "Kids",
    imageUrl: "/covers/alice.svg",
    createdAt: "2026-10-31T09:00:00Z",
  },
  {
    id: "preview-short-history",
    title: "A Short History of the World",
    author: "H. G. Wells",
    category: "History",
    imageUrl: "/covers/short-history.svg",
    createdAt: "2026-10-30T09:00:00Z",
  },
  {
    id: "preview-little-women",
    title: "Little Women",
    author: "Louisa May Alcott",
    category: "Fiction",
    imageUrl: "/covers/little-women.svg",
    createdAt: "2026-10-29T09:00:00Z",
  },
  {
    id: "preview-art-war",
    title: "The Art of War",
    author: "Sun Tzu",
    category: "History",
    imageUrl: "/covers/art-war.svg",
    createdAt: "2026-10-28T09:00:00Z",
  },
];
