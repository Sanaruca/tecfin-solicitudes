/**
 * Autenticación y sesión.
 *
 * TODO(integración API): al habilitar `USE_MOCK = false`:
 *   POST /auth/login   -> { token, user }  (guardar token en cookie HttpOnly)
 *   POST /auth/logout
 *   GET  /auth/me      -> usuario de la sesión actual
 */
import { mockDB } from "@/lib/mock/store";
import { apiNoDisponible, USE_MOCK } from "@/lib/api/config";
import type { LoginInput, LoginResponse, SessionUser } from "@/lib/types";

export async function login(input: LoginInput): Promise<LoginResponse> {
  if (USE_MOCK) return mockDB.auth.login(input);
  return apiNoDisponible("POST /auth/login");
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return mockDB.auth.logout();
  return apiNoDisponible("POST /auth/logout");
}

/** Sesión actual (síncrona, solo en el navegador). */
export function getSession(): SessionUser | null {
  if (USE_MOCK) return mockDB.auth.getSession();
  return null;
}

/** Snapshot estable de la sesión (para `useSyncExternalStore`). */
export function getSessionSnapshot(): SessionUser | null {
  if (USE_MOCK) return mockDB.auth.getSessionSnapshot();
  return null;
}

/** Server snapshot: en el servidor nunca hay sesión en el cliente. */
export function getServerSessionSnapshot(): SessionUser | null {
  return null;
}

/** Suscripción a cambios de sesión (para `useSyncExternalStore`). */
export function subscribeToSession(callback: () => void): () => void {
  if (USE_MOCK) return mockDB.auth.subscribe(callback);
  return () => undefined;
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
