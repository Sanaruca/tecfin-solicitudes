/**
 * Acceso a usuarios (solo Administrador; la API devuelve 403 al resto).
 *
 * Con la API Go:
 *   GET    /usuarios
 *   POST   /usuarios
 *   DELETE /usuarios/:id   (al eliminar un usuario, sus solicitudes quedan
 *                           sin dueño: la API hace `creadoPorId = NULL`)
 */
import { mockDB } from "@/lib/mock/store";
import { USE_MOCK } from "@/lib/api/config";
import { request } from "@/lib/api/client";
import type { Usuario, UsuarioCreateInput } from "@/lib/types";

export async function listUsuarios(): Promise<Usuario[]> {
  if (USE_MOCK) return mockDB.usuarios.list();
  return request<Usuario[]>("/usuarios");
}

export async function createUsuario(input: UsuarioCreateInput): Promise<Usuario> {
  if (USE_MOCK) return mockDB.usuarios.create(input);
  return request<Usuario>("/usuarios", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteUsuario(id: number): Promise<void> {
  if (USE_MOCK) return mockDB.usuarios.remove(id);
  await request<Usuario>(`/usuarios/${id}`, { method: "DELETE" });
}
