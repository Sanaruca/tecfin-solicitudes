import { cn } from "@/lib/cn";

/** Bloque con animación de pulso, para estados de carga. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-zinc-200", className)} />;
}
