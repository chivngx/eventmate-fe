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

/** Dan Nang wards that currently have active/valid events — used in Hero search and event filters. */
export function useActiveWards() {
    return useQuery({
        queryKey: ["active-wards"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("events")
                .select("ward_id, danang_wards(id, name), status, event_date, end_date, application_deadline")
                .not("ward_id", "is", null)
                .neq("status", "closed")
                .neq("status", "cancelled")

            if (error) throw error

            const wardMap = new Map<number, { id: number; name: string }>()
            const now = new Date()

            data?.forEach((item: any) => {
                const ward = item.danang_wards
                if (!ward || !ward.id || !ward.name) return

                const isUpcoming = item.status === "upcoming" || !item.status
                // Check if event or application deadline has not expired
                const isNotExpired =
                    (!item.application_deadline && !item.event_date && !item.end_date) ||
                    (item.application_deadline && new Date(item.application_deadline) >= now) ||
                    (item.event_date && new Date(item.event_date) >= now) ||
                    (item.end_date && new Date(item.end_date) >= now)

                if (isUpcoming && isNotExpired) {
                    wardMap.set(ward.id, {
                        id: ward.id,
                        name: ward.name,
                    })
                }
            })

            return Array.from(wardMap.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"))
        },
        staleTime: 5 * 60_000,
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
