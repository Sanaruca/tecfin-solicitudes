"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PencilIcon,
  PlusIcon,
  SearchIcon,
  TrashIcon,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonClassName, Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ESTADO_BADGES, ESTADO_LABELS, ESTADOS } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";
import { deleteSolicitud, listSolicitudes } from "@/lib/api/solicitudes";
import type { EstadoSolicitud, Solicitud } from "@/lib/types";

export function SolicitudesView() {
  const pathname = usePathname();
  const [items, setItems] = useState<Solicitud[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState<EstadoSolicitud | "">("");
  const [error, setError] = useState<string | null>(null);
  const [aEliminar, setAEliminar] = useState<Solicitud | null>(null);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const data = await listSolicitudes({
          nombre: nombre || undefined,
          estado: estado || undefined,
        });
        if (!cancelled) {
          setItems(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : "No se pudieron cargar las solicitudes.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, nombre ? 300 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // `pathname`: al volver de editar/crear, el listado se refresca (Next
    // mantiene la vista anterior montada en el DOM, oculta, sin re-consultar).
  }, [pathname, nombre, estado]);

  async function confirmarEliminacion() {
    if (!aEliminar) return;
    setEliminando(true);
    try {
      await deleteSolicitud(aEliminar.id);
      setItems((prev) => (prev ?? []).filter((s) => s.id !== aEliminar.id));
      setAEliminar(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la solicitud.");
    } finally {
      setEliminando(false);
    }
  }

  const hayFiltros = nombre.trim() !== "" || estado !== "";
  const primeraCarga = items === null;
  const total = items?.length ?? 0;

  const resumen = primeraCarga
    ? "Cargando solicitudes…"
    : `${total} ${total === 1 ? "solicitud" : "solicitudes"}${hayFiltros ? " (filtradas)" : ""}`;

  function limpiarFiltros() {
    setNombre("");
    setEstado("");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
            Solicitudes
          </h1>
          <p className="text-sm text-zinc-500">{resumen}</p>
        </div>
        <Link
          href="/solicitudes/nueva"
          className={buttonClassName({ className: "w-full sm:w-auto" })}
        >
          <PlusIcon className="h-4 w-4" />
          Nueva solicitud
        </Link>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            type="search"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Buscar por nombre…"
            aria-label="Buscar por nombre de cliente"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
          <FilterChip active={estado === ""} onClick={() => setEstado("")}>
            Todos
          </FilterChip>
          {ESTADOS.map((value) => (
            <FilterChip
              key={value}
              active={estado === value}
              onClick={() => setEstado(value)}
            >
              {ESTADO_LABELS[value]}
            </FilterChip>
          ))}
          {loading && !primeraCarga ? (
            <span className="ml-1 inline-flex items-center gap-1.5 self-center text-xs text-zinc-400">
              <Spinner className="h-3.5 w-3.5" />
              Actualizando
            </span>
          ) : null}
        </div>
      </div>

      {primeraCarga ? (
        <TableSkeleton />
      ) : total === 0 ? (
        hayFiltros ? (
          <EmptyState
            title="No se encontraron solicitudes"
            description="Probá con otro nombre o quitá el filtro de estado."
            action={
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Todavía no hay solicitudes"
            description="Creá la primera solicitud de un cliente para empezar a trabajar."
            action={
              <Link href="/solicitudes/nueva" className={buttonClassName()}>
                <PlusIcon className="h-4 w-4" />
                Nueva solicitud
              </Link>
            }
          />
        )
      ) : (
        <>
          {/* Tabla (desktop) */}
          <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:block">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Teléfono</th>
                  <th className="px-4 py-3">Descripción</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {items?.map((solicitud) => (
                  <tr key={solicitud.id} className="transition-colors hover:bg-zinc-50/70">
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {solicitud.nombreCliente}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                      {solicitud.telefono}
                    </td>
                    <td className="px-4 py-3 text-zinc-600">
                      <span className="block max-w-[260px] truncate" title={solicitud.descripcion}>
                        {solicitud.descripcion}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-zinc-600">
                      {formatDate(solicitud.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={ESTADO_BADGES[solicitud.estado]}>
                        {ESTADO_LABELS[solicitud.estado]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/solicitudes/${solicitud.id}`}
                          aria-label={`Editar solicitud de ${solicitud.nombreCliente}`}
                          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-indigo-600"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setAEliminar(solicitud)}
                          aria-label={`Eliminar solicitud de ${solicitud.nombreCliente}`}
                          className="rounded-lg p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-rose-600"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tarjetas (mobile) */}
          <div className="space-y-3 md:hidden">
            {items?.map((solicitud) => (
              <article
                key={solicitud.id}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-900">
                      {solicitud.nombreCliente}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatDate(solicitud.fecha)} · {solicitud.telefono}
                    </p>
                  </div>
                  <Badge className={ESTADO_BADGES[solicitud.estado]}>
                    {ESTADO_LABELS[solicitud.estado]}
                  </Badge>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-zinc-600">
                  {solicitud.descripcion}
                </p>
                <div className="mt-3 flex justify-end gap-1 border-t border-zinc-100 pt-2">
                  <Link
                    href={`/solicitudes/${solicitud.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-indigo-600"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setAEliminar(solicitud)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-zinc-600 hover:bg-zinc-100 hover:text-rose-600"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        open={aEliminar !== null}
        title="Eliminar solicitud"
        description={
          aEliminar
            ? `Se eliminará la solicitud de "${aEliminar.nombreCliente}" de forma permanente. Esta acción no se puede deshacer.`
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-indigo-600 bg-indigo-600 text-white"
          : "border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
      )}
    >
      {children}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="hidden overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm md:block">
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="hidden h-4 w-28 sm:block" />
              <Skeleton className="hidden h-4 flex-1 md:block" />
              <Skeleton className="hidden h-4 w-20 md:block" />
              <Skeleton className="ml-auto h-5 w-24 rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3 md:hidden">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-48" />
            <Skeleton className="mt-2 h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
