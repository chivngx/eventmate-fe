import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
    const { origin } = request.nextUrl
    const code = request.nextUrl.searchParams.get('code')
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const roleParam = request.nextUrl.searchParams.get('role')

    let next = redirectParam && redirectParam.startsWith('/')
        ? redirectParam
        : (roleParam === 'organizer' ? '/for-employers' : '/')

    if (code) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

        const cookiesToSet: { name: string; value: string; options?: any }[] = []

        const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(newCookies) {
                    cookiesToSet.push(...newCookies)
                },
            },
        })

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
            console.error('[auth/callback] exchangeCodeForSession failed:', error)
            return NextResponse.redirect(`${origin}/login?error=auth_failed`)
        }

        // Ensure user profile is initialized
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const userRole = roleParam === 'organizer' ? 'organizer' : (user.user_metadata?.role || 'student')
            const fullName = user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Thành viên mới'
            const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('id', user.id)
                .maybeSingle()

            if (!existingProfile) {
                await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email || "",
                    full_name: fullName,
                    role: userRole,
                    avatar_url: avatarUrl,
                })
            }

            const finalRole = existingProfile?.role || userRole
            if (!redirectParam && finalRole === 'organizer') {
                next = '/for-employers'
            }
        }

        const response = NextResponse.redirect(`${origin}${next}`)
        cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
        )
        return response
    }

    return NextResponse.redirect(`${origin}${next}`)
}