import { BookOpen, Library, RotateCcw } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Find your next read",
    description:
      "Browse the shelves. Follow a favorite author or let something unexpected catch your eye.",
    Icon: Library,
  },
  {
    number: "02",
    title: "Make it yours for a while",
    description:
      "When membership opens, sign in and borrow an available book. A new adventure is just a page away.",
    Icon: BookOpen,
  },
  {
    number: "03",
    title: "Return it. Pass it on.",
    description:
      "Finish your chapter, return the book, and give another reader the chance to fall in love with it.",
    Icon: RotateCcw,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="site-container section-space"
      aria-labelledby="how-title"
    >
      <div className="how-panel">
        <div className="how-heading">
          <div>
            <p className="section-eyebrow mb-3 text-copper-light">
              A library, made simple
            </p>
            <h2 id="how-title" className="section-title max-w-xl text-white">
              Good stories.
              <br />
              No complicated chapters.
            </h2>
          </div>
          <p className="max-w-64 text-sm leading-7 text-white/70">
            A little less scrolling.
            <br />A little more turning pages.
          </p>
        </div>
        <ol className="how-grid">
          {steps.map(({ number, title, description, Icon }) => (
            <li key={number} className="how-step">
              <div className="mb-5 flex items-center justify-between">
                <span className="display-heading text-[2.6rem] text-copper-light">
                  {number}
                  <span className="text-white/25">.</span>
                </span>
                <Icon
                  className="size-6 text-white/60"
                  strokeWidth={1.2}
                  aria-hidden="true"
                />
              </div>
              <h3 className="mb-3 text-base font-semibold text-white">
                {title}
              </h3>
              <p className="text-[13px] leading-7 text-white/70">
                {description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
