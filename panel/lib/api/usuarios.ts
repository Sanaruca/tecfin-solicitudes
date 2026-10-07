/**
 * Acceso a usuarios (solo Administrador).
 *
 * TODO(integración API): al habilitar `USE_MOCK = false`, reemplazar por:
 *   GET    /usuarios
 *   POST   /usuarios
 *   DELETE /usuarios/:id
 */
import { mockDB } from "@/lib/mock/store";
import { apiNoDisponible, USE_MOCK } from "@/lib/api/config";
import type { Usuario, UsuarioCreateInput } from "@/lib/types";

export async function listUsuarios(): Promise<Usuario[]> {
  if (USE_MOCK) return mockDB.usuarios.list();
  return apiNoDisponible("GET /usuarios");
}

export async function createUsuario(input: UsuarioCreateInput): Promise<Usuario> {
  if (USE_MOCK) return mockDB.usuarios.create(input);
  return apiNoDisponible("POST /usuarios");
}

export async function deleteUsuario(id: number): Promise<void> {
  if (USE_MOCK) return mockDB.usuarios.remove(id);
  return apiNoDisponible(`DELETE /usuarios/${id}`);
}
