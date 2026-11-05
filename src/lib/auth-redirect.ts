/** Only local app destinations may survive an authentication round trip. */
export function safeCallbackUrl(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/";
  // Reject encoded separators too; browsers and proxies can normalize them differently.
  if (/[\\\u0000-\u0020\u007f]/.test(value) || /%(?:2f|5c|0[0-9a-f]|1[0-9a-f]|7f|25)/i.test(value)) return "/";
  try {
    const url = new URL(value, "https://bookbar.invalid");
    if (url.origin !== "https://bookbar.invalid" || /^\/(?:api|login|register)(?:\/|$)/.test(url.pathname)) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function loginUrl(callbackUrl: string) {
  return `/login?callbackUrl=${encodeURIComponent(safeCallbackUrl(callbackUrl))}`;
}
