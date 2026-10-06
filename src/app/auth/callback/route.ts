import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
    const { origin } = request.nextUrl
    const code = request.nextUrl.searchParams.get('code')
    const redirectParam = request.nextUrl.searchParams.get('redirect')
    const roleParam = request.nextUrl.searchParams.get('role')

    let next = redirectParam && redirectParam.startsWith('/')
        ? redirectParam
        : '/'

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
            return NextResponse.redirect(`${origin}/?auth=login&error=auth_failed`)
        }

        // Ensure user profile is initialized
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null

            // 1. Kiểm tra profile hiện có trong DB
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id, role, full_name, bio, avatar_url')
                .eq('id', user.id)
                .maybeSingle()

            // 2. Xác định vai trò: NẾU ĐÃ CÓ PROFILE THÌ GIỮ NGUYÊN 100%, KHÔNG BAO GIỜ GHI ĐÈ
            const effectiveRole = existingProfile?.role || (roleParam === 'organizer' ? 'organizer' : (user.user_metadata?.role || 'student'))
            const isOrg = effectiveRole === 'organizer'
            const finalFullName = (isOrg && user.user_metadata?.company_name)
                ? user.user_metadata.company_name
                : (user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Thành viên mới')
            const bio = user.user_metadata?.description || user.user_metadata?.bio || null

            if (!existingProfile) {
                // Người dùng mới tạo tài khoản lần đầu qua Google OAuth
                await supabase.from('profiles').insert({
                    id: user.id,
                    email: user.email || "",
                    role: effectiveRole,
                    full_name: finalFullName,
                    avatar_url: avatarUrl,
                    ...(bio ? { bio } : {}),
                })
            } else {
                // Tài khoản đã tồn tại -> KHÔNG ĐƯỢC THAY ĐỔI ROLE CỦA HỌ
                const updatePayload: Record<string, any> = {}

                // Chỉ gán role nếu profile cũ trong DB bị null/undefined
                if (!existingProfile.role && effectiveRole) {
                    updatePayload.role = effectiveRole
                }

                // Chỉ cập nhật full_name nếu profile chưa có tên hoặc đang là placeholder mặc định
                if (!existingProfile.full_name || existingProfile.full_name === 'Thành viên mới') {
                    if (finalFullName) {
                        updatePayload.full_name = finalFullName
                    }
                }

                // Chỉ bổ sung avatar nếu profile chưa có
                if (!existingProfile.avatar_url && avatarUrl) {
                    updatePayload.avatar_url = avatarUrl
                }

                // Chỉ bổ sung bio nếu profile chưa có
                if (!existingProfile.bio && bio) {
                    updatePayload.bio = bio
                }

                if (Object.keys(updatePayload).length > 0) {
                    await supabase.from('profiles').update(updatePayload).eq('id', user.id)
                }
            }

            // 3. Đồng bộ user_metadata.role với role thực tế trong DB để middleware luôn nhận diện đúng
            if (user.user_metadata?.role !== effectiveRole) {
                await supabase.auth.updateUser({
                    data: { role: effectiveRole },
                })
            }

            // 4. Tránh redirect nhầm vào route dành riêng cho role khác
            if (effectiveRole === 'organizer' && (next.startsWith('/my-events') || next.startsWith('/cv') || next.startsWith('/profile'))) {
                next = '/dashboard'
            } else if (effectiveRole === 'student' && (next.startsWith('/manage-events') || next.startsWith('/post-job'))) {
                next = '/dashboard'
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