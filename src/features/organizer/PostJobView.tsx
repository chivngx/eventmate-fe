"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useWards, useJobPositions, useEventCategories } from "@/hooks/useLookups"
import PostJobForm from "./components/post-job/PostJobForm"
import { SkeletonGenericPage } from "@/components/ui/skeleton"

export default function PostJobView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isPremium, singleEventCredits, refreshProfile, loading: authLoading } = useUser()
  const { showToast } = useToast()

  const editId = searchParams?.get("edit") || null

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [location, setLocation] = useState("")
  const [wardId, setWardId] = useState("")
  const [positionType, setPositionType] = useState("")
  const [benefits, setBenefits] = useState("")
  const [category, setCategory] = useState("")
  const [slotsNeeded, setSlotsNeeded] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [salaryAmount, setSalaryAmount] = useState("")
  const [salaryType, setSalaryType] = useState("per_shift")
  const [paymentMethod, setPaymentMethod] = useState("cash_after_event")
  const [zaloGroupLink, setZaloGroupLink] = useState("")
  const [applicationDeadline, setApplicationDeadline] = useState("")
  const [isUrgent, setIsUrgent] = useState(false)
  const [isFeatured, setIsFeatured] = useState(false)
  const [existingQrCode, setExistingQrCode] = useState<string | null>(null)
  const [eventsThisMonth, setEventsThisMonth] = useState<number>(0)

  const [loading, setLoading] = useState(false)
  const [fetchingEdit, setFetchingEdit] = useState(!!editId)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const hasSingleEventCredit = !isPremium && (singleEventCredits || 0) > 0
  const monthlyLimit = isPremium ? 5 : 1 + (singleEventCredits || 0)

  const { data: wards = [] } = useWards()
  const { data: posData = [] } = useJobPositions()
  const { data: catData = [] } = useEventCategories()

  const positionsList = posData.map((p) => p.name)
  const categoriesList = catData.map((c) => c.name)

  // Validate form fields comprehensively
  const validateForm = () => {
    const errs: Record<string, string> = {}
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, "0")
    const d = String(now.getDate()).padStart(2, "0")
    const todayStr = `${y}-${m}-${d}`

    // 1. Tên vị trí
    if (!title.trim()) {
      errs.title = "Vui lòng nhập tên vị trí tuyển dụng"
    } else if (title.trim().length < 5) {
      errs.title = "Tên vị trí phải có ít nhất 5 ký tự"
    }

    // 2. Danh mục sự kiện
    if (!category.trim()) {
      errs.category = "Vui lòng chọn danh mục sự kiện"
    }

    // 3. Vai trò phụ trách
    if (!positionType.trim()) {
      errs.positionType = "Vui lòng chọn vai trò phụ trách"
    }

    // 4. Số lượng tuyển dụng
    const slots = parseInt(slotsNeeded, 10)
    if (!slotsNeeded || isNaN(slots) || slots < 1) {
      errs.slotsNeeded = "Số lượng cần tuyển phải từ 1 người trở lên"
    }

    // 5. Hạn chót nộp đơn
    if (!applicationDeadline) {
      errs.applicationDeadline = "Vui lòng chọn hạn chót nhận đơn"
    } else if (applicationDeadline < todayStr) {
      errs.applicationDeadline = "Hạn chót ứng tuyển không thể ở trong quá khứ"
    }

    // 6. Phường / Xã
    if (!wardId) {
      errs.wardId = "Vui lòng chọn Phường / Xã tại Đà Nẵng"
    }

    // 7. Địa chỉ cụ thể
    if (!location.trim()) {
      errs.location = "Vui lòng nhập địa chỉ / địa điểm chi tiết"
    } else if (location.trim().length < 3) {
      errs.location = "Địa chỉ phải có ít nhất 3 ký tự"
    }

    // 8. Ngày bắt đầu sự kiện
    if (!eventDate) {
      errs.eventDate = "Vui lòng chọn ngày bắt đầu sự kiện"
    } else if (eventDate < todayStr) {
      errs.eventDate = "Ngày sự kiện không thể ở trong quá khứ"
    }

    // Kiểm tra tương quan hạn chót vs ngày sự kiện
    if (applicationDeadline && eventDate && applicationDeadline > eventDate) {
      errs.applicationDeadline = "Hạn chót không được sau ngày diễn ra sự kiện"
    }

    // 9. Ngày kết thúc (nếu có)
    if (endDate && eventDate && endDate < eventDate) {
      errs.endDate = "Ngày kết thúc không thể trước ngày bắt đầu"
    }

    // 10. Giờ ca trực
    if (startTime && endTime && (!endDate || endDate === eventDate)) {
      if (startTime >= endTime) {
        errs.endTime = "Giờ kết thúc ca trực phải sau giờ bắt đầu"
      }
    }

    // 11. Mức thù lao
    if (salaryType !== "volunteer") {
      const sal = Number(salaryAmount)
      if (!salaryAmount || isNaN(sal) || sal < 0) {
        errs.salaryAmount = "Vui lòng nhập mức thù lao hợp lệ (>= 0 đ)"
      }
    }

    // 12. Link nhóm Zalo
    if (zaloGroupLink.trim()) {
      const isUrl = /^https?:\/\/.+/i.test(zaloGroupLink.trim())
      if (!isUrl) {
        errs.zaloGroupLink = "Link nhóm phải là URL hợp lệ (VD: https://zalo.me/g/...)"
      }
    }

    // 13. Mô tả chi tiết
    if (!desc.trim()) {
      errs.desc = "Vui lòng nhập mô tả nhiệm vụ và yêu cầu"
    } else if (desc.trim().length < 20) {
      errs.desc = "Mô tả cần ít nhất 20 ký tự để ứng viên nắm rõ công việc"
    }

    return errs
  }

  // Check quota for current month
  useEffect(() => {
    if (!user) return
    const checkQuota = async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

      const { count } = await supabase
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("organizer_id", user.id)
        .gte("created_at", startOfMonth)
        .lte("created_at", endOfMonth)

      setEventsThisMonth(count || 0)
    }

    checkQuota()
  }, [user])

  // Fetch existing event if editing
  useEffect(() => {
    if (!editId || !user) return

    const fetchEditEvent = async () => {
      setFetchingEdit(true)
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", editId)
        .eq("organizer_id", user.id)
        .maybeSingle()

      if (error || !data) {
        showToast({
          title: "Lỗi",
          message: "Không tìm thấy sự kiện hoặc bạn không có quyền chỉnh sửa.",
          type: "error",
        })
        router.push("/manage-events")
        return
      }

      if (data) {
        setTitle(data.title || "")
        setDesc(data.description || "")
        setLocation(data.location || "")
        setWardId(data.ward_id ? String(data.ward_id) : "")
        setPositionType(data.position_type || "")
        setCategory(data.category || "")
        setBenefits(Array.isArray(data.benefits) ? data.benefits.join(", ") : data.benefits || "")
        setSlotsNeeded(data.slots_needed ? String(data.slots_needed) : "1")
        setEventDate(data.event_date ? data.event_date.split("T")[0] : "")
        setEndDate(data.end_date ? data.end_date.split("T")[0] : "")
        setStartTime(data.start_time || "07:30")
        setEndTime(data.end_time || "17:00")
        setSalaryAmount(data.salary_amount != null ? String(data.salary_amount) : "0")
        setSalaryType(data.salary_type || "per_shift")
        setPaymentMethod(data.payment_method || "cash_after_event")
        setZaloGroupLink(data.zalo_group_link || "")
        setApplicationDeadline(data.application_deadline ? data.application_deadline.split("T")[0] : "")
        const isSingleEvent = data.plan_tier === "single_event"
        const canKeepUrgent = isPremium || isSingleEvent
        const canKeepQr = isPremium || isSingleEvent
        setIsUrgent(canKeepUrgent ? Boolean(data.is_urgent) : false)
        setIsFeatured(isPremium ? Boolean(data.is_featured) : false)
        setExistingQrCode(canKeepQr ? data.qr_checkin_code || null : null)
      }
      setFetchingEdit(false)
    }

    fetchEditEvent()
  }, [editId, user, isPremium])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstKey = Object.keys(validationErrors)[0]
      const firstMsg = validationErrors[firstKey]
      showToast({
        title: "Thông tin chưa hợp lệ",
        message: firstMsg || "Vui lòng kiểm tra lại các trường thông tin có viền đỏ!",
        type: "error",
      })

      // Scroll to first invalid element
      const el = document.getElementById(`event-${firstKey}`)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" })
      }
      return
    }
    setErrors({})

    if (!editId && eventsThisMonth >= 1 && !isPremium && (singleEventCredits || 0) <= 0) {
      showToast({
        title: "Đạt hạn mức đăng tin",
        message: "Bạn đã sử dụng hết hạn mức 1 sự kiện miễn phí trong tháng này. Vui lòng mua gói Sự Kiện Nhanh (99k) hoặc Doanh Nghiệp VIP để đăng thêm!",
        type: "error",
      })
      return
    }

    if (!editId && isPremium && eventsThisMonth >= monthlyLimit) {
      showToast({
        title: "Đạt hạn mức đăng tin",
        message: `Bạn đã sử dụng hết hạn mức ${monthlyLimit} sự kiện trong tháng này.`,
        type: "error",
      })
      return
    }

    if (!user) return

    setLoading(true)

    // Xác định sự kiện đăng mới thuộc gói nào
    const willBeSingleEvent = !isPremium && (singleEventCredits || 0) > 0
    const canUseUrgent = isPremium || willBeSingleEvent
    const canUseQR = isPremium || willBeSingleEvent
    const canUseFeatured = isPremium

    const qrCode = canUseQR
      ? existingQrCode || Math.random().toString(36).substring(2, 8).toUpperCase()
      : null

    const assignedTier = isPremium
      ? "enterprise"
      : willBeSingleEvent
      ? "single_event"
      : "free"

    const eventPayload = {
      title,
      description: desc,
      location,
      ward_id: Number(wardId),
      position_type: positionType || "Tình nguyện viên",
      benefits,
      category: category || "Sự kiện chung",
      slots_needed: parseInt(slotsNeeded, 10) || 1,
      event_date: eventDate ? new Date(eventDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      start_time: startTime || null,
      end_time: endTime || null,
      salary_amount: salaryAmount ? Number(salaryAmount) : 0,
      salary_type: salaryType,
      payment_method: paymentMethod,
      zalo_group_link: zaloGroupLink ? zaloGroupLink.trim() : null,
      application_deadline: applicationDeadline ? new Date(applicationDeadline).toISOString() : null,
      is_urgent: canUseUrgent ? isUrgent : false,
      is_featured: canUseFeatured ? isFeatured : false,
      plan_tier: assignedTier,
      qr_checkin_code: qrCode,
    }

    try {
      if (editId) {
        const { error } = await supabase
          .from("events")
          .update(eventPayload)
          .eq("id", editId)
          .eq("organizer_id", user.id)

        if (error) throw error

        showToast({
          title: "Thành công",
          message: "Cập nhật bài tuyển dụng thành công!",
          type: "success",
        })
      } else {
        const { error } = await supabase.from("events").insert([
          { organizer_id: user.id, ...eventPayload, status: "upcoming" },
        ])

        if (error) throw error

        // Nếu dùng credit Sự Kiện Nhanh, trừ đi 1 lượt
        if (willBeSingleEvent) {
          await supabase
            .from("profiles")
            .update({ single_event_credits: Math.max(0, (singleEventCredits || 1) - 1) })
            .eq("id", user.id)
          if (refreshProfile) await refreshProfile()
        }

        showToast({
          title: "Thành công",
          message: willBeSingleEvent
            ? "Đăng bài Sự Kiện Nhanh thành công! Đã tự động kích hoạt Ghim Tuyển Gấp và Điểm danh QR."
            : "Tạo bài tuyển dụng sự kiện mới thành công!",
          type: "success",
        })
      }

      router.push("/manage-events")
    } catch (err: any) {
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(err, "Không thể lưu tin tuyển dụng. Vui lòng thử lại."),
        type: "error",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/manage-events")
  }

  if (authLoading || fetchingEdit) {
    return <SkeletonGenericPage />
  }

  return (
    <div className="w-full animate-in fade-in duration-200">
      <PostJobForm
        editingId={editId}
        title={title}
        setTitle={setTitle}
        location={location}
        setLocation={setLocation}
        wardId={wardId}
        setWardId={setWardId}
        wards={wards}
        eventDate={eventDate}
        setEventDate={setEventDate}
        endDate={endDate}
        setEndDate={setEndDate}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        salaryAmount={salaryAmount}
        setSalaryAmount={setSalaryAmount}
        salaryType={salaryType}
        setSalaryType={setSalaryType}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        zaloGroupLink={zaloGroupLink}
        setZaloGroupLink={setZaloGroupLink}
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
        isUrgent={isUrgent}
        setIsUrgent={setIsUrgent}
        isFeatured={isFeatured}
        setIsFeatured={setIsFeatured}
        isPremium={isPremium}
        singleEventCredits={singleEventCredits || 0}
        eventsThisMonthCount={eventsThisMonth}
        monthlyLimit={monthlyLimit}
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        positionsList={positionsList}
        categoriesList={categoriesList}
        errors={errors}
        setErrors={setErrors}
      />
    </div>
  )
}
