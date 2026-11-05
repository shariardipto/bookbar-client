import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "BookBar | A Small Online Library",
    template: "BookBar | %s",
  },
  description:
    "A thoughtful space to discover books, share your shelves, and find your next great read. BookBar is opening soon.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
