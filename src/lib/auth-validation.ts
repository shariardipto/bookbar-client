import { z } from "zod";

export const passwordSchema = z.string()
  .min(6, "Use at least 6 characters.")
  .max(128, "Use no more than 128 characters.")
  .regex(/[A-Z]/, "Include an uppercase letter.")
  .regex(/[a-z]/, "Include a lowercase letter.");

export const registrationSchema = z.object({
  name: z.string().trim().min(2, "Enter your name (at least 2 characters).").max(100),
  email: z.email("Enter a valid email address.").trim(),
  image: z.url("Enter a valid photo URL.").refine(
    (value) => /^https?:\/\//i.test(value), "Use an http or https photo URL.",
  ),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address.").trim(),
  password: z.string().min(1, "Enter your password.").max(128),
});

export type RegistrationValues = z.infer<typeof registrationSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
