/**
 * Acceso a solicitudes.
 *
 * Con la API Go:
 *   GET    /solicitudes?nombre=&estado=&pagina=&porPagina=
 *   GET    /solicitudes/:id   (404 -> null)
 *   POST   /solicitudes
 *   PUT    /solicitudes/:id
 *   DELETE /solicitudes/:id
 */
import { mockDB } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { ApiError, request } from "@/lib/api/client";
import type {
  Solicitud,
  SolicitudCreateInput,
  SolicitudFilters,
  SolicitudUpdateInput,
} from "@/lib/types";

/** Traduce los filtros de la UI a los query params de la API. */
function queryString(filters: SolicitudFilters): string {
  const params = new URLSearchParams();
  if (filters.nombre) params.set("nombre", filters.nombre);
  if (filters.estado) params.set("estado", filters.estado);
  if (filters.pagina) params.set("pagina", String(filters.pagina));
  if (filters.porPagina) params.set("porPagina", String(filters.porPagina));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listSolicitudes(filters: SolicitudFilters = {}): Promise<Solicitud[]> {
  if (USE_MOCK) return mockDB.solicitudes.list(filters);
  return request<Solicitud[]>(`/solicitudes${queryString(filters)}`);
}

export async function getSolicitud(id: number): Promise<Solicitud | null> {
  if (USE_MOCK) return mockDB.solicitudes.get(id);
  try {
    return await request<Solicitud>(`/solicitudes/${id}`);
  } catch (err) {
    // La API responde 404 si no existe: la vista muestra "no encontrada".
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function createSolicitud(input: SolicitudCreateInput): Promise<Solicitud> {
  if (USE_MOCK) return mockDB.solicitudes.create(input);
  return request<Solicitud>("/solicitudes", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateSolicitud(
  id: number,
  input: SolicitudUpdateInput,
): Promise<Solicitud> {
  if (USE_MOCK) return mockDB.solicitudes.update(id, input);
  return request<Solicitud>(`/solicitudes/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteSolicitud(id: number): Promise<void> {
  if (USE_MOCK) return mockDB.solicitudes.remove(id);
  await request<Solicitud>(`/solicitudes/${id}`, { method: "DELETE" });
}
