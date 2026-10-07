"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ShieldIcon } from "@/components/icons";
import { useSession } from "@/components/auth/session-context";
import { buttonClassName } from "@/components/ui/button";

/**
 * Restringe las vistas de usuarios al rol Administrador
 * (el operador no puede crear ni eliminar usuarios).
 */
export function UsuariosGuard({ children }: { children: ReactNode }) {
  const session = useSession();

  if (session.rol === "ADMINISTRADOR") return <>{children}</>;

  return (
    <div className="mx-auto max-w-lg rounded-xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
        <ShieldIcon className="h-5 w-5" />
      </span>
      <h1 className="mt-3 text-lg font-semibold text-zinc-900">Sección restringida</h1>
      <p className="mt-2 text-sm text-zinc-600">
        Solo los administradores pueden crear y eliminar usuarios.
      </p>
      <Link
        href="/solicitudes"
        className={buttonClassName({ variant: "secondary", className: "mt-5" })}
      >
        Ir a solicitudes
      </Link>
    </div>
  );
}
