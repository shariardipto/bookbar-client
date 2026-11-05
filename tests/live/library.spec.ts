import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import { parseEnv } from "node:util";
import { MongoClient, ObjectId } from "mongodb";

const serverEnv = parseEnv(
  readFileSync(
    new URL("../../../bookbar-server/.env", import.meta.url),
    "utf8",
  ),
);
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
async function accessible(page: Page) {
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  check(
    !result.violations.length,
    `P06 accessibility: ${JSON.stringify(result.violations.map(({ id, nodes }) => ({ id, selectors: nodes.map((node) => node.target) })))}`,
  );
}

test("real upload, book management, borrowing, return and persisted private session", async ({
  page,
}) => {
  const run = randomUUID(),
    email = `p06-${run}@example.invalid`,
    password = `Aa${randomBytes(10).toString("hex")}`;
  const authClient = new MongoClient(process.env.MONGODB_URI ?? "", {
    serverSelectionTimeoutMS: 10_000,
  });
  const dataClient = new MongoClient(serverEnv.MONGODB_URI ?? "", {
    serverSelectionTimeoutMS: 10_000,
  });
  const authDb = authClient.db(process.env.MONGODB_DB_NAME),
    db = dataClient.db(serverEnv.MONGODB_DB_NAME);
  const description = `Temporary P06 acceptance probe ${run}`;
  let memberId = "",
    stage = "database connection";
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.name));
  try {
    try {
      await Promise.all([authClient.connect(), dataClient.connect()]);
    } catch {
      throw new Error(
        "P06 live database connection failed; inspect private Atlas/network settings.",
      );
    }
    stage = "real browser registration and redirect-back login";
    await page.goto("/add-book");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadd-book$/);
    await page.goto("/register?callbackUrl=%2Fadd-book");
    await page.getByLabel("Your name").fill("P06 Reader");
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page
      .getByLabel("Photo URL", { exact: true })
      .fill("https://example.invalid/avatar.png");
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Create account", exact: true })
      .click();
    await expect(page).toHaveURL(
      /\/login\?callbackUrl=%2Fadd-book&registered=1$/,
    );
    await page.getByLabel("Email address", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page
      .getByRole("button", { name: "Log in", exact: true })
      .last()
      .click();
    await expect(page).toHaveURL("/add-book");
    const member = await authDb.collection("user").findOne({ email });
    check(member, "Probe member was not saved");
    memberId = member._id.toString();
    await page.reload();
    await expect(page).toHaveURL("/add-book");
    await expect(page.getByLabel("Added by", { exact: true })).toHaveValue(
      "P06 Reader",
    );

    stage = "form validation and responsive Add Book";
    await mkdir(".cache/p06", { recursive: true });
    await page.getByRole("button", { name: "Add book", exact: true }).click();
    await expect(
      page.getByText("Enter the book title.", { exact: true }),
    ).toBeVisible();
    for (const width of [360, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth + 1,
        ),
      ).toBe(true);
      if (width !== 768)
        await page.screenshot({
          path: `.cache/p06/add-book-${width}.png`,
          fullPage: true,
          mask: [page.getByLabel("Your email", { exact: true })],
        });
    }
    await accessible(page);
    await page
      .getByLabel("Book title", { exact: true })
      .fill("A P06 Reading Journey");
    await page.getByLabel("Author", { exact: true }).fill("P06 Writer");
    await page.getByLabel("Category", { exact: true }).selectOption("Fiction");
    await page.getByLabel("Total copies", { exact: true }).fill("2");
    await page.getByLabel("About this book", { exact: true }).fill(description);
    // A synthetic 1px PNG is the only asset sent to the real image provider.
    await page.getByLabel("Cover image", { exact: true }).setInputFiles({
      name: "bookbar-test-cover.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJWQAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    stage = "real authenticated imgbb upload";
    await expect(
      page.getByText("Your cover is ready.", { exact: true }),
    ).toBeVisible({ timeout: 35_000 });
    await page.getByRole("button", { name: "Add book", exact: true }).click();
    await expect(page).toHaveURL(/\/books\/[a-f\d]{24}$/);
    const bookId = page.url().split("/").at(-1)!;
    await expect(
      page.getByRole("heading", { name: "A P06 Reading Journey", exact: true }),
    ).toBeVisible();
    const saved = await db
      .collection("books")
      .findOne({ _id: new ObjectId(bookId) });
    check(
      saved?.description === description && saved.addedByUserId === memberId,
      "Real book creation was not persisted",
    );
    check(
      new URL(saved.imageUrl).hostname === "i.ibb.co",
      "The real uploaded image URL was not saved",
    );
    await expect(
      page.getByText("2 of 2 copies available", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("button", { name: "Borrow this book", exact: true }),
    ).toBeEnabled();

    stage = "real borrow modal and inventory refresh";
    await page
      .getByRole("button", { name: "Borrow this book", exact: true })
      .click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel("Your email", { exact: true })).toHaveValue(
      email,
    );
    await accessible(page);
    await page.keyboard.press("Escape");
    await page.screenshot({
      path: ".cache/p06/book-details.png",
      mask: [page.locator(".book-owner-details")],
    });
    await expect(
      page.getByRole("button", { name: "Borrow this book", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Borrow this book", exact: true })
      .click();
    await dialog
      .getByRole("button", { name: "Confirm borrow", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText("1 of 2 copies available", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "Already on your reading shelf",
        exact: true,
      }),
    ).toBeDisabled();
    const loan = await db
      .collection("borrows")
      .findOne({ bookId: new ObjectId(bookId), userId: memberId });
    check(
      loan &&
        loan.returnDate.getTime() - loan.borrowDate.getTime() === 7 * 86400000,
      "Seven-day borrow was not persisted",
    );

    stage = "prefilled edit, active-loan delete conflict and cache refresh";
    await page
      .getByRole("link", { name: "Manage your book", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Edit A P06 Reading Journey", exact: true })
      .click();
    await expect(dialog.getByLabel("Book title", { exact: true })).toHaveValue(
      "A P06 Reading Journey",
    );
    await expect(
      dialog.getByLabel("About this book", { exact: true }),
    ).toHaveValue(description);
    stage = "mobile edit layout";
    await page.setViewportSize({ width: 360, height: 900 });
    await page.screenshot({
      path: ".cache/p06/edit-dialog-mobile.png",
      mask: [dialog.getByLabel("Your email", { exact: true })],
    });
    const mobile = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }));
    check(
      mobile.content <= mobile.viewport + 1,
      `P06 layout: ${JSON.stringify(mobile)}`,
    );
    stage = "mobile edit accessibility";
    await accessible(page);
    await page.setViewportSize({ width: 1440, height: 1000 });
    stage = "edit save and active-loan delete conflict";
    await dialog
      .getByLabel("Book title", { exact: true })
      .fill("A P06 Journey, Revised");
    await dialog.getByLabel("Total copies", { exact: true }).fill("3");
    await dialog
      .getByRole("button", { name: "Save changes", exact: true })
      .click();
    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "A P06 Journey, Revised",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("2 of 3 copies available", { exact: true }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: "Delete A P06 Journey, Revised",
        exact: true,
      })
      .click();
    const confirmation = page.getByRole("alertdialog");
    await accessible(page);
    await confirmation
      .getByRole("button", { name: "Delete book", exact: true })
      .click();
    await expect(confirmation.getByRole("alert")).toBeVisible();
    check(
      (await db
        .collection("books")
        .countDocuments({ _id: new ObjectId(bookId) })) === 1,
      "Active book unexpectedly deleted",
    );
    await confirmation
      .getByRole("button", { name: "Cancel", exact: true })
      .click();

    stage = "real borrowed-books table and return";
    await page.goto("/my-borrows");
    await expect(page.getByRole("table")).toBeVisible();
    await expect(page.locator("tbody tr")).toHaveCount(1);
    await expect(page.locator("time")).toHaveCount(2);
    await page.setViewportSize({ width: 360, height: 900 });
    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth + 1,
      ),
    ).toBe(true);
    await accessible(page);
    await page
      .getByRole("button", {
        name: "Return A P06 Reading Journey",
        exact: true,
      })
      .click();
    await page.screenshot({ path: ".cache/p06/return-dialog-mobile.png" });
    await confirmation
      .getByRole("button", { name: "Return book", exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "An open shelf. Endless possibilities.",
        exact: true,
      }),
    ).toBeVisible();
    check(
      (await db
        .collection("borrows")
        .countDocuments({ bookId: new ObjectId(bookId) })) === 0,
      "Return did not remove active loan",
    );
    check(
      (await db.collection("books").findOne({ _id: new ObjectId(bookId) }))
        ?.copies === 3,
      "Return did not restore available copies",
    );
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`/books/${bookId}`);
    await expect(
      page.getByText("3 of 3 copies available", { exact: true }),
    ).toBeVisible();

    stage = "Mongo latest-six and desktop catalog";
    const jwtResponse = await page.request.get("/api/auth/token");
    check(jwtResponse.ok(), "Could not obtain a member JWT");
    const jwt = await jwtResponse.json();
    for (let i = 0; i < 6; i++) {
      const response = await page.request.post("http://localhost:5000/books", {
        headers: { Authorization: `Bearer ${jwt.token}` },
        data: {
          title: `P06 Shelf ${i}`,
          author: "P06 Writer",
          category: "Science",
          imageUrl: "http://localhost:3000/covers/time-machine.svg",
          totalCopies: 2,
          description,
        },
      });
      check(response.ok(), "Could not create synthetic latest-six probe books");
    }
    const expected = await db
      .collection("books")
      .find()
      .sort({ createdAt: -1, _id: -1 })
      .limit(6)
      .toArray();
    await page.goto("/");
    await expect(page.locator("[data-book-card]")).toHaveCount(6);
    expect(
      await page
        .locator("[data-book-card]")
        .evaluateAll((cards) =>
          cards.map((card) => card.getAttribute("data-book-id")),
        ),
    ).toEqual(expected.map((book) => book._id.toString()));
    await page.goto("/books");
    await expect(page.locator("[data-book-card]").first()).toBeVisible();
    expect(
      await page
        .locator("[data-book-grid]")
        .evaluate(
          (grid) =>
            getComputedStyle(grid).gridTemplateColumns.split(" ").length,
        ),
    ).toBe(3);
    await mkdir(".cache/p06", { recursive: true });
    await page.screenshot({
      path: ".cache/p06/live-catalog-desktop.png",
      fullPage: true,
    });

    stage = "delete after return and live cache invalidation";
    await page.goto("/my-books");
    await page
      .getByRole("button", {
        name: "Delete A P06 Journey, Revised",
        exact: true,
      })
      .click();
    await confirmation
      .getByRole("button", { name: "Delete book", exact: true })
      .click();
    await expect(confirmation).not.toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "A P06 Journey, Revised",
        exact: true,
      }),
    ).toHaveCount(0);
    check(
      (await db
        .collection("books")
        .countDocuments({ _id: new ObjectId(bookId) })) === 0,
      "Delete was not persisted",
    );
    expect(errors).toEqual([]);
  } catch (error) {
    // Stage labels remain safe; never append raw provider/Mongo/auth responses.
    if (
      error instanceof Error &&
      /^P06 (live database|accessibility|layout)/.test(error.message)
    )
      throw error;
    throw new Error(
      `P06 live workflow failed during: ${stage}. ${error instanceof Error && error.name === "TimeoutError" ? "UI timed out." : "Acceptance assertion failed."}`,
    );
  } finally {
    try {
      const member = await authDb.collection("user").findOne({ email });
      const ids = [memberId, member?._id.toString()].filter(Boolean);
      const books = await db
        .collection("books")
        .find({ description, addedByUserId: { $in: ids } })
        .toArray();
      await db.collection("borrows").deleteMany({
        bookId: { $in: books.map((book) => book._id) },
        userId: { $in: ids },
      });
      await db
        .collection("books")
        .deleteMany({ description, addedByUserId: { $in: ids } });
      await authDb.collection("session").deleteMany({ userId: { $in: ids } });
      await authDb.collection("account").deleteMany({ userId: { $in: ids } });
      await authDb
        .collection("user")
        .deleteMany({ email, _id: { $in: ids.map((id) => new ObjectId(id)) } });
      check(
        (await db.collection("books").countDocuments({ description })) === 0 &&
          (await authDb.collection("user").countDocuments({ email })) === 0,
        "P06 probe cleanup needs attention",
      );
    } catch {
      throw new Error(
        "P06 probe cleanup could not be verified; inspect only this run's synthetic records privately.",
      );
    } finally {
      await Promise.all([authClient.close(), dataClient.close()]);
    }
  }
});
