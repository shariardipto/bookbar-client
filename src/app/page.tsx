import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="mx-auto w-full max-w-6xl px-6 py-7 sm:px-10">
        <Link href="/" aria-label="BookBar home" className="wordmark inline-block text-3xl tracking-tight">
          BookBar<span className="text-copper">.</span>
        </Link>
      </header>

      <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-1 items-center px-6 py-14 sm:px-10 sm:py-24">
        <section aria-labelledby="welcome-title" className="max-w-3xl">
          <p className="mb-7 flex items-center gap-3 text-xs font-semibold tracking-[0.2em] uppercase text-slate">
            <span aria-hidden="true" className="h-px w-9 bg-copper" />
            A small online library
          </p>
          <h1 id="welcome-title" className="display-heading text-5xl leading-[1.08] tracking-tight text-navy sm:text-7xl">
            Every great read starts a new chapter.
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-slate">
            We’re preparing a thoughtful space to discover books, share your shelves,
            and borrow something worth getting lost in.
          </p>
          <p className="mt-10 inline-flex rounded-full border border-mist bg-white px-5 py-2.5 text-sm font-medium text-navy">
            Library opening soon
          </p>
        </section>
      </main>

      <footer className="border-t border-mist px-6 py-6 sm:px-10">
        <p className="mx-auto max-w-6xl text-sm text-slate">BookBar · A little space for a world of stories.</p>
      </footer>
    </div>
  );
}
