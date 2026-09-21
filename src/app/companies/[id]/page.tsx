import type { Metadata } from "next"
import CompanyDetailView from "@/features/company/CompanyDetailView"

export const metadata: Metadata = {
  title: "Thông tin đơn vị tổ chức",
  description: "Chi tiết hồ sơ và danh sách sự kiện của đơn vị tổ chức trên EventMate.",
}

export default function CompanyDetailPage() {
  return <CompanyDetailView />
}
