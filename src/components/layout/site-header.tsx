"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="announcement-bar">
        A small library. A world of possibilities.
      </div>
      <header className="site-header">
        <div className="site-container flex h-20 items-center justify-between gap-5">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="hidden h-full items-center gap-9 md:flex"
          >
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="nav-link"
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">
                Join the library <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Open navigation menu"
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[min(360px,85vw)] gap-0 p-6">
              <SheetHeader className="px-0 pt-12 pb-8">
                <SheetTitle className="display-heading text-3xl leading-tight">
                  Your next chapter awaits.
                </SheetTitle>
                <SheetDescription className="mt-3 leading-relaxed">
                  A little space for a world of stories.
                </SheetDescription>
              </SheetHeader>
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-2 border-y py-5"
              >
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="mobile-nav-link"
                    aria-current={isActive(link.href) ? "page" : undefined}
                  >
                    {link.label}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                ))}
              </nav>
              <div className="mt-7 flex flex-col gap-3">
                <Button asChild>
                  <Link href="/register" onClick={() => setOpen(false)}>
                    Join the library <ArrowUpRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                </Button>
              </div>
              <p className="mt-auto pt-8 text-xs leading-relaxed text-slate">
                The collection is in preview. Membership opens soon.
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
