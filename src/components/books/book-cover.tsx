"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function BookCover({
  src,
  title,
  className,
  priority = false,
}: {
  src: string;
  title: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <div
        role="img"
        aria-label={`Cover unavailable for ${title}`}
        className={cn("book-cover-fallback", className)}
      >
        <BookOpen
          className="mb-3 size-8"
          strokeWidth={1.3}
          aria-hidden="true"
        />
        <span className="display-heading text-center text-lg">{title}</span>
      </div>
    );
  return (
    <Image
      src={src}
      alt={`${title} — BookBar preview cover`}
      width={360}
      height={540}
      className={cn("book-cover", className)}
      unoptimized
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
