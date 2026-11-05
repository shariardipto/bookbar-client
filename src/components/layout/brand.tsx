import Link from "next/link";
import { BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="BookBar home"
      className={cn(
        "inline-flex w-fit items-center gap-2.5 text-navy",
        className,
      )}
    >
      <span className="relative flex size-9 items-center justify-center rounded-lg bg-navy text-white">
        <BookOpen className="size-5" strokeWidth={1.5} aria-hidden="true" />
        <span className="absolute -right-0.5 top-1.5 h-3 w-1 rounded-sm bg-copper-light" />
      </span>
      <span className="wordmark text-[1.9rem] leading-none tracking-tight">
        BookBar<span className="text-copper">.</span>
      </span>
    </Link>
  );
}
