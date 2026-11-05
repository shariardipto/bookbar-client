import type { Metadata } from "next";
import "./globals.css";
import { bodyFont, displayFont } from "@/lib/fonts";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: {
    default: "BookBar | A Small Online Library",
    template: "BookBar | %s",
  },
  description:
    "Discover a world of stories at BookBar, a small online library made for curious readers. Explore our collection preview.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body>
        <AppProviders>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
        </AppProviders>
      </body>
    </html>
  );
}
