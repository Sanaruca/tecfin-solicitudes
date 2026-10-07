/**
 * Acceso a solicitudes.
 *
 * TODO(integración API): al habilitar `USE_MOCK = false`, reemplazar las
 * llamadas mock por `fetch` contra la API Go:
 *   GET    /solicitudes?nombre=&estado=&pagina=&porPagina=
 *   GET    /solicitudes/:id
 *   POST   /solicitudes
 *   PUT    /solicitudes/:id
 *   DELETE /solicitudes/:id
 */
import { mockDB } from "@/lib/mock/store";
import { apiNoDisponible, USE_MOCK } from "@/lib/api/config";
import type {
  Solicitud,
  SolicitudCreateInput,
  SolicitudFilters,
  SolicitudUpdateInput,
} from "@/lib/types";

export async function listSolicitudes(filters: SolicitudFilters = {}): Promise<Solicitud[]> {
  if (USE_MOCK) return mockDB.solicitudes.list(filters);
  return apiNoDisponible("GET /solicitudes");
}

export async function getSolicitud(id: number): Promise<Solicitud | null> {
  if (USE_MOCK) return mockDB.solicitudes.get(id);
  return apiNoDisponible(`GET /solicitudes/${id}`);
}

export async function createSolicitud(input: SolicitudCreateInput): Promise<Solicitud> {
  if (USE_MOCK) return mockDB.solicitudes.create(input);
  return apiNoDisponible("POST /solicitudes");
}

export async function updateSolicitud(
  id: number,
  input: SolicitudUpdateInput,
): Promise<Solicitud> {
  if (USE_MOCK) return mockDB.solicitudes.update(id, input);
  return apiNoDisponible(`PUT /solicitudes/${id}`);
}

export async function deleteSolicitud(id: number): Promise<void> {
  if (USE_MOCK) return mockDB.solicitudes.remove(id);
  return apiNoDisponible(`DELETE /solicitudes/${id}`);
}
