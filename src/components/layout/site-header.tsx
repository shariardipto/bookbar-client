"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Brand } from "./brand";
import { Button } from "@/components/ui/button";
import { AccountMenu, LogoutButton } from "@/components/auth/account-menu";
import { useMemberSession } from "@/components/auth/session-provider";
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
const memberLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data, isPending, error, refetch } = useMemberSession();
  const navigation = data?.user ? [...links, ...memberLinks] : links;
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
            className="hidden h-full items-center gap-6 lg:flex"
          >
            {navigation.map((link) => (
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
          <div className="hidden items-center gap-2 lg:flex">
            {isPending ? (
              <span className="account-loading" role="status">
                Checking membership…
              </span>
            ) : data?.user ? (
              <AccountMenu user={data.user} />
            ) : error ? (
              <Button variant="ghost" onClick={() => refetch()}>
                Retry session
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
              </>
            )}
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
                className="lg:hidden"
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
                {navigation.map((link) => (
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
                {isPending ? (
                  <span role="status" className="account-loading">
                    Checking membership…
                  </span>
                ) : data?.user ? (
                  <>
                    <Button asChild variant="outline">
                      <Link href="/profile" onClick={() => setOpen(false)}>
                        My profile
                      </Link>
                    </Button>
                    <p className="text-xs text-slate break-words">
                      Signed in as {data.user.name}
                    </p>
                    <LogoutButton onComplete={() => setOpen(false)} />
                  </>
                ) : error ? (
                  <Button variant="outline" onClick={() => refetch()}>
                    Retry session
                  </Button>
                ) : (
                  <>
                    <Button asChild>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        Join the library <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </Button>
                  </>
                )}
                <Button variant="outline" asChild>
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Log in
                  </Link>
                </Button>
              </div>
              <p className="mt-auto pt-8 text-xs leading-relaxed text-slate">
                A little space for your next chapter.
              </p>
            </SheetContent>
          </Sheet>
        </div>
      </header>
    </>
  );
}
