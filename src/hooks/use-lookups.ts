"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

/**
 * React Query hooks for shared, mostly-static lookup data.
 *
 * These tables (danang_wards, job_positions, event_categories) are read-only
 * from the app's perspective and rarely change. Caching them with a long
 * staleTime eliminates redundant fetches across components (notch-navbar mega
 * menu, StudentDashboard filters, EventFormModal dropdowns all fetch the same
 * data).
 */

/** Dan Nang wards (phường/xã) — used in filters + event form. */
export function useWards() {
  return useQuery({
    queryKey: ["wards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("danang_wards")
        .select("id, name")
        .order("name", { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 10 * 60_000, // 10 min — wards rarely change
  })
}

/** Job positions — used in navbar mega menu + event form. */
export function useJobPositions() {
  return useQuery({
    queryKey: ["job-positions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_positions")
        .select("name, slug")
        .order("name", { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 10 * 60_000,
  })
}

/** Event categories — used in navbar mega menu + event form + filters. */
export function useEventCategories() {
  return useQuery({
    queryKey: ["event-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_categories")
        .select("name, slug, icon, color")
        .order("name", { ascending: true })
      if (error) throw error
      return data ?? []
    },
    staleTime: 10 * 60_000,
  })
}
