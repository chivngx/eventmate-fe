import type { Metadata } from "next"
import OrganizerLandingView from "@/features/organizer/OrganizerLandingView"

export const metadata: Metadata = {
  title: "Dành cho Ban Tổ Chức & Doanh Nghiệp — EventMate Đà Nẵng",
  description:
    "Giải pháp tuyển dụng và quản lý nhân sự sự kiện thông minh hàng đầu tại Đà Nẵng. Tiếp cận hơn 50,000+ sinh viên, CTV, PG/PB, Supporter sự kiện đã xác thực.",
}

export default function ForEmployersPage() {
  return <OrganizerLandingView />
}
