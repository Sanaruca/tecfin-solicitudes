/**
 * Tipos compartidos entre el panel y la API (Go).
 * Espejo de los modelos de `api/models` (JSON de la API).
 *
 * Estos tipos NO deben cambiar al integrar la API: la capa `lib/api/*`
 * será la única que se conecte con el backend.
 */

export type EstadoSolicitud = "PENDIENTE" | "EN_PROCESO" | "COMPLETADA" | "CANCELADA";
export type Rol = "ADMINISTRADOR" | "OPERADOR";

/** Solicitud de cliente (espejo de `solicitud.Solicitud`). */
export interface Solicitud {
  id: number;
  nombreCliente: string;
  telefono: string;
  descripcion: string;
  /** Fecha de la solicitud (RFC3339, `time.Time` en la API). */
  fecha: string;
  estado: EstadoSolicitud;
  /** Usuario que registró la solicitud. `null` si fue eliminado. */
  creadoPorId: number | null;
  createdAt: string;
  updatedAt: string;
}

/** Usuario del sistema (espejo de `usuario.Usuario`, sin password). */
export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: Rol;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SolicitudCreateInput {
  nombreCliente: string;
  telefono: string;
  descripcion: string;
  fecha: string;
  estado: EstadoSolicitud;
}

export type SolicitudUpdateInput = Partial<SolicitudCreateInput>;

export interface UsuarioCreateInput {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: Usuario;
}

/** Filtros del listado de solicitudes (query params de la API). */
export interface SolicitudFilters {
  nombre?: string;
  estado?: EstadoSolicitud;
  pagina?: number;
  porPagina?: number;
}

/** Usuario autenticado en el cliente (sesión). */
export type SessionUser = Usuario;
