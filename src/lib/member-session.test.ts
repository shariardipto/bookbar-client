import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { getSession, redirect } = vi.hoisted(() => ({
  getSession: vi.fn(),
  redirect: vi.fn((path: string) => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));
vi.mock("./auth", () => ({ getAuth: () => ({ api: { getSession } }) }));
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ cookie: "test-cookie-only" }),
}));
vi.mock("next/navigation", () => ({ redirect }));
import { requireMember } from "./member-session";

beforeEach(() => vi.clearAllMocks());

it("waits for the server session instead of redirecting during loading", async () => {
  let resolve!: (value: unknown) => void;
  getSession.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  const pending = requireMember("/my-books");
  await Promise.resolve();
  expect(redirect).not.toHaveBeenCalled();
  const session = { user: { id: "member-1", name: "Reader" } };
  resolve(session);
  expect(await pending).toBe(session);
});

it("redirects a resolved signed-out session with its intended path", async () => {
  getSession.mockResolvedValue(null);
  await expect(requireMember("/my-borrows")).rejects.toThrow(
    "REDIRECT:/login?callbackUrl=%2Fmy-borrows",
  );
  expect(getSession).toHaveBeenCalledWith({ headers: expect.any(Headers) });
});

it("fails closed on a storage error without exposing its details", async () => {
  getSession.mockRejectedValue(new Error("private connection details"));
  await expect(requireMember("/profile")).rejects.toThrow(
    "Your membership session could not be checked.",
  );
  expect(redirect).not.toHaveBeenCalled();
});
