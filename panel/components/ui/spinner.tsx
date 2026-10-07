import { cn } from "@/lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("h-4 w-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FullScreenLoader({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-zinc-50">
      <Spinner className="h-6 w-6 text-indigo-600" />
      <p className="text-sm text-zinc-500">{label}</p>
    </div>
  );
}
