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
  const { user, loading: authLoading } = useUser()
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

  const [loading, setLoading] = useState(false)
  const [fetchingEdit, setFetchingEdit] = useState(!!editId)

  const { data: wards = [] } = useWards()
  const { data: posData = [] } = useJobPositions()
  const { data: catData = [] } = useEventCategories()

  const positionsList = posData.map((p) => p.name)
  const categoriesList = catData.map((c) => c.name)

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

      if (data && !error) {
        setTitle(data.title || "")
        setDesc(data.description || "")
        setLocation(data.location || "")
        setWardId(data.ward_id ? String(data.ward_id) : "")
        setPositionType(data.position_type || "Tình nguyện viên")
        setBenefits(data.benefits || "Cấp chứng nhận")
        setCategory(data.category || "Lễ hội Âm nhạc")
        setSlotsNeeded(String(data.slots_needed || 1))
        setEventDate(data.event_date ? data.event_date.split("T")[0] : "")
        setEndDate(data.end_date ? data.end_date.split("T")[0] : "")
        setStartTime(data.start_time || "07:30")
        setEndTime(data.end_time || "17:00")
        setSalaryAmount(data.salary_amount != null ? String(data.salary_amount) : "0")
        setSalaryType(data.salary_type || "per_shift")
        setPaymentMethod(data.payment_method || "cash_after_event")
        setZaloGroupLink(data.zalo_group_link || "")
        setApplicationDeadline(data.application_deadline ? data.application_deadline.split("T")[0] : "")
      }
      setFetchingEdit(false)
    }

    fetchEditEvent()
  }, [editId, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title || !desc || !wardId || !eventDate || !applicationDeadline) {
      showToast({
        title: "Thiếu thông tin",
        message: "Vui lòng điền đầy đủ tiêu đề, mô tả, chọn Phường/Xã và thời hạn ứng tuyển!",
        type: "error",
      })
      return
    }

    if (!user) return

    setLoading(true)

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

        showToast({
          title: "Thành công",
          message: "Tạo bài tuyển dụng sự kiện mới thành công!",
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
        loading={loading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        positionsList={positionsList}
        categoriesList={categoriesList}
      />
    </div>
  )
}
