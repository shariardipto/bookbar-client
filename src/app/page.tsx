import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookHeart,
  Compass,
  Repeat2,
} from "lucide-react";
import { HeroSlider } from "@/components/home/hero-slider";
import { CategorySection } from "@/components/home/category-section";
import { HowItWorks } from "@/components/home/how-it-works";
import { LatestBooks } from "@/components/books/latest-books";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: { absolute: "BookBar | Home" } };

export default function Home() {
  return (
    <>
      <h1 className="sr-only">BookBar. Your next chapter starts here.</h1>
      <div className="site-container pt-6 sm:pt-8">
        <HeroSlider />
      </div>
      <div className="site-container shelf-notes">
        <p>
          <Compass aria-hidden="true" /> A story for every mood
        </p>
        <span aria-hidden="true" />
        <p>
          <BookHeart aria-hidden="true" /> A shelf worth sharing
        </p>
        <span aria-hidden="true" />
        <p>
          <Repeat2 aria-hidden="true" /> Read. Return. Repeat.
        </p>
      </div>
      <section
        className="site-container section-space pt-8! sm:pt-10!"
        aria-labelledby="arrivals-title"
      >
        <div className="section-heading-row">
          <div>
            <p className="section-eyebrow mb-3">
              Fresh stories, familiar comforts
            </p>
            <h2 id="arrivals-title" className="section-title">
              New on the shelves.
            </h2>
          </div>
          <Link href="/books" className="text-link">
            Explore all books{" "}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-8">
          <LatestBooks />
        </div>
        <div className="mt-9 text-center">
          <Button
            variant="outline"
            size="lg"
            asChild
            className="bg-transparent"
          >
            <Link href="/books">
              See All Books <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
      <CategorySection />
      <HowItWorks />
      <section
        className="reading-invitation"
        aria-labelledby="invitation-title"
      >
        <div className="site-container flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="section-eyebrow mb-3">
              There’s always another chapter
            </p>
            <h2
              id="invitation-title"
              className="display-heading text-[clamp(1.8rem,3vw,2.5rem)] leading-tight text-navy"
            >
              A good book is waiting for you.
            </h2>
          </div>
          <Button size="lg" asChild>
            <Link href="/books">
              Find your next read <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
