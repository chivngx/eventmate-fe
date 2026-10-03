import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

const PROTECTED_ROUTES = [
    '/settings', '/cv', '/my-events', '/manage-events', '/post-job',
    '/chat', '/saved', '/account', '/notifications', '/profile', '/dashboard'
]
const AUTH_ROUTES = ['/login', '/register']
const STUDENT_ONLY_ROUTES = ['/cv', '/profile', '/my-events']
const ORG_ONLY_ROUTES = ['/post-job', '/manage-events']

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
        cookies: {
            getAll: () => request.cookies.getAll(),
            setAll: (cookiesToSet) => {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                supabaseResponse = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
            },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()
    const pathname = request.nextUrl.pathname

    const redirect = (to: string, search = '') => {
        const url = request.nextUrl.clone()
        url.pathname = to
        url.search = search
        return NextResponse.redirect(url)
    }

    const matchesRoute = (routes: string[]) =>
        routes.some((r) => pathname === r || pathname.startsWith(r + '/'))

    // 1. Admin route protection
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        if (!user) return redirect('/login', `?redirect=${pathname}`)

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.role !== 'admin') return redirect('/')
    }

    // 2. Protected routes require login
    if (!user && matchesRoute(PROTECTED_ROUTES)) {
        return redirect('/login', `?redirect=${pathname}`)
    }

    // 3. Role-based restrictions
    if (user) {
        const userRole = user.user_metadata?.role

        if (matchesRoute(STUDENT_ONLY_ROUTES) && (userRole === 'organizer' || userRole === 'employer')) {
            return redirect('/manage-events')
        }

        if (matchesRoute(ORG_ONLY_ROUTES) && (userRole === 'student' || userRole === 'candidate')) {
            return redirect('/my-events')
        }

        // 4. Logged-in user visiting auth routes
        if (AUTH_ROUTES.includes(pathname)) {
            const redirectParam = request.nextUrl.searchParams.get('redirect')
            if (redirectParam?.startsWith('/')) return redirect(redirectParam)

            const roleParam = request.nextUrl.searchParams.get('role')
            const isOrganizer = roleParam === 'organizer' || userRole === 'organizer' || userRole === 'employer'
            return redirect(isOrganizer ? '/for-employers' : '/')
        }
    }

    return supabaseResponse
}
