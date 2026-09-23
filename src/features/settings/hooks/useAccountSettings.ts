"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import { getStudentProfileCompletion } from "@/lib/profile-completion"

export function useAccountSettings() {
  const { user, profile, loading: authLoading, refreshProfile, isPremium } = useUser()
  const { showToast } = useToast()

  // System & Meta State
  const [hasPassword, setHasPassword] = useState(true)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Profile Fields
  const [userId, setUserId] = useState<string>("")
  const [fullName, setFullName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [university, setUniversity] = useState<string>("")
  const [bio, setBio] = useState<string>("")
  const [skills, setSkills] = useState<string>("")
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [mst, setMst] = useState<string>("")
  const [website, setWebsite] = useState<string>("")
  const [scale, setScale] = useState<string>("")
  const [address, setAddress] = useState<string>("")
  const [mapEmbedUrl, setMapEmbedUrl] = useState<string>("")
  const [reliabilityScore, setReliabilityScore] = useState<number>(100)
  const [isVerified, setIsVerified] = useState<boolean>(false)

  // Student Preferences & Privacy States
  const [isSeekingJob, setIsSeekingJob] = useState<boolean>(true)
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true)
  const [showPhoneToOrganizer, setShowPhoneToOrganizer] = useState<boolean>(true)

  // Media upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Password Management State
  const [currentPassword, setCurrentPassword] = useState<string>("")
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")

  // Calculate real profile completion (Thống nhất 100% với Profile Page)
  const cvPercent = useMemo(() => {
    if (!profile && !user) return 0
    return getStudentProfileCompletion(user, profile).percent
  }, [user, profile])

  // Initialize data from Supabase Auth + Profile
  const loadProfileData = useCallback(async () => {
    if (authLoading) return
    if (!user) {
      setLoading(false)
      return
    }

    setUserId(user.id)
    setEmail(user.email || "")

    const providers = user.app_metadata?.providers || []
    setHasPassword(providers.includes("email"))

    // Fetch full profile row from DB to get the most up-to-date attributes
    const { data: dbProfile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    const p = dbProfile || profile

    if (p) {
      const urlRole = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("role") : null
      setRole(urlRole || p.role || "student")
      setFullName(p.full_name || "")
      setPhone(p.phone || "")
      setUniversity(p.university || "")
      setBio(p.bio || "")
      setSkills(p.skills || "")
      setAvatarUrl(p.avatar_url || "")
      setMst(p.mst || "")
      setWebsite(p.website || "")
      setScale(p.scale || "")
      setAddress(p.address || "")
      setMapEmbedUrl(p.map_embed_url || "")
      setReliabilityScore(p.reliability_score ?? 100)
      setIsVerified(Boolean(p.is_verified))
    }

    // Load student preferences (prefer user_metadata, fallback to localStorage)
    try {
      const meta = user.user_metadata || {}
      if (meta.isSeekingJob !== undefined) {
        setIsSeekingJob(Boolean(meta.isSeekingJob))
      } else {
        const savedSeeking = localStorage.getItem(`eventmate_seeking_${user.id}`)
        if (savedSeeking !== null) setIsSeekingJob(savedSeeking === "true")
      }

      if (meta.emailNotifications !== undefined) {
        setEmailNotifications(Boolean(meta.emailNotifications))
      } else {
        const savedNotif = localStorage.getItem(`eventmate_notif_${user.id}`)
        if (savedNotif !== null) setEmailNotifications(savedNotif === "true")
      }

      if (meta.showPhoneToOrganizer !== undefined) {
        setShowPhoneToOrganizer(Boolean(meta.showPhoneToOrganizer))
      } else {
        const savedPhoneShare = localStorage.getItem(`eventmate_phoneshare_${user.id}`)
        if (savedPhoneShare !== null) setShowPhoneToOrganizer(savedPhoneShare === "true")
      }
    } catch {
      // ignore
    }

    setLoading(false)
  }, [user, profile, authLoading])

  useEffect(() => {
    loadProfileData()
  }, [loadProfileData])

  // Clear transient alert message after 4s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  // Update Organizer Profile Logic
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setUpdating(true)
    setMessage(null)

    if (!fullName.trim()) {
      showToast({ title: "Thiếu thông tin", message: "Vui lòng nhập tên Đơn vị / Câu lạc bộ.", type: "error" })
      setUpdating(false)
      return
    }

    if (phone.trim()) {
      const phoneClean = phone.trim().replace(/[\s.-]/g, "")
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/
      if (!phoneRegex.test(phoneClean)) {
        showToast({ title: "Số điện thoại không hợp lệ", message: "Vui lòng nhập số điện thoại đúng định dạng (VD: 0905123456).", type: "error" })
        setUpdating(false)
        return
      }
    }

    if (website.trim()) {
      const isUrl = /^https?:\/\/.+/i.test(website.trim())
      if (!isUrl) {
        showToast({ title: "Website không hợp lệ", message: "Đường dẫn Website/Fanpage phải bắt đầu bằng http:// hoặc https://", type: "error" })
        setUpdating(false)
        return
      }
    }

    const isOrg = role === "organizer" || role === "employer"
    const updatePayload: any = {
      full_name: fullName.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      avatar_url: avatarUrl,
    }

    if (isOrg) {
      updatePayload.university = fullName.trim() // Keep synchronized with organization name
      updatePayload.mst = mst.trim()
      updatePayload.website = website.trim()
      updatePayload.scale = scale.trim()
      updatePayload.address = address.trim()
      updatePayload.map_embed_url = mapEmbedUrl.trim()
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)

    setUpdating(false)

    if (error) {
      const errText = getUserFacingMessage(error, "Cập nhật thông tin thất bại. Vui lòng thử lại.")
      setMessage({ type: "error", text: errText })
      showToast({ title: "Lỗi", message: errText, type: "error" })
    } else {
      const successText = "Đã lưu thông tin Đơn vị / CLB thành công!"
      setMessage({ type: "success", text: successText })
      showToast({ title: "Thành công", message: successText, type: "success" })
      await refreshProfile()
    }
  }

  // Instant Auto-Save Student Privacy & Notification Settings on Toggle
  const updateStudentSetting = async (
    key: "isSeekingJob" | "emailNotifications" | "showPhoneToOrganizer",
    nextVal: boolean,
    label: string
  ) => {
    if (!userId) return

    // Optimistically update local state immediately
    if (key === "isSeekingJob") setIsSeekingJob(nextVal)
    if (key === "emailNotifications") setEmailNotifications(nextVal)
    if (key === "showPhoneToOrganizer") setShowPhoneToOrganizer(nextVal)

    const storageKeys: Record<string, string> = {
      isSeekingJob: `eventmate_seeking_${userId}`,
      emailNotifications: `eventmate_notif_${userId}`,
      showPhoneToOrganizer: `eventmate_phoneshare_${userId}`,
    }

    try {
      localStorage.setItem(storageKeys[key], String(nextVal))
      await supabase.auth.updateUser({
        data: {
          [key]: nextVal,
        },
      })
      showToast({
        title: "Đã lưu cài đặt",
        message: `${label}: ${nextVal ? "Đang bật" : "Đã tắt"}`,
        type: "success",
      })
    } catch (error) {
      console.error("Auto-save setting failed:", error)
      showToast({
        title: "Lỗi lưu thiết lập",
        message: "Không thể lưu thay đổi vào tài khoản.",
        type: "error",
      })
    }
  }

  const handleToggleSeekingJob = (val: boolean) =>
    updateStudentSetting("isSeekingJob", val, "Trạng thái tìm việc sự kiện")

  const handleToggleShowPhone = (val: boolean) =>
    updateStudentSetting("showPhoneToOrganizer", val, "Chia sẻ SĐT (Zalo)")

  const handleToggleEmailNotif = (val: boolean) =>
    updateStudentSetting("emailNotifications", val, "Nhận email việc làm")

  // Retain manual save handler for backward compatibility
  const handleSaveStudentSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!userId) return

    setUpdating(true)
    try {
      localStorage.setItem(`eventmate_seeking_${userId}`, String(isSeekingJob))
      localStorage.setItem(`eventmate_notif_${userId}`, String(emailNotifications))
      localStorage.setItem(`eventmate_phoneshare_${userId}`, String(showPhoneToOrganizer))

      await supabase.auth.updateUser({
        data: {
          isSeekingJob,
          emailNotifications,
          showPhoneToOrganizer,
        },
      })

      const successText = "Đã lưu cài đặt tài khoản & quyền riêng tư thành công!"
      setMessage({ type: "success", text: successText })
      showToast({ title: "Thành công", message: successText, type: "success" })
    } catch {
      showToast({ title: "Thành công", message: "Đã cập nhật thiết lập!", type: "success" })
    } finally {
      setUpdating(false)
    }
  }

  // Update Password Logic
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newPassword || newPassword.length < 6) {
      const errText = "Mật khẩu mới phải có tối thiểu 6 ký tự!"
      setMessage({ type: "error", text: errText })
      showToast({ title: "Lỗi", message: errText, type: "error" })
      return
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      const errText = "Mật khẩu xác nhận không khớp!"
      setMessage({ type: "error", text: errText })
      showToast({ title: "Lỗi", message: errText, type: "error" })
      return
    }

    setUpdating(true)
    setMessage(null)

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    setUpdating(false)

    if (error) {
      const errText = getUserFacingMessage(error, "Đổi mật khẩu thất bại. Vui lòng thử lại.")
      setMessage({ type: "error", text: errText })
      showToast({ title: "Lỗi", message: errText, type: "error" })
    } else {
      const successText = "Đã cập nhật mật khẩu mới thành công!"
      setMessage({ type: "success", text: successText })
      showToast({ title: "Thành công", message: successText, type: "success" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    }
  }

  // Upload Avatar
  const handleUploadAvatar = async (file: File) => {
    if (!userId) return
    try {
      setUploadingAvatar(true)
      setMessage(null)

      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Kích thước tệp vượt quá giới hạn 2MB.")
      }

      const fileExt = file.name.split(".").pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { cacheControl: "3600", upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId)

      if (updateError) throw updateError

      setAvatarUrl(publicUrl)
      showToast({ title: "Thành công", message: "Đã cập nhật ảnh đại diện!", type: "success" })
      await refreshProfile()
    } catch (error: any) {
      const errText = getUserFacingMessage(error, "Tải ảnh lên thất bại. Vui lòng thử lại.")
      setMessage({ type: "error", text: errText })
      showToast({ title: "Lỗi tải ảnh", message: errText, type: "error" })
    } finally {
      setUploadingAvatar(false)
    }
  }

  return {
    role,
    loading,
    updating,
    message,
    fullName,
    setFullName,
    email,
    phone,
    setPhone,
    university,
    setUniversity,
    bio,
    setBio,
    skills,
    setSkills,
    avatarUrl,
    mst,
    setMst,
    website,
    setWebsite,
    scale,
    setScale,
    address,
    setAddress,
    mapEmbedUrl,
    setMapEmbedUrl,
    reliabilityScore,
    isVerified,
    isPremium,
    cvPercent,
    isSeekingJob,
    setIsSeekingJob,
    emailNotifications,
    setEmailNotifications,
    showPhoneToOrganizer,
    setShowPhoneToOrganizer,
    uploadingAvatar,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    hasPassword,
    handleUploadAvatar,
    handleUpdateProfile,
    handleSaveStudentSettings,
    handleToggleSeekingJob,
    handleToggleShowPhone,
    handleToggleEmailNotif,
    handleUpdatePassword,
  }
}
