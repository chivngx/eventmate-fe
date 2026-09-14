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
import { GraduationCap, Phone, Sparkles, Save, FileText, User, Eye, Shirt, Ruler, ShieldCheck } from "lucide-react"
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

  // State form CV cơ bản
  const [phone, setPhone] = useState("")
  const [university, setUniversity] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState("")

  // State chuyên biệt cho nhân sự sự kiện
  const [shirtSize, setShirtSize] = useState("M")
  const [height, setHeight] = useState("")
  const [zaloPhone, setZaloPhone] = useState("")
  const [reliabilityScore, setReliabilityScore] = useState(100)

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
        setShirtSize(data.shirt_size || "M")
        setHeight(data.height ? data.height.toString() : "")
        setZaloPhone(data.zalo_phone || "")
        setReliabilityScore(data.reliability_score ?? 100)
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
          skills,
          shirt_size: shirtSize || null,
          height: height ? parseInt(height) : null,
          zalo_phone: zaloPhone || null
        })
        .eq("id", user.id)

      if (error) {
        alert(getUserFacingMessage(error, "Lỗi khi lưu CV. Vui lòng thử lại."))
      } else {
        alert("🎉 Đã lưu Hồ sơ năng lực thành công! Mức độ hoàn thiện CV của bạn trên hệ thống đã được cập nhật tự động.")
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
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600 shrink-0">
              <FileText className="w-5 h-5" />
            </span>
            <span className="min-w-0">Hồ sơ Năng lực Sự kiện (CV)</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Bổ sung đầy đủ size áo, chiều cao và liên hệ Zalo giúp bạn tăng <strong className="text-slate-600 font-semibold">300% cơ hội</strong> được Ban tổ chức lựa chọn.
          </p>
        </div>

        {/* Identity card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 bg-card border border-border rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-border shrink-0 rounded-full">
              <AvatarImage src={avatarUrl} className="object-cover rounded-full" />
              <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-xl rounded-full">
                {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="font-semibold text-foreground truncate">{fullName || "Chưa cập nhật"}</p>
              <p className="text-sm text-muted-foreground truncate">{email || "—"}</p>
              <span className="inline-flex items-center text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                {role === "student" ? "Nhân sự sự kiện" : "Nhà tuyển nhân sự"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl text-emerald-800 self-stretch sm:self-auto justify-center">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold">Điểm uy tín: {reliabilityScore}/100</span>
              <p className="text-[11px] text-emerald-600">Chuyên cần, đúng giờ</p>
            </div>
          </div>
        </div>

        {/* Form card */}
        <Card className="border border-border shadow-sm rounded-xl bg-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-foreground">Chi tiết Hồ sơ</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Cập nhật thông số sự kiện, liên hệ, học vấn và kỹ năng để ứng tuyển nhanh chóng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveCV} className="space-y-6">

              {/* Thông số chuyên biệt cho nhân sự sự kiện */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Shirt className="w-4 h-4 text-primary" /> Thông số Sự kiện & Đồng phục
                  </h3>
                  <span className="text-xs text-slate-500">Cần thiết khi Ban tổ chức cấp đồng phục và sắp xếp vị trí</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="shirtSize" className="text-xs font-semibold text-slate-700">
                      Size áo đồng phục
                    </Label>
                    <select
                      id="shirtSize"
                      value={shirtSize}
                      onChange={e => setShirtSize(e.target.value)}
                      className="w-full h-11 px-3 rounded-lg bg-white border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="S">Size S (Dưới 50kg)</option>
                      <option value="M">Size M (50 - 60kg)</option>
                      <option value="L">Size L (60 - 70kg)</option>
                      <option value="XL">Size XL (70 - 80kg)</option>
                      <option value="XXL">Size XXL (Trên 80kg)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="height" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-slate-500" /> Chiều cao (cm)
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="VD: 165"
                      value={height}
                      onChange={e => setHeight(e.target.value)}
                      className="h-11 rounded-lg bg-white border-slate-300 focus-visible:ring-primary/20 text-sm font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="zaloPhone" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> SĐT Zalo điều phối
                    </Label>
                    <Input
                      id="zaloPhone"
                      placeholder="VD: 0905123456"
                      value={zaloPhone}
                      onChange={e => setZaloPhone(e.target.value)}
                      className="h-11 rounded-lg bg-white border-slate-300 focus-visible:ring-primary/20 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Phone + University grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-600" /> Số điện thoại chính
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
                    <GraduationCap className="w-4 h-4 text-slate-600" /> Trường Đại học / Cao đẳng
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
                  <Sparkles className="w-4 h-4 text-slate-600" /> Kỹ năng nổi bật
                </Label>
                <Input
                  id="skills"
                  placeholder="Giao tiếp, Lễ tân, Check-in, Hậu cần, MC, Quản lý thời gian... (cách nhau bằng dấu phẩy)"
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
                  placeholder="Viết một đoạn ngắn giới thiệu về tính cách, kinh nghiệm chạy sự kiện của bạn để tạo ấn tượng tốt nhất với Ban tổ chức..."
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
                  className="rounded-lg border-border hover:bg-slate-100 text-foreground font-medium h-11 px-5 w-full sm:w-auto cursor-pointer"
                >
                  <Eye className="w-4 h-4 mr-2" /> Xem trước & Tải CV
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 px-6 transition-colors shadow-sm w-full sm:w-auto cursor-pointer"
                >
                  {saving ? "Đang lưu..." : (<><Save className="w-4 h-4 mr-2" /> Lưu Hồ sơ năng lực</>)}
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
          zalo_phone: zaloPhone,
          shirt_size: shirtSize,
          height: height ? parseInt(height) : undefined,
          reliability_score: reliabilityScore,
          university: university,
          bio: bio,
          skills: skills
        }}
      />
    </MainLayout>
  )
}
