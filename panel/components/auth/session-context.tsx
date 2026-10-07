"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SessionUser } from "@/lib/types";

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: ReactNode;
}) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

/** Devuelve el usuario de la sesión actual (dentro de <AuthGuard>). */
export function useSession(): SessionUser {
  const user = useContext(SessionContext);
  if (!user) {
    throw new Error("useSession debe usarse dentro de <AuthGuard>");
  }
  return user;
}
