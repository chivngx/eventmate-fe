"use client"

/**
 * Root error boundary — catches unhandled errors in any route segment.
 * Shows a friendly Vietnamese message with a retry button.
 */
import { useEffect } from"react"

export default function Error({
 error,
 reset,
}: {
 error: Error & { digest?: string }
 reset: () => void
}) {
 useEffect(() => {
 // Log to console for dev diagnostics (production should use Sentry).
 console.error("[App Error Boundary]:", error)
 }, [error])

 return (
 <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
 <div className="text-5xl">😕</div>
 <h2 className="text-xl font-bold text-slate-900">
 Đã xảy ra lỗi
 </h2>
 <p className="max-w-md text-sm text-slate-500">
 Trang bạn đang xem gặp sự cố. Vui lòng thử lại hoặc quay lại sau.
 </p>
 <button
 onClick={reset}
 className="mt-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
 >
 Thử lại
 </button>
 </div>
 )
}
