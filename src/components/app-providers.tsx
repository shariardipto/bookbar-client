"use client";

import { Toaster } from "sonner";
import { SessionProvider } from "@/components/auth/session-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}<Toaster position="top-right" richColors closeButton /></SessionProvider>;
}
