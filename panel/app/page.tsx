import { redirect } from "next/navigation";

// La raíz solo redirige: no produce HTML propio que validar como instantáneo.
export const instant = false;

export default function Home() {
  redirect("/solicitudes");
}
