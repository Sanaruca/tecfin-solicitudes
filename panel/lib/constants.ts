import type { EstadoSolicitud, Rol } from "@/lib/types";

/** Estados posibles de una solicitud (espejo de `solicitud.EstadoSolicitud`). */
export const ESTADOS: EstadoSolicitud[] = [
  "PENDIENTE",
  "EN_PROCESO",
  "COMPLETADA",
  "CANCELADA",
];

export const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
  PENDIENTE: "Pendiente",
  EN_PROCESO: "En proceso",
  COMPLETADA: "Completada",
  CANCELADA: "Cancelada",
};

export const ESTADO_BADGES: Record<EstadoSolicitud, string> = {
  PENDIENTE: "border border-amber-200 bg-amber-50 text-amber-700",
  EN_PROCESO: "border border-sky-200 bg-sky-50 text-sky-700",
  COMPLETADA: "border border-emerald-200 bg-emerald-50 text-emerald-700",
  CANCELADA: "border border-rose-200 bg-rose-50 text-rose-700",
};

export const ROL_LABELS: Record<Rol, string> = {
  ADMINISTRADOR: "Administrador",
  OPERADOR: "Operador",
};

export const ROL_BADGES: Record<Rol, string> = {
  ADMINISTRADOR: "border border-indigo-200 bg-indigo-50 text-indigo-700",
  OPERADOR: "border border-zinc-200 bg-zinc-100 text-zinc-700",
};

export function isEstadoSolicitud(value: string): value is EstadoSolicitud {
  return (ESTADOS as string[]).includes(value);
}

export function isRol(value: string): value is Rol {
  return value === "ADMINISTRADOR" || value === "OPERADOR";
}
