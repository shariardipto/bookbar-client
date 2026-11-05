import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "./auth";
import { loginUrl } from "./auth-redirect";

export const getMemberSession = cache(async () => {
  try {
    // Read the cookie-backed session for this request; do not trust client state.
    return await getAuth().api.getSession({ headers: await headers() });
  } catch {
    throw new Error("Your membership session could not be checked. Please try again shortly.");
  }
});

export async function requireMember(callbackUrl: string) {
  const session = await getMemberSession();
  if (!session) redirect(loginUrl(callbackUrl));
  return session;
}
