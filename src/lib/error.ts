const ERROR_CODE_MESSAGES: Record<string, string> = {
    "23505": "Bản ghi đã tồn tại, không thể trùng lặp.",
    "23503": "Dữ liệu liên quan không tồn tại.",
    "42501": "Bạn không có quyền thực hiện thao tác này.",
    "PGRST116": "Không tìm thấy dữ liệu phù hợp.",
}

export function getUserFacingMessage(
    error: unknown,
    fallback = "Đã xảy ra lỗi. Vui lòng thử lại sau."
): string {
    const errObj = error as { message?: string; details?: string; hint?: string; code?: string } | null
    if (errObj && (errObj.message || errObj.code || errObj.details || errObj.hint)) {
        console.error("[EventMate] operation failed:", {
            message: errObj.message,
            code: errObj.code,
            details: errObj.details,
            hint: errObj.hint,
            raw: error,
        })
    } else {
        console.error("[EventMate] operation failed:", error)
    }

    if (errObj?.code && ERROR_CODE_MESSAGES[errObj.code]) {
        return ERROR_CODE_MESSAGES[errObj.code]
    }

    return fallback
}

const HTML_ESCAPES: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
}

export function escapeHtml(value: string): string {
    return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] || ch)
}
