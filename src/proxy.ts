import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

/**
 * Next.js proxy (formerly"middleware" in Next 15 and earlier) — runs on
 * every matched route to refresh the Supabase session (httpOnly cookies)
 * and protect private routes.
 *
 * Matcher excludes static assets and Next internals so we only run on
 * actual page/route requests.
 */
export async function proxy(request: NextRequest) {
 return await updateSession(request)
}

export const config = {
 matcher: [
 /*
 * Match all request paths except:
 * - _next/static, _next/image, favicon (static assets)
 * - .*\\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$ (file extensions)
 */
 '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
 ],
}
