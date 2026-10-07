/**
 * Autenticación y sesión.
 *
 * Con la API Go:
 *   POST /auth/login   -> { token, user }
 *   POST /auth/logout  -> 204 (la sesión es stateless: el cliente descarta el token)
 *   GET  /auth/me      -> usuario de la sesión actual (lo resuelve el middleware
 *                         de la API en cada petición)
 *
 * El token se guarda en el navegador y viaja en `Authorization: Bearer`
 * (`lib/api/client.ts`): si la API responde 401, la sesión se cierra y
 * <AuthGuard> vuelve al login.
 */
import { mockDB } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { cerrarSesion, getSession, guardarSesion, request } from "@/lib/api/client";
import type { LoginInput, LoginResponse } from "@/lib/types";

export {
  getSession,
  getSessionSnapshot,
  getServerSessionSnapshot,
  subscribeToSession,
} from "@/lib/api/client";

export async function login(input: LoginInput): Promise<LoginResponse> {
  if (USE_MOCK) return mockDB.auth.login(input);

  // 401 acá significa "credenciales incorrectas": no hay que tocar la sesión.
  const res = await request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
    noCerrarSesion: true,
  });
  guardarSesion(res.token, res.user);
  return res;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return mockDB.auth.logout();

  try {
    await request<void>("/auth/logout", { method: "POST", noCerrarSesion: true });
  } catch {
    // La sesión es stateless: aunque falle la llamada, el token se descarta igual.
  } finally {
    cerrarSesion();
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}
