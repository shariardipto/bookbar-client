import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { token, getSession } = vi.hoisted(() => ({
  token: vi.fn(),
  getSession: vi.fn(),
}));
vi.mock("./auth-client", () => ({ authClient: { token, getSession } }));
import { apiRequest } from "./api-client";
const fetchMock = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_API_BASE_URL", "https://api.bookbar.example");
  vi.stubGlobal("fetch", fetchMock);
  token.mockResolvedValue({ data: { token: "unit.test.token" } });
  getSession.mockResolvedValue({ data: null });
  fetchMock.mockResolvedValue(
    Response.json({ success: true, data: { saved: true } }),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("obtains a service JWT, sends it only as bearer auth, and unwraps the API envelope", async () => {
  expect(
    await apiRequest("/books", { method: "POST", body: { title: "A Book" } }),
  ).toEqual({ saved: true });
  const [url, options] = fetchMock.mock.calls[0]!;
  expect(url.href).toBe("https://api.bookbar.example/books");
  expect(options.headers.get("Authorization")).toBe("Bearer unit.test.token");
  expect(options.credentials).toBe("omit");
  expect(options.cache).toBe("no-store");
  expect(JSON.parse(options.body)).toEqual({ title: "A Book" });
});
it("makes a public request without fetching or sending a token", async () => {
  await apiRequest("/books?sort=latest&limit=6", { authenticated: false });
  expect(token).not.toHaveBeenCalled();
  expect(fetchMock.mock.calls[0]![1].headers.has("Authorization")).toBe(false);
});
it.each([
  "https://evil.invalid/books",
  "//evil.invalid/books",
  "/\\evil.invalid/books",
  "/api/auth/token",
  "/books#fragment",
])("does not send credentials to unsafe destination %s", async (path) => {
  await expect(apiRequest(path)).rejects.toMatchObject({
    code: "API_CONFIGURATION",
  });
  expect(token).not.toHaveBeenCalled();
  expect(fetchMock).not.toHaveBeenCalled();
});
it("does not make an API request when the auth token is unavailable", async () => {
  token.mockResolvedValue({ error: { status: 401 } });
  await expect(apiRequest("/books")).rejects.toMatchObject({
    status: 401,
    code: "AUTH_REQUIRED",
  });
  expect(fetchMock).not.toHaveBeenCalled();
});
it("rechecks the session after a 401 without replaying a mutation", async () => {
  fetchMock.mockResolvedValue(
    Response.json({ success: false }, { status: 401 }),
  );
  await expect(
    apiRequest("/books", { method: "POST", body: {} }),
  ).rejects.toMatchObject({ status: 401 });
  expect(getSession).toHaveBeenCalledWith({
    query: { disableCookieCache: true },
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);
});
it("preserves a structured inventory conflict", async () => {
  fetchMock.mockResolvedValue(
    Response.json(
      {
        success: false,
        message: "Return all borrowed copies first.",
        error: { code: "ACTIVE_BORROWS" },
      },
      { status: 409 },
    ),
  );
  await expect(apiRequest("/books")).rejects.toMatchObject({
    status: 409,
    code: "ACTIVE_BORROWS",
    message: "Return all borrowed copies first.",
  });
});
it("reports network failure without exposing the raw exception", async () => {
  fetchMock.mockRejectedValue(new Error("private error details"));
  await expect(apiRequest("/books")).rejects.toMatchObject({
    code: "NETWORK_ERROR",
    message: "The library could not be reached. Please try again.",
  });
});
