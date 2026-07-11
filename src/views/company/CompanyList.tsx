"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import { Building2, Search, MapPin, Mail, Phone, CalendarDays, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function CompanyList() {
  const navigate = useNavigate()
  // 🔒 P1.1: role từ context (thay getUser() + profiles.select lặp)
  const { user, role } = useUser()
  const userRole = user ? (role || "student") : "guest"
  const [organizers, setOrganizers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      // Fetch organizer profiles & their events to count
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          bio,
          slug,
          university,
          email,
          phone,
          events (id)
        `)
        .eq("role", "organizer")

      if (error) {
        console.error("Lỗi tải danh sách BTC:", error)
      } else if (data) {
        setOrganizers(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const filteredOrganizers = organizers.filter(org => {
    const nameMatch = org.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const bioMatch = org.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    const uniMatch = org.university?.toLowerCase().includes(searchTerm.toLowerCase())
    return nameMatch || bioMatch || uniMatch
  })

  return (
    <MainLayout role={userRole}>
      <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* HEADER — flat, no blur blob, no gradient */}
        <header className="mb-8 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-slate-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                Danh sách Ban Tổ Chức
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 max-w-2xl">
                Kết nối với các nhà tổ chức sự kiện uy tín tại Đà Nẵng, xem hồ sơ hoạt động và khám phá các cơ hội cống hiến mới.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Tìm kiếm ban tổ chức, trường học, mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-lg border-slate-200 bg-white focus:border-slate-400 font-medium text-sm"
            />
          </div>
        </header>

        {/* CONTENT */}
        {loading ? (
          <div className="flex justify-center items-center py-24 text-slate-500 font-medium">
            Đang tải danh sách các Ban tổ chức...
          </div>
        ) : filteredOrganizers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-foreground">Không tìm thấy Ban tổ chức nào</h3>
            <p className="text-slate-500 text-sm mt-1">Hãy thử tìm kiếm với từ khóa khác.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {filteredOrganizers.map((org, index) => {
              const eventCount = org.events?.length || 0
              const displayName = org.full_name || "Ban tổ chức ẩn danh"
              const orgLink = `/companies/${org.slug || org.id}`

              return (
                <article
                  key={org.id}
                  style={{ animationDelay: `${index * 40}ms` }}
                  onClick={() => navigate(orgLink)}
                  className="group bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-3"
                >
                  {/* Top: logo + event count badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-14 h-14 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0">
                      <Avatar className="h-full w-full rounded-lg">
                        <AvatarImage src={org.avatar_url} className="object-cover" />
                        <AvatarFallback className="rounded-lg bg-slate-100 text-slate-600 text-xl font-bold">
                          {displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    {eventCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                        <CalendarDays className="w-3 h-3" />
                        {eventCount} sự kiện
                      </span>
                    )}
                  </div>

                  {/* Body: name + university + bio */}
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-slate-900 transition-colors">
                      {displayName}
                    </h3>
                    {org.university && (
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{org.university}</span>
                      </p>
                    )}
                    <p className="text-sm text-slate-500 line-clamp-2 mt-2">
                      {org.bio || "Chưa có bài giới thiệu chi tiết về ban tổ chức này."}
                    </p>
                  </div>

                  {/* Footer: contact + action indicator */}
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 text-xs text-slate-400 min-w-0">
                      {org.email && (
                        <span className="flex items-center gap-1 min-w-0" title={org.email}>
                          <Mail className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{org.email}</span>
                        </span>
                      )}
                      {org.phone && !org.email && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 shrink-0" />
                          <span>{org.phone}</span>
                        </span>
                      )}
                      {!org.email && !org.phone && (
                        <span className="text-slate-300">Chưa có liên hệ</span>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
