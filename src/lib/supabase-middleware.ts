import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/database.types'

const PROTECTED_ROUTES = [
    '/settings', '/cv', '/my-events', '/manage-events', '/post-job',
    '/chat', '/saved', '/account', '/notifications', '/profile', '/dashboard'
]
const AUTH_ROUTES = ['/login', '/register', '/reset-password']
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

    // 1. Auth routes interception -> always redirect to modal on home page
    if (pathname === '/login') {
        const search = request.nextUrl.searchParams.toString()
        const redirectParam = request.nextUrl.searchParams.get('redirect')
        if (user) return redirect(redirectParam?.startsWith('/') ? redirectParam : '/')
        return redirect('/', `?auth=login${search ? `&${search}` : ''}`)
    }
    if (pathname === '/register') {
        const search = request.nextUrl.searchParams.toString()
        if (user) return redirect('/')
        return redirect('/', `?auth=register${search ? `&${search}` : ''}`)
    }
    if (pathname === '/reset-password') {
        const search = request.nextUrl.searchParams.toString()
        return redirect('/', `?auth=forgot${search ? `&${search}` : ''}`)
    }

    // 2. Admin route protection
    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
        if (!user) return redirect('/', `?auth=login&role=organizer&redirect=${pathname}`)

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .maybeSingle()

        if (profile?.role !== 'admin') return redirect('/')
    }

    // 3. Protected routes require login -> redirect to home and trigger modal
    if (!user && matchesRoute(PROTECTED_ROUTES)) {
        return redirect('/', `?auth=login&redirect=${pathname}`)
    }

    // 4. Role-based restrictions
    if (user) {
        const userRole = user.user_metadata?.role

        if (matchesRoute(STUDENT_ONLY_ROUTES) && (userRole === 'organizer' || userRole === 'employer')) {
            return redirect('/manage-events')
        }

        if (matchesRoute(ORG_ONLY_ROUTES) && (userRole === 'student' || userRole === 'candidate')) {
            return redirect('/my-events')
        }
    }

    return supabaseResponse
}
