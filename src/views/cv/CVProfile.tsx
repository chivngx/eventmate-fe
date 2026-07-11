"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GraduationCap, Phone, Sparkles, Save, FileText, User, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import CVPreviewModal from "@/components/cv/CVPreviewModal"
import { SkeletonGenericPage } from "@/components/ui/Skeleton"

export default function CVProfile() {
  const navigate = useNavigate()
  // 🔒 P1.1: user + role từ context (thay getUser() + profiles.select lặp)
  const { user, role, loading: authLoading } = useUser()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false)

  // State thông tin người dùng bổ sung hiển thị trực quan
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")

  // State form CV
  const [phone, setPhone] = useState("")
  const [university, setUniversity] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState("")

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    const fetchCV = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (data) {
        setFullName(data.full_name || "")
        setEmail(data.email || user.email || "")
        setAvatarUrl(data.avatar_url || "")
        setPhone(data.phone || "")
        setUniversity(data.university || "")
        setBio(data.bio || "")
        setSkills(data.skills || "")
      }
      setLoading(false)
    }
    fetchCV()
  }, [user, authLoading, navigate])

  const handleSaveCV = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (user) {
      // Cập nhật dữ liệu lên bảng profiles
      // Database Trigger ngầm (calculate_cv_completion) sẽ tự động tính lại số điểm % hoàn thiện
      const { error } = await supabase
        .from("profiles")
        .update({
          phone,
          university,
          bio,
          skills
        })
        .eq("id", user.id)

      if (error) {
        alert(getUserFacingMessage(error, "Lỗi khi lưu CV. Vui lòng thử lại."))
      } else {
        alert("🎉 Đã lưu Hồ sơ CV thành công! Mức độ hoàn thiện CV của bạn trên hệ thống đã được cập nhật tự động.")
      }
    }
    setSaving(false)
  }

  if (loading) return <SkeletonGenericPage />

  return (
    <MainLayout role={role || "student"}>
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-accent text-primary shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <span className="min-w-0">Hồ sơ Năng lực (CV)</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Bổ sung đầy đủ thông tin giúp bạn tăng <strong className="text-primary font-semibold">300% cơ hội</strong> được Ban tổ chức lựa chọn ứng tuyển.
          </p>
        </div>

        {/* Identity card */}
        <div className="flex items-center gap-4 p-4 sm:p-5 bg-card border border-border rounded-xl shadow-sm">
          <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-border shrink-0 rounded-full">
            <AvatarImage src={avatarUrl} className="object-cover rounded-full" />
            <AvatarFallback className="bg-accent text-primary font-semibold text-xl rounded-full">
              {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="font-semibold text-foreground truncate">{fullName || "Chưa cập nhật"}</p>
            <p className="text-sm text-muted-foreground truncate">{email || "—"}</p>
            <span className="inline-flex items-center text-xs font-medium text-primary bg-accent border border-primary/20 px-2 py-0.5 rounded">
              {role === "student" ? "Ứng viên" : "Nhà tuyển dụng"}
            </span>
          </div>
        </div>

        {/* Form card */}
        <Card className="border border-border shadow-sm rounded-xl bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Chi tiết CV</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Cập nhật thông tin liên hệ, học vấn và kỹ năng để tăng cơ hội trúng tuyển.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCV} className="space-y-6">

              {/* Phone + University grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> Số điện thoại liên hệ
                  </Label>
                  <Input
                    id="phone"
                    placeholder="Nhập số điện thoại liên hệ..."
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="h-11 rounded-lg bg-card border-border focus-visible:ring-ring text-sm font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" /> Trường Đại học / Cao đẳng
                  </Label>
                  <Input
                    id="university"
                    placeholder="Ví dụ: Đại học FPT, Đại học Bách Khoa..."
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="h-11 rounded-lg bg-card border-border focus-visible:ring-ring text-sm font-medium"
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills" className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Kỹ năng nổi bật
                </Label>
                <Input
                  id="skills"
                  placeholder="Giao tiếp, Chụp ảnh, Quản lý thời gian, Teamwork... (cách nhau bằng dấu phẩy)"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  className="h-11 rounded-lg bg-card border-border focus-visible:ring-ring text-sm font-medium"
                />
                <p className="text-xs text-muted-foreground">Ngăn cách các kỹ năng bằng dấu phẩy.</p>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-medium text-foreground">
                  Giới thiệu bản thân (Bio)
                </Label>
                <textarea
                  id="bio"
                  placeholder="Viết một đoạn ngắn giới thiệu về tính cách, đam mê và kinh nghiệm của bạn để tạo ấn tượng tốt nhất với Ban tổ chức..."
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={5}
                  className="w-full rounded-lg bg-card border border-border p-3 text-sm font-medium focus:outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-ring/40 transition-colors resize-none leading-relaxed"
                />
              </div>

              {/* Action row */}
              <div className="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  onClick={() => setCvPreviewOpen(true)}
                  variant="outline"
                  className="rounded-lg border-border hover:bg-accent text-foreground font-medium h-11 px-5 w-full sm:w-auto"
                >
                  <Eye className="w-4 h-4 mr-2" /> Xem trước & Tải CV
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 px-6 transition-colors shadow-sm w-full sm:w-auto"
                >
                  {saving ? "Đang lưu..." : (<><Save className="w-4 h-4 mr-2" /> Lưu Hồ sơ CV</>)}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <CVPreviewModal
        isOpen={cvPreviewOpen}
        onClose={() => setCvPreviewOpen(false)}
        profile={{
          full_name: fullName,
          email: email,
          avatar_url: avatarUrl,
          phone: phone,
          university: university,
          bio: bio,
          skills: skills
        }}
      />
    </MainLayout>
  )
}
