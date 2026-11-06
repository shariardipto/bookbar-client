import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p className="mt-5 max-w-64 text-sm leading-7 text-slate">
              Good books deserve to be shared. Find a story, turn a page, pass
              it on.
            </p>
          </div>
          <div>
            <h2 className="footer-heading">Explore the shelves</h2>
            <ul className="footer-links">
              <li>
                <Link href="/books">All books</Link>
              </li>
              <li>
                <Link href="/books?category=Fiction">Fiction</Link>
              </li>
              <li>
                <Link href="/books?category=Science">Science & discovery</Link>
              </li>
              <li>
                <Link href="/books?category=Kids">For little readers</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-heading">Make yourself at home</h2>
            <ul className="footer-links">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/#how-it-works">How borrowing works</Link>
              </li>
              <li>
                <Link href="/register">Join the library</Link>
              </li>
              <li>
                <Link href="/login">Member login</Link>
              </li>
            </ul>
          </div>
          <div>
            <h2 className="footer-heading">Keep in touch</h2>
            <p className="text-sm leading-7 text-slate">
              Contact details and community channels will be shared when
              membership opens.
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Explore Instagram (opens in a new tab)"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
                </svg>
              </a>
              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="Explore X (opens in a new tab)"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M18.9 2H22l-6.8 7.8L23.2 22H17l-4.9-7.4L5.6 22H2.4l8.2-9.4L.8 2h6.4l4.4 6.7L18.9 2Zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20Z" />
                </svg>
              </a>
            </div>
            <p className="mt-2 text-[11px] text-slate">
              Discover the platforms; For the love of reading.
            </p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2026 BookBar. All Rights Reserved</p>
          <Link href="/books" className="inline-flex items-center gap-1.5">
            Find your next chapter{" "}
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
