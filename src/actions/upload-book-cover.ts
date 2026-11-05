"use server";
import { getMemberSession } from "@/lib/member-session";
import { storeCover, type CoverUploadResult } from "@/lib/cover-upload";

export async function uploadBookCover(
  formData: FormData,
): Promise<CoverUploadResult> {
  try {
    const member = await getMemberSession();
    if (!member)
      return {
        success: false,
        code: "AUTH_REQUIRED",
        message: "Log in before uploading a cover.",
      };
    const image = formData.get("image");
    if (!(image instanceof File))
      return {
        success: false,
        code: "INVALID_COVER",
        message: "Choose a cover image first.",
      };
    return await storeCover(image, process.env.IMGBB_API_KEY);
  } catch {
    return {
      success: false,
      code: "UPLOAD_FAILED",
      message: "Cover upload is temporarily unavailable. Please try again.",
    };
  }
}
