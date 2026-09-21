import Link from "next/link"

/**
 * Custom 404 page — Vietnamese, on-brand.
 */
export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
            <div className="text-7xl font-bold text-slate-600">404</div>
            <h1 className="text-xl font-bold text-slate-900">
                Không tìm thấy trang
            </h1>
            <p className="max-w-md text-sm text-slate-500">
                Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển. Về trang chủ để
                tiếp tục khám phá EventMate.
            </p>
            <Link
                href="/"
                className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40"
            >
                Về trang chủ
            </Link>
        </div>
    )
}
