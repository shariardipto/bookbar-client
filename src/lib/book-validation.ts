import { z } from "zod";
import { categories } from "./catalog";
export const bookFormSchema = z.object({
  title: z.string().trim().min(1, "Enter the book title.").max(200),
  author: z.string().trim().min(1, "Enter the author's name.").max(160),
  category: z.enum(categories, { error: "Choose a category." }),
  imageUrl: z
    .url("Upload a cover image.")
    .refine(
      (value) => /^https?:\/\//i.test(value),
      "Upload a valid cover image.",
    ),
  description: z
    .string()
    .trim()
    .min(1, "Tell readers a little about this book.")
    .max(5000),
  totalCopies: z
    .number()
    .int("Use a whole number of copies.")
    .min(1, "Add at least one copy.")
    .max(2_147_483_647),
});
export type BookFormValues = z.infer<typeof bookFormSchema>;
