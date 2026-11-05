import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
import { getAuthEnvironment } from "./auth-env";
import { getAuth } from "./auth";
import type { BetterAuthOptions } from "better-auth";

beforeAll(() => {
  vi.stubEnv(
    "BETTER_AUTH_SECRET",
    "unit-test-only-secret-at-least-32-characters",
  );
  vi.stubEnv("BETTER_AUTH_URL", "http://localhost:3000");
  vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017");
  vi.stubEnv("GOOGLE_CLIENT_ID", "");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "");
  // All unit requests share one synthetic IP; production rate limiting stays enabled.
  (getAuth().options as BetterAuthOptions).rateLimit = { enabled: false };
});
afterAll(async () => {
  await globalThis.bookbarAuthMongo?.client.close();
  globalThis.bookbarAuthMongo = undefined;
  vi.unstubAllEnvs();
});

describe("Better Auth server contract (no database connection)", () => {
  it.each(["abcde1", "ABCDE1", "Abc1"])(
    "rejects a direct signup with %s before persistence",
    async (password) => {
      const response = await getAuth().handler(
        new Request("http://localhost:3000/api/auth/sign-up/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: JSON.stringify({
            name: "Reader",
            email: "reader@example.com",
            image: "https://example.com/photo.jpg",
            password,
          }),
        }),
      );
      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({
        code: "INVALID_REGISTRATION",
      });
    },
  );
  it("uses the required signup settings and API JWT claims", () => {
    const options = getAuth().options;
    expect(options.emailAndPassword).toMatchObject({
      minPasswordLength: 6,
      autoSignIn: false,
      requireEmailVerification: false,
    });
    expect(options.socialProviders).toEqual({});
    expect(
      options.plugins?.find((plugin) => plugin.id === "jwt"),
    ).toBeDefined();
  });
  it("resolves a signed-out session and rejects token requests without a database", async () => {
    const auth = getAuth();
    expect(await auth.api.getSession({ headers: new Headers() })).toBeNull();
    const response = await auth.handler(
      new Request("http://localhost:3000/api/auth/token"),
    );
    expect(response.status).toBe(401);
  });
  it("rejects external origins before starting signup", async () => {
    const response = await getAuth().handler(
      new Request("http://localhost:3000/api/auth/sign-up/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "https://evil.invalid",
        },
        body: JSON.stringify({
          name: "Reader",
          email: "reader@example.com",
          image: "https://example.com/photo.jpg",
          password: "Abcde1",
        }),
      }),
    );
    expect(response.status).toBe(403);
  });
});

it("reports invalid private field names without their values", () => {
  const secret = "private-value";
  expect(() =>
    getAuthEnvironment({
      BETTER_AUTH_SECRET: secret,
      BETTER_AUTH_URL: "https://bad.invalid/path",
    }),
  ).toThrow("BETTER_AUTH_SECRET, BETTER_AUTH_URL");
  try {
    getAuthEnvironment({ BETTER_AUTH_SECRET: secret });
  } catch (error) {
    expect(String(error)).not.toContain(secret);
  }
});
