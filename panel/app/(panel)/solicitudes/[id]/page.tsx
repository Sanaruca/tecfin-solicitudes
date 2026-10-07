import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SolicitudForm } from "@/components/solicitudes/solicitud-form";

export const metadata: Metadata = {
  title: "Editar solicitud",
};

// El contenido se resuelve en el cliente hasta integrar la API (sesión mock).
export const instant = false;

export default async function EditarSolicitudPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  return <SolicitudForm mode="edit" id={numericId} />;
}
