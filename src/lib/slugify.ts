/**
 * Client-side slugify for Vietnamese text.
 *
 * Mirrors the server-side `public.slugify(text)` Postgres function in db.sql.
 * Used as a fallback when a DB row's `slug` column is NULL (e.g. before the
 * `generate_*_slug` triggers have run on the live database).
 *
 * Usage: `slugify(row.name)` → "tinh-nguyen-vien"
 */
export function slugify(text: string): string {
  if (!text) return ""
  let val = text.toLowerCase()
  // Vietnamese diacritics → ASCII base
  val = val.replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
  val = val.replace(/[èéẹẻẽêềếệểễ]/g, "e")
  val = val.replace(/[ìíịỉĩ]/g, "i")
  val = val.replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
  val = val.replace(/[ùúụủũưừứựửữ]/g, "u")
  val = val.replace(/[ỳýỵỷỹ]/g, "y")
  val = val.replace(/[đ]/g, "d")
  // Remove special chars, keep letters/digits/space/hyphen
  val = val.replace(/[^a-z0-9\s-]/g, "")
  // Collapse whitespace/hyphens → single hyphen
  val = val.replace(/[\s-]+/g, "-")
  val = val.replace(/^-+|-+$/g, "")
  return val
}

/**
 * Resolve a row's slug: prefer the DB `slug` column, fall back to slugify(name).
 * Returns a non-empty string safe to use as a route segment and React key.
 */
export function resolveSlug(row: { slug?: string | null; name?: string | null }): string {
  if (row?.slug) return row.slug
  return slugify(row?.name || "")
}
