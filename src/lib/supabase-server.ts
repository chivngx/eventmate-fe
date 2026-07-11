import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'

/**
 * Supabase server client for use in Server Components, Route Handlers,
 * and Server Actions.
 *
 * Reads/writes the auth session from httpOnly cookies (set by the browser
 * client + refreshed in middleware). NEVER expose the service-role key here.
 *
 * Usage:
 * import { createServerSupabaseClient } from '@/lib/supabase-server'
 * const supabase = await createServerSupabaseClient()
 * const { data: { user } } = await supabase.auth.getUser()
 */
export async function createServerSupabaseClient() {
 const cookieStore = await cookies()
 const supabaseUrl =
 process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
 const supabaseAnonKey =
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

 return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
 cookies: {
 getAll() {
 return cookieStore.getAll()
 },
 setAll(cookiesToSet) {
 try {
 cookiesToSet.forEach(({ name, value, options }) =>
 cookieStore.set(name, value, options)
 )
 } catch {
 // The `setAll` method was called from a Server Component.
 // This can be ignored if middleware refreshes the session.
 }
 },
 },
 })
}
