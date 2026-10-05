"use client"

import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

const STALE_TIME = 10 * 60 * 1000

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
        staleTime: STALE_TIME,
    })
}

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

            const now = new Date()
            const wardMap = new Map<number, { id: number; name: string }>()

            data?.forEach((item: any) => {
                const ward = item.danang_wards
                if (!ward?.id || !ward?.name) return

                const isUpcoming = !item.status || item.status === "upcoming"
                const dates = [item.application_deadline, item.event_date, item.end_date].filter(Boolean)
                const isNotExpired = dates.length === 0 || dates.some((d) => new Date(d) >= now)

                if (isUpcoming && isNotExpired) {
                    wardMap.set(ward.id, { id: ward.id, name: ward.name })
                }
            })

            return Array.from(wardMap.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"))
        },
        staleTime: 5 * 60 * 1000,
    })
}

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
        staleTime: STALE_TIME,
    })
}

export function useEventCategories() {
    return useQuery({
        queryKey: ["event-categories"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("event_categories")
                .select("name, slug")
                .order("name", { ascending: true })
            if (error) throw error
            return data ?? []
        },
        staleTime: STALE_TIME,
    })
}
