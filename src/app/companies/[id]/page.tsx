import type { Metadata } from "next"
import { supabase } from "@/lib/supabase"
import CompanyDetailView from "@/features/company/CompanyDetailView"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id || "")
  let query = supabase.from("profiles").select("full_name, bio, avatar_url")
  if (isUuid) {
    query = query.eq("id", id)
  } else {
    query = query.eq("slug", id)
  }
  const { data } = await query.maybeSingle()

  if (data) {
    const title = `${data.full_name} | Đơn vị tổ chức trên EventMate`
    const description = data.bio
      ? data.bio.slice(0, 160).replace(/\n+/g, " ")
      : `Xem thông tin và các sự kiện tuyển dụng của ${data.full_name} tại Đà Nẵng trên EventMate.`
    const imageUrl = data.avatar_url || "/images/logo/eventmate-logo-square-512.png"

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: imageUrl,
            alt: `Logo ${data.full_name}`,
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

  return {
    title: "Thông tin đơn vị tổ chức | EventMate",
    description: "Chi tiết hồ sơ và danh sách sự kiện của đơn vị tổ chức trên EventMate.",
    openGraph: {
      title: "Thông tin đơn vị tổ chức | EventMate",
      description: "Chi tiết hồ sơ và danh sách sự kiện của đơn vị tổ chức trên EventMate.",
      images: [{ url: "/images/logo/eventmate-logo-square-512.png" }],
    },
    twitter: {
      card: "summary",
      images: ["/images/logo/eventmate-logo-square-512.png"],
    },
  }
}

export default function CompanyDetailPage() {
  return <CompanyDetailView />
}
