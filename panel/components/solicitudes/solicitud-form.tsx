"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { buttonClassName } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea, fieldErrorClassName } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { ESTADO_LABELS, ESTADOS } from "@/lib/constants";
import { dateInputToIso, toInputDate, todayInputDate } from "@/lib/format";
import { createSolicitud, getSolicitud, updateSolicitud } from "@/lib/api/solicitudes";
import type { EstadoSolicitud, Solicitud } from "@/lib/types";

interface FormValues {
  nombreCliente: string;
  telefono: string;
  descripcion: string;
  fecha: string;
  estado: EstadoSolicitud;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyValues: FormValues = {
  nombreCliente: "",
  telefono: "",
  descripcion: "",
  fecha: todayInputDate(),
  estado: "PENDIENTE",
};

export function SolicitudForm({
  mode,
  id,
}: {
  mode: "create" | "edit";
  id?: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(mode === "edit");
  const [noEncontrada, setNoEncontrada] = useState(false);
  const [solicitud, setSolicitud] = useState<Solicitud | null>(null);

  useEffect(() => {
    if (mode !== "edit" || id === undefined) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getSolicitud(id);
        if (cancelled) return;
        if (!data) {
          setNoEncontrada(true);
          return;
        }
        setSolicitud(data);
        setValues({
          nombreCliente: data.nombreCliente,
          telefono: data.telefono,
          descripcion: data.descripcion,
          fecha: toInputDate(data.fecha) || todayInputDate(),
          estado: data.estado,
        });
      } catch (err) {
        if (!cancelled) {
          setFormError(err instanceof Error ? err.message : "No se pudo cargar la solicitud.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [mode, id]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!values.nombreCliente.trim()) next.nombreCliente = "Ingresá el nombre del cliente.";
    if (!values.telefono.trim()) next.telefono = "Ingresá el teléfono de contacto.";
    if (!values.descripcion.trim()) next.descripcion = "Ingresá una descripción.";
    if (!values.fecha) next.fecha = "Seleccioná la fecha.";
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = { ...values, fecha: dateInputToIso(values.fecha) };
    setSubmitting(true);
    setFormError(null);
    try {
      if (mode === "create") {
        await createSolicitud(payload);
      } else {
        if (id === undefined) throw new Error("Solicitud no válida.");
        await updateSolicitud(id, payload);
      }
      router.push("/solicitudes");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo guardar la solicitud.");
      setSubmitting(false);
    }
  }

  if (noEncontrada) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-zinc-900">Solicitud no encontrada</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Puede que haya sido eliminada o que el enlace sea incorrecto.
        </p>
        <Link href="/solicitudes" className={buttonClassName({ className: "mt-5" })}>
          Volver al listado
        </Link>
      </div>
    );
  }

  const esEdicion = mode === "edit";

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-28 w-full sm:col-span-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/solicitudes"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ← Volver a solicitudes
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
          {esEdicion ? "Editar solicitud" : "Nueva solicitud"}
        </h1>
        {esEdicion && solicitud ? (
          <p className="text-sm text-zinc-500">
            Solicitud #{solicitud.id} · actualizada el {formatDateTime(solicitud.updatedAt)}
          </p>
        ) : (
          <p className="text-sm text-zinc-500">
            Completá los datos del cliente para registrar la solicitud.
          </p>
        )}
      </div>

      {formError ? <Alert>{formError}</Alert> : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre del cliente" htmlFor="nombreCliente" required error={errors.nombreCliente}>
            <Input
              id="nombreCliente"
              name="nombreCliente"
              value={values.nombreCliente}
              onChange={(event) => set("nombreCliente", event.target.value)}
              placeholder="Ej: Mercado San Rafael"
              className={errors.nombreCliente ? fieldErrorClassName : undefined}
              autoComplete="off"
            />
          </Field>

          <Field label="Teléfono" htmlFor="telefono" required error={errors.telefono}>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              value={values.telefono}
              onChange={(event) => set("telefono", event.target.value)}
              placeholder="Ej: +54 9 11 5555-1010"
              className={errors.telefono ? fieldErrorClassName : undefined}
            />
          </Field>

          <Field label="Fecha" htmlFor="fecha" required error={errors.fecha}>
            <Input
              id="fecha"
              name="fecha"
              type="date"
              value={values.fecha}
              onChange={(event) => set("fecha", event.target.value)}
              className={errors.fecha ? fieldErrorClassName : undefined}
            />
          </Field>

          <Field label="Estado" htmlFor="estado" required>
            <Select
              id="estado"
              name="estado"
              value={values.estado}
              onChange={(event) => set("estado", event.target.value as EstadoSolicitud)}
            >
              {ESTADOS.map((estado) => (
                <option key={estado} value={estado}>
                  {ESTADO_LABELS[estado]}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Descripción"
            htmlFor="descripcion"
            required
            error={errors.descripcion}
            className="sm:col-span-2"
          >
            <Textarea
              id="descripcion"
              name="descripcion"
              value={values.descripcion}
              onChange={(event) => set("descripcion", event.target.value)}
              placeholder="Contá qué necesita el cliente…"
              className={errors.descripcion ? fieldErrorClassName : undefined}
            />
          </Field>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/solicitudes"
            className={buttonClassName({ variant: "secondary", className: "sm:w-auto" })}
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className={buttonClassName({ className: "sm:w-auto" })}
          >
            {submitting ? <Spinner className="h-4 w-4" /> : null}
            {submitting ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
