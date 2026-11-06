"use client";
import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { uploadBookCover } from "@/actions/upload-book-cover";
import { apiRequest } from "@/lib/api-client";
import { categories } from "@/lib/catalog";
import { bookFormSchema, type BookFormValues } from "@/lib/book-validation";
import { libraryKey } from "@/lib/library-queries";
import type { LibraryBook, LibraryMember } from "@/lib/library-types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/auth/form-field";
import { BookCover } from "./book-cover";
import { libraryMessage } from "./library-state";

export function BookForm({
  member,
  book,
  onSaved,
  onCancel,
  onBusyChange,
}: {
  member: LibraryMember;
  book?: LibraryBook;
  onSaved?: () => void;
  onCancel?: () => void;
  onBusyChange?: (busy: boolean) => void;
}) {
  const router = useRouter(),
    queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, startUpload] = useTransition();
  const {
    register,
    control,
    setValue,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors },
  } = useForm<BookFormValues>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: book?.title ?? "",
      author: book?.author ?? "",
      category: book?.category ?? "Fiction",
      description: book?.description ?? "",
      imageUrl: book?.imageUrl ?? "",
      totalCopies: book?.totalCopies ?? 1,
    },
  });
  const imageUrl = useWatch({ control, name: "imageUrl" });
  const saving = useMutation({
    mutationFn: (values: BookFormValues) =>
      apiRequest<LibraryBook>(book ? `/books/${book._id}` : "/books", {
        method: book ? "PATCH" : "POST",
        body: values,
      }),
    onSuccess: async (saved) => {
      await queryClient.invalidateQueries({ queryKey: libraryKey });
      toast.success(
        book ? "Your book has been updated." : "Your book is on the shelf.",
      );
      if (onSaved) onSaved();
      else router.push(`/books/${saved._id}`);
    },
    onError: (error) => {
      toast.error(libraryMessage(error));
      void queryClient.invalidateQueries({ queryKey: libraryKey });
    },
  });
  const busy = uploading || saving.isPending;
  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  function upload(file?: File) {
    if (!file) return;
    clearErrors("imageUrl");
    if (
      file.size > 5 * 1024 * 1024 ||
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError("imageUrl", {
        message: "Choose a PNG, JPEG, WebP or GIF smaller than 5 MB.",
      });
      return;
    }
    startUpload(async () => {
      try {
        const form = new FormData();
        form.append("image", file);
        const result = await uploadBookCover(form);
        if (result.success) {
          setValue("imageUrl", result.imageUrl, {
            shouldValidate: true,
            shouldDirty: true,
          });
          toast.success("Cover uploaded.");
        } else {
          setError("imageUrl", { message: result.message });
          toast.error(result.message);
        }
      } catch {
        toast.error("The cover could not be uploaded. Please try again.");
        setError("imageUrl", {
          message: "The cover could not be uploaded. Please try again.",
        });
      }
    });
  }
  return (
    <form
      className="book-form"
      noValidate
      aria-label={book ? "Edit book" : "Add a book"}
      aria-busy={busy}
      onSubmit={(event) => {
        void handleSubmit(
          (values) => {
            const active = book ? book.totalCopies - book.copies : 0;
            if (values.totalCopies < active) {
              setError("totalCopies", {
                message: `At least ${active} copies are currently borrowed.`,
              });
              return;
            }
            saving.mutate(values);
          },
          (invalid) => {
            if (invalid.imageUrl && !invalid.title && !invalid.author)
              fileInput.current?.focus();
          },
        )(event);
      }}
    >
      <div className="book-form-grid">
        <FormField
          id="book-title"
          label="Book title"
          error={errors.title?.message}
        >
          <Input
            id="book-title"
            maxLength={200}
            disabled={busy}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "book-title-error" : undefined}
            {...register("title")}
          />
        </FormField>
        <FormField
          id="book-author"
          label="Author"
          error={errors.author?.message}
        >
          <Input
            id="book-author"
            maxLength={160}
            disabled={busy}
            aria-invalid={Boolean(errors.author)}
            aria-describedby={errors.author ? "book-author-error" : undefined}
            {...register("author")}
          />
        </FormField>
        <FormField
          id="book-category"
          label="Category"
          error={errors.category?.message}
        >
          <select
            id="book-category"
            className="library-input"
            disabled={busy}
            {...register("category")}
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </FormField>
        <FormField
          id="book-copies"
          label="Total copies"
          hint={
            book && book.totalCopies > book.copies
              ? `${book.totalCopies - book.copies} copies are currently borrowed.`
              : "How many copies can the library share?"
          }
          error={errors.totalCopies?.message}
        >
          <Input
            id="book-copies"
            type="number"
            min={1}
            max={2_147_483_647}
            disabled={busy}
            aria-invalid={Boolean(errors.totalCopies)}
            aria-describedby={`book-copies-hint${errors.totalCopies ? " book-copies-error" : ""}`}
            {...register("totalCopies", { valueAsNumber: true })}
          />
        </FormField>
        <FormField id="book-owner" label="Added by">
          <Input
            id="book-owner"
            value={member.name}
            readOnly
            className="library-readonly"
          />
        </FormField>
        <FormField id="book-owner-email" label="Your email">
          <Input
            id="book-owner-email"
            value={member.email}
            readOnly
            className="library-readonly"
          />
        </FormField>
      </div>
      <FormField
        id="book-description"
        label="About this book"
        error={errors.description?.message}
      >
        <textarea
          id="book-description"
          className="library-input min-h-36"
          maxLength={5000}
          disabled={busy}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "book-description-error" : undefined
          }
          {...register("description")}
        />
      </FormField>
      <FormField
        id="book-cover"
        label={
          book ? "Cover image — choose a file to replace it" : "Cover image"
        }
        hint="PNG, JPEG, WebP or GIF. Up to 5 MB."
        error={errors.imageUrl?.message}
      >
        <div className="cover-upload">
          <Upload className="size-5 text-copper" aria-hidden="true" />
          <input
            ref={fileInput}
            id="book-cover"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={busy}
            aria-invalid={Boolean(errors.imageUrl)}
            aria-describedby={`book-cover-hint${errors.imageUrl ? " book-cover-error" : ""}`}
            onChange={(event) => {
              upload(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
        </div>
        {uploading && (
          <p role="status" className="auth-hint">
            Uploading your cover…
          </p>
        )}
        {imageUrl && (
          <div className="cover-upload-preview">
            <BookCover
              key={imageUrl}
              src={imageUrl}
              title={book?.title ?? "Your new book"}
            />
            <p className="auth-hint">Your cover is ready.</p>
          </div>
        )}
      </FormField>
      {saving.isError && (
        <p role="alert" className="auth-error">
          {libraryMessage(saving.error)}
        </p>
      )}
      <div className="flex flex-wrap justify-end gap-3 border-t pt-6">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={busy}>
          {uploading
            ? "Uploading cover…"
            : saving.isPending
              ? "Saving your book…"
              : book
                ? "Save changes"
                : "Add book"}
        </Button>
      </div>
    </form>
  );
}
