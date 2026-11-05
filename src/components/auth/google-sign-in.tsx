"use client";

import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { safeCallbackUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";

export function GoogleSignIn({ enabled, callbackUrl = "/", disabled = false }: { enabled: boolean; callbackUrl?: string; disabled?: boolean }) {
  const [pending, setPending] = useState(false);
  async function signIn() {
    setPending(true);
    try {
      const result = await authClient.signIn.social({ provider: "google", callbackURL: safeCallbackUrl(callbackUrl), errorCallbackURL: "/login?error=google" });
      if (result.error) { toast.error("Google sign-in could not be started. Please try again."); setPending(false); }
    } catch { toast.error("Google sign-in is temporarily unavailable."); setPending(false); }
  }
  return <div className="auth-social">
    <div className="auth-divider"><span>or</span></div>
    <Button type="button" variant="outline" className="w-full" disabled={!enabled || disabled || pending} onClick={signIn} aria-describedby={!enabled ? "google-unavailable" : undefined}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36ZM12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.04.97-3.38.97-2.6 0-4.8-1.76-5.59-4.12H3.06v2.59A10 10 0 0 0 12 22ZM6.41 13.93A6 6 0 0 1 6.1 12c0-.67.12-1.32.31-1.93V7.48H3.06A10 10 0 0 0 2 12c0 1.61.39 3.13 1.06 4.52l3.35-2.59ZM12 5.95c1.47 0 2.79.51 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.94 5.48l3.35 2.59C7.2 7.71 9.4 5.95 12 5.95Z" /></svg>
      {pending ? "Connecting to Google…" : "Continue with Google"}
    </Button>
    {!enabled && <p id="google-unavailable" className="auth-hint mt-2">Google sign-in is currently unavailable.</p>}
  </div>;
}
