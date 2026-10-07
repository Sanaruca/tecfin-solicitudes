"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { buttonClassName } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Select, fieldErrorClassName } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { ROL_LABELS } from "@/lib/constants";
import { createUsuario } from "@/lib/api/usuarios";
import type { Rol } from "@/lib/types";

interface FormValues {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const emptyValues: FormValues = {
  nombre: "",
  email: "",
  password: "",
  rol: "OPERADOR",
};

export function UsuarioForm() {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(emptyValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): FormErrors {
    const next: FormErrors = {};
    if (!values.nombre.trim()) next.nombre = "Ingresá el nombre completo.";
    if (!values.email.trim()) {
      next.email = "Ingresá el email.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Ingresá un email válido.";
    }
    if (!values.password) {
      next.password = "Ingresá una contraseña.";
    } else if (values.password.length < 6) {
      next.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    return next;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await createUsuario({
        nombre: values.nombre.trim(),
        email: values.email.trim(),
        password: values.password,
        rol: values.rol,
      });
      router.push("/usuarios");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo crear el usuario.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/usuarios"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ← Volver a usuarios
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
          Nuevo usuario
        </h1>
        <p className="text-sm text-zinc-500">
          El usuario podrá ingresar al panel con el email y la contraseña definidos.
        </p>
      </div>

      {formError ? <Alert>{formError}</Alert> : null}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="max-w-2xl rounded-xl border border-zinc-200 bg-white p-5 shadow-sm md:p-6"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre completo" htmlFor="nombre" required error={errors.nombre}>
            <Input
              id="nombre"
              name="nombre"
              value={values.nombre}
              onChange={(event) => set("nombre", event.target.value)}
              placeholder="Ej: Ana Torres"
              className={errors.nombre ? fieldErrorClassName : undefined}
              autoComplete="off"
            />
          </Field>

          <Field label="Email" htmlFor="email" required error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              value={values.email}
              onChange={(event) => set("email", event.target.value)}
              placeholder="nombre@empresa.com"
              className={errors.email ? fieldErrorClassName : undefined}
              autoComplete="off"
            />
          </Field>

          <Field
            label="Contraseña"
            htmlFor="password"
            required
            error={errors.password}
            hint="Mínimo 6 caracteres."
          >
            <Input
              id="password"
              name="password"
              type="password"
              value={values.password}
              onChange={(event) => set("password", event.target.value)}
              placeholder="••••••"
              className={errors.password ? fieldErrorClassName : undefined}
              autoComplete="new-password"
            />
          </Field>

          <Field label="Rol" htmlFor="rol" required>
            <Select
              id="rol"
              name="rol"
              value={values.rol}
              onChange={(event) => set("rol", event.target.value as Rol)}
            >
              <option value="OPERADOR">{ROL_LABELS.OPERADOR}</option>
              <option value="ADMINISTRADOR">{ROL_LABELS.ADMINISTRADOR}</option>
            </Select>
          </Field>

          <div className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2.5 text-xs leading-5 text-sky-700 sm:col-span-2">
            <strong>Operador:</strong> gestiona solicitudes (crear, editar, eliminar) pero no
            puede crear ni eliminar usuarios.
            <br />
            <strong>Administrador:</strong> gestiona solicitudes y además administra usuarios.
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-zinc-100 pt-5 sm:flex-row sm:justify-end">
          <Link
            href="/usuarios"
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
            {submitting ? "Creando…" : "Crear usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
