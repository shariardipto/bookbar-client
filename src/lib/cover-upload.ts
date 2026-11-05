import "server-only";
export const MAX_COVER_BYTES = 5 * 1024 * 1024;
export type CoverUploadResult =
  | { success: true; imageUrl: string }
  | { success: false; code: string; message: string };
const failure = (code: string, message: string): CoverUploadResult => ({
  success: false,
  code,
  message,
});

export async function storeCover(
  file: File,
  key: string | undefined,
): Promise<CoverUploadResult> {
  if (!file.size || file.size > MAX_COVER_BYTES)
    return failure("INVALID_COVER", "Choose an image smaller than 5 MB.");
  const extensions: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  const extension = extensions[file.type];
  if (!extension)
    return failure("INVALID_COVER", "Choose a PNG, JPEG, WebP or GIF image.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  const signature =
    file.type === "image/png"
      ? bytes.slice(0, 8).join(",") === "137,80,78,71,13,10,26,10"
      : file.type === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : file.type === "image/webp"
          ? text(0, 4) === "RIFF" && text(8, 12) === "WEBP"
          : ["GIF87a", "GIF89a"].includes(text(0, 6));
  if (!signature)
    return failure(
      "INVALID_COVER",
      "This file does not match its image format. Choose another image.",
    );
  if (!key?.trim() || /your[-_ ]|replace|placeholder/i.test(key))
    return failure(
      "UPLOAD_NOT_CONFIGURED",
      "Cover uploads are temporarily unavailable.",
    );
  try {
    const body = new FormData();
    body.append("key", key.trim());
    body.append(
      "image",
      new Blob([bytes], { type: file.type }),
      `bookbar-cover.${extension}`,
    );
    const response = await fetch("https://api.imgbb.com/1/upload", {
      method: "POST",
      body,
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    const result = await response.json();
    if (
      !response.ok ||
      result?.success !== true ||
      typeof result?.data?.url !== "string"
    )
      return failure(
        "UPLOAD_FAILED",
        "The cover could not be uploaded. Please try again.",
      );
    const url = new URL(result.data.url);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "i.ibb.co" ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      return failure(
        "UPLOAD_FAILED",
        "The image host returned an invalid cover link.",
      );
    return { success: true, imageUrl: url.href };
  } catch {
    return failure(
      "UPLOAD_FAILED",
      "The cover could not be uploaded. Please try again.",
    );
  }
}
