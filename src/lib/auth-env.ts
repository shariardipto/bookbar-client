import "server-only";
import { z } from "zod";

function providerValue(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return !normalized ||
    /^(?:your(?:[-_ ]|$)|replace(?:[-_ ]|$)|placeholder|example)/i.test(
      normalized,
    )
    ? undefined
    : normalized;
}

const authEnvironment = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url().refine((value) => {
    const url = new URL(value);
    return (
      !url.username &&
      !url.password &&
      url.pathname === "/" &&
      !url.search &&
      !url.hash &&
      (url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(url.hostname)))
    );
  }),
  GOOGLE_CLIENT_ID: z.preprocess(providerValue, z.string().optional()),
  GOOGLE_CLIENT_SECRET: z.preprocess(providerValue, z.string().optional()),
});

export function getAuthEnvironment(
  env: Record<string, string | undefined> = process.env,
) {
  const parsed = authEnvironment.safeParse(env);
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((issue) => issue.path[0])),
    ];
    throw new Error(
      `Invalid private auth configuration: ${fields.join(", ")}.`,
    );
  }
  const { GOOGLE_CLIENT_ID: id, GOOGLE_CLIENT_SECRET: secret } = parsed.data;
  if (Boolean(id?.trim()) !== Boolean(secret?.trim())) {
    throw new Error(
      "Set both GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET privately.",
    );
  }
  return {
    ...parsed.data,
    BETTER_AUTH_URL: new URL(parsed.data.BETTER_AUTH_URL).origin,
  };
}

export function isGoogleConfigured() {
  return Boolean(
    providerValue(process.env.GOOGLE_CLIENT_ID) &&
    providerValue(process.env.GOOGLE_CLIENT_SECRET),
  );
}
