import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * OAuth / email-confirmation callback handler.
 *
 * Supabase redirects here after Google OAuth or after the user clicks the
 * email-confirmation link. The URL contains `?code=...` which we exchange
 * for a session. The @supabase/ssr client writes the session into httpOnly
 * cookies, then we redirect to the originally-requested page (or home).
 *
 * This replaces the old hash-cleanup hack in providers.tsx that stripped
 * `#access_token=...` from the URL after 300ms.
 */
export async function GET(request: NextRequest) {
 const { origin } = request.nextUrl
 const code = request.nextUrl.searchParams.get('code')
 const redirectParam = request.nextUrl.searchParams.get('redirect')
 // Default redirect destination after successful auth.
 const next = redirectParam && redirectParam.startsWith('/') ? redirectParam : '/'
 const response = NextResponse.redirect(`${origin}${next}`)

 if (code) {
 const supabaseUrl =
 process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
 const supabaseAnonKey =
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

 const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
 cookies: {
 getAll() {
 return request.cookies.getAll()
 },
 setAll(cookiesToSet) {
 cookiesToSet.forEach(({ name, value }) =>
 request.cookies.set(name, value)
 )
 cookiesToSet.forEach(({ name, value, options }) =>
 response.cookies.set(name, value, options)
 )
 },
 },
 })

 // Exchange the auth code for a session and persist it to cookies.
 const { error } = await supabase.auth.exchangeCodeForSession(code)
 if (error) {
 // Failed exchange → redirect to login with a generic error flag.
 // SECURITY: do not leak the raw error in the URL.
 console.error('[auth/callback] exchangeCodeForSession failed:', error)
 return NextResponse.redirect(`${origin}/login?error=auth_failed`)
 }
 }

 // Successful exchange (or no code) → go to the intended destination.
 return response
}
