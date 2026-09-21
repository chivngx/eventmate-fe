import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase-middleware'

// Refresh Supabase session & handle route protection
export async function proxy(request: NextRequest) {
  return await updateSession(request)
}

export const middleware = proxy

export const config = {
  // Skip static assets and internal Next.js routes
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
