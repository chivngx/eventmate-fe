import type { Metadata } from "next"
import NotificationsView from "@/features/notifications/NotificationsView"

export const metadata: Metadata = {
  title: "Thông báo | EventMate",
  description: "Cập nhật tiến độ ứng tuyển và thông tin mới nhất từ Ban tổ chức sự kiện.",
}

export default function NotificationsPage() {
  return <NotificationsView embedded={true} />
}
