import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

/**
 * Supabase browser client (shared singleton).
 *
 * Uses @supabase/ssr's createBrowserClient which stores the session in
 * httpOnly cookies (NOT localStorage like the old supabase-js default),
 * mitigating XSS-based session theft. The session is refreshed by
 * middleware (src/lib/supabase-middleware.ts) on every navigation.
 *
 * Server Components / Route Handlers should NOT use this — import
 * `createServerSupabaseClient` from `@/lib/supabase-server` instead.
 */
const supabaseUrl =
 process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey =
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder-anon-key'

export const supabase = createBrowserClient<Database>(
 supabaseUrl,
 supabaseAnonKey
)
