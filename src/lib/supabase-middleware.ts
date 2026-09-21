import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

/**
 * Refresh the Supabase auth session on every request and protect private routes.
 *
 * - Reads the session from httpOnly cookies.
 * - Refreshes the access token if expired (writes updated cookies back).
 * - Redirects unauthenticated users away from private routes.
 * - Redirects authenticated users away from /login and /register.
 *
 * Runs on every matched route (matcher below excludes static assets).
 */
export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabaseUrl =
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey =
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) =>
                    request.cookies.set(name, value)
                )
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) =>
                    supabaseResponse.cookies.set(name, value, options)
                )
            },
        },
    })

    // IMPORTANT: getUser() validates the JWT and refreshes it if needed.
    // Do NOT use getSession() here — it does not validate and is unsafe for security.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Protected routes requiring user session
    const protectedRoutes = ['/settings', '/cv', '/my-events', '/manage-events', '/post-job', '/chat', '/saved', '/account', '/notifications', '/profile', '/dashboard']
    // Routes only for logged-out users
    const authRoutes = ['/login', '/register']

    const isProtected = protectedRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    )
    const isAuthRoute = authRoutes.includes(pathname)

    // Admin routes protection: requires authentication AND role === 'admin'
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        if (!user) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            url.searchParams.set('redirect', pathname)
            return NextResponse.redirect(url)
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.role !== 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/'
            url.search = ''
            return NextResponse.redirect(url)
        }
    }

    // Redirect logged-out users trying to access protected routes → /login
    if (!user && isProtected) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', pathname)
        return NextResponse.redirect(url)
    }

    // Role-based protection: Student-only routes (/cv, /profile, /my-events) cannot be accessed by organizers
    const studentOnlyRoutes = ['/cv', '/profile', '/my-events']
    const isStudentOnlyRoute = studentOnlyRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    )
    if (user && isStudentOnlyRoute) {
        const userRole = user.user_metadata?.role
        if (userRole === 'organizer' || userRole === 'employer') {
            const url = request.nextUrl.clone()
            url.pathname = '/manage-events'
            url.search = ''
            return NextResponse.redirect(url)
        }
    }

    // Role-based protection: Organizer-only routes (/post-job, /manage-events) cannot be accessed by students
    const orgOnlyRoutes = ['/post-job', '/manage-events']
    const isOrgOnlyRoute = orgOnlyRoutes.some(
        (route) => pathname === route || pathname.startsWith(route + '/')
    )
    if (user && isOrgOnlyRoute) {
        const userRole = user.user_metadata?.role
        if (userRole === 'student' || userRole === 'candidate') {
            const url = request.nextUrl.clone()
            url.pathname = '/my-events'
            url.search = ''
            return NextResponse.redirect(url)
        }
    }

    // Redirect logged-in users trying to access /login or /register
    if (user && isAuthRoute) {
        const roleParam = request.nextUrl.searchParams.get('role')
        const redirectParam = request.nextUrl.searchParams.get('redirect')
        if (redirectParam && redirectParam.startsWith('/')) {
            const url = request.nextUrl.clone()
            url.pathname = redirectParam
            url.search = ''
            return NextResponse.redirect(url)
        }
        const userRole = user.user_metadata?.role
        const isOrganizer = roleParam === 'organizer' || userRole === 'organizer' || userRole === 'employer'
        const url = request.nextUrl.clone()
        url.pathname = isOrganizer ? '/for-employers' : '/'
        url.search = ''
        return NextResponse.redirect(url)
    }

    return supabaseResponse
}
