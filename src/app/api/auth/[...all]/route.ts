import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth";

export const runtime = "nodejs";
export const { GET, POST } = toNextJsHandler(async (request: Request) => {
  try {
    return await getAuth().handler(request);
  } catch {
    return Response.json(
      {
        code: "AUTH_UNAVAILABLE",
        message:
          "Membership is temporarily unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
});
