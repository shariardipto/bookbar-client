import Link from "next/link";
import {
  ArrowUpRight,
  Atom,
  BookOpen,
  Landmark,
  Sparkles,
  WandSparkles,
} from "lucide-react";

const items = [
  { name: "Fiction", description: "Get wonderfully lost.", Icon: BookOpen },
  { name: "Science", description: "A world of what ifs.", Icon: Atom },
  { name: "History", description: "The past, rediscovered.", Icon: Landmark },
  {
    name: "Kids",
    description: "Little readers, big worlds.",
    Icon: WandSparkles,
  },
  { name: "Others", description: "Follow your curiosity.", Icon: Sparkles },
];

export function CategorySection() {
  return (
    <section
      className="section-space border-y bg-white/65"
      aria-labelledby="categories-title"
    >
      <div className="site-container">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="section-eyebrow mb-3">A shelf for every mood</p>
            <h2 id="categories-title" className="section-title">
              Follow your curiosity.
            </h2>
          </div>
          <p className="body-copy max-w-72">
            The best discoveries often start
            <br className="hidden sm:block" /> with a little wandering.
          </p>
        </div>
        <div className="category-grid">
          {items.map(({ name, description, Icon }, index) => (
            <Link
              key={name}
              href={`/books?category=${name}`}
              className="category-tile group"
            >
              <div className="mb-7 flex items-center justify-between">
                <Icon
                  className="size-6 text-copper"
                  strokeWidth={1.3}
                  aria-hidden="true"
                />
                <span className="text-[10px] tracking-wider text-slate">
                  0{index + 1}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h3 className="display-heading text-2xl text-navy">{name}</h3>
                <ArrowUpRight
                  className="size-4 text-slate transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
