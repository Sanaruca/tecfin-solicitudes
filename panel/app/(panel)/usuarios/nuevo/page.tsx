import type { Metadata } from "next";
import { UsuariosGuard } from "@/components/usuarios/usuarios-guard";
import { UsuarioForm } from "@/components/usuarios/usuario-form";

export const metadata: Metadata = {
  title: "Nuevo usuario",
};

// El contenido se resuelve en el cliente hasta integrar la API (sesión mock).
export const instant = false;

export default function NuevoUsuarioPage() {
  return (
    <UsuariosGuard>
      <UsuarioForm />
    </UsuariosGuard>
  );
}
