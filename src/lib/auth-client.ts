"use client";

import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Relative requests keep cookies and sessions on the current Next.js origin.
// API calls in P04 obtain a service token with authClient.token().
export const authClient = createAuthClient({ plugins: [jwtClient()] });
