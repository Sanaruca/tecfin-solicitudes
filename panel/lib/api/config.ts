/**
 * Configuración de la capa de datos del panel.
 *
 * Mientras la API Go no está completa se usan datos mock (`USE_MOCK = true`).
 * Al integrar la API solo hay que cambiar el flag y completar los `TODO(integración)`
 * de cada archivo en `lib/api/*`.
 */
export const USE_MOCK = true;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

/** Se usa hasta que la ruta correspondiente exista en la API Go. */
export function apiNoDisponible(recurso: string): never {
  throw new Error(`La API Go aún no está disponible para ${recurso}.`);
}
