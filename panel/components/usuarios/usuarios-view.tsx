"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusIcon, ShieldIcon, TrashIcon } from "@/components/icons";
import { useSession } from "@/components/auth/session-context";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ROL_BADGES, ROL_LABELS } from "@/lib/constants";
import { deleteUsuario, listUsuarios } from "@/lib/api/usuarios";
import type { Usuario } from "@/lib/types";

export function UsuariosView() {
  const session = useSession();
  const esAdmin = session.rol === "ADMINISTRADOR";

  const [items, setItems] = useState<Usuario[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Usuario | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (!esAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await listUsuarios();
        if (!cancelled) setItems(data);
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [esAdmin]);

  async function confirmarEliminacion() {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await deleteUsuario(aEliminar.id);
      setItems((prev) => (prev ?? []).filter((u) => u.id !== aEliminar.id));
      setAEliminar(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el usuario.");
    } finally {
      setEliminando(false);
    }
  }

  if (!esAdmin) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          <ShieldIcon className="h-5 w-5" />
        </span>
        <h1 className="mt-3 text-lg font-semibold text-zinc-900">Sección restringida</h1>
        <p className="mt-2 text-sm text-zinc-600">
          La gestión de usuarios está disponible solo para administradores.
        </p>
        <Link href="/solicitudes" className={buttonClassName({ variant: "secondary", className: "mt-5" })}>
          Ir a solicitudes
        </Link>
      </div>
    );
  }

  const total = items?.length ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Usuarios
          </h1>
          <p className="text-sm text-zinc-500">
            {items === null
              ? "Cargando usuarios…"
              : `${total} ${total === 1 ? "usuario" : "usuarios"}`}
          </p>
        </div>
        <Link
          href="/usuarios/nuevo"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          <PlusIcon className="h-4 w-4" />
          Nuevo usuario
        </Link>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      {items === null ? (
        <UsersSkeleton />
      ) : total === 0 ? (
        <EmptyState
          title="No hay usuarios cargados"
          description="Creá el primer usuario para que pueda ingresar al panel."
          action={
            <Link href="/usuarios/nuevo" className={buttonClassName()}>
              <PlusIcon className="h-4 w-4" />
              Nuevo usuario
            </Link>
          }
        />
      ) : (
        <>
          {/* Tabla (desktop) */}
          <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Rol</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items.map((usuario) => {
                  const esPropio = usuario.id === session.id;
                  return (
                    <tr key={usuario.id} className="transition-colors hover:bg-zinc-50/70">
                      <td className="px-4 py-3 font-medium text-zinc-900">{usuario.nombre}</td>
                      <td className="px-4 py-3 text-zinc-600">{usuario.email}</td>
                      <td className="px-4 py-3">
                        <Badge className={ROL_BADGES[usuario.rol]}>{ROL_LABELS[usuario.rol]}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            usuario.activo
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-zinc-200 bg-zinc-100 text-zinc-600"
                          }
                        >
                          {usuario.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end">
                          <button
                            type="button"
                            disabled={esPropio}
                            onClick={() => setAEliminar(usuario)}
                            aria-label={`Eliminar usuario ${usuario.nombre}`}
                            title={esPropio ? "No podés eliminar tu propio usuario" : undefined}
                            className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Tarjetas (mobile) */}
          <div className="space-y-3 md:hidden">
            {items.map((usuario) => {
              const esPropio = usuario.id === session.id;
              return (
                <article
                  key={usuario.id}
                  className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">{usuario.nombre}</p>
                      <p className="mt-0.5 truncate text-xs text-zinc-500">{usuario.email}</p>
                    </div>
                    <Badge className={ROL_BADGES[usuario.rol]}>{ROL_LABELS[usuario.rol]}</Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-2">
                    <Badge
                      className={
                        usuario.activo
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-zinc-200 bg-zinc-100 text-zinc-600"
                      }
                    >
                      {usuario.activo ? "Activo" : "Inactivo"}
                    </Badge>
                    <button
                      type="button"
                      disabled={esPropio}
                      onClick={() => setAEliminar(usuario)}
                      className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Eliminar
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        title="Eliminar usuario"
        description={
          aEliminar
            ? `Se eliminará el usuario "${aEliminar.nombre}" (${aEliminar.email}). Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        loading={eliminando}
        onConfirm={confirmarEliminacion}
        onCancel={() => setAEliminar(null)}
      />
    </div>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-3">
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 shadow-sm md:block">
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="hidden h-4 w-52 sm:block" />
              <Skeleton className="ml-auto h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="mt-2 h-3 w-48" />
            <Skeleton className="mt-4 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
