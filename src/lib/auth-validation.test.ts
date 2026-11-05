import { describe, expect, it } from "vitest";
import {
  passwordSchema,
  registrationSchema,
  loginSchema,
} from "./auth-validation";
import { loginUrl, safeCallbackUrl } from "./auth-redirect";

describe("membership contracts", () => {
  it("allows the assignment's six-character mixed-case password", () => {
    expect(passwordSchema.safeParse("Abcde1").success).toBe(true);
  });
  it.each(["abcde1", "ABCDE1", "Abc1", "1".repeat(6), "Aa".repeat(65)])(
    "rejects invalid registration password %s",
    (password) => {
      expect(passwordSchema.safeParse(password).success).toBe(false);
    },
  );
  it("requires a name, email and web photo URL", () => {
    const member = {
      name: "A Reader",
      email: "reader@example.com",
      image: "https://example.com/reader.jpg",
      password: "Abcde1",
    };
    expect(registrationSchema.safeParse(member).success).toBe(true);
    for (const fields of [
      { name: " " },
      { email: "invalid" },
      { image: "javascript:alert(1)" },
    ]) {
      expect(
        registrationSchema.safeParse({ ...member, ...fields }).success,
      ).toBe(false);
    }
  });
  it("does not apply new-account password rules to login", () => {
    expect(
      loginSchema.safeParse({ email: "reader@example.com", password: "old" })
        .success,
    ).toBe(true);
  });
});

describe("login destinations", () => {
  it("preserves a local path, query and fragment", () => {
    expect(safeCallbackUrl("/books/abc?view=full#details")).toBe(
      "/books/abc?view=full#details",
    );
    expect(loginUrl("/my-books")).toBe("/login?callbackUrl=%2Fmy-books");
  });
  it.each([
    undefined,
    "https://evil.invalid",
    "//evil.invalid",
    "/\\evil.invalid",
    "/%2Fevil.invalid",
    "/%255cevil.invalid",
    "/\nevil",
    "/api/auth/sign-out",
    "/login",
    "/register?callbackUrl=/login",
    "/a/../login",
  ])("rejects external or looping destination %s", (url) => {
    expect(safeCallbackUrl(url)).toBe("/");
  });
});
