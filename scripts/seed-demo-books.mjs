import { createHash } from "node:crypto";
import { mkdir, open, readFile, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";
import { chromium } from "@playwright/test";
import { demoBooks } from "./data/demo-books.mjs";

// Explicit local CLI only; never imported by production application code.
const root = new URL("../", import.meta.url);
const cache = new URL(".cache/demo-seed/", root);
class SeedError extends Error {}
const ensure = (condition, message) => {
  if (!condition) throw new SeedError(message);
};
const normalize = (value) =>
  value.normalize("NFKC").trim().replace(/\s+/gu, " ").toLocaleLowerCase("en");
export const bookKey = (book) =>
  `${normalize(book.title)}\u0000${normalize(book.author)}`;
export function planDemoBooks(existing, requested = demoBooks) {
  const known = new Set(existing.map(bookKey));
  ensure(
    new Set(requested.map(bookKey)).size === requested.length,
    "The seed dataset contains duplicate titles/authors.",
  );
  return requested.filter((book) => !known.has(bookKey(book)));
}
const escapeXml = (value) =>
  value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[character],
  );
export function coverSvg(book, index) {
  const palettes = [
    ["#263c55", "#f0dec1"],
    ["#d8dfd6", "#344c4a"],
    ["#b56a50", "#fff0dc"],
    ["#e9d8ba", "#344851"],
    ["#c7b6c4", "#28394f"],
  ];
  const [background, ink] = palettes[index % palettes.length];
  const titleSize =
    Math.max(...book.coverLines.map((line) => line.length)) > 15
      ? 29
      : book.coverLines.length === 1
        ? 42
        : 37;
  const lines = book.coverLines
    .map(
      (line, number) =>
        `<text x="180" y="${105 + number * 46}" text-anchor="middle" font-family="Georgia,serif" font-size="${titleSize}">${escapeXml(line)}</text>`,
    )
    .join("");
  const motifs = {
    Fiction:
      '<path d="M81 298q50-29 99 0q49-29 99 0v137q-49-25-99 0q-49-25-99 0ZM180 298v137M99 324q34-16 63-3M198 321q32-13 63 3M99 348q34-16 63-3M198 345q32-13 63 3"/>',
    Science:
      '<circle cx="180" cy="356" r="70"/><ellipse cx="180" cy="356" rx="105" ry="31" transform="rotate(38 180 356)"/><ellipse cx="180" cy="356" rx="105" ry="31" transform="rotate(-38 180 356)"/><path d="M180 268v176M92 356h176"/><circle cx="180" cy="356" r="9"/>',
    History:
      '<path d="M73 315l107-48l107 48ZM89 329h182M89 432h182M76 448h208M110 335v88M124 335v88M172 335v88M186 335v88M234 335v88M248 335v88"/><circle cx="180" cy="298" r="9"/>',
    Kids: '<path d="M92 435l30-111l58 111l58-111l30 111ZM83 448h194M180 290v97M154 314l26-24l26 24"/><circle cx="113" cy="281" r="15"/><path d="M254 272v22M243 283h22M75 371v16M67 379h16"/>',
    Others:
      '<circle cx="180" cy="353" r="88"/><circle cx="180" cy="353" r="72"/><path d="M180 291v125M127 331q53 9 53 64q-53-4-53-64ZM233 312q-53 8-53 63q53-4 53-63ZM116 456h128"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="540" viewBox="0 0 360 540"><title>${escapeXml(book.title)} — original BookBar cover</title><rect width="360" height="540" fill="${background}"/><rect x="19" y="20" width="322" height="500" fill="none" stroke="${ink}" opacity=".5"/><path d="M8 0v540M14 0v540" stroke="${ink}" opacity=".17"/><g fill="${ink}"><text x="180" y="45" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" letter-spacing="2.7">THE BOOKBAR COLLECTION</text>${lines}<text x="180" y="486" text-anchor="middle" font-family="Arial,sans-serif" font-size="8" letter-spacing="2">${escapeXml(book.category.toUpperCase())}</text><text x="180" y="506" text-anchor="middle" font-family="Arial,sans-serif" font-size="10" letter-spacing="1">${escapeXml(book.author.toUpperCase())}</text></g><g fill="none" stroke="${ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${motifs[book.category]}</g></svg>`;
}
const fingerprint = (record) =>
  createHash("sha256")
    .update(
      JSON.stringify(
        Object.fromEntries(
          Object.entries(record).sort(([a], [b]) => a.localeCompare(b)),
        ),
      ),
    )
    .digest("hex");
async function parseJson(response) {
  return response.json().catch(() => null);
}
function localOrigin(value) {
  const url = URL.parse(value ?? "");
  ensure(
    url &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash,
    "Seed origins must be explicitly configured local HTTP origins.",
  );
  return url.origin;
}

export async function seedDemoBooks() {
  await mkdir(cache, { recursive: true });
  const lockPath = new URL("seed.lock", cache);
  let lock;
  try {
    lock = await open(lockPath, "wx", 0o600);
  } catch {
    throw new SeedError(
      "Another seed run or a previous lock exists; no books were changed.",
    );
  }
  let cookie = "",
    browser,
    stage = "preflight",
    origin;
  try {
    await lock.writeFile(`${process.pid}\n`);
    origin = localOrigin(process.env.BETTER_AUTH_URL);
    const api = localOrigin(process.env.NEXT_PUBLIC_API_BASE_URL);
    const manifestPath = new URL("manifest.json", cache);
    let manifest = { covers: {}, createdIds: {} };
    try {
      manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    } catch (error) {
      if (error.code !== "ENOENT")
        throw new SeedError(
          "Seed progress is unreadable; existing data was not changed.",
        );
    }
    ensure(
      manifest.covers && manifest.createdIds,
      "Seed progress has an invalid format.",
    );
    const save = () =>
      writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, {
        mode: 0o600,
      });
    const auth = (path, body) =>
      fetch(`${origin}/api/auth/${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          Origin: origin,
          ...(cookie ? { Cookie: cookie } : {}),
          ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        signal: AbortSignal.timeout(25000),
        redirect: "manual",
      });
    async function catalog(path = "/books") {
      const response = await fetch(`${api}${path}`, {
        signal: AbortSignal.timeout(15000),
      });
      const result = await parseJson(response);
      ensure(
        response.ok && result?.success && Array.isArray(result.data),
        "The catalog could not be read.",
      );
      return result.data;
    }
    const before = await catalog(),
      pending = planDemoBooks(before);
    console.log(
      `Plan: ${pending.length} new books; ${demoBooks.length - pending.length} matching titles skipped; ${before.length} existing books preserved.`,
    );
    const credentials = parseEnv(
      await readFile(new URL(".env.seed.local", root), "utf8").catch(() => {
        throw new SeedError(
          "Private starter-account settings are missing from .env.seed.local.",
        );
      }),
    );
    ensure(
      credentials.BOOKBAR_SEED_EMAIL && credentials.BOOKBAR_SEED_PASSWORD,
      "Private starter-account settings are incomplete.",
    );
    const login = await auth("sign-in/email", {
      email: credentials.BOOKBAR_SEED_EMAIL,
      password: credentials.BOOKBAR_SEED_PASSWORD,
    });
    ensure(
      login.ok,
      "Existing starter-account sign-in failed; no account or settings were changed.",
    );
    cookie = login.headers
      .getSetCookie()
      .map((value) => value.split(";")[0])
      .join("; ");
    ensure(cookie, "No seed session was issued.");
    const tokenResponse = await auth("token"),
      token = await parseJson(tokenResponse);
    ensure(
      tokenResponse.ok && typeof token?.token === "string",
      "Seed API authorization failed.",
    );
    const headers = { Authorization: `Bearer ${token.token}` };
    async function detail(id) {
      const response = await fetch(`${api}/books/${id}`, {
        headers,
        signal: AbortSignal.timeout(15000),
      });
      const result = await parseJson(response);
      ensure(
        response.ok && result?.success && result.data?._id === id,
        "A private book record could not be read.",
      );
      return result.data;
    }
    const originals = new Map();
    for (const book of before)
      originals.set(book._id, fingerprint(await detail(book._id)));

    if (pending.length) {
      ensure(
        process.env.IMGBB_API_KEY?.trim(),
        "Private imgbb configuration is required for new covers.",
      );
      stage = "cover rendering";
      browser = await chromium.launch({ channel: "chrome", headless: true });
      const page = await browser.newPage({
        viewport: { width: 360, height: 540 },
        deviceScaleFactor: 2,
      });
      for (const book of pending) {
        if (manifest.covers[book.key]) continue;
        const svg = coverSvg(book, demoBooks.indexOf(book));
        await writeFile(new URL(`${book.key}.svg`, cache), svg);
        await page.setContent(
          `<style>html,body{margin:0;width:360px;height:540px;overflow:hidden}</style>${svg}`,
        );
        await page.screenshot({
          path: fileURLToPath(new URL(`${book.key}.png`, cache)),
        });
      }
      await browser.close();
      browser = undefined;
      stage = "image hosting";
      const missingCovers = pending.filter(
        (book) => !manifest.covers[book.key],
      );
      for (let start = 0; start < missingCovers.length; start += 3) {
        const batch = missingCovers.slice(start, start + 3);
        const results = await Promise.allSettled(
          batch.map(async (book) => {
            const body = new FormData();
            body.set("key", process.env.IMGBB_API_KEY.trim());
            body.set(
              "image",
              new Blob([await readFile(new URL(`${book.key}.png`, cache))], {
                type: "image/png",
              }),
              `bookbar-${book.key}.png`,
            );
            const response = await fetch("https://api.imgbb.com/1/upload", {
              method: "POST",
              body,
              redirect: "error",
              signal: AbortSignal.timeout(25000),
            });
            const result = await parseJson(response);
            const url = URL.parse(
              typeof result?.data?.url === "string" ? result.data.url : "",
            );
            ensure(
              response.ok &&
                result?.success === true &&
                url?.origin === "https://i.ibb.co" &&
                !url.username &&
                !url.password &&
                !url.search &&
                !url.hash,
              "A cover upload failed; private provider details suppressed.",
            );
            return url.href;
          }),
        );
        results.forEach((result, index) => {
          if (result.status === "fulfilled")
            manifest.covers[batch[index].key] = result.value;
        });
        await save();
        ensure(
          results.every((result) => result.status === "fulfilled"),
          "Cover hosting was incomplete; successful progress was saved for a safe rerun.",
        );
        console.log(
          `Hosted ${Object.keys(manifest.covers).length}/${demoBooks.length} original covers.`,
        );
      }
    }

    stage = "authorized book creation";
    let created = 0;
    for (const book of pending) {
      // Recheck after uploads and before each POST. Never PATCH/DELETE or replay
      // uncertain mutations; a later rerun discovers any committed title first.
      if (!planDemoBooks(await catalog(), [book]).length) continue;
      const response = await fetch(`${api}/books`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          category: book.category,
          description: book.description,
          imageUrl: manifest.covers[book.key],
          totalCopies: book.totalCopies,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const result = await parseJson(response);
      ensure(
        response.ok && result?.success && typeof result.data?._id === "string",
        "Book creation was not confirmed. Rerun safely; existing records will be checked first.",
      );
      manifest.createdIds[book.key] = result.data._id;
      await save();
      created++;
      console.log(`Added: ${book.title}`);
    }

    stage = "preservation and page verification";
    const after = await catalog();
    ensure(
      after.length === before.length + created,
      "The catalog changed concurrently; inspect it before another run.",
    );
    ensure(
      planDemoBooks(after).length === 0,
      "Some demonstration books are missing.",
    );
    for (const [id, hash] of originals)
      ensure(
        fingerprint(await detail(id)) === hash,
        "An existing book changed during the run; this script never updates existing records.",
      );
    const seeded = [];
    for (const book of demoBooks) {
      const matches = after.filter(
        (record) => bookKey(record) === bookKey(book),
      );
      ensure(
        matches.length === 1,
        "A duplicate demonstration title was found; no records were removed.",
      );
      const record = await detail(matches[0]._id);
      ensure(
        record.description.length > 50 &&
          Number.isFinite(Date.parse(record.createdAt)) &&
          record.totalCopies >= 1 &&
          record.copies >= 0 &&
          record.copies <= record.totalCopies,
        "A saved demonstration record is incomplete.",
      );
      seeded.push(record);
    }
    browser = await chromium.launch({ channel: "chrome", headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.name));
    await page.goto(`${origin}/books`);
    await page
      .locator("[data-book-card]")
      .nth(after.length - 1)
      .waitFor();
    ensure(
      (await page.locator("[data-book-card]").count()) === after.length,
      "All Books is missing saved records.",
    );
    for (const image of await page.locator("[data-book-card] img").all())
      await image.scrollIntoViewIfNeeded();
    await page.waitForFunction((count) => {
      const images = [...document.querySelectorAll("[data-book-card] img")];
      return (
        images.length === count &&
        images.every((image) => image.complete && image.naturalWidth > 0)
      );
    }, after.length);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({
      path: fileURLToPath(new URL("all-books-desktop.png", cache)),
    });
    const latest = await catalog("/books?sort=latest&limit=6");
    await page.goto(`${origin}/`);
    await page
      .locator("[data-book-card]")
      .nth(latest.length - 1)
      .waitFor();
    const homeIds = await page
      .locator("[data-book-card]")
      .evaluateAll((cards) =>
        cards.map((card) => card.getAttribute("data-book-id")),
      );
    ensure(
      homeIds.length === 6 &&
        homeIds.every((id, index) => id === latest[index]._id),
      "Home New Arrivals does not match the database latest six.",
    );
    const browserLogin = await context.request.post(
      `${origin}/api/auth/sign-in/email`,
      {
        headers: { Origin: origin },
        data: {
          email: credentials.BOOKBAR_SEED_EMAIL,
          password: credentials.BOOKBAR_SEED_PASSWORD,
        },
      },
    );
    ensure(browserLogin.ok(), "Book Details browser sign-in failed.");
    try {
      for (const record of seeded) {
        await page.goto(`${origin}/books/${record._id}`);
        await page
          .getByRole("heading", { name: record.title, exact: true })
          .waitFor();
        ensure(
          await page.getByText(record.description, { exact: true }).isVisible(),
          "Book Details is missing a saved description.",
        );
        await page.waitForFunction(() => {
          const image = document.querySelector(".member-book-detail img");
          return image?.complete && image.naturalWidth > 0;
        });
      }
      ensure(
        !errors.length,
        "A browser JavaScript error occurred during page verification.",
      );
    } finally {
      const logout = await context.request.post(`${origin}/api/auth/sign-out`, {
        headers: { Origin: origin },
        data: {},
      });
      ensure(logout.ok(), "Browser verification logout was not confirmed.");
    }
    console.log(
      `PASS: created ${created}; skipped ${demoBooks.length - created}; total library books ${after.length}.`,
    );
    console.log(
      `PASS: ${originals.size} pre-existing records unchanged; all 5 categories represented; timestamps set by the API.`,
    );
    console.log(
      `PASS: All Books (${after.length} loaded covers), Home latest 6 and all 14 private Book Details pages.`,
    );
  } catch (error) {
    throw new SeedError(
      `${stage}: ${error instanceof SeedError ? error.message : "Operation failed; private error details suppressed."}`,
    );
  } finally {
    if (browser) await browser.close().catch(() => undefined);
    if (cookie && origin) {
      const response = await fetch(`${origin}/api/auth/sign-out`, {
        method: "POST",
        headers: {
          Origin: origin,
          Cookie: cookie,
          "Content-Type": "application/json",
        },
        body: "{}",
        signal: AbortSignal.timeout(15000),
      }).catch(() => null);
      if (!response?.ok) {
        console.error(
          "Seed session logout was not confirmed; no credentials logged.",
        );
        process.exitCode = 1;
      }
    }
    await lock.close();
    await unlink(lockPath);
  }
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  seedDemoBooks().catch((error) => {
    console.error(
      error instanceof SeedError
        ? error.message
        : "Seed failed; private details suppressed.",
    );
    process.exitCode = 1;
  });
}
