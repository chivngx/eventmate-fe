import type { Metadata } from "next"
import { Suspense } from "react"
import EventSearchListView from "@/features/event/EventSearchListView"

export const metadata: Metadata = {
  title: "Khám phá Sự kiện & Việc làm",
  description: "Khám phá các sự kiện, lễ hội và cơ hội việc làm sự kiện hấp dẫn tại Đà Nẵng.",
}

export default function EventsPage() {
  return (
    <Suspense fallback={null}>
      <EventSearchListView />
    </Suspense>
  )
}
