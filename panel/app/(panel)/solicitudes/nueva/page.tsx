import type { Metadata } from "next";
import { SolicitudForm } from "@/components/solicitudes/solicitud-form";

export const metadata: Metadata = {
  title: "Nueva solicitud",
};

// El contenido se resuelve en el cliente hasta integrar la API (sesión mock).
export const instant = false;

export default function NuevaSolicitudPage() {
  return <SolicitudForm mode="create" />;
}
