"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import {
  registrationSchema,
  type RegistrationValues,
} from "@/lib/auth-validation";
import { loginUrl } from "@/lib/auth-redirect";
import { authErrorMessage } from "@/lib/auth-errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-field";
import { PasswordInput } from "./password-input";
import { GoogleSignIn } from "./google-sign-in";

export function RegistrationForm({
  googleEnabled,
  callbackUrl,
}: {
  googleEnabled: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
  });
  async function submit(values: RegistrationValues) {
    try {
      const result = await authClient.signUp.email(values);
      if (result.error) {
        const message = authErrorMessage(result.error.code);
        setError("root", { message });
        toast.error(message);
        return;
      }
      toast.success("Your account is ready. Log in to begin.");
      router.replace(`${loginUrl(callbackUrl)}&registered=1`);
    } catch {
      const message = authErrorMessage();
      setError("root", { message });
      toast.error(message);
    }
  }
  return (
    <>
      <form
        className="auth-form"
        noValidate
        onSubmit={handleSubmit(submit)}
        aria-label="Create your BookBar account"
        aria-busy={isSubmitting}
      >
        <FormField id="name" label="Your name" error={errors.name?.message}>
          <Input
            id="name"
            autoComplete="name"
            maxLength={100}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
        </FormField>
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
          id="image"
          label="Photo URL"
          hint="A public http or https link to your profile photo."
          error={errors.image?.message}
        >
          <Input
            id="image"
            type="url"
            autoComplete="photo"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.image)}
            aria-describedby={`image-hint${errors.image ? " image-error" : ""}`}
            {...register("image")}
          />
        </FormField>
        <FormField
          id="password"
          label="Password"
          hint="At least 6 characters, with an uppercase and a lowercase letter."
          error={errors.password?.message}
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            maxLength={128}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={`password-hint${errors.password ? " password-error" : ""}`}
            {...register("password")}
          />
        </FormField>
        {errors.root && (
          <p className="auth-error" role="alert">
            {errors.root.message}
          </p>
        )}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating your account…" : "Create account"}
        </Button>
      </form>
      <GoogleSignIn enabled={googleEnabled} disabled={isSubmitting} />
      <p className="auth-switch">
        Already a member? <Link href={loginUrl(callbackUrl)}>Log in</Link>
      </p>
    </>
  );
}
