import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { MAX_COVER_BYTES, storeCover } from "./cover-upload";
const png = () =>
  new File(
    [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0])],
    "image.png",
    { type: "image/png" },
  );
afterEach(() => vi.unstubAllGlobals());
it("keeps the key in a POST body and returns only a public cover URL", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValue(
      Response.json({
        success: true,
        data: {
          url: "https://i.ibb.co/test/cover.png",
          delete_url: "private-deletion-url",
        },
      }),
    );
  vi.stubGlobal("fetch", fetcher);
  expect(await storeCover(png(), "unit-test-key")).toEqual({
    success: true,
    imageUrl: "https://i.ibb.co/test/cover.png",
  });
  const [url, options] = fetcher.mock.calls[0];
  expect(url).toBe("https://api.imgbb.com/1/upload");
  expect(options.method).toBe("POST");
  expect(options.body.get("key")).toBe("unit-test-key");
  expect(options.body.get("image")).toBeInstanceOf(File);
});
it("rejects absent, oversized and disguised files before calling the provider", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  for (const file of [
    new File([], "empty.png", { type: "image/png" }),
    new File([new Uint8Array(MAX_COVER_BYTES + 1)], "large.png", {
      type: "image/png",
    }),
    new File(["<svg/>"], "cover.svg", { type: "image/svg+xml" }),
    new File(["not an image"], "fake.png", { type: "image/png" }),
  ]) {
    expect(await storeCover(file, "unit-test-key")).toMatchObject({
      success: false,
      code: "INVALID_COVER",
    });
  }
  expect(fetcher).not.toHaveBeenCalled();
});
it("fails safely when upload configuration is absent", async () => {
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  expect(await storeCover(png(), undefined)).toMatchObject({
    success: false,
    code: "UPLOAD_NOT_CONFIGURED",
  });
  expect(fetcher).not.toHaveBeenCalled();
});
it.each([
  "https://evil.invalid/image.png",
  "http://i.ibb.co/image.png",
  "https://i.ibb.co/image.png?secret=private",
  "https://user:password@i.ibb.co/image.png",
])("rejects unsafe provider URL %s", async (url) => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(Response.json({ success: true, data: { url } })),
  );
  expect(await storeCover(png(), "unit-test-key")).toMatchObject({
    success: false,
    code: "UPLOAD_FAILED",
  });
});
it("does not expose provider errors or transport details", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(
      Response.json(
        { error: { message: "private-provider-detail" } },
        { status: 400 },
      ),
    )
    .mockRejectedValueOnce(new Error("private-key-in-network-error"));
  vi.stubGlobal("fetch", fetcher);
  for (let i = 0; i < 2; i++)
    expect(await storeCover(png(), "unit-test-key")).toEqual({
      success: false,
      code: "UPLOAD_FAILED",
      message: "The cover could not be uploaded. Please try again.",
    });
});
