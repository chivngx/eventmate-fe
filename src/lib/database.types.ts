/**
 * Supabase database type definitions.
 *
 * Placeholder until generated via `supabase gen types typescript` from the
 * live database. Typed as a permissive `any`-shaped Database so the SSR
 * clients compile without breaking existing call sites (which all use
 * untyped `.from('table')` queries).
 *
 * TODO (Phase 2): run `supabase gen types typescript --project-id vncgqeaslscpliadivod > src/lib/database.types.ts`
 * and replace this file to get end-to-end type safety.
 */
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
