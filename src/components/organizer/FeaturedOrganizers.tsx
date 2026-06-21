import { useState, useEffect } from "react"
import { Users, Check, Plus } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface FeaturedOrganizersProps {
  events: any[]
}

export default function FeaturedOrganizers({ events }: FeaturedOrganizersProps) {
  const [followed, setFollowed] = useState<Record<string, boolean>>({})

  // Lấy các nhà tổ chức độc nhất có chiến dịch sự kiện
  const organizers = (() => {
    const orgMap: Record<string, { name: string; avatarUrl?: string; eventCount: number; id: string }> = {}
    events.forEach(event => {
      const orgId = event.organizer_id
      const orgName = event.profiles?.full_name || "Đơn vị ẩn danh"
      if (!orgMap[orgId]) {
        orgMap[orgId] = {
          id: orgId,
          name: orgName,
          avatarUrl: event.profiles?.avatar_url,
          eventCount: 0
        }
      }
      orgMap[orgId].eventCount++
    })
    return Object.values(orgMap).slice(0, 3) // Lấy top 3 câu lạc bộ / BTC tiêu biểu
  })()

  // Đồng bộ trạng thái follow từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("followed_organizers")
    if (saved) {
      try {
        setFollowed(JSON.parse(saved))
      } catch (e) {
        console.error(e)
      }
    }
  }, [])

  const handleFollow = (orgId: string) => {
    const nextState = { ...followed, [orgId]: !followed[orgId] }
    setFollowed(nextState)
    localStorage.setItem("followed_organizers", JSON.stringify(nextState))
  }

  if (organizers.length === 0) return null

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-100 p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-slate-900 text-sm tracking-tight flex items-center gap-2">
          <Users className="w-4 h-4 text-emerald-600" /> Nhà tổ chức tiêu biểu 🌟
        </h3>
      </div>

      <div className="space-y-4 pt-1">
        {organizers.map((org) => {
          const isFollowing = !!followed[org.id]

          return (
            <div key={org.id} className="flex items-center justify-between gap-3 group">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-slate-100 shrink-0 rounded-xl">
                  <AvatarFallback className="rounded-xl bg-slate-50 text-slate-700 font-extrabold text-sm group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                    {org.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-black text-slate-800 truncate" title={org.name}>
                    {org.name}
                  </p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                    {org.eventCount} chiến dịch đang mở
                  </p>
                </div>
              </div>

              <Button
                onClick={() => handleFollow(org.id)}
                size="sm"
                variant={isFollowing ? "secondary" : "outline"}
                className={`h-7 px-2.5 rounded-lg text-[10px] font-black shrink-0 transition-all ${
                  isFollowing
                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "border-slate-200 hover:border-emerald-600 hover:text-emerald-600"
                }`}
              >
                {isFollowing ? (
                  <span className="flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Đang theo
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5">
                    <Plus className="w-3 h-3" /> Theo dõi
                  </span>
                )}
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
