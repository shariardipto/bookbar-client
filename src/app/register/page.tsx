import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { RegistrationForm } from "@/components/auth/registration-form";
import { isGoogleConfigured } from "@/lib/auth-env";
import { safeCallbackUrl } from "@/lib/auth-redirect";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell mode="register">
      <RegistrationForm
        googleEnabled={isGoogleConfigured()}
        callbackUrl={safeCallbackUrl(params.callbackUrl)}
      />
    </AuthShell>
  );
}
