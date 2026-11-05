"use client";

import { createContext, useContext } from "react";
import { authClient } from "@/lib/auth-client";

type SessionState = ReturnType<typeof authClient.useSession>;
const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const session = authClient.useSession();
  return <SessionContext value={session}>{children}</SessionContext>;
}

export function useMemberSession() {
  const session = useContext(SessionContext);
  if (!session) throw new Error("Use member session within SessionProvider.");
  return session;
}
