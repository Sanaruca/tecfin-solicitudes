/**
 * Cliente HTTP de la API Go + almacenamiento de la sesión en el navegador.
 *
 * Toda llamada a la API pasa por `request`, que:
 *  - arma la URL con `API_BASE_URL` y el prefijo `/api`,
 *  - adjunta el token de sesión en `Authorization: Bearer`,
 *  - convierte el `{"error": …}` de la API en una excepción con mensaje legible,
 *  - y si la API responde 401 (token vencido o inválido) cierra la sesión para
 *    que <AuthGuard> redirija al login.
 *
 * La sesión (token + usuario) se guarda en `localStorage`. Se expone la misma
 * interfaz que tenía la store mock (`getSession`, `getSessionSnapshot`,
 * `subscribeToSession`), de modo que las vistas no cambian.
 */
import { API_BASE_URL } from "@/lib/api/config";
import type { SessionUser } from "@/lib/types";

const LS_TOKEN = "panel.api.token";
const LS_SESSION = "panel.api.session";

/** Error de la API que conserva el estado HTTP (para poder reaccionar). */
export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
  /**
   * No cerrar la sesión aunque la API responde 401. Se usa en el login
   * (401 = contraseña incorrecta) y en el logout (para descartar el token
   * aunque el servidor ya no lo recuerde).
   */
  noCerrarSesion?: boolean;
}

// ---------------------------------------------------------------------------
// Sesión
// ---------------------------------------------------------------------------

const esNavegador = () => typeof window !== "undefined";

function leerClave(clave: string): string | null {
  if (!esNavegador()) return null;
  try {
    return window.localStorage.getItem(clave);
  } catch {
    return null;
  }
}

function escribirClave(clave: string, valor: string | null): void {
  if (!esNavegador()) return;
  try {
    if (valor === null) window.localStorage.removeItem(clave);
    else window.localStorage.setItem(clave, valor);
  } catch {
    // localStorage deshabilitado o sin cuota: la sesión no persiste.
  }
}

function parsearSesion(raw: string | null): SessionUser | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

// Referencia estable de la sesión (para `useSyncExternalStore`): se reutiliza
// el objeto mientras el valor guardado no cambie.
// `undefined` = todavía no se leyó; `null` = había sesión y se borró.
let ultimaLectura: string | null | undefined;
let sesionCache: SessionUser | null = null;

const oyentes = new Set<() => void>();

function emitirSesion(): void {
  oyentes.forEach((notificar) => notificar());
}

/** Token de sesión (JWT), o null si no hay sesión. */
export function getToken(): string | null {
  return leerClave(LS_TOKEN);
}

/** Guarda token + usuario de la sesión y avisa a los que la escuchan. */
export function guardarSesion(token: string, user: SessionUser): void {
  escribirClave(LS_TOKEN, token);
  escribirClave(LS_SESSION, JSON.stringify(user));
  ultimaLectura = undefined;
  emitirSesion();
}

/** Descarta el token y el usuario de la sesión. */
export function cerrarSesion(): void {
  escribirClave(LS_TOKEN, null);
  escribirClave(LS_SESSION, null);
  ultimaLectura = undefined;
  emitirSesion();
}

/** Sesión actual (síncrona, solo en el navegador). */
export function getSession(): SessionUser | null {
  return parsearSesion(leerClave(LS_SESSION));
}

/** Snapshot estable de la sesión (para `useSyncExternalStore`). */
export function getSessionSnapshot(): SessionUser | null {
  const raw = leerClave(LS_SESSION);
  if (raw !== ultimaLectura) {
    ultimaLectura = raw;
    sesionCache = parsearSesion(raw);
  }
  return sesionCache;
}

/** Server snapshot: en el servidor no hay localStorage, la sesión arranca vacía. */
export function getServerSessionSnapshot(): SessionUser | null {
  return null;
}

/** Suscripción a cambios de sesión (para `useSyncExternalStore`). */
export function subscribeToSession(callback: () => void): () => void {
  if (!esNavegador()) return () => undefined;
  oyentes.add(callback);

  // Cambios hechos desde otra pestaña/dispositivo.
  const alCambiarStorage = (evento: StorageEvent) => {
    if (evento.key === null || evento.key === LS_SESSION) callback();
  };
  window.addEventListener("storage", alCambiarStorage);

  return () => {
    oyentes.delete(callback);
    window.removeEventListener("storage", alCambiarStorage);
  };
}

// ---------------------------------------------------------------------------
// Peticiones
// ---------------------------------------------------------------------------

/**
 * Ejecuta una petición contra la API Go y devuelve la respuesta ya parseada.
 * Cualquier error (4xx/5xx, API caída) se lanza como `Error` con un mensaje
 * listo para mostrar en la UI.
 */
export async function request<T>(ruta: string, opciones: RequestOptions = {}): Promise<T> {
  const { noCerrarSesion = false, headers, ...init } = opciones;
  const token = getToken();

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_BASE_URL}/api${ruta}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new Error(
      `No se pudo conectar con la API en ${API_BASE_URL}. Revisá que esté corriendo.`,
    );
  }

  const texto = await respuesta.text();
  let datos: unknown = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = null;
    }
  }

  if (respuesta.status === 401 && !noCerrarSesion) {
    // Token vencido o usuario ya no válido: cerramos la sesión para que
    // AuthGuard lleve al login.
    cerrarSesion();
    throw new ApiError(401, "Tu sesión expiró. Iniciá sesión de nuevo.");
  }

  if (!respuesta.ok) {
    const errorApi =
      datos !== null && typeof datos === "object" && "error" in datos
        ? (datos as { error: unknown }).error
        : null;
    throw new ApiError(
      respuesta.status,
      typeof errorApi === "string" && errorApi.trim() !== ""
        ? errorApi
        : `Error ${respuesta.status} al consultar la API.`,
    );
  }

  return datos as T;
}
