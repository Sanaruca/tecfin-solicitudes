const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** Formatea una fecha ISO/RFC3339 como `dd/mm/aaaa`. */
export function formatDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateFormatter.format(date);
}

/** Convierte una fecha ISO en `yyyy-mm-dd` (input type="date"). */
export function toInputDate(iso?: string | null): string {
  if (!iso) return "";
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(iso);
  return match ? match[1] : "";
}

/** Fecha actual local en formato `yyyy-mm-dd`. */
export function todayInputDate(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

/** `yyyy-mm-dd` -> ISO/RFC3339 (mediodía UTC para evitar corrimientos de zona). */
export function dateInputToIso(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T12:00:00.000Z`).toISOString()
    : value;
}

/** Normaliza texto para búsquedas sin distinguir mayúsculas ni acentos. */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}
