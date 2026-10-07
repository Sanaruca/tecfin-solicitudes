import type { Metadata } from "next";
import { UsuariosView } from "@/components/usuarios/usuarios-view";

export const metadata: Metadata = {
  title: "Usuarios",
};

// El contenido se resuelve en el cliente hasta integrar la API (sesión mock).
export const instant = false;

export default function UsuariosPage() {
  return <UsuariosView />;
}
