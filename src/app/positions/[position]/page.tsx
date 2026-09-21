import type { Metadata } from "next"
import EventSearchListView from "@/features/event/EventSearchListView"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ position: string }>
}): Promise<Metadata> {
  const { position } = await params
  const decoded = decodeURIComponent(position).replace(/-/g, " ")
  const title = `Việc làm sự kiện vị trí ${decoded.toUpperCase()} tại Đà Nẵng`
  return {
    title,
    description: `Khám phá các cơ hội việc làm và sự kiện cho vị trí ${decoded} tại Đà Nẵng trên EventMate.`,
  }
}

export default async function PositionDetailPage({
  params,
}: {
  params: Promise<{ position: string }>
}) {
  const { position } = await params
  const decoded = decodeURIComponent(position)
  return <EventSearchListView initialPosition={decoded} />
}
