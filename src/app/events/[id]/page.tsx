import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import EventDetailView from "@/features/event/EventDetailView"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")

  let query = supabase
    .from("events")
    .select("title, description, position_type, category, profiles:organizer_id(full_name)")

  if (isUuid) {
    query = query.eq("id", id)
  } else {
    query = query.eq("slug", id)
  }

  const { data } = await query.maybeSingle()

  if (data) {
    const orgName = (data.profiles as any)?.full_name
    const title = `${data.title}${orgName ? ` - ${orgName}` : ""} | EventMate`
    const description = data.description
      ? data.description.slice(0, 160).replace(/\n+/g, " ")
      : `Tuyển dụng ${data.position_type || "nhân sự sự kiện"} cho ${data.title} tại Đà Nẵng trên EventMate.`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
      },
    }
  }

  return {
    title: "Chi tiết sự kiện | EventMate",
    description: "Thông tin chi tiết về sự kiện, vị trí tuyển dụng và yêu cầu tham gia trên EventMate.",
  }
}

export default function EventDetailPage() {
  return <EventDetailView />
}
