import type { Metadata } from "next";
import { SolicitudesView } from "@/components/solicitudes/solicitudes-view";

export const metadata: Metadata = {
  title: "Solicitudes",
};

// El contenido se resuelve en el cliente hasta integrar la API (sesión mock).
export const instant = false;

export default function SolicitudesPage() {
  return <SolicitudesView />;
}
