import type { ReactNode } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { AppShell } from "@/components/layout/app-shell";

// TODO(integración API): la sesión pasará a leerse en el servidor (cookie),
// y ahí se puede quitar este opt-out para validar navegación instantánea.
export const instant = false;

/** Layout de las rutas autenticadas: sidebar + topbar + guardia de sesión. */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>{children}</AppShell>
    </AuthGuard>
  );
}
