"use client"

import { useState, useEffect } from"react"
import { useNavigate } from"@/lib/router"
import { supabase } from"@/lib/supabase"
import { getUserFacingMessage } from"@/lib/error"
import { useUser } from"@/components/providers/AuthProvider"
import MainLayout from"@/components/layout/MainLayout"
import { Input } from"@/components/ui/input"
import { Button } from"@/components/ui/button"
import { GraduationCap, Phone, Sparkles, Save, FileText, User, Eye } from"lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import CVPreviewModal from"@/components/cv/CVPreviewModal"
import { SkeletonGenericPage } from"@/components/ui/Skeleton"

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
 setFullName(data.full_name ||"")
 setEmail(data.email || user.email ||"")
 setAvatarUrl(data.avatar_url ||"")
 setPhone(data.phone ||"")
 setUniversity(data.university ||"")
 setBio(data.bio ||"")
 setSkills(data.skills ||"")
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
 alert(getUserFacingMessage(error,"Lỗi khi lưu CV. Vui lòng thử lại."))
 } else {
 alert("🎉 Đã lưu Hồ sơ CV thành công! Mức độ hoàn thiện CV của bạn trên hệ thống đã được cập nhật tự động.")
 }
 }
 setSaving(false)
 }

 if (loading) return <SkeletonGenericPage />

 return (
 <MainLayout role={role ||"student"}>
 <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

 <div className="mb-8">
 <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
 <FileText className="w-8 h-8 text-primary" />
 Hồ sơ Năng lực (CV)
 </h1>
 <p className="text-muted-foreground font-medium mt-2">
 Bổ sung đầy đủ thông tin giúp bạn tăng <strong className="text-primary">300% cơ hội</strong> được Ban tổ chức lựa chọn ứng tuyển.
 </p>
 </div>

 <div className="bg-card rounded-2xl border border-border shadow-md overflow-hidden">
 {/* BANNER NỀN TRÊN CỦA THẺ PROFILE */}
 <div className="h-32 relative bg-muted">
 <div className="absolute -bottom-10 left-8">
 <div className="w-24 h-24 bg-card rounded-2xl p-1.5 shadow-md flex items-center justify-center border border-border">
 {/* ĐÃ NÂNG CẤP: Hiển thị Avatar thực tế đồng bộ động từ tài khoản Google/DB */}
 <Avatar className="h-full w-full rounded-xl shrink-0">
 <AvatarImage src={avatarUrl} className="object-cover" />
 <AvatarFallback className="bg-accent text-primary font-black text-2xl rounded-xl">
 {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
 </AvatarFallback>
 </Avatar>
 </div>
 </div>
 </div>

 <form onSubmit={handleSaveCV} className="p-6 sm:p-8 pt-16 space-y-8">
 {/* HIỂN THỊ TÊN ĐẦY ĐỦ VÀ EMAIL TRỰC QUAN */}
 <div className="-mt-2 bg-muted/50 p-4 rounded-xl border border-border grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm font-bold text-foreground">
 <p>Họ và tên: <span className="text-foreground font-black ml-1">{fullName ||"Chưa cập nhật"}</span></p>
 <p>Phân quyền: <span className="text-primary uppercase tracking-wider font-black ml-1">{role === 'student' ? 'Ứng viên' : 'Nhà tuyển dụng'}</span></p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <label className="text-sm font-bold text-foreground flex items-center gap-2">
 <Phone className="w-4 h-4 text-primary" /> Số điện thoại liên hệ
 </label>
 <Input
 placeholder="Nhập số điện thoại liên hệ..."
 value={phone}
 onChange={e => setPhone(e.target.value)}
 className="h-12 rounded-xl bg-muted border-border focus-visible:ring-ring text-base font-medium"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-foreground flex items-center gap-2">
 <GraduationCap className="w-4 h-4 text-primary" /> Trường Đại học / Cao đẳng
 </label>
 <Input
 placeholder="Ví dụ: Đại học FPT, Đại học Bách Khoa..."
 value={university}
 onChange={e => setUniversity(e.target.value)}
 className="h-12 rounded-xl bg-muted border-border focus-visible:ring-ring text-base font-medium"
 />
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-foreground flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-primary" /> Kỹ năng nổi bật
 </label>
 <Input
 placeholder="Ví dụ: Giao tiếp, Chụp ảnh, Quản lý thời gian, Teamwork (Cách nhau bằng dấu phẩy)"
 value={skills}
 onChange={e => setSkills(e.target.value)}
 className="h-12 rounded-xl bg-muted border-border focus-visible:ring-ring text-base font-medium"
 />
 </div>

 <div className="space-y-2">
 <label className="text-sm font-bold text-foreground">Giới thiệu bản thân ngắn (Bio)</label>
 <textarea
 placeholder="Viết một đoạn ngắn giới thiệu về tính cách, đam mê và kinh nghiệm của bạn để tạo ấn tượng tốt nhất với Ban tổ chức..."
 value={bio}
 onChange={e => setBio(e.target.value)}
 rows={5}
 className="w-full rounded-xl bg-muted border border-border p-4 text-base font-medium focus:outline-none focus:border-primary transition-colors resize-none leading-relaxed"
 />
 </div>

 <div className="flex flex-col sm:flex-row justify-end items-center gap-3 pt-4 border-t border-border">
 <Button
 type="button"
 onClick={() => setCvPreviewOpen(true)}
 variant="outline"
 className="rounded-xl border-primary/20 hover:bg-accent text-primary font-bold h-12 px-6 w-full sm:w-auto"
 >
 <Eye className="w-5 h-5 mr-2" /> Xem trước & Tải CV
 </Button>
 <Button
 type="submit"
 disabled={saving}
 className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8 transition-transform active:scale-95 shadow-md w-full sm:w-auto"
 >
 {saving ?"Đang lưu cấu trúc hồ sơ..." : <><Save className="w-5 h-5 mr-2" /> Lưu Hồ sơ CV</>}
 </Button>
 </div>
 </form>
 </div>

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