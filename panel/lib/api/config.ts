/**
 * Configuración de la capa de datos del panel.
 *
 * `USE_MOCK = false`: la UI consume la API Go (ver `lib/api/client.ts`).
 * Si querés volver a los datos mock (sin backend), poné el flag en `true`:
 * las vistas no cambian, solo se cambia la fuente de datos.
 */
export const USE_MOCK = false;

/** URL base de la API Go (variable `NEXT_PUBLIC_API_URL`). */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
