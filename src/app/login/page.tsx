import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleConfigured } from "@/lib/auth-env";
import { safeCallbackUrl } from "@/lib/auth-redirect";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string | string[]; registered?: string; error?: string }> }) {
  const params = await searchParams;
  return <AuthShell mode="login"><LoginForm googleEnabled={isGoogleConfigured()} callbackUrl={safeCallbackUrl(params.callbackUrl)} registered={params.registered === "1"} googleError={params.error === "google"} /></AuthShell>;
}
