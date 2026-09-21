import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatSalary(amount?: number | null, type?: string | null, fallback = "Thỏa thuận"): string {
    if (!amount || amount === 0 || type === "volunteer") return "Tình nguyện viên"
    const formatted = new Intl.NumberFormat("vi-VN").format(amount) + "đ"
    if (type === "per_hour") return `${formatted} / h`
    if (type === "per_shift") return `${formatted} / ca`
    if (type === "per_event") return `${formatted} / sự kiện`
    if (type === "per_month") return `${formatted} / tháng`
    return formatted || fallback
}

export function formatTimeAgo(dateString?: string | null): string {
    if (!dateString) return "Vừa xong"
    const diff = Date.now() - new Date(dateString).getTime()
    if (isNaN(diff) || diff < 0) return "Vừa xong"
    const minutes = Math.floor(diff / (1000 * 60))
    if (minutes < 1) return "Vừa xong"
    if (minutes < 60) return `${minutes} phút trước`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} giờ trước`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} ngày trước`
    const months = Math.floor(days / 30)
    return `${months} tháng trước`
}

export function formatShiftTime(start?: string | null, end?: string | null): string | null {
    if (!start && !end) return null
    const s = start ? start.slice(0, 5) : ""
    const e = end ? end.slice(0, 5) : ""
    if (s && e) return `${s} - ${e}`
    return s || e
}