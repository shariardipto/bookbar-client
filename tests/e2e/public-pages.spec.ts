import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

test("home has six preview books and three usable, manually controlled slides", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page).toHaveTitle("BookBar | Home");
  await expect(page.locator("[data-book-card]")).toHaveCount(6);
  await expect(
    page.getByText("These are sample titles", { exact: false }),
  ).toBeVisible();
  await expect(page.locator(".swiper-slide")).toHaveCount(3);
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "Your next chapter",
  );
  await page.getByRole("button", { name: "Next slide", exact: true }).click();
  await expect(page.locator(".swiper-slide-active")).toContainText(
    "Stay curious.",
  );
  await expect(page.locator(".swiper-slide[aria-hidden=true]")).toHaveCount(2);
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
    .locator(".swiper-slide-active")
    .getByRole("link", { name: "Browse Books", exact: true })
    .click();
  await expect(page).toHaveURL(/\/books$/);
  expect(errors).toEqual([]);
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
  await page.locator(".category-tile").filter({ hasText: "Science" }).click();
  await expect(page).toHaveURL(/category=Science/);
  await expect(page.locator("[data-book-card]")).toHaveCount(2);
  await page
    .getByRole("link", { name: "View details for The Time Machine" })
    .click();
  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fbooks%2Fpreview-time-machine/,
  );
  await expect(
    page.getByRole("form", { name: "Log in to BookBar" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("BookBar | Login");
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
