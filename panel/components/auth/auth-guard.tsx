"use client";

import { useEffect, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  getSessionSnapshot,
  getServerSessionSnapshot,
  subscribeToSession,
} from "@/lib/api/auth";
import { FullScreenLoader } from "@/components/ui/spinner";
import { SessionProvider } from "./session-context";

/**
 * Protege todas las rutas del panel: si no hay sesión, redirige al login.
 * Al integrar la API real solo cambia la fuente de la sesión (cookie/token).
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  useEffect(() => {
    if (!session) router.replace("/login");
  }, [session, router]);

  if (!session) return <FullScreenLoader label="Cargando tu sesión…" />;

  return <SessionProvider user={session}>{children}</SessionProvider>;
}
