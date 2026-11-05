import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({})); // These unit tests run in a server context.
import { getAuthDatabase } from "./database";

afterEach(async () => {
  await globalThis.bookbarAuthMongo?.client.close();
  globalThis.bookbarAuthMongo = undefined;
  vi.unstubAllEnvs();
});

describe("server-only authentication storage", () => {
  it("keeps one client across calls and module reloads without connecting", async () => {
    vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017");
    vi.stubEnv("MONGODB_DB_NAME", "bookbar");
    expect(getAuthDatabase().databaseName).toBe("bookbar");
    const client = globalThis.bookbarAuthMongo?.client;
    vi.resetModules();
    const reloaded = await import("./database");
    reloaded.getAuthDatabase();
    expect(globalThis.bookbarAuthMongo?.client).toBe(client);
  });

  it("requires private configuration instead of using fake credentials", () => {
    vi.stubEnv("MONGODB_URI", "");
    expect(() => getAuthDatabase()).toThrow("Set MONGODB_URI privately");
    vi.stubEnv("MONGODB_URI", "mongodb://127.0.0.1:27017");
    vi.stubEnv("MONGODB_DB_NAME", "invalid/name");
    expect(() => getAuthDatabase()).toThrow("Invalid MONGODB_DB_NAME");
  });
});
