import type { Metadata } from "next"
import AdminDashboardView from "@/features/admin/AdminDashboardView"

export const metadata: Metadata = {
  title: "Quản trị hệ thống",
  description: "Trang quản trị và kiểm duyệt sự kiện EventMate.",
}

export default function AdminPage() {
  return <AdminDashboardView />
}