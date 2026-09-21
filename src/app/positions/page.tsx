import type { Metadata } from "next"
import EventSearchListView from "@/features/event/EventSearchListView"

export const metadata: Metadata = {
  title: "Vị trí tuyển dụng Sự kiện",
  description: "Các vị trí tuyển dụng nhân sự sự kiện: Lễ tân, Check-in, Hậu cần, MC, Điều phối viên tại Đà Nẵng.",
}

export default function PositionsPage() {
  return <EventSearchListView />
}
