/** Slug estable para ids de grupos/opciones (sin espacios). */
export function slugifyLabel(s: string): string {
  const t = s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return t || "opcion";
}
