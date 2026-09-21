import type { Metadata } from "next"
import SavedEventsView from "@/features/event/SavedEventsView"

export const metadata: Metadata = {
  title: "Sự kiện đã lưu",
  description: "Danh sách các sự kiện bạn đã đánh dấu để theo dõi và ứng tuyển sau.",
}

export default function SavedEventsPage() {
  return <SavedEventsView />
}
