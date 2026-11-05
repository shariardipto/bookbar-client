"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, Keyboard } from "swiper/modules";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookCover } from "@/components/books/book-cover";
import "swiper/css";
import "swiper/css/a11y";

const slides = [
  {
    eyebrow: "For the beautifully curious",
    line: "Your next chapter",
    emphasis: "starts here.",
    description:
      "Somewhere between the first page and the last, there’s a whole new world. Let’s find yours.",
    note: "A little escape, between the covers.",
    books: ["time-machine", "secret-garden", "pride-prejudice"],
    titles: ["The Time Machine", "The Secret Garden", "Pride and Prejudice"],
  },
  {
    eyebrow: "Big ideas. Beautiful discoveries.",
    line: "Stay curious.",
    emphasis: "Read something new.",
    description:
      "Follow a question, wander into another century, or see the familiar a little differently. Curiosity looks good on you.",
    note: "Make a little room for wonder.",
    books: ["short-history", "origin-species", "room-own"],
    titles: [
      "A Short History of the World",
      "On the Origin of Species",
      "A Room of One’s Own",
    ],
  },
  {
    eyebrow: "Stories are better when shared",
    line: "A small library.",
    emphasis: "Endless possibilities.",
    description:
      "Old favorites and unexpected finds. Stories for little readers and lifelong dreamers. There’s a place for every reader here.",
    note: "Good stories are for everyone.",
    books: ["little-women", "alice", "art-war"],
    titles: [
      "Little Women",
      "Alice’s Adventures in Wonderland",
      "The Art of War",
    ],
  },
];

export function HeroSlider() {
  const slider = useRef<SwiperInstance | null>(null);
  const [active, setActive] = useState(0);
  const [moving, setMoving] = useState(false);
  return (
    <section className="hero-shell" aria-label="Discover BookBar">
      <Swiper
        modules={[A11y, Keyboard]}
        slidesPerView={1}
        speed={500}
        loop
        keyboard={{ enabled: true, onlyInViewport: true, pageUpDown: false }}
        a11y={{
          containerMessage: "BookBar reading inspiration",
          slideLabelMessage: "{{index}} of {{slidesLength}}",
        }}
        onSwiper={(instance) => {
          slider.current = instance;
        }}
        onSlideChange={(instance) => setActive(instance.realIndex)}
        onTransitionStart={() => setMoving(true)}
        onTransitionEnd={() => setMoving(false)}
      >
        {slides.map((slide, index) => {
          return (
            <SwiperSlide
              key={slide.eyebrow}
              inert={active !== index ? true : undefined}
              aria-hidden={active !== index}
            >
              <div className="hero-slide">
                <div className="hero-copy">
                  <p className="hero-eyebrow">
                    <span aria-hidden="true" />
                    {slide.eyebrow}
                  </p>
                  <h2 className="hero-title display-heading">
                    {slide.line}
                    <br />
                    <em>{slide.emphasis}</em>
                  </h2>
                  <p className="hero-description">{slide.description}</p>
                  <div className="hero-actions">
                    <Button
                      size="lg"
                      asChild
                      className="bg-white text-navy hover:bg-white/90"
                    >
                      <Link href="/books">
                        Browse Books <ArrowUpRight aria-hidden="true" />
                      </Link>
                    </Button>
                    <Link href="/#how-it-works" className="hero-secondary">
                      How it works{" "}
                      <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
                <div
                  className="hero-art"
                  aria-label="A selection of preview book covers"
                >
                  <div
                    className="hero-orbit hero-orbit-one"
                    aria-hidden="true"
                  />
                  <div
                    className="hero-orbit hero-orbit-two"
                    aria-hidden="true"
                  />
                  <span className="hero-star hero-star-one" aria-hidden="true">
                    ✳
                  </span>
                  <span className="hero-star hero-star-two" aria-hidden="true">
                    ✧
                  </span>
                  {slide.books.map((book, bookIndex) => (
                    <BookCover
                      key={book}
                      src={`/covers/${book}.svg`}
                      title={slide.titles[bookIndex]}
                      className={`hero-book hero-book-${bookIndex + 1}`}
                      priority={index === 0}
                    />
                  ))}
                  <p className="hero-art-note">{slide.note}</p>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
      <div className="hero-controls">
        <div className="flex items-center gap-3">
          <span className="hero-counter" aria-live="polite" aria-atomic="true">
            <span className="sr-only">Slide </span>0{active + 1}
            <span className="mx-2 text-white/45">/</span>03
          </span>
          <div className="flex" aria-label="Choose a slide">
            {slides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                className="hero-dot"
                disabled={moving}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={active === index ? "true" : undefined}
                onClick={() => slider.current?.slideToLoop(index)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous slide"
            disabled={moving}
            className="hero-arrow"
            onClick={() => slider.current?.slidePrev()}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next slide"
            disabled={moving}
            className="hero-arrow"
            onClick={() => slider.current?.slideNext()}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
