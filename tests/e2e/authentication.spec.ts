import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";

// Transport stubs exercise UI behavior only. They are not evidence of Atlas,
// persisted sessions, successful email login, or a completed Google callback.
const user = {
  id: "ui-test-member",
  name: "Avery Reader",
  email: "reader@example.com",
  image: null,
  emailVerified: false,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};
const session = {
  id: "ui-test-session",
  userId: user.id,
  token: "ui-test-only",
  expiresAt: "2027-11-01T00:00:00Z",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
};

test("registration validates locally, reveals passwords, and goes to login after a stubbed success", async ({
  page,
}) => {
  let submissions = 0;
  await page.route("**/api/auth/get-session**", (route) =>
    route.fulfill({ json: null }),
  );
  await page.route("**/api/auth/sign-up/email", async (route) => {
    submissions++;
    expect(route.request().postDataJSON()).toMatchObject({
      name: "Avery Reader",
      email: user.email,
      image: "https://example.com/photo.jpg",
      password: "Abcde1",
    });
    await route.fulfill({ json: { token: null, user } });
  });
  await page.goto("/register?callbackUrl=%2Fmy-books");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Enter your name", { exact: false }),
  ).toBeVisible();
  expect(submissions).toBe(0);
  await page.getByLabel("Your name").fill(user.name);
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page
    .getByLabel("Photo URL", { exact: true })
    .fill("https://example.com/photo.jpg");
  await page.getByLabel("Password", { exact: true }).fill("abcdef");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(
    page.getByText("Include an uppercase letter.", { exact: true }),
  ).toBeVisible();
  expect(submissions).toBe(0);
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
    "type",
    "text",
  );
  await page.getByRole("button", { name: "Hide password" }).click();
  await page.getByLabel("Password", { exact: true }).fill("Abcde1");
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(
    /\/login\?callbackUrl=%2Fmy-books&registered=1$/,
  );
  await expect(
    page.getByText(
      "Your account is ready. Log in with your email and password.",
    ),
  ).toBeVisible();
  expect(submissions).toBe(1);
});

test("login shows a stubbed credential error and rejects an external return path", async ({
  page,
}) => {
  await page.route("**/api/auth/get-session**", (route) =>
    route.fulfill({ json: null }),
  );
  let succeeded = false;
  await page.route("**/api/auth/sign-in/email", (route) =>
    route.fulfill(
      succeeded
        ? { json: { user, session } }
        : {
            status: 401,
            json: {
              code: "INVALID_EMAIL_OR_PASSWORD",
              message: "Invalid credentials",
            },
          },
    ),
  );
  await page.goto("/login?callbackUrl=https%3A%2F%2Fevil.invalid");
  let dialogs = 0;
  page.on("dialog", async (dialog) => {
    dialogs++;
    await dialog.dismiss();
  });
  await page.getByLabel("Email address", { exact: true }).fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill("Abcde1");
  await page
    .getByRole("button", { name: "Log in", exact: true })
    .last()
    .click();
  await expect(page.locator("form").getByRole("alert")).toHaveText(
    "That email and password do not match. Please try again.",
  );
  await page.getByRole("button", { name: "Forgot password?" }).click();
  await expect(
    page.getByText("Password reset is not available.", { exact: false }),
  ).toBeVisible();
  expect(dialogs).toBe(0);
  succeeded = true;
  await page
    .getByRole("button", { name: "Log in", exact: true })
    .last()
    .click();
  await expect(page).toHaveURL("/");
});

test("real server guards preserve all private destinations for signed-out visitors", async ({
  page,
}) => {
  for (const destination of [
    "/profile",
    "/add-book",
    "/my-books",
    "/my-borrows",
    "/books/000000000000000000000002",
  ]) {
    await page.goto(destination);
    await expect(page).toHaveURL(
      new RegExp(`/login\\?callbackUrl=${encodeURIComponent(destination)}$`),
    );
    await expect(
      page.getByRole("form", { name: "Log in to BookBar" }),
    ).toBeVisible();
  }
});

test("stubbed session drives keyboard account navigation, survives UI reload, and logs out", async ({
  page,
}) => {
  let signedIn = true;
  await page.route("**/api/auth/get-session**", (route) =>
    route.fulfill({ json: signedIn ? { user, session } : null }),
  );
  await page.route("**/api/auth/sign-out", async (route) => {
    signedIn = false;
    await route.fulfill({ json: { success: true } });
  });
  await page.goto("/books");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "My Books", exact: true }),
  ).toBeVisible();
  await page.reload();
  for (const width of [390, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const size = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(
      size.content,
      `member navigation overflows at ${width}px`,
    ).toBeLessThanOrEqual(size.viewport + 1);
    await expect(
      page.getByRole("button", { name: "Open account menu for Avery Reader" }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Log in", exact: true }),
  ).toHaveCount(0);
  await expect(
    page
      .getByRole("dialog")
      .getByRole("link", { name: "Join the library", exact: true }),
  ).toHaveCount(0);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1440, height: 1000 });
  const trigger = page.getByRole("button", {
    name: "Open account menu for Avery Reader",
  });
  await expect(trigger).toBeVisible();
  const accountA11y = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(
    accountA11y.violations.map((issue) => ({
      id: issue.id,
      nodes: issue.nodes.map((node) => ({
        target: node.target,
        summary: node.failureSummary,
      })),
    })),
  ).toEqual([]);
  await trigger.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "My profile" }),
  ).toBeFocused();
  await expect(
    page.getByRole("menuitem", { name: "My profile" }),
  ).toHaveAttribute("href", "/profile");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Log out" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL("/");
  await expect(
    page
      .getByRole("banner")
      .getByRole("link", { name: "Join the library", exact: true }),
  ).toBeVisible();
});

test("membership forms fit mobile and desktop without detected accessibility violations", async ({
  page,
}) => {
  await mkdir(".cache/p03", { recursive: true });
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ["/login", "/register"]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const size = await page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        content: document.documentElement.scrollWidth,
      }));
      expect(size.content).toBeLessThanOrEqual(size.viewport + 1);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(
        results.violations.map((issue) => ({
          id: issue.id,
          nodes: issue.nodes.map((node) => node.target),
        })),
      ).toEqual([]);
      await page.screenshot({
        path: `.cache/p03/${route.slice(1)}-${width}.png`,
        fullPage: true,
      });
    }
  }
});
