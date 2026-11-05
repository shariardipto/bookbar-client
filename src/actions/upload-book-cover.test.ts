import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { session, store } = vi.hoisted(() => ({
  session: vi.fn(),
  store: vi.fn(),
}));
vi.mock("@/lib/member-session", () => ({ getMemberSession: session }));
vi.mock("@/lib/cover-upload", () => ({ storeCover: store }));
import { uploadBookCover } from "./upload-book-cover";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("IMGBB_API_KEY", "unit-test-private-key");
});
afterEach(() => vi.unstubAllEnvs());
it("requires a server-verified session before processing uploads", async () => {
  session.mockResolvedValue(null);
  expect(await uploadBookCover(new FormData())).toMatchObject({
    success: false,
    code: "AUTH_REQUIRED",
  });
  expect(store).not.toHaveBeenCalled();
});
it("does not accept a URL in place of a file", async () => {
  session.mockResolvedValue({ user: { id: "member" } });
  const form = new FormData();
  form.set("image", "https://example.invalid/cover.png");
  expect(await uploadBookCover(form)).toMatchObject({
    success: false,
    code: "INVALID_COVER",
  });
  expect(store).not.toHaveBeenCalled();
});
it("passes only a file and the private configuration to storage", async () => {
  session.mockResolvedValue({ user: { id: "member" } });
  store.mockResolvedValue({
    success: true,
    imageUrl: "https://i.ibb.co/test/cover.png",
  });
  const form = new FormData();
  form.set("image", new File(["image"], "cover.png"));
  form.set("key", "untrusted-key");
  expect(await uploadBookCover(form)).toEqual({
    success: true,
    imageUrl: "https://i.ibb.co/test/cover.png",
  });
  expect(store).toHaveBeenCalledWith(expect.any(File), "unit-test-private-key");
});
it("fails closed without exposing session errors", async () => {
  session.mockRejectedValue(new Error("private connection information"));
  expect(await uploadBookCover(new FormData())).toEqual({
    success: false,
    code: "UPLOAD_FAILED",
    message: "Cover upload is temporarily unavailable. Please try again.",
  });
});
