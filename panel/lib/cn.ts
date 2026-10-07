/** Une clases de Tailwind ignorando los valores falsy. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}
