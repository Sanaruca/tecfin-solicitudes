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
 *
 * La sesión se lee en el navegador (localStorage): en el servidor y en el
 * primer render no existe todavía, así que esperamos a estar hidratados antes
 * de decidir si redirigir. Si la API responde 401, `lib/api/client.ts` cierra
 * la sesión, el snapshot cambia y esta guardia vuelve al login.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const session = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getServerSessionSnapshot,
  );

  useEffect(() => {
    // En la hidratación React usa el snapshot del servidor (aún sin sesión),
    // así que antes de redirigir confirmamos leyendo la sesión real del
    // navegador. Si la API responde 401, `lib/api/client.ts` cierra la sesión
    // y este efecto vuelve al login.
    if ((session ?? getSessionSnapshot()) === null) router.replace("/login");
  }, [session, router]);

  if (!session) return <FullScreenLoader label="Cargando tu sesión…" />;

  return <SessionProvider user={session}>{children}</SessionProvider>;
}
