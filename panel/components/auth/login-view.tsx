"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ClipboardIcon, EyeIcon, EyeOffIcon } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { buttonClassName } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, fieldErrorClassName } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getSession, login } from "@/lib/api/auth";

export function LoginView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Si ya hay sesión, no tiene sentido mostrar el login.
  useEffect(() => {
    if (getSession()) router.replace("/solicitudes");
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = "Ingresá tu email.";
    if (!password) nextErrors.password = "Ingresá tu contraseña.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError(null);
    try {
      await login({ email: email.trim(), password });
      router.replace("/solicitudes");
      router.refresh();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <ClipboardIcon className="h-6 w-6" />
          </span>
          <h1 className="mt-3 text-lg font-semibold tracking-tight text-zinc-900">
            Gestión de Solicitudes
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Iniciá sesión para administrar las solicitudes de clientes.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {formError ? <Alert className="mb-4">{formError}</Alert> : null}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Field label="Email" htmlFor="email" required error={errors.email}>
              <Input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="nombre@empresa.com"
                className={errors.email ? fieldErrorClassName : undefined}
                autoComplete="username"
                autoFocus
              />
            </Field>

            <Field label="Contraseña" htmlFor="password" required error={errors.password}>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••"
                  className={
                    errors.password
                      ? `${fieldErrorClassName} pr-10`
                      : "pr-10"
                  }
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className={`${buttonClassName({ className: "w-full" })} mt-1`}
            >
              {submitting ? <Spinner className="h-4 w-4" /> : null}
              {submitting ? "Ingresando…" : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
