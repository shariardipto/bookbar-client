import "server-only";
import { betterAuth } from "better-auth/minimal";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { createAuthMiddleware, APIError } from "better-auth/api";
import { jwt } from "better-auth/plugins";
import { getAuthDatabase, getAuthMongoClient } from "./database";
import { getAuthEnvironment } from "./auth-env";
import { registrationSchema } from "./auth-validation";

function createAuth() {
  const env = getAuthEnvironment();
  return betterAuth({
    appName: "BookBar",
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    database: mongodbAdapter(getAuthDatabase(), { client: getAuthMongoClient() }),
    trustedOrigins: [env.BETTER_AUTH_URL],
    advanced: { disableOriginCheck: false, disableCSRFCheck: false },
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 6,
      maxPasswordLength: 128,
      autoSignIn: false,
      requireEmailVerification: false,
    },
    socialProviders: env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET ? {
      google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET },
    } : {},
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;
        const result = registrationSchema.safeParse(ctx.body);
        if (!result.success) throw new APIError("BAD_REQUEST", {
          code: "INVALID_REGISTRATION",
          message: result.error.issues[0]?.message ?? "Check your membership details.",
        });
        return { context: { body: { ...ctx.body, ...result.data } } };
      }),
    },
    plugins: [jwt({
      // These values must match Express's P04 verifier configuration.
      jwt: {
        issuer: env.BETTER_AUTH_URL,
        audience: env.BETTER_AUTH_URL,
        expirationTime: "15m",
        definePayload: ({ user }) => ({ email: user.email, name: user.name }),
      },
      disableSettingJwtHeader: true,
    })],
    // Raw driver/provider errors can contain private connection details.
    logger: { disabled: true },
    disabledPaths: ["/request-password-reset", "/reset-password", "/send-verification-email", "/verify-email"],
  });
}

let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  return instance ??= createAuth();
}
export type AuthSession = ReturnType<typeof getAuth>["$Infer"]["Session"];
