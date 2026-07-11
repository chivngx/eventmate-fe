/**
 * Security helpers for user-facing error messages and HTML escaping.
 *
 * Why: raw backend/Supabase error messages can leak internals (table names,
 * RLS hints, constraint names, stack fragments) to end users. We log the raw
 * error for debugging while showing a friendly, generic Vietnamese message.
 */

/**
 * Map any caught error to a safe, user-facing message. The raw error is
 * forwarded to `console.error` so developers keep full diagnostics, but users
 * only ever see `fallback` (or a small set of recognized friendly messages).
 *
 * @param error  The caught value (Error / Supabase error / unknown).
 * @param fallback  Default message shown to the user (Vietnamese).
 */
export function getUserFacingMessage(
  error: unknown,
  fallback = "Đã xảy ra lỗi. Vui lòng thử lại sau."
): string {
  // Keep the full error for developer diagnostics — never shown to users.
  console.error("[EventMate] operation failed:", error)

  // Recognize a handful of well-known Supabase error codes and map them to
  // actionable, non-leaky messages. Everything else falls back to `fallback`.
  if (error && typeof error === "object") {
    const code = (error as { code?: string }).code
    if (code === "23505") return "Bản ghi đã tồn tại, không thể trùng lặp."
    if (code === "23503") return "Dữ liệu liên quan không tồn tại."
    if (code === "42501") return "Bạn không có quyền thực hiện thao tác này."
    if (code === "PGRST116") return "Không tìm thấy dữ liệu phù hợp."
  }

  return fallback
}

/**
 * Escape a string for safe interpolation into an HTML document (e.g. when
 * writing to a print window via document.write). Prevents DOM XSS when the
 * value originates from user/organizer input stored in the database.
 */
export function escapeHtml(value: string): string {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;"
      case "<":
        return "&lt;"
      case ">":
        return "&gt;"
      case '"':
        return "&quot;"
      case "'":
        return "&#39;"
      default:
        return ch
    }
  })
}
