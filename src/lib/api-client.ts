"use client";

import { authClient } from "./auth-client";

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  authenticated?: boolean;
  signal?: AbortSignal;
};

function endpoint(path: string) {
  try {
    const base = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "");
    const url = new URL(path, base);
    if (
      base.username ||
      base.password ||
      base.pathname !== "/" ||
      base.search ||
      base.hash ||
      !(
        base.protocol === "https:" ||
        (base.protocol === "http:" &&
          ["localhost", "127.0.0.1"].includes(base.hostname))
      ) ||
      !path.startsWith("/") ||
      path.startsWith("//") ||
      path.includes("\\") ||
      url.origin !== base.origin ||
      !/^\/(books|borrows)(?:\/[a-f\d]{24})?$/.test(url.pathname) ||
      url.hash
    )
      throw new Error();
    return url;
  } catch {
    throw new ApiRequestError(
      0,
      "API_CONFIGURATION",
      "The library connection is not configured correctly.",
    );
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const url = endpoint(path);
  const authenticated = options.authenticated ?? true;
  const headers = new Headers();
  if (options.body !== undefined)
    headers.set("Content-Type", "application/json");
  if (authenticated) {
    let result;
    try {
      result = await authClient.token();
    } catch {
      throw new ApiRequestError(
        503,
        "AUTH_UNAVAILABLE",
        "Sign-in verification is temporarily unavailable.",
      );
    }
    if (result.error || !result.data?.token) {
      const status = result.error?.status === 401 ? 401 : 503;
      throw new ApiRequestError(
        status,
        status === 401 ? "AUTH_REQUIRED" : "AUTH_UNAVAILABLE",
        status === 401
          ? "Log in to continue."
          : "Sign-in verification is temporarily unavailable.",
      );
    }
    headers.set("Authorization", `Bearer ${result.data.token}`);
  }
  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      credentials: "omit",
      cache: "no-store",
      signal: options.signal,
      ...(options.body === undefined
        ? {}
        : { body: JSON.stringify(options.body) }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ApiRequestError(
      0,
      "NETWORK_ERROR",
      "The library could not be reached. Please try again.",
    );
  }
  if (response.status === 401 && authenticated) {
    // Recheck the cookie-backed session, but never replay a mutation automatically.
    await authClient
      .getSession({ query: { disableCookieCache: true } })
      .catch(() => undefined);
    throw new ApiRequestError(
      401,
      "AUTH_REQUIRED",
      "Your session needs to be checked. Please log in again if needed.",
    );
  }
  const result = await response.json().catch(() => null);
  if (!response.ok || result?.success !== true || !("data" in result)) {
    throw new ApiRequestError(
      response.status,
      typeof result?.error?.code === "string" ? result.error.code : "API_ERROR",
      typeof result?.message === "string"
        ? result.message
        : "The library could not complete that request.",
    );
  }
  return result.data as T;
}
