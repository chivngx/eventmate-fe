import type { Metadata } from "next"
import CompanyListView from "@/features/company/CompanyListView"

export const metadata: Metadata = {
  title: "Đơn vị & Ban tổ chức sự kiện",
  description: "Khám phá các doanh nghiệp, công ty truyền thông và ban tổ chức sự kiện uy tín tại Đà Nẵng.",
}

export default function CompaniesPage() {
  return <CompanyListView />
}
