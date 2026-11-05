import { beforeEach, expect, it, vi } from "vitest";
const { handler } = vi.hoisted(() => ({ handler: vi.fn() }));
vi.mock("@/lib/auth", () => ({ getAuth: () => ({ handler }) }));
import { GET, POST } from "./route";

beforeEach(() => vi.resetAllMocks());

it("redacts unexpected storage failures at the public auth boundary", async () => {
  handler.mockRejectedValue(
    new Error("private connection details must never reach the response"),
  );
  const response = await POST(
    new Request("http://localhost:3000/api/auth/sign-in/email", {
      method: "POST",
    }),
  );
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(await response.json()).toEqual({
    code: "AUTH_UNAVAILABLE",
    message: "Membership is temporarily unavailable. Please try again shortly.",
  });
});

it("preserves a handled authentication rejection", async () => {
  handler.mockResolvedValue(
    Response.json({ code: "UNAUTHORIZED" }, { status: 401 }),
  );
  const response = await GET(
    new Request("http://localhost:3000/api/auth/token"),
  );
  expect(response.status).toBe(401);
  expect(await response.json()).toEqual({ code: "UNAUTHORIZED" });
});
