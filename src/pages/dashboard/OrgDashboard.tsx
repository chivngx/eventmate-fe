import { useState, useEffect } from "react"
import { useOrgDashboard } from "./useOrgDashboard"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import OrgEventsTab from "@/components/event/OrgEventsTab"
import OrgEventApplicationsDetail from "@/components/organizer/OrgEventApplicationsDetail"
import EventFormModal from "@/components/event/EventFormModal"
import ReviewModal from "@/components/ReviewModal"
import CVViewModal from "@/components/cv/CVViewModal"
import OrgLayout from "@/components/layout/OrgLayout"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/ui/ToastProvider"

export default function OrgDashboard() {
  const { showToast } = useToast()
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
    activeTab, setActiveTab, isPremium, handleBuyPremium, togglePremium
  } = useOrgDashboard()

  const [reviewingStudent, setReviewingStudent] = useState<{ eventId: string; studentId: string; studentName: string } | null>(null)

  // Profile update state
  const [profileData, setProfileData] = useState({
    fullName: "",
    phone: "",
    university: "", // represents Company Name
    bio: "",
    avatarUrl: "",
    email: "",
    mst: "",
    website: "",
    scale: "",
    address: "",
    companyImages: ""
  })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [activeSubTab, setActiveSubTab] = useState<"info" | "password">("info")
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [uploadingCompanyImage, setUploadingCompanyImage] = useState(false)

  // Password change state
  const [passwordState, setPasswordState] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Fetch / sync organizer profile
  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      if (data) {
        setProfileData({
          fullName: data.full_name || "",
          phone: data.phone || "",
          university: data.university || "",
          bio: data.bio || "",
          avatarUrl: data.avatar_url || "",
          email: data.email || "",
          mst: data.mst || "",
          website: data.website || "",
          scale: data.scale || "",
          address: data.address || "",
          companyImages: data.company_images || ""
        })

        // Update local storage cache to match
        localStorage.setItem("em_user_profile", JSON.stringify({
          fullName: data.full_name || "",
          avatarUrl: data.avatar_url || "",
          email: data.email || "",
          role: data.role || "organizer"
        }))
      }
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)
    const { data: { user } } = await supabase.auth.getUser()
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
          title: "Thành công",
          message: "Cập nhật thông tin công ty thành công!",
          type: "success"
        })
        fetchProfile()
      } else {
        showToast({
          title: "Lỗi cập nhật",
          message: error.message,
          type: "error"
        })
      }
    }
    setIsUpdatingProfile(false)
  }

  // Upload Logo handler
  const handleUploadLogo = async (file: File) => {
    try {
      setUploadingAvatar(true)
      const { data: { user } } = await supabase.auth.getUser()
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
        title: "Thành công",
        message: "Tải lên logo thành công!",
        type: "success"
      })
      fetchProfile()
    } catch (err: any) {
      showToast({
        title: "Lỗi tải ảnh lên",
        message: err.message,
        type: "error"
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Upload Company Image handler
  const handleUploadCompanyImage = async (file: File) => {
    try {
      setUploadingCompanyImage(true)
      const { data: { user } } = await supabase.auth.getUser()
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
        title: "Thành công",
        message: "Tải lên hình ảnh công ty thành công!",
        type: "success"
      })
      fetchProfile()
    } catch (err: any) {
      showToast({
        title: "Lỗi tải ảnh lên",
        message: err.message,
        type: "error"
      })
    } finally {
      setUploadingCompanyImage(false)
    }
  }

  // Delete Company Image handler
  const handleDeleteCompanyImage = async (indexToDelete: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
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
        title: "Thành công",
        message: "Xóa hình ảnh thành công!",
        type: "success"
      })
      fetchProfile()
    } catch (err: any) {
      showToast({
        title: "Lỗi xóa ảnh",
        message: err.message,
        type: "error"
      })
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!passwordState.newPassword) {
      showToast({
        title: "Lỗi",
        message: "Vui lòng nhập mật khẩu mới",
        type: "error"
      })
      return
    }
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      showToast({
        title: "Lỗi",
        message: "Mật khẩu xác nhận không khớp",
        type: "error"
      })
      return
    }
    setIsUpdatingPassword(true)
    const { error } = await supabase.auth.updateUser({
      password: passwordState.newPassword
    })
    if (!error) {
      showToast({
        title: "Thành công",
        message: "Đổi mật khẩu thành công!",
        type: "success"
      })
      setPasswordState({ newPassword: "", confirmPassword: "" })
    } else {
      showToast({
        title: "Lỗi",
        message: error.message,
        type: "error"
      })
    }
    setIsUpdatingPassword(false)
  }

  const handleBuyPremiumService = () => {
    handleBuyPremium()
    showToast({
      title: "Kích hoạt thành công",
      message: "Chúc mừng! Bạn đã nâng cấp tài khoản VIP Tuyển dụng thành công.",
      type: "success"
    })
  }

  const userProfileCached = {
    fullName: profileData.fullName || "Nhà tuyển dụng",
    avatarUrl: profileData.avatarUrl || "",
    email: profileData.email || ""
  }

  // Active Chats list for the Recruiter
  const [activeChats, setActiveChats] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(false)

  useEffect(() => {
    const fetchChats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
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
    if (activeTab === "chat") {
      fetchChats()
    }
  }, [activeTab])

  // Mock CV Recommendations
  const mockCVs = [
    { name: "Nguyễn Văn A", university: "Đại học Bách Khoa - ĐHĐN", skills: "React, Node.js, Photoshop", match: 95, completion: 90, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Trần Thị B", university: "Đại học Ngoại Ngữ - ĐHĐN", skills: "Tiếng Anh (IELTS 7.5), Tổ chức sự kiện, MC", match: 88, completion: 100, avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Phạm Minh C", university: "Đại học Kinh tế - ĐHĐN", skills: "Marketing, Content Writer, Canva", match: 85, completion: 80, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80" },
    { name: "Lê Thu D", university: "Đại học Duy Tân", skills: "Tình nguyện viên, Hậu cần, Giao tiếp tốt", match: 82, completion: 95, avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80" }
  ]

  return (
    <OrgLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      isPremium={isPremium}
      userProfile={userProfileCached}
      onLogout={async () => {
        localStorage.removeItem("em_user_profile")
        await supabase.auth.signOut()
        window.location.href = "/"
      }}
    >
      {/* 1. TAB: FEED (BẢNG TIN THỐNG KÊ CHI TIẾT) */}
      {activeTab === "feed" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 p-8 rounded-[2rem] text-slate-800 border-2 border-emerald-100/50 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Xin chào, {profileData.fullName || "Nhà tuyển dụng"}!</h1>
              <p className="text-slate-600 font-medium mt-1">Dưới đây là tổng quan hiệu suất các chiến dịch tuyển dụng tình nguyện viên của bạn.</p>
            </div>
            <Button onClick={() => { setActiveTab("events"); setShowForm(true); }} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 px-6 shrink-0 shadow-md">
              Tạo chiến dịch mới
            </Button>
          </div>

          {/* STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400"><Briefcase className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tổng chiến dịch</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{totalEvents}</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400"><Calendar className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đang mở tuyển</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{activeEvents}</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400"><Users className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tỷ lệ duyệt hồ sơ</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">85%</h3>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lượt xem hồ sơ</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">142 lượt</h3>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent activity log */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Biểu đồ hiệu quả tuyển dụng (Tháng 6)</h3>
              {/* Beautiful Mock SVG Chart */}
              <div className="h-64 w-full flex items-end justify-between px-4 pt-6 border-b border-l border-slate-200 dark:border-slate-800 relative">
                <div className="absolute left-4 top-2 text-[10px] text-slate-400 font-bold">Ứng viên / Ngày</div>
                <div className="w-1/6 flex flex-col items-center gap-2">
                  <div className="w-8 bg-slate-200 dark:bg-slate-850 h-28 rounded-t-lg transition-all duration-500 hover:bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-400 font-bold">Tuần 1</span>
                </div>
                <div className="w-1/6 flex flex-col items-center gap-2">
                  <div className="w-8 bg-slate-200 dark:bg-slate-850 h-40 rounded-t-lg transition-all duration-500 hover:bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-400 font-bold">Tuần 2</span>
                </div>
                <div className="w-1/6 flex flex-col items-center gap-2">
                  <div className="w-8 bg-emerald-600 h-48 rounded-t-lg shadow-lg shadow-emerald-500/20"></div>
                  <span className="text-[10px] text-slate-400 font-bold">Tuần 3</span>
                </div>
                <div className="w-1/6 flex flex-col items-center gap-2">
                  <div className="w-8 bg-slate-200 dark:bg-slate-850 h-32 rounded-t-lg transition-all duration-500 hover:bg-emerald-500"></div>
                  <span className="text-[10px] text-slate-400 font-bold">Tuần 4</span>
                </div>
              </div>
            </div>

            {/* Premium quick promo */}
            <div className="bg-gradient-to-b from-emerald-50 to-white p-6 rounded-[2rem] text-slate-800 flex flex-col justify-between shadow-md border-2 border-emerald-100/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              <div className="space-y-4">
                <Crown className="w-10 h-10 text-emerald-600 fill-current" />
                <h3 className="text-xl font-black text-slate-900">Nâng cấp VIP Tuyển dụng</h3>
                <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                  Tiếp cận trực tiếp hàng ngàn hồ sơ sinh viên tài năng tại Đà Nẵng, xem báo cáo thông minh và đẩy tin tuyển dụng của bạn lên vị trí nổi bật nhất.
                </p>
              </div>
              <Button onClick={() => setActiveTab("services")} className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-11">
                Xem bảng giá gói
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAB: EVENTS (TIN TUYỂN DỤNG) */}
      {activeTab === "events" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Các chiến dịch của tôi</h1>
            <Button onClick={() => setShowForm(true)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black">
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

      {/* 3. TAB: CANDIDATES (QUẢN LÝ CV - DRILL DOWN) */}
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
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Chọn tin tuyển dụng để xem ứng viên</h2>
              <p className="text-slate-500 font-medium -mt-2">Chọn một trong những tin tuyển dụng dưới đây để xem danh sách hồ sơ chi tiết.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => handleViewApplications(ev)}
                    className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 hover:border-emerald-250 dark:hover:border-emerald-900 transition-all duration-200 cursor-pointer flex items-center justify-between"
                  >
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">{ev.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-semibold flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> Số lượng đơn ứng tuyển: {ev.applications?.length || 0}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. TAB: RECOMMENDED (CV ĐỀ XUẤT - KHÓA PREMIUM) */}
      {activeTab === "recommended" && (
        <div className="space-y-6 relative z-10 min-h-[450px] animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Đề xuất CV Thông minh</h1>
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${!isPremium ? "filter blur-sm pointer-events-none select-none" : ""}`}>
            {mockCVs.map((cv, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <img src={cv.avatar} alt={cv.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold truncate">{cv.name}</h3>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded">Match: {cv.match}%</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{cv.university}</p>
                  <p className="text-xs font-semibold text-slate-600 mt-2 truncate">Kỹ năng: {cv.skills}</p>
                </div>
              </div>
            ))}
          </div>

          {/* PREMIUM LOCK OVERLAY */}
          {!isPremium && (
            <div className="absolute inset-0 bg-slate-50/10 dark:bg-slate-950/10 flex items-center justify-center p-6 z-10">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md text-center shadow-2xl space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto shadow-sm">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">Mở khóa tính năng VIP</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    Khám phá tính năng gợi ý CV tự động bằng AI, tìm kiếm sinh viên phù hợp nhất dựa trên tiêu chuẩn sự kiện và gửi lời mời phỏng vấn ngay lập tức!
                  </p>
                </div>
                <Button onClick={() => setActiveTab("services")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black w-full h-11 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 fill-current" /> Xem gói dịch vụ VIP
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. TAB: REPORTS (BÁO CÁO TUYỂN DỤNG - KHÓA PREMIUM) */}
      {activeTab === "reports" && (
        <div className="space-y-6 relative z-10 min-h-[450px] animate-in fade-in duration-300">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Báo cáo & Phân tích chuyên sâu</h1>

          <div className={`space-y-6 ${!isPremium ? "filter blur-sm pointer-events-none select-none" : ""}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Tỷ lệ hoàn thành hồ sơ ứng tuyển</h4>
                <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">92.5%</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Thời gian phản hồi CV trung bình</h4>
                <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">1.8 ngày</div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Kênh tiếp cận hiệu quả nhất</h4>
                <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">Facebook & Web</div>
              </div>
            </div>

            {/* BIỂU ĐỒ BÁO CÁO CHI TIẾT */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Lượt tiếp cận & Đơn ứng tuyển theo ngày</h3>
              <div className="h-72 w-full flex items-end justify-between px-4 pt-6 border-b border-l border-slate-200 dark:border-slate-800 relative">
                <div className="absolute left-4 top-2 text-[10px] text-slate-400 font-bold">Lượt xem (Xanh dương) / Đơn ứng tuyển (Emerald)</div>

                {/* Thứ 2 */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-28 rounded-t transition-all hover:opacity-85" title="120 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-10 rounded-t transition-all hover:opacity-85" title="15 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Thứ 2</span>
                </div>

                {/* Thứ 3 */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-36 rounded-t transition-all hover:opacity-85" title="160 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-16 rounded-t transition-all hover:opacity-85" title="24 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Thứ 3</span>
                </div>

                {/* Thứ 4 */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-44 rounded-t transition-all hover:opacity-85" title="200 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-24 rounded-t transition-all hover:opacity-85" title="35 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Thứ 4</span>
                </div>

                {/* Thứ 5 */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-32 rounded-t transition-all hover:opacity-85" title="140 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-12 rounded-t transition-all hover:opacity-85" title="18 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Thứ 5</span>
                </div>

                {/* Thứ 6 */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-48 rounded-t transition-all hover:opacity-85" title="220 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-36 rounded-t transition-all hover:opacity-85" title="50 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Thứ 6</span>
                </div>

                {/* Thứ 7 */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-56 rounded-t transition-all hover:opacity-85" title="260 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-48 rounded-t transition-all hover:opacity-85" title="68 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Thứ 7</span>
                </div>

                {/* Chủ Nhật */}
                <div className="w-1/7 flex flex-col items-center gap-1.5 flex-1">
                  <div className="flex items-end gap-1">
                    <div className="w-3 bg-blue-500 h-40 rounded-t transition-all hover:opacity-85" title="180 lượt xem"></div>
                    <div className="w-3 bg-emerald-500 h-28 rounded-t transition-all hover:opacity-85" title="40 ứng tuyển"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold">Chủ Nhật</span>
                </div>

              </div>
            </div>
          </div>

          {/* PREMIUM LOCK OVERLAY */}
          {!isPremium && (
            <div className="absolute inset-0 bg-slate-50/10 dark:bg-slate-950/10 flex items-center justify-center p-6 z-10">
              <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 max-w-md text-center shadow-2xl space-y-5 animate-in zoom-in-95">
                <div className="w-16 h-16 bg-amber-50 dark:bg-amber-950/30 rounded-2xl flex items-center justify-center text-amber-500 mx-auto shadow-sm">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-slate-950 dark:text-white">Mở khóa Báo cáo tuyển dụng</h3>
                  <p className="text-slate-500 font-medium text-sm leading-relaxed">
                    Xem biểu đồ tương tác, số lượt xem bài đăng tuyển dụng chi tiết theo ngày và xuất các báo cáo thống kê phục vụ hoạt động quản trị của tổ chức.
                  </p>
                </div>
                <Button onClick={() => setActiveTab("services")} className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black w-full h-11 shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 fill-current" /> Xem gói dịch vụ VIP
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB: SERVICES (MUA DỊCH VỤ) */}
      {activeTab === "services" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100">Bảng giá dịch vụ VIP</h1>
            <p className="text-slate-500 font-medium">Lựa chọn gói dịch vụ tối ưu để tối đa hóa hiệu quả tuyển dụng tình nguyện viên của bạn.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
            {/* VIP Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-150 dark:border-slate-800 p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
              {isPremium && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
                  Đang sử dụng
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
                    <Crown className="w-5 h-5 text-emerald-500 fill-current" /> VIP Recruiter
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Giải pháp tối ưu cho Nhà tuyển dụng chuyên nghiệp</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">990.000đ</span>
                  <span className="text-slate-400 text-xs font-bold">/ tháng</span>
                </div>

                <ul className="space-y-3">
                  {[
                    "Mở khóa đề xuất CV AI phù hợp",
                    "Xem Báo cáo tuyển dụng chuyên sâu",
                    "Đẩy tin nổi bật không giới hạn",
                    "Hỗ trợ ưu tiên 24/7 từ EventMate"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                      <Check className="w-4 h-4 text-emerald-500" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={handleBuyPremiumService}
                disabled={isPremium}
                className={`mt-8 w-full rounded-xl font-black h-11 shadow-sm
                  ${isPremium
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                  }
                `}
              >
                {isPremium ? "Đã được kích hoạt" : "Kích hoạt ngay"}
              </Button>
            </div>

            {/* Basic Push Plan */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-850 p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">Đẩy tin VIP bài đăng</h3>
                  <p className="text-slate-400 text-xs font-semibold mt-1">Tăng độ tiếp cận của bài tuyển dụng</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black">290.000đ</span>
                  <span className="text-slate-400 text-xs font-bold">/ 7 ngày</span>
                </div>

                <ul className="space-y-3">
                  {[
                    "Ghim bài đăng lên top 1 trang chủ sinh viên",
                    "Hiển thị nhãn VIP nổi bật trên bài đăng",
                    "Đẩy tin tự động mỗi 24 giờ"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
                      <Check className="w-4 h-4 text-emerald-500" /> {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                onClick={() => showToast({ title: "Dịch vụ giả lập", message: "Gói đẩy tin VIP đã được mô phỏng kích hoạt thành công cho chiến dịch!", type: "info" })}
                className="mt-8 w-full rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black h-11"
              >
                Mua gói đẩy tin
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 7. TAB: CHAT (TÍCH HỢP HỘI THOẠI TRỰC TIẾP) */}
      {activeTab === "chat" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Danh sách cuộc trò chuyện</h1>

          {loadingChats ? (
            <div className="text-center py-12 text-slate-500 font-medium">Đang tải cuộc trò chuyện...</div>
          ) : activeChats.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-150 rounded-[2rem] bg-white dark:bg-slate-900">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">Chưa có cuộc trò chuyện nào</h3>
              <p className="text-slate-500 font-medium mt-1">Nhấp vào nút nhắn tin trên hồ sơ ứng viên để bắt đầu cuộc hội thoại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeChats.map((chat) => {
                const student = chat.profiles
                const event = chat.events
                return (
                  <div
                    key={chat.id}
                    onClick={() => handleStartChatWithStudent(event?.id, student?.id)}
                    className="p-5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-250 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <img src={student?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=40&h=40&q=80"} alt={student?.full_name} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100" />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{student?.full_name}</h4>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{student?.university || "Sinh viên"}</p>
                        <span className="inline-block text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded mt-1.5 font-semibold">
                          Chiến dịch: {event?.title}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400 shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 8. TAB: ACCOUNT (TÀI KHOẢN TỔ CHỨC) */}
      {activeTab === "account" && (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
          <div className="flex bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl max-w-md mx-auto shadow-sm">
            <button
              onClick={() => setActiveSubTab("info")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${activeSubTab === "info"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              Thông tin công ty/CLB
            </button>
            <button
              onClick={() => setActiveSubTab("password")}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-black transition-all ${activeSubTab === "password"
                  ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
            >
              Đổi mật khẩu
            </button>
          </div>

          {activeSubTab === "info" ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cột trái: Upload Logo và hình ảnh doanh nghiệp */}
              <div className="lg:col-span-1 space-y-6">

                {/* LOGO UPLOAD CARD */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 text-center shadow-sm flex flex-col items-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Logo Công ty / CLB</h3>
                  <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-md group">
                    <img
                      src={profileData.avatarUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=150&h=150&q=80"}
                      alt="Company Logo"
                      className="w-full h-full object-cover"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-all duration-200"
                    >
                      <span className="text-xs font-black">Thay đổi Logo</span>
                    </label>
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleUploadLogo(file)
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => document.getElementById("logo-upload")?.click()}
                    className="mt-4 px-4 py-2 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border dark:border-slate-850 rounded-xl text-xs font-black transition-all"
                  >
                    {uploadingAvatar ? "Đang tải lên..." : "Tải ảnh mới"}
                  </button>
                  <p className="text-[10px] text-slate-400 mt-2 font-semibold">Khuyến nghị: Tỉ lệ 1:1, tối đa 2MB.</p>
                </div>

                {/* COMPANY IMAGES GALLERY & UPLOAD */}
                <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800/80 rounded-[2rem] p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hình ảnh hoạt động</h3>

                  <div className="grid grid-cols-2 gap-3">
                    {profileData.companyImages ? (
                      profileData.companyImages.split(',').filter(Boolean).map((imgUrl, idx) => (
                        <div key={idx} className="relative aspect-video rounded-xl overflow-hidden border border-slate-100 dark:border-slate-850 group">
                          <img src={imgUrl} alt={`Company image ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleDeleteCompanyImage(idx)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all shadow-sm"
                          >
                            <span className="text-[10px] font-bold block px-1">Xóa</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 text-center py-6 text-slate-400 text-xs font-semibold">Chưa có hình ảnh nào.</div>
                    )}
                  </div>

                  <input
                    type="file"
                    id="company-image-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleUploadCompanyImage(file)
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById("company-image-upload")?.click()}
                    className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 text-slate-500 hover:text-emerald-600"
                  >
                    {uploadingCompanyImage ? "Đang tải ảnh..." : "Thêm ảnh hoạt động"}
                  </button>
                </div>
              </div>

              {/* Cột phải: Form thông tin chi tiết */}
              <div className="lg:col-span-2">
                <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Thông tin công ty/CLB</h2>
                    <p className="text-slate-400 text-xs font-semibold mt-0.5">Cập nhật và hoàn thiện hồ sơ tuyển dụng của bạn.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên công ty / CLB</label>
                      <input
                        type="text"
                        required
                        value={profileData.fullName}
                        onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                        placeholder="Tên đầy đủ của công ty..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mã số thuế (MST)</label>
                      <input
                        type="text"
                        value={profileData.mst}
                        onChange={(e) => setProfileData({ ...profileData, mst: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                        placeholder="Mã số thuế..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Số điện thoại liên hệ</label>
                      <input
                        type="tel"
                        required
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                        placeholder="Số điện thoại..."
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email liên hệ</label>
                      <input
                        type="email"
                        disabled
                        value={profileData.email}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 text-slate-500 text-sm font-bold cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                      <input
                        type="url"
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                        placeholder="https://example.com"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quy mô (số nhân viên)</label>
                      <select
                        value={profileData.scale}
                        onChange={(e) => setProfileData({ ...profileData, scale: e.target.value })}
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                      >
                        <option value="">Chọn quy mô...</option>
                        <option value="1-9 nhân viên">1-9 nhân viên</option>
                        <option value="10-24 nhân viên">10-24 nhân viên</option>
                        <option value="25-99 nhân viên">25-99 nhân viên</option>
                        <option value="100-499 nhân viên">100-499 nhân viên</option>
                        <option value="500+ nhân viên">500+ nhân viên</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                      placeholder="Địa chỉ công ty..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả công ty / CLB</label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                      rows={4}
                      className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                      placeholder="Giới thiệu chung về công ty hoặc câu lạc bộ..."
                    />
                  </div>

                  <Button type="submit" disabled={isUpdatingProfile} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 shadow-md">
                    {isUpdatingProfile ? "Đang lưu thay đổi..." : "Lưu thay đổi"}
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <form onSubmit={handleChangePassword} className="max-w-2xl mx-auto bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 space-y-6 shadow-sm">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">Đổi mật khẩu</h2>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Đặt lại mật khẩu bảo mật mới.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={passwordState.newPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                  placeholder="Tối thiểu 6 ký tự..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  required
                  value={passwordState.confirmPassword}
                  onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 focus:bg-white text-sm font-bold transition-all focus:border-emerald-500"
                  placeholder="Xác nhận lại mật khẩu..."
                />
              </div>

              <Button type="submit" disabled={isUpdatingPassword} className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black h-12 shadow-md">
                {isUpdatingPassword ? "Đang đổi mật khẩu..." : "Xác nhận đổi mật khẩu"}
              </Button>
            </form>
          )}
        </div>
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

      {/* FLOATING DEV TOGGLE PREMIUM */}
      <button
        onClick={togglePremium}
        className="fixed bottom-6 right-6 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold px-4 py-2.5 rounded-full text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all z-[9999] flex items-center gap-1.5 border border-slate-200 dark:border-slate-800"
      >
        <Crown className="w-3.5 h-3.5 text-amber-500 fill-current" />
        Dev: {isPremium ? "Tắt VIP" : "Bật VIP"}
      </button>
    </OrgLayout>
  )
}