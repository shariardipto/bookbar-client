import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { previewBooks } from "../../src/lib/preview-books";

// Deterministic API transport fixtures for public UI checks only. Real Atlas,
// uploads, sessions and mutations are verified separately by test:live.
test.beforeEach(async ({ page }) => {
  await page.route("http://localhost:5000/books?**", (route) => {
    const limit = new URL(route.request().url()).searchParams.get("limit");
    const records = previewBooks.map((book, index) => ({
      ...book,
      _id: String(index + 1).padStart(24, "0"),
      copies: 2,
      totalCopies: 2,
    }));
    return route.fulfill({
      json: {
        success: true,
        data: limit ? records.slice(0, Number(limit)) : records,
      },
    });
  });
  await page.route("http://localhost:5000/books", (route) =>
    route.fulfill({
      json: {
        success: true,
        data: previewBooks.map((book, index) => ({
          ...book,
          _id: String(index + 1).padStart(24, "0"),
          copies: 2,
          totalCopies: 2,
        })),
      },
    }),
  );
});

test("loopback URLs preserve filters and private destinations on the canonical host", async ({
  page,
}) => {
  await page.goto("http://127.0.0.1:3000/books?category=Science&q=Wells");
  await expect(page).toHaveURL(
    "http://localhost:3000/books?category=Science&q=Wells",
  );
  await expect(page.getByRole("searchbox")).toHaveValue("Wells");
  await expect(page.locator("[data-book-card]")).toHaveCount(1);
  await page.goto("http://127.0.0.1:3000/my-books");
  await expect(page).toHaveURL(
    "http://localhost:3000/login?callbackUrl=%2Fmy-books",
  );
});

test("home renders six API records and five navigable hero slides", async ({
  page,
}) => {
  const errors: string[] = [];
  await page.emulateMedia({ reducedMotion: "no-preference" });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("BookBar | Home");
  await expect(page.locator("[data-book-card]")).toHaveCount(6);
  await expect(
    page.getByText("These are sample titles", { exact: false }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Next slide", exact: true }).focus();
  await expect(
    page.getByRole("button", { name: /automatic slides/ }),
  ).toHaveCount(0);
  await expect(page.locator(".swiper-slide")).toHaveCount(5);
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "Your next chapter",
  );
  await page.getByRole("button", { name: "Next slide", exact: true }).click();
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "Stay curious.",
  );
  await expect(page.locator(".swiper-slide[aria-hidden=true]")).toHaveCount(4);
  expect(
    await page
      .locator(".swiper-slide[aria-hidden=true]")
      .evaluateAll((slides) =>
        slides.every((slide) => slide.hasAttribute("inert")),
      ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Go to slide 3", exact: true })
    .click();
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "Endless possibilities.",
  );
  await page
    .getByRole("button", { name: "Previous slide", exact: true })
    .click();
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "Stay curious.",
  );
  await page
    .getByRole("button", { name: "Go to slide 4", exact: true })
    .click();
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "for a good book.",
  );
  await page
    .getByRole("button", { name: "Go to slide 5", exact: true })
    .click();
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "lead the way.",
  );
  await page
    .locator(".swiper-slide-active")
    .getByRole("link", { name: "Browse Books", exact: true })
    .click();
  await expect(page).toHaveURL(/\/books$/);
  expect(errors).toEqual([]);
});

test("hero autoplay advances and resumes after hover without play/pause controls", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.mouse.move(0, 0);
  const current = page.locator(".hero-dot[aria-current=true]");
  await expect(current).toHaveAttribute("aria-label", "Go to slide 2", {
    timeout: 7500,
  });
  await page.locator(".swiper-slide-active .hero-copy").hover();
  const hovered = await current.getAttribute("aria-label");
  await page.waitForTimeout(5500);
  await expect(current).toHaveAttribute("aria-label", hovered!);
  await page.mouse.move(0, 0);
  await expect(current).not.toHaveAttribute("aria-label", hovered!, {
    timeout: 7500,
  });
  await expect(
    page.getByRole("button", { name: /automatic slides/ }),
  ).toHaveCount(0);
});

