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
            const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null
            const isOrg = userRole === 'organizer' || user.user_metadata?.role === 'organizer'
            const finalFullName = (isOrg && user.user_metadata?.company_name)
                ? user.user_metadata.company_name
                : (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Thành viên mới')
            const bio = user.user_metadata?.description || user.user_metadata?.bio || null
            const scale = user.user_metadata?.scale || user.user_metadata?.company_field || null

            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, role, full_name, bio, scale')
                .eq('id', user.id)
                .maybeSingle()

            const profilePayload: Record<string, any> = {
                email: user.email || "",
                role: userRole,
                full_name: finalFullName,
                avatar_url: avatarUrl,
            }
            if (bio) profilePayload.bio = bio
            if (scale) profilePayload.scale = scale

            if (!existingProfile) {
                await supabase.from('profiles').insert({
                    id: user.id,
                    ...profilePayload,
                })
            } else {
                // Update profile if trigger created it with incomplete or default data
                const updatePayload: Record<string, any> = {}
                if (finalFullName && existingProfile.full_name !== finalFullName) {
                    updatePayload.full_name = finalFullName
                }
                if (bio && !existingProfile.bio) {
                    updatePayload.bio = bio
                }
                if (scale && !existingProfile.scale) {
                    updatePayload.scale = scale
                }
                if (userRole && existingProfile.role !== userRole) {
                    updatePayload.role = userRole
                }
                if (Object.keys(updatePayload).length > 0) {
                    await supabase.from('profiles').update(updatePayload).eq('id', user.id)
                }
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