"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authErrorMessage } from "@/lib/auth-errors";
import { loginSchema, type LoginValues } from "@/lib/auth-validation";
import { safeCallbackUrl } from "@/lib/auth-redirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { GoogleSignIn } from "./google-sign-in";

export function LoginForm({
  googleEnabled,
  callbackUrl,
  registered,
  googleError,
}: {
  googleEnabled: boolean;
  callbackUrl: string;
  registered: boolean;
  googleError: boolean;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  async function submit(values: LoginValues) {
    try {
      const result = await authClient.signIn.email(values);
      if (result.error) {
        const message = authErrorMessage(result.error.code);
        setError("root", { message });
        toast.error(message);
        return;
      }
      toast.success("Welcome back to BookBar.");
      router.replace(safeCallbackUrl(callbackUrl));
      router.refresh();
    } catch {
      const message = authErrorMessage();
      setError("root", { message });
      toast.error(message);
    }
  }
  return (
    <>
      {registered && (
        <p className="auth-status mb-5" role="status">
          Your account is ready. Log in with your email and password.
        </p>
      )}
      {googleError && (
        <p className="auth-error mb-5" role="alert">
          Google sign-in was not completed. Please try again or use your email.
        </p>
      )}
      <form
        className="auth-form"
        noValidate
        onSubmit={handleSubmit(submit)}
        aria-label="Log in to BookBar"
        aria-busy={isSubmitting}
      >
        <FormField
          id="email"
          label="Email address"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="current-password"
            maxLength={128}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
        </FormField>
        <button
          type="button"
          className="auth-forgot"
          onClick={() =>
            toast.info(
              "Password reset is not available. Use your existing password or your linked Google account.",
            )
          }
        >
          Forgot password?
        </button>
        {errors.root && (
          <p className="auth-error" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <GoogleSignIn
        enabled={googleEnabled}
        callbackUrl={callbackUrl}
        disabled={isSubmitting}
      />
      <p className="auth-switch">
        New to BookBar?{" "}
        <Link
          href={`/register?callbackUrl=${encodeURIComponent(safeCallbackUrl(callbackUrl))}`}
        >
          Create an account
        </Link>
      </p>
    </>
  );
}