test("hero respects reduced motion and pauses when keyboard focus enters", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const current = page.locator(".hero-dot[aria-current=true]");
  await expect(
    page.getByRole("button", { name: /automatic slides/ }),
  ).toHaveCount(0);
  await page.waitForTimeout(5500);
  await expect(current).toHaveAttribute("aria-label", "Go to slide 1");
  await page.getByRole("button", { name: "Next slide", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(current).toHaveAttribute("aria-label", "Go to slide 2");
  await expect(page.locator(".hero-counter")).toHaveAttribute(
    "aria-live",
    "polite",
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("banner")
    .getByRole("link", { name: "BookBar home", exact: true })
    .focus();
  await page.mouse.move(0, 0);
  await expect(current).toHaveAttribute("aria-label", "Go to slide 3", {
    timeout: 7500,
  });
});

test("all five hero slides and controls fit mobile, tablet and desktop", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mkdir(".cache/hero", { recursive: true });
  await page.goto("/");
  for (const width of [360, 480, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (let slide = 1; slide <= 5; slide++) {
      await page
        .getByRole("button", { name: `Go to slide ${slide}`, exact: true })
        .click();
      await expect(
        page.locator(".hero-dot[aria-current=true]"),
      ).toHaveAttribute("aria-label", `Go to slide ${slide}`);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
      ).toBe(true);
      const boxes = await page
        .locator(".hero-controls")
        .evaluate((element) => ({
          controls: element.getBoundingClientRect().toJSON(),
          children: [...element.children].map((child) =>
            child.getBoundingClientRect().toJSON(),
          ),
        }));
      expect(
        boxes.children.every(
          (child) =>
            child.left >= boxes.controls.left - 1 &&
            child.right <= boxes.controls.right + 1,
        ),
      ).toBe(true);
    }
    await page
      .locator(".hero-shell")
      .screenshot({ path: `.cache/hero/slide-five-${width}.png` });
    if (width === 360 || width === 1440) {
      const result = await new AxeBuilder({ page })
        .include(".hero-shell")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((issue) => ({
          id: issue.id,
          nodes: issue.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
    }
  }
});

test("catalog combines search/category, persists on refresh, sorts, and resets an empty result", async ({
  page,
}) => {
  await page.goto("/books");
  await expect(page).toHaveTitle("BookBar | All Books");
  await expect(page.locator("[data-book-card]")).toHaveCount(9);
  await page.getByRole("button", { name: "Science", exact: true }).click();
  await expect(page.locator("[data-book-card]")).toHaveCount(2);
  await page.getByRole("searchbox").fill("Wells");
  await expect(page.locator("[data-book-card]")).toHaveCount(1);
  await expect(page.locator("[data-book-card]")).toContainText(
    "The Time Machine",
  );
  await page.reload();
  await expect(page.getByRole("searchbox")).toHaveValue("Wells");
  await expect(
    page.getByRole("button", { name: "Science", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-book-card]")).toHaveCount(1);
  await page.getByRole("searchbox").fill("a title that does not exist");
  await expect(
    page.getByRole("heading", { name: "No matching books." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator("[data-book-card]")).toHaveCount(9);
  await page.getByRole("combobox", { name: "Sort books" }).click();
  await page.getByRole("option", { name: "Title A–Z" }).click();
  await expect(page.locator("[data-book-card]").first()).toContainText(
    "A Room of One’s Own",
  );
  await page.reload();
  await expect(
    page.getByRole("combobox", { name: "Sort books" }),
  ).toContainText("Title A–Z");
});

test("category links open the filtered collection and details preserve the intended route", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("link", { name: /Science A world of what ifs\./ })
    .click();
  await expect(page).toHaveURL(/category=Science/);
  await expect(page.locator("[data-book-card]")).toHaveCount(2);
  await page
    .getByRole("link", { name: "View details for The Time Machine" })
    .click();
  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fbooks%2F000000000000000000000002/,
  );
  await expect(
    page.getByRole("form", { name: "Log in to BookBar" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("BookBar | Login");
});

test("library loading, empty and retry states use API outcomes", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let fail = true;
  await page.route("http://localhost:5000/books", async (route) => {
    await gate;
    await route.fulfill(
      fail
        ? {
            status: 503,
            json: {
              success: false,
              message: "The library is temporarily unavailable.",
            },
          }
        : { json: { success: true, data: [] } },
    );
  });
  await page.goto("/books");
  await expect(
    page.getByRole("status", { name: "Loading books" }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("heading", { name: "The shelf needs a moment." }),
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "A little room for a good book.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Add a book", exact: true }).last(),
  ).toHaveAttribute("href", "/add-book");
});

test("custom 404 keeps the global shell and has a working home action", async ({
  page,
}) => {
  const response = await page.goto("/a-lost-chapter");
  expect(response?.status()).toBe(404);
  await expect(page).toHaveTitle("BookBar | Page Not Found");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await page.getByRole("link", { name: "Back to Home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("broken covers get an accessible fallback", async ({ page }) => {
  await page.route("**/covers/secret-garden.svg", (route) =>
    route.fulfill({ status: 404, body: "Not found" }),
  );
  await page.goto("/books");
  await expect(
    page.getByRole("img", { name: "Cover unavailable for The Secret Garden" }),
  ).toBeVisible();
  await expect(page.locator("[data-book-card]").first()).toContainText(
    "The Secret Garden",
  );
});

test("mobile navigation traps focus, closes with Escape, and navigates", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 900 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Open navigation menu" });
  await menu.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Tab");
  expect(
    await dialog.evaluate((element) =>
      element.contains(document.activeElement),
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(menu).toBeFocused();
  await menu.click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "All Books" })
    .click();
  await expect(page).toHaveURL(/\/books$/);
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

for (const width of [360, 390, 768, 1280, 1440]) {
  test(`public pages fit ${width}px and book cards have the intended grid`, async ({
    page,
  }) => {
    await mkdir(".cache/p01", { recursive: true });
    await page.setViewportSize({ width, height: 1000 });
    for (const route of [
      "/",
      "/books",
      "/login",
      "/register",
      "/a-lost-chapter",
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const size = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(
        size.content,
        `${route} overflows at ${width}px`,
      ).toBeLessThanOrEqual(size.viewport + 1);
      if (route === "/" || route === "/books") {
        const columns = await page
          .locator("[data-book-grid]")
          .evaluate(
            (element) =>
              getComputedStyle(element).gridTemplateColumns.split(" ").length,
          );
        expect(columns).toBe(width < 480 ? 1 : width < 1024 ? 2 : 3);
        const cards = await page
          .locator("[data-book-card]")
          .evaluateAll((elements) =>
            elements.map((element) => ({
              w: element.getBoundingClientRect().width,
              h: element.getBoundingClientRect().height,
            })),
          );
        expect(
          Math.max(...cards.map((card) => card.w)) -
            Math.min(...cards.map((card) => card.w)),
        ).toBeLessThan(2);
        expect(
          Math.max(...cards.map((card) => card.h)) -
            Math.min(...cards.map((card) => card.h)),
        ).toBeLessThan(2);
        await page.screenshot({
          path: `.cache/p01/${route === "/" ? "home" : "books"}-${width}.png`,
          fullPage: true,
        });
      }
    }
  });
}

test("public pages have no detected WCAG A/AA violations", async ({ page }) => {
  for (const route of [
    "/",
    "/books",
    "/login",
    "/register",
    "/a-lost-chapter",
  ]) {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(
      results.violations,
      `${route}: ${JSON.stringify(results.violations.map((issue) => ({ id: issue.id, nodes: issue.nodes.map((node) => node.target) })))}`,
    ).toEqual([]);
  }
});
