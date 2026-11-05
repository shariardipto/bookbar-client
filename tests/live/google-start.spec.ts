import { expect, test } from "@playwright/test";

// This verifies Next's real OAuth-start contract, not Google consent/callback.
// Never record the authorization URL, state, cookies, or provider response body.
test("real Google start and simulated cancellation preserve safe login recovery", async ({
  page,
}) => {
  await page.goto("/login?callbackUrl=%2Fprofile");
  await expect(
    page.getByRole("button", { name: "Continue with Google", exact: true }),
  ).toBeEnabled();
  const response = await page.request.post("/api/auth/sign-in/social", {
    headers: { Origin: "http://localhost:3000" },
    data: {
      provider: "google",
      callbackURL: "/profile",
      errorCallbackURL: "/login?error=google&callbackUrl=%2Fprofile",
      disableRedirect: true,
    },
  });
  if (!response.ok())
    throw new Error(
      "Google sign-in start failed; check the private provider configuration.",
    );
  const result = await response.json();
  if (typeof result.url !== "string")
    throw new Error(
      "Google sign-in start did not return an authorization URL.",
    );
  const url = new URL(result.url);
  const scopes = new Set((url.searchParams.get("scope") ?? "").split(" "));
  expect(url.origin === "https://accounts.google.com").toBe(true);
  expect(
    url.searchParams.get("redirect_uri") ===
      "http://localhost:3000/api/auth/callback/google",
  ).toBe(true);
  expect(Boolean(url.searchParams.get("state"))).toBe(true);
  expect(
    scopes.size === 3 &&
      scopes.has("openid") &&
      scopes.has("email") &&
      scopes.has("profile"),
  ).toBe(true);
  expect(result.redirect === false).toBe(true);

  // Exercise Next's failure handler and consume this probe's one-time state.
  // This is a simulated provider rejection, never a successful Google login.
  const canceled = await page.request.get(
    `/api/auth/callback/google?${new URLSearchParams({ error: "access_denied", state: url.searchParams.get("state")! })}`,
    { maxRedirects: 0 },
  );
  expect(canceled.status() === 302).toBe(true);
  const destination = new URL(
    canceled.headers().location,
    "http://localhost:3000",
  );
  expect(
    destination.origin === "http://localhost:3000" &&
      destination.pathname === "/login",
  ).toBe(true);
  expect(destination.searchParams.get("callbackUrl") === "/profile").toBe(true);
  await page.goto(destination.pathname + destination.search);
  await expect(
    page
      .getByRole("alert")
      .filter({ hasText: "Google sign-in was not completed." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with Google", exact: true }),
  ).toBeEnabled();
  const session = await page.request.get("/api/auth/get-session");
  expect((await session.json()) === null).toBe(true);
});
