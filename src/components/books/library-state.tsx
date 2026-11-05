"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/api-client";
import { loginUrl } from "@/lib/auth-redirect";

export function libraryMessage(error: unknown) {
  return error instanceof ApiRequestError
    ? error.message
    : "We could not complete that request. Please try again.";
}
export function LibraryError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const pathname = usePathname();
  const auth = error instanceof ApiRequestError && error.status === 401;
  const missing = error instanceof ApiRequestError && error.status === 404;
  return (
    <div className="library-state" role="alert">
      <BookOpen className="size-8 mb-4" aria-hidden="true" />
      <h2 className="display-heading text-3xl">
        {auth
          ? "Your membership needs a moment."
          : missing
            ? "This book has left the shelf."
            : "The shelf needs a moment."}
      </h2>
      <p className="body-copy mt-3 max-w-md">{libraryMessage(error)}</p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {auth ? (
          <Button asChild>
            <Link href={loginUrl(pathname)}>Log in again</Link>
          </Button>
        ) : (
          !missing && (
            <Button variant="outline" onClick={retry}>
              <RotateCcw aria-hidden="true" />
              Try again
            </Button>
          )
        )}
        <Button variant="ghost" asChild>
          <Link href="/books">Browse books</Link>
        </Button>
      </div>
    </div>
  );
}
export function LibraryEmpty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="library-state">
      <BookOpen
        className="size-9 mb-5 text-copper"
        strokeWidth={1.2}
        aria-hidden="true"
      />
      <h2 className="display-heading text-3xl">{title}</h2>
      <p className="body-copy mt-4 max-w-md">{description}</p>
      {action && <div className="mt-7">{action}</div>}
    </div>
  );
}
