"use client"

import { useState, useEffect } from "react"
import {
  X,
  Phone,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Heart,
  Calendar,
  User,
  Globe,
  Briefcase,
  Printer,
  Mail,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"

export interface CVExperienceItem {
  id?: string
  title: string
  company?: string
  year?: string
  description?: string
}

export interface CVProfileData {
  id?: string
  student_id?: string
  full_name?: string | null
  email?: string | null
  avatar_url?: string | null
  phone?: string | null
  reliability_score?: number | null
  university?: string | null
  bio?: string | null
  skills?: string | string[] | null
  cv_completion_percent?: number | null
  gender?: string | null
  birth_year?: string | number | null
  social_link?: string | null
  cv_url?: string | null
  experiences?: CVExperienceItem[] | string | null
}

export interface CVModalProps {
  isOpen?: boolean
  profile?: CVProfileData | null
  viewingCV?: CVProfileData | null
  onClose: () => void
}

export default function CVModal({
  isOpen = true,
  profile,
  viewingCV,
  onClose,
}: CVModalProps) {
  const data = profile || viewingCV
  const { user } = useUser()
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const studentId = data?.id || data?.student_id

  // 1. Tự động ghi nhận lượt xem & kiểm tra trạng thái Like (khi là Organizer xem hồ sơ ứng viên)
  useEffect(() => {
    if (!studentId || !user || user.id === studentId) return

    // Ghi nhận view
    supabase.rpc("record_profile_view", { p_student_id: studentId }).then()

    // Kiểm tra trạng thái đã Like
    const checkLike = async () => {
      const { data: likeData } = await supabase
        .from("profile_likes")
        .select("id")
        .eq("student_id", studentId)
        .eq("organizer_id", user.id)
        .maybeSingle()
      setIsLiked(Boolean(likeData))
    }
    checkLike()
  }, [studentId, user])

  // 2. Thao tác Like / Bookmark ứng viên
  const handleToggleLike = async () => {
    if (!user || !studentId || user.id === studentId || isLiking) return
    setIsLiking(true)
    try {
      if (isLiked) {
        await supabase
          .from("profile_likes")
          .delete()
          .eq("student_id", studentId)
          .eq("organizer_id", user.id)
        setIsLiked(false)
      } else {
        await supabase
          .from("profile_likes")
          .insert({ student_id: studentId, organizer_id: user.id })
        setIsLiked(true)
      }
    } catch (err) {
      console.error("Lỗi khi thích hồ sơ:", err)
    } finally {
      setIsLiking(false)
    }
  }

  if (!isOpen || !data) return null

  const displayName = data.full_name || "Ứng viên EventMate"
  const rawExperiences = data.experiences
  const experiences: CVExperienceItem[] = Array.isArray(rawExperiences)
    ? (rawExperiences as CVExperienceItem[])
    : typeof rawExperiences === "string"
      ? (() => {
        try {
          const parsed = JSON.parse(rawExperiences)
          return Array.isArray(parsed) ? (parsed as CVExperienceItem[]) : []
        } catch {
          return []
        }
      })()
      : []

  const skillsList = Array.isArray(data.skills)
    ? data.skills
    : typeof data.skills === "string"
      ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : []

  const isExternalViewer = user && studentId && user.id !== studentId

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static animate-in fade-in duration-200">
      <div className="bg-white rounded-[16px] border border-slate-200 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:rounded-none print:border-none print:w-full animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#fafafa] p-5 sm:p-6 flex items-start justify-between border-b border-slate-200 shrink-0 print:hidden">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar className="size-[54px] rounded-full border border-slate-300 bg-slate-100 shadow-xs shrink-0">
              <AvatarImage src={data.avatar_url || undefined} className="object-cover" />
              <AvatarFallback className="bg-emerald-600 text-white font-semibold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h3 className="font-semibold text-[17px] text-slate-900 leading-snug truncate">
                {displayName}
              </h3>
              <p className="text-[13px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <Mail className="size-3.5 shrink-0" />
                <span>{data.email || "Chưa cập nhật email"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-8 px-3 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              title="In hoặc tải bản PDF"
            >
              <Printer className="size-3.5" />
              <span className="hidden sm:inline">In / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Đóng"
              className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-white print:p-8">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
                <Phone className="size-3" /> SĐT / Zalo
              </p>
              <p className="font-semibold text-slate-800 text-[13px] truncate">
                {data.phone || "Chưa cập nhật"}
              </p>
            </div>

            <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
                <ShieldCheck className="size-3 text-emerald-600" /> Uy tín
              </p>
              <p className="font-semibold text-emerald-600 text-[13px]">
                {data.reliability_score ?? 100}/100
              </p>
            </div>

            <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
                <User className="size-3 text-slate-500" /> Giới tính
              </p>
              <p className="font-semibold text-slate-800 text-[13px] truncate">
                {data.gender || "Chưa rõ"}
              </p>
            </div>

            <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3 space-y-1">
              <p className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="size-3 text-slate-500" /> Năm sinh
              </p>
              <p className="font-semibold text-slate-800 text-[13px] truncate">
                {data.birth_year ? String(data.birth_year) : "Chưa rõ"}
              </p>
            </div>
          </div>

          {/* School / Education */}
          <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3.5 space-y-1">
            <p className="text-[11px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-slate-500" /> Trường học / Khoa ngành
            </p>
            <p className="font-medium text-slate-800 text-[13px]">
              {data.university || "Chưa cập nhật thông tin trường học"}
            </p>
          </div>

          {/* Social / Portfolio Link */}
          {data.social_link && (
            <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="size-4 text-zinc-900 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-slate-500 uppercase">Portfolio / Liên kết cá nhân</p>
                  <a
                    href={data.social_link.startsWith("http") ? data.social_link : `https://${data.social_link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-zinc-900 hover:text-black hover:underline font-semibold truncate block"
                  >
                    {data.social_link}
                  </a>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-slate-400 shrink-0" />
            </div>
          )}

          {/* Experiences */}
          <div className="space-y-2.5">
            <p className="text-[12px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-slate-700" /> Kinh nghiệm sự kiện thực chiến
            </p>
            {experiences.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-[#fafafa] border border-slate-200 text-[13px] text-slate-400 italic">
                Ứng viên chưa cập nhật kinh nghiệm sự kiện.
              </div>
            ) : (
              <div className="space-y-2">
                {experiences.map((exp, i) => (
                  <div key={exp.id || i} className="p-3 rounded-xl bg-[#fafafa] border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[13px] text-slate-800">{exp.title}</span>
                      {exp.year && (
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-600 shrink-0 font-medium">
                          {exp.year}
                        </span>
                      )}
                    </div>
                    {exp.company && (
                      <p className="text-[12px] font-semibold text-zinc-700">{exp.company}</p>
                    )}
                    {exp.description && (
                      <p className="text-[12px] text-slate-600 leading-relaxed pt-0.5">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-slate-500 uppercase flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-slate-700" /> Kỹ năng &amp; Thế mạnh
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.length > 0 ? (
                skillsList.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-[12px] font-medium"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-[13px] text-slate-400 italic">Ứng viên chưa cập nhật kỹ năng.</p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-slate-500 uppercase">Giới thiệu bản thân &amp; Mục tiêu</p>
            <div className="bg-[#fafafa] border border-slate-200 rounded-xl p-3.5 text-[13px] text-slate-700 leading-relaxed">
              {data.bio || <span className="italic text-slate-400">Chưa có thông tin giới thiệu.</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fafafa] border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
          {isExternalViewer ? (
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`h-9 px-4 rounded-lg border inline-flex items-center gap-2 text-[13px] font-medium transition-colors cursor-pointer ${isLiked
                  ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
            >
              <Heart className={`size-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-slate-400"}`} />
              <span>{isLiked ? "Đã thích hồ sơ" : "Thích hồ sơ"}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 rounded-lg border border-slate-300 hover:bg-slate-100 bg-white text-slate-700 font-medium text-[13px] transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
