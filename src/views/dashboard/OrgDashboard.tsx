"use client"

import { useState, useEffect } from"react"
import { useOrgDashboard } from "@/hooks/useOrgDashboard"
import { Button } from"@/components/ui/button"
import {
 Briefcase,
 Calendar,
 Users,
 MessageSquare,
 Lock,
 Crown,
 Check,
 TrendingUp,
 ArrowRight,
 ChevronRight
} from"lucide-react"
import OrgEventsTab from"@/components/event/OrgEventsTab"
import OrgEventApplicationsDetail from"@/components/organizer/OrgEventApplicationsDetail"
import EventFormModal from"@/components/event/EventFormModal"
import ReviewModal from"@/components/ReviewModal"
import CVViewModal from"@/components/cv/CVViewModal"
import OrgLayout from"@/components/layout/OrgLayout"
import AccountTab from"@/components/organizer/tabs/AccountTab"
import { supabase } from"@/lib/supabase"
import { getUserFacingMessage } from"@/lib/error"
import { useUser } from"@/components/providers/AuthProvider"
import { useToast } from"@/components/ui/ToastProvider"

export default function OrgDashboard() {
 const { showToast } = useToast()
 // 🔒 P1.1: user từ context (thay getUser() lặp 6 lần)
 const { user } = useUser()
 const {
 events, title, setTitle, desc, setDesc, location, setLocation,
 wardId, setWardId, wards,
 positionType, setPositionType, benefits, setBenefits,
 category, setCategory, slotsNeeded, setSlotsNeeded,
 eventDate, setEventDate, applicationDeadline, setApplicationDeadline,
 loading, fetching, showForm, setShowForm, editingId,
 viewingCV, setViewingCV, applications, loadingApps,
 selectedEventForCandidates, handleBackToEvents,
 handleSubmitEvent, handleEditClick, handleDeleteEvent,
 handleViewApplications, handleUpdateStatus, handleStartChatWithStudent, resetForm,
 totalEvents, activeEvents, userId,
 activeTab, setActiveTab, isPremium, handleBuyPremium
 } = useOrgDashboard()

 const [reviewingStudent, setReviewingStudent] = useState<{ eventId: string; studentId: string; studentName: string } | null>(null)

 // Profile update state
 const [profileData, setProfileData] = useState({
 fullName:"",
 phone:"",
 university:"", // represents Company Name
 bio:"",
 avatarUrl:"",
 email:"",
 mst:"",
 website:"",
 scale:"",
 address:"",
 companyImages:""
 })
 const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
 const [activeSubTab, setActiveSubTab] = useState<"info" |"password">("info")
 const [uploadingAvatar, setUploadingAvatar] = useState(false)
 const [uploadingCompanyImage, setUploadingCompanyImage] = useState(false)

 // Password change state
 const [passwordState, setPasswordState] = useState({
 newPassword:"",
 confirmPassword:""
 })
 const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

 // Fetch / sync organizer profile
 const fetchProfile = async () => {
 if (user) {
 const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
 if (data) {
 setProfileData({
 fullName: data.full_name ||"",
 phone: data.phone ||"",
 university: data.university ||"",
 bio: data.bio ||"",
 avatarUrl: data.avatar_url ||"",
 email: data.email ||"",
 mst: data.mst ||"",
 website: data.website ||"",
 scale: data.scale ||"",
 address: data.address ||"",
 companyImages: data.company_images ||""
 })
 }
 }
 }

 useEffect(() => {
 fetchProfile()
 }, [userId])

 const handleUpdateProfile = async (e: React.FormEvent) => {
 e.preventDefault()
 setIsUpdatingProfile(true)
 if (user) {
 const { error } = await supabase.from("profiles").update({
 full_name: profileData.fullName,
 phone: profileData.phone,
 university: profileData.fullName, // Keep university field synced with Company Name/CLB
 bio: profileData.bio,
 avatar_url: profileData.avatarUrl,
 mst: profileData.mst,
 website: profileData.website,
 scale: profileData.scale,
 address: profileData.address,
 company_images: profileData.companyImages
 }).eq("id", user.id)

 if (!error) {
 showToast({
 title:"Thành công",
 message:"Cập nhật thông tin công ty thành công!",
 type:"success"
 })
 fetchProfile()
 } else {
 showToast({
 title:"Lỗi cập nhật",
 message: getUserFacingMessage(error,"Cập nhật hồ sơ thất bại. Vui lòng thử lại."),
 type:"error"
 })
 }
 }
 setIsUpdatingProfile(false)
 }

 // Upload Logo handler
 const handleUploadLogo = async (file: File) => {
 try {
 setUploadingAvatar(true)
 if (!user) return

 const fileExt = file.name.split('.').pop()
 const fileName = `${user.id}-logo-${Math.random().toString(36).substring(7)}.${fileExt}`
 const filePath = fileName

 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, file, { cacheControl: '3600', upsert: true })

 if (uploadError) throw uploadError

 const { data: { publicUrl } } = supabase.storage
 .from('avatars')
 .getPublicUrl(filePath)

 // Update local state and also sync to db
 const { error: updateError } = await supabase
 .from('profiles')
 .update({ avatar_url: publicUrl })
 .eq('id', user.id)

 if (updateError) throw updateError

 setProfileData(prev => ({ ...prev, avatarUrl: publicUrl }))
 showToast({
 title:"Thành công",
 message:"Tải lên logo thành công!",
 type:"success"
 })
 fetchProfile()
 } catch (err: any) {
 showToast({
 title:"Lỗi tải ảnh lên",
 message: getUserFacingMessage(err,"Không thể tải ảnh lên. Vui lòng thử lại."),
 type:"error"
 })
 } finally {
 setUploadingAvatar(false)
 }
 }

 // Upload Company Image handler
 const handleUploadCompanyImage = async (file: File) => {
 try {
 setUploadingCompanyImage(true)
 if (!user) return

 const fileExt = file.name.split('.').pop()
 const fileName = `${user.id}-company-${Math.random().toString(36).substring(7)}.${fileExt}`
 const filePath = fileName

 const { error: uploadError } = await supabase.storage
 .from('avatars')
 .upload(filePath, file, { cacheControl: '3600', upsert: true })

 if (uploadError) throw uploadError

 const { data: { publicUrl } } = supabase.storage
 .from('avatars')
 .getPublicUrl(filePath)

 const currentImages = profileData.companyImages ? profileData.companyImages.split(',').filter(Boolean) : []
 const newImages = [...currentImages, publicUrl].join(',')

 const { error: updateError } = await supabase
 .from('profiles')
 .update({ company_images: newImages })
 .eq('id', user.id)

 if (updateError) throw updateError

 setProfileData(prev => ({ ...prev, companyImages: newImages }))
 showToast({
 title:"Thành công",
 message:"Tải lên hình ảnh công ty thành công!",
 type:"success"
 })
 fetchProfile()
 } catch (err: any) {
 showToast({
 title:"Lỗi tải ảnh lên",
 message: getUserFacingMessage(err,"Không thể tải ảnh lên. Vui lòng thử lại."),
 type:"error"
 })
 } finally {
 setUploadingCompanyImage(false)
 }
 }

 // Delete Company Image handler
 const handleDeleteCompanyImage = async (indexToDelete: number) => {
 try {
 if (!user) return

 const currentImages = profileData.companyImages ? profileData.companyImages.split(',').filter(Boolean) : []
 const updatedImagesList = currentImages.filter((_, idx) => idx !== indexToDelete)
 const newImages = updatedImagesList.join(',')

 const { error: updateError } = await supabase
 .from('profiles')
 .update({ company_images: newImages })
 .eq('id', user.id)

 if (updateError) throw updateError

 setProfileData(prev => ({ ...prev, companyImages: newImages }))
 showToast({
 title:"Thành công",
 message:"Xóa hình ảnh thành công!",
 type:"success"
 })
 fetchProfile()
 } catch (err: any) {
 showToast({
 title:"Lỗi xóa ảnh",
 message: getUserFacingMessage(err,"Không thể xóa ảnh. Vui lòng thử lại."),
 type:"error"
 })
 }
 }

 const handleChangePassword = async (e: React.FormEvent) => {
 e.preventDefault()
 if (!passwordState.newPassword) {
 showToast({
 title:"Lỗi",
 message:"Vui lòng nhập mật khẩu mới",
 type:"error"
 })
 return
 }
 if (passwordState.newPassword !== passwordState.confirmPassword) {
 showToast({
 title:"Lỗi",
 message:"Mật khẩu xác nhận không khớp",
 type:"error"
 })
 return
 }
 setIsUpdatingPassword(true)
 const { error } = await supabase.auth.updateUser({
 password: passwordState.newPassword
 })
 if (!error) {
 showToast({
 title:"Thành công",
 message:"Đổi mật khẩu thành công!",
 type:"success"
 })
 setPasswordState({ newPassword:"", confirmPassword:"" })
 } else {
 showToast({
 title:"Lỗi",
 message: getUserFacingMessage(error,"Đổi mật khẩu thất bại. Vui lòng thử lại."),
 type:"error"
 })
 }
 setIsUpdatingPassword(false)
 }

 const handleBuyPremiumService = () => {
 handleBuyPremium()
 showToast({
 title:"Kích hoạt thành công",
 message:"Chúc mừng! Bạn đã nâng cấp tài khoản VIP Tuyển nhân sự thành công.",
 type:"success"
 })
 }

 const userProfileCached = {
 fullName: profileData.fullName ||"Nhà tuyển nhân sự",
 avatarUrl: profileData.avatarUrl ||"",
 email: profileData.email ||""
 }

 // Active Chats list for the Recruiter
 const [activeChats, setActiveChats] = useState<any[]>([])
 const [loadingChats, setLoadingChats] = useState(false)

 // 🔒 P2.8: CV recommendations — fetch applicants thật (thay mock 4 fake students)
 const [recommendedCVs, setRecommendedCVs] = useState<any[]>([])
 useEffect(() => {
 if (activeTab !=="recommended" || !isPremium || !userId) return
 const fetchRecommended = async () => {
 // Lấy applicants mới nhất join profiles + events (lấy skills từ profile + position_type từ event để match)
 const { data } = await supabase
 .from("applications")
 .select(`
 id,
 status,
 applied_at,
 student_id,
 event_id,
 events (title, position_type, benefits),
 profiles!applications_student_id_fkey (id, full_name, avatar_url, university, skills, cv_completion_percent)
 `)
 .eq("events.organizer_id", userId)
 .order("applied_at", { ascending: false })
 .limit(8)
 if (data) {
 // Compute match score đơn giản: cv_completion_percent + bonus nếu skills chứa position_type keyword
 const scored = data.map((app: any) => {
 const skills = (app.profiles?.skills ||"").toLowerCase()
 const position = (app.events?.position_type ||"").toLowerCase()
 let match = app.profiles?.cv_completion_percent || 50
 if (position && skills.includes(position.split("")[0])) match = Math.min(99, match + 10)
 return {
 name: app.profiles?.full_name ||"Sinh viên",
 university: app.profiles?.university ||"Chưa cập nhật",
 skills: app.profiles?.skills ||"Chưa cập nhật kỹ năng",
 match,
 completion: app.profiles?.cv_completion_percent || 0,
 avatar: app.profiles?.avatar_url ||"",
 studentId: app.profiles?.id,
 eventId: app.event_id,
 }
 })
 setRecommendedCVs(scored)
 }
 }
 fetchRecommended()
 }, [activeTab, isPremium, userId])

 useEffect(() => {
 const fetchChats = async () => {
 if (!user) return
 setLoadingChats(true)
 const { data } = await supabase
 .from("chats")
 .select(`
 id,
 created_at,
 events (id, title),
 profiles!chats_student_id_fkey (id, full_name, avatar_url, university)
 `)
 .eq("organizer_id", user.id)
 if (data) setActiveChats(data)
 setLoadingChats(false)
 }
 if (activeTab ==="chat") {
 fetchChats()
 }
 }, [activeTab])

 // 🔒 P2.8: mockCVs removed — using recommendedCVs (real applicants from DB)

 // 🔒 P2.8: feed stats — approval rate + weekly applications (thay 85% / 142 lượt / chart mock)
 const [feedStats, setFeedStats] = useState<{ approvalRate: number; weeklyApps: number[] }>({ approvalRate: 0, weeklyApps: [0, 0, 0, 0] })
 useEffect(() => {
 if (activeTab !=="feed" || !userId) return
 const fetchStats = async () => {
 // Approval rate: approved / total applications cho events của organizer
 const { data: apps } = await supabase
 .from("applications")
 .select("status, applied_at")
 .in("event_id", (await supabase.from("events").select("id").eq("organizer_id", userId)).data?.map((e: any) => e.id) || [])
 if (apps && apps.length > 0) {
 const approved = apps.filter((a: any) => a.status ==="approved").length
 const rate = Math.round((approved / apps.length) * 100)
 // Weekly applications (4 tuần gần nhất)
 const now = Date.now()
 const weekMs = 7 * 24 * 60 * 60 * 1000
 const weekly = [0, 0, 0, 0]
 apps.forEach((a: any) => {
 const applied = new Date(a.applied_at).getTime()
 const weeksAgo = Math.floor((now - applied) / weekMs)
 if (weeksAgo >= 0 && weeksAgo < 4) weekly[3 - weeksAgo]++
 })
 setFeedStats({ approvalRate: rate, weeklyApps: weekly })
 }
 }
 fetchStats()
 }, [activeTab, userId])

  return (
    <OrgLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isPremium={isPremium}
      userProfile={userProfileCached}
      onLogout={async () => {
        // 🔒 P1.1: AuthProvider onAuthStateChange clears session state
        await supabase.auth.signOut()
        window.location.href = "/"
      }}
    >
      {/* 1. TAB: FEED */}
      {activeTab === "feed" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Welcome header */}
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                Xin chào, {profileData.fullName || "Nhà tuyển nhân sự"}!
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Tổng quan hiệu suất các chiến dịch tuyển nhân sự tình nguyện viên của bạn.
              </p>
            </div>
            <Button
              onClick={() => { setActiveTab("events"); setShowForm(true); }}
              className="h-10 shrink-0 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Tạo chiến dịch mới
            </Button>
          </div>

          {/* Stat cards — 4 cols responsive */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Briefcase className="h-5 w-5" />} label="Tổng chiến dịch" value={String(totalEvents)} />
            <StatCard icon={<Calendar className="h-5 w-5" />} label="Đang mở đăng ký" value={String(activeEvents)} />
            <StatCard icon={<Users className="h-5 w-5" />} label="Tỷ lệ duyệt đăng ký" value={`${feedStats.approvalRate}%`} />
            <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Tổng đơn đăng ký" value={String(feedStats.weeklyApps.reduce((a: number, b: number) => a + b, 0))} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Weekly applications chart */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:col-span-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">Biểu đồ đăng ký</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">4 tuần gần nhất</p>
              </div>
              {/* 🔒 P2.8: real chart từ feedStats.weeklyApps */}
              <div className="flex h-48 w-full items-end justify-between gap-2 border-b border-l border-border pl-3 pt-6 sm:h-56">
                {(() => {
                  const max = Math.max(...feedStats.weeklyApps, 1)
                  return feedStats.weeklyApps.map((count, i) => (
                    <div key={i} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{count}</span>
                      <div
                        className={`w-full max-w-12 rounded-t-md transition-colors ${i === 2 ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                        style={{ height: `${Math.max(8, (count / max) * 140)}px` }}
                        title={`${count} người tham gia`}
                      />
                      <span className="text-xs text-muted-foreground">Tuần {i + 1}</span>
                    </div>
                  ))
                })()}
              </div>
            </div>

            {/* Premium promo */}
            <div className="flex flex-col justify-between rounded-xl border border-primary/20 bg-card p-5 shadow-sm sm:p-6">
              <div className="space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-primary">
                  <Crown className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-foreground">Nâng cấp VIP Tuyển nhân sự</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Tiếp cận trực tiếp hàng ngàn hồ sơ sinh viên tài năng tại Đà Nẵng, xem báo cáo thông minh và đẩy sự kiện lên vị trí nổi bật.
                </p>
              </div>
              <Button
                onClick={() => setActiveTab("services")}
                className="mt-5 h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Xem bảng giá gói
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: EVENTS */}
      {activeTab === "events" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Các chiến dịch của tôi</h1>
            <Button
              onClick={() => setShowForm(true)}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Tạo chiến dịch mới
            </Button>
          </div>
          <OrgEventsTab
            fetching={fetching}
            events={events}
            onEditClick={handleEditClick}
            onDeleteEvent={handleDeleteEvent}
            onViewApplications={handleViewApplications}
          />
        </div>
      )}

      {/* 3. TAB: CANDIDATES */}
      {activeTab === "candidates" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {selectedEventForCandidates ? (
            <OrgEventApplicationsDetail
              event={selectedEventForCandidates}
              applications={applications}
              loadingApps={loadingApps}
              onBack={handleBackToEvents}
              setViewingCV={setViewingCV}
              handleUpdateStatus={handleUpdateStatus}
              onStartChatWithStudent={handleStartChatWithStudent}
              onRateStudent={(eventId, studentId, studentName) => setReviewingStudent({ eventId, studentId, studentName })}
            />
          ) : (
            <div className="space-y-5 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Chọn sự kiện để xem người tham gia</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Chọn một trong những sự kiện dưới đây để xem danh sách hồ sơ chi tiết.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {events.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => handleViewApplications(ev)}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4 text-left transition-colors hover:border-primary/40 hover:bg-card"
                  >
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-semibold text-foreground">{ev.title}</h4>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        Số lượng đơn đăng ký: {ev.applications?.length || 0}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: RECOMMENDED (Premium) */}
      {activeTab === "recommended" && (
        <div className="relative z-10 min-h-[450px] space-y-6 animate-in fade-in duration-300">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Đề xuất người tham gia Thông minh</h1>

          <div className={`grid grid-cols-1 gap-4 md:grid-cols-2 ${!isPremium ? "pointer-events-none select-none blur-sm" : ""}`}>
            {recommendedCVs.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground md:col-span-2">
                Chưa có người tham gia nào đăng ký vào sự kiện của bạn.
              </div>
            ) : recommendedCVs.map((cv, i) => (
              <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
                {cv.avatar ? (
                  <img src={cv.avatar} alt={cv.name} loading="lazy" className="h-12 w-12 shrink-0 rounded-lg border border-border object-cover sm:h-14 sm:w-14" />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent text-base font-semibold text-primary sm:h-14 sm:w-14">
                    {cv.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-semibold text-foreground">{cv.name}</h3>
                    <span className="shrink-0 rounded-md bg-accent px-1.5 py-0.5 text-xs font-medium text-primary">
                      Match: {cv.match}%
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{cv.university}</p>
                  <p className="mt-2 truncate text-xs text-foreground">Kỹ năng: {cv.skills}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Premium lock overlay */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/20 p-6">
              <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 text-center shadow-md sm:p-8 animate-in zoom-in-95">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Lock className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Mở khóa tính năng VIP</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Khám phá tính năng gợi ý CV tự động bằng AI, tìm kiếm sinh viên phù hợp nhất dựa trên tiêu chuẩn sự kiện và gửi lời mời phỏng vấn ngay lập tức!
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("services")}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Crown className="h-4 w-4" /> Xem gói dịch vụ VIP
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: REPORTS (Premium) */}
      {activeTab === "reports" && (
        <div className="relative z-10 min-h-[450px] space-y-6 animate-in fade-in duration-300">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Báo cáo & Phân tích chuyên sâu</h1>

          <div className={`space-y-6 ${!isPremium ? "pointer-events-none select-none blur-sm" : ""}`}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground">Tỷ lệ hoàn thành hồ sơ</h4>
                <div className="mt-2 text-2xl font-semibold text-foreground">92.5%</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground">Thời gian phản hồi CV TB</h4>
                <div className="mt-2 text-2xl font-semibold text-foreground">1.8 ngày</div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h4 className="text-xs font-medium text-muted-foreground">Kênh tiếp cận hiệu quả</h4>
                <div className="mt-2 text-2xl font-semibold text-foreground">Facebook & Web</div>
              </div>
            </div>

            {/* Daily reach / applications chart */}
            <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base font-semibold text-foreground">Lượt tiếp cận & Đơn đăng ký theo ngày</h3>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Lượt xem
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" /> Đơn đăng ký
                  </span>
                </div>
              </div>
              <div className="flex h-56 w-full items-end justify-between gap-2 border-b border-l border-border pl-3 pt-6 sm:h-64">
                {[
                  { day: "T2", views: 120, apps: 15 },
                  { day: "T3", views: 160, apps: 24 },
                  { day: "T4", views: 200, apps: 35 },
                  { day: "T5", views: 140, apps: 18 },
                  { day: "T6", views: 220, apps: 50 },
                  { day: "T7", views: 260, apps: 68 },
                  { day: "CN", views: 180, apps: 40 },
                ].map((d) => {
                  const maxV = 280
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-full items-end gap-1">
                        <div
                          className="w-2.5 rounded-t bg-muted-foreground/40 transition-colors hover:bg-muted-foreground/60 sm:w-3"
                          style={{ height: `${(d.views / maxV) * 200}px` }}
                          title={`${d.views} lượt xem`}
                        />
                        <div
                          className="w-2.5 rounded-t bg-primary transition-colors hover:bg-primary/80 sm:w-3"
                          style={{ height: `${(d.apps / maxV) * 200}px` }}
                          title={`${d.apps} đăng ký`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{d.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Premium lock overlay */}
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted/20 p-6">
              <div className="w-full max-w-md space-y-5 rounded-xl border border-border bg-card p-6 text-center shadow-md sm:p-8 animate-in zoom-in-95">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  <Lock className="h-7 w-7" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Mở khóa Báo cáo tuyển nhân sự</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Xem biểu đồ tương tác, số lượt xem bài tuyển nhân sự nhân sự chi tiết theo ngày và xuất các báo cáo thống kê phục vụ hoạt động quản trị của tổ chức.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab("services")}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Crown className="h-4 w-4" /> Xem gói dịch vụ VIP
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: SERVICES */}
      {activeTab === "services" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="mx-auto max-w-2xl space-y-2 text-center">
            <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Bảng giá dịch vụ VIP</h1>
            <p className="text-sm text-muted-foreground">
              Lựa chọn gói dịch vụ tối ưu để tối đa hóa hiệu quả tuyển nhân sự tình nguyện viên của bạn.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 pt-2 md:grid-cols-2">
            {/* VIP Plan */}
            <div className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              {isPremium && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Đang sử dụng
                </span>
              )}
              <div className="space-y-5">
                <div>
                  <h3 className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
                    <Crown className="h-5 w-5 text-primary" /> VIP Recruiter
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">Giải pháp tối ưu cho Nhà tuyển nhân sự chuyên nghiệp</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-foreground sm:text-3xl">990.000đ</span>
                  <span className="text-xs text-muted-foreground">/ tháng</span>
                </div>

                <ul className="space-y-2.5">
                  {[
                    "Mở khóa đề xuất người tham gia AI phù hợp",
                    "Xem Báo cáo tuyển nhân sự chuyên sâu",
                    "Đẩy tin nổi bật không giới hạn",
                    "Hỗ trợ ưu tiên 24/7 từ EventMate"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={handleBuyPremiumService}
                disabled={isPremium}
                className={`mt-6 h-11 w-full rounded-lg text-sm font-medium ${
                  isPremium
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {isPremium ? "Đã được kích hoạt" : "Kích hoạt ngay"}
              </Button>
            </div>

            {/* Push Plan */}
            <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Đẩy tin VIP bài đăng</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Tăng độ tiếp cận của bài tuyển nhân sự</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-semibold text-foreground sm:text-3xl">290.000đ</span>
                  <span className="text-xs text-muted-foreground">/ 7 ngày</span>
                </div>

                <ul className="space-y-2.5">
                  {[
                    "Ghim bài đăng lên top 1 trang chủ sinh viên",
                    "Hiển thị nhãn VIP nổi bật trên bài đăng",
                    "Đẩy tin tự động mỗi 24 giờ"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 shrink-0 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => showToast({ title: "Dịch vụ giả lập", message: "Gói đẩy tin VIP đã được mô phỏng kích hoạt thành công cho chiến dịch!", type: "info" })}
                className="mt-6 h-11 w-full rounded-lg bg-foreground text-sm font-medium text-background hover:bg-foreground/90"
              >
                Mua gói đẩy tin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB: CHAT */}
      {activeTab === "chat" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">Danh sách cuộc trò chuyện</h1>

          {loadingChats ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Đang tải cuộc trò chuyện...</div>
          ) : activeChats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card py-12 text-center sm:py-16">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <MessageSquare className="h-7 w-7" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Chưa có cuộc trò chuyện nào</h3>
              <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                Nhấp vào nút nhắn tin trên hồ sơ người tham gia để bắt đầu cuộc hội thoại.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {activeChats.map((chat) => {
                const student = chat.profiles
                const event = chat.events
                return (
                  <button
                    key={chat.id}
                    onClick={() => handleStartChatWithStudent(event?.id, student?.id)}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:shadow-sm sm:p-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={student?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&h=80&q=80"}
                        alt={student?.full_name}
                        loading="lazy"
                        className="h-11 w-11 shrink-0 rounded-lg border border-border object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-semibold text-foreground">{student?.full_name}</h4>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{student?.university || "Sinh viên"}</p>
                        <span className="mt-1.5 inline-block rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          {event?.title}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 8. TAB: ACCOUNT */}
      {activeTab === "account" && (
        <AccountTab
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
          profileData={profileData}
          setProfileData={setProfileData}
          handleUpdateProfile={handleUpdateProfile}
          isUpdatingProfile={isUpdatingProfile}
          handleUploadLogo={handleUploadLogo}
          uploadingAvatar={uploadingAvatar}
          handleUploadCompanyImage={handleUploadCompanyImage}
          handleDeleteCompanyImage={handleDeleteCompanyImage}
          uploadingCompanyImage={uploadingCompanyImage}
          passwordState={passwordState}
          setPasswordState={setPasswordState}
          handleChangePassword={handleChangePassword}
          isUpdatingPassword={isUpdatingPassword}
        />
      )}

      {/* MODALS */}
      <EventFormModal
        showForm={showForm}
        editingId={editingId}
        resetForm={resetForm}
        handleSubmitEvent={handleSubmitEvent}
        title={title}
        setTitle={setTitle}
        location={location}
        setLocation={setLocation}
        wardId={wardId}
        setWardId={setWardId}
        wards={wards}
        eventDate={eventDate}
        setEventDate={setEventDate}
        applicationDeadline={applicationDeadline}
        setApplicationDeadline={setApplicationDeadline}
        positionType={positionType}
        setPositionType={setPositionType}
        category={category}
        setCategory={setCategory}
        benefits={benefits}
        setBenefits={setBenefits}
        slotsNeeded={slotsNeeded}
        setSlotsNeeded={setSlotsNeeded}
        desc={desc}
        setDesc={setDesc}
        loading={loading}
      />

      {reviewingStudent && userId && (
        <ReviewModal
          isOpen={!!reviewingStudent}
          onClose={() => setReviewingStudent(null)}
          eventId={reviewingStudent.eventId}
          reviewerId={userId}
          revieweeId={reviewingStudent.studentId}
          revieweeName={reviewingStudent.studentName}
        />
      )}

      <CVViewModal viewingCV={viewingCV} onClose={() => setViewingCV(null)} />
    </OrgLayout>
  )
}

/* ---------- small local helper component ---------- */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent text-primary sm:h-12 sm:w-12">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 truncate text-xl font-semibold text-foreground sm:text-2xl">{value}</p>
      </div>
    </div>
  )
}