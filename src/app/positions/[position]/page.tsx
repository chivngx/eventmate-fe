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
  const description = `Khám phá các cơ hội việc làm và sự kiện cho vị trí ${decoded} tại Đà Nẵng trên EventMate.`
  const imageUrl = "/images/logo/eventmate-logo-square-512.png"
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: `Việc làm sự kiện ${decoded} - EventMate`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: [imageUrl],
    },
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
