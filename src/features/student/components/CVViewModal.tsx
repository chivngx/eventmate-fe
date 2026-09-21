"use client"

import React, { useState, useEffect } from "react"
import { X, Phone, GraduationCap, Sparkles, ShieldCheck, FileText, ExternalLink, Heart, Calendar, User, Globe, Briefcase } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"

interface CVViewModalProps {
  viewingCV: any
  onClose: () => void
}

export default function CVViewModal({ viewingCV, onClose }: CVViewModalProps) {
  const { user } = useUser()
  const [isLiked, setIsLiked] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  const studentId = viewingCV?.id || viewingCV?.student_id

  useEffect(() => {
    if (!studentId || !user) return

    // 1. Tự động ghi nhận lượt xem (chống trùng trong ngày bằng RPC)
    if (user.id !== studentId) {
      supabase.rpc("record_profile_view", { p_student_id: studentId }).then()
    }

    // 2. Kiểm tra xem người dùng hiện tại đã thích hồ sơ này chưa
    const checkLikeStatus = async () => {
      const { data } = await supabase
        .from("profile_likes")
        .select("id")
        .eq("student_id", studentId)
        .eq("organizer_id", user.id)
        .maybeSingle()

      setIsLiked(!!data)
    }

    checkLikeStatus()
  }, [studentId, user])

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
      console.error("Error toggling like:", err)
    } finally {
      setIsLiking(false)
    }
  }

  if (!viewingCV) return null

  const displayName = viewingCV.full_name || "Người tham gia ẩn danh"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[16px] border border-[#ededed] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#fafafa] p-5 sm:p-6 flex items-start justify-between border-b border-[#ededed]">
          <div className="flex items-center gap-3.5">
            <Avatar className="size-[54px] rounded-full border border-[#cbcbcb] bg-slate-100 shadow-xs">
              <AvatarImage src={viewingCV.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-slate-200 text-[#222222] font-semibold text-lg">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-0.5">
              <h3 className="font-['Inter'] font-semibold text-[17px] text-[#222222] leading-snug">
                {displayName}
              </h3>
              <p className="text-[13px] text-[#757575]">{viewingCV.email || "Chưa cập nhật email"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="size-[34px] rounded-full flex items-center justify-center text-[#757575] hover:text-[#222222] hover:bg-[#ededed] transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 bg-white">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3 space-y-1">
              <p className="text-[11px] font-medium text-[#757575] uppercase flex items-center gap-1">
                <Phone className="size-3" /> SĐT / Zalo
              </p>
              <p className="font-semibold text-[#222222] text-[13px] truncate">
                {viewingCV.phone || "Chưa cập nhật"}
              </p>
            </div>

            <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3 space-y-1">
              <p className="text-[11px] font-medium text-[#757575] uppercase flex items-center gap-1">
                <ShieldCheck className="size-3 text-[#009E00]" /> Uy tín
              </p>
              <p className="font-semibold text-[#009E00] text-[13px]">
                {viewingCV.reliability_score ?? 100}/100
              </p>
            </div>

            <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3 space-y-1">
              <p className="text-[11px] font-medium text-[#757575] uppercase flex items-center gap-1">
                <User className="size-3 text-[#757575]" /> Giới tính
              </p>
              <p className="font-semibold text-[#222222] text-[13px] truncate">
                {viewingCV.gender || "Chưa rõ"}
              </p>
            </div>

            <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3 space-y-1">
              <p className="text-[11px] font-medium text-[#757575] uppercase flex items-center gap-1">
                <Calendar className="size-3 text-[#757575]" /> Năm sinh
              </p>
              <p className="font-semibold text-[#222222] text-[13px] truncate">
                {viewingCV.birth_year ? String(viewingCV.birth_year) : "Chưa rõ"}
              </p>
            </div>
          </div>

          {/* School / Education */}
          <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3.5 space-y-1">
            <p className="text-[11px] font-medium text-[#757575] uppercase flex items-center gap-1.5">
              <GraduationCap className="size-3.5 text-[#757575]" /> Trường học / Khoa ngành
            </p>
            <p className="font-medium text-[#222222] text-[13px]">
              {viewingCV.university || "Chưa cập nhật thông tin trường học"}
            </p>
          </div>

          {/* Social / Portfolio Link */}
          {viewingCV.social_link && (
            <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe className="size-4 text-[#005DDC] shrink-0" />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-[#757575] uppercase">Portfolio / Liên kết cá nhân</p>
                  <a
                    href={viewingCV.social_link.startsWith("http") ? viewingCV.social_link : `https://${viewingCV.social_link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-[#005DDC] hover:underline font-medium truncate block"
                  >
                    {viewingCV.social_link}
                  </a>
                </div>
              </div>
              <ExternalLink className="size-3.5 text-[#757575] shrink-0" />
            </div>
          )}

          {/* Attached PDF CV */}
          {viewingCV.cv_url && (
            <div className="bg-[#fafafa] border border-[#ededed] rounded-[12px] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="size-9 rounded-[8px] bg-[#ededed] flex items-center justify-center shrink-0 text-[#222222]">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#222222] truncate">Hồ sơ CV đính kèm (PDF)</p>
                  <p className="text-[11px] text-[#757575]">Xem tài liệu CV chi tiết của ứng viên</p>
                </div>
              </div>
              <a
                href={viewingCV.cv_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[6px] bg-[#222222] hover:bg-black text-white text-[12px] font-medium shadow-xs transition-colors shrink-0 cursor-pointer"
              >
                <span>Xem file PDF</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}

          {/* Experiences */}
          <div className="space-y-2.5">
            <p className="text-[12px] font-medium text-[#757575] uppercase flex items-center gap-1.5">
              <Briefcase className="size-3.5 text-[#222222]" /> Kinh nghiệm sự kiện thực chiến
            </p>
            {(() => {
              const exps = Array.isArray(viewingCV.experiences)
                ? viewingCV.experiences
                : typeof viewingCV.experiences === "string"
                ? (() => { try { return JSON.parse(viewingCV.experiences) } catch { return [] } })()
                : []

              if (exps.length === 0) {
                return (
                  <div className="p-3.5 rounded-[8px] bg-[#fafafa] border border-[#ededed] text-[13px] text-[#8c8c8c] italic">
                    Ứng viên chưa cập nhật kinh nghiệm sự kiện.
                  </div>
                )
              }

              return (
                <div className="space-y-2">
                  {exps.map((exp: any, i: number) => (
                    <div key={exp.id || i} className="p-3 rounded-[8px] bg-[#fafafa] border border-[#ededed] space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-[13px] text-[#222222]">{exp.title}</span>
                        {exp.year && (
                          <span className="text-[11px] px-2 py-0.5 rounded-[4px] bg-[#ededed] text-[#515151] shrink-0 font-medium">
                            {exp.year}
                          </span>
                        )}
                      </div>
                      {exp.company && (
                        <p className="text-[12px] font-medium text-[#005DDC]">{exp.company}</p>
                      )}
                      {exp.description && (
                        <p className="text-[12px] text-[#515151] leading-relaxed pt-0.5">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>

          {/* Skills */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-[#757575] uppercase flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-[#222222]" /> Kỹ năng & Thế mạnh
            </p>
            <div className="flex flex-wrap gap-1.5">
              {viewingCV.skills ? (
                viewingCV.skills.split(",").map((skill: string, i: number) => (
                  <span
                    key={i}
                    className="bg-[#f4f4f4] text-[#353535] border border-[#ededed] px-2.5 py-1 rounded-[6px] text-[12px] font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))
              ) : (
                <p className="text-[13px] text-[#8c8c8c] italic">Ứng viên chưa cập nhật kỹ năng.</p>
              )}
            </div>
          </div>

          {/* Bio / Introduction */}
          <div className="space-y-2">
            <p className="text-[12px] font-medium text-[#757575] uppercase">Giới thiệu bản thân & Mục tiêu</p>
            <div className="bg-[#fafafa] border border-[#ededed] rounded-[10px] p-3.5 text-[13px] text-[#353535] leading-relaxed">
              {viewingCV.bio || <span className="italic text-[#8c8c8c]">Chưa có thông tin giới thiệu.</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fafafa] border-t border-[#ededed] flex items-center justify-between gap-3">
          {user && studentId && user.id !== studentId ? (
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={isLiking}
              className={`h-[38px] px-4 rounded-[8px] border inline-flex items-center gap-2 text-[13px] font-medium transition cursor-pointer ${
                isLiked
                  ? "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "border-[#cbcbcb] bg-white text-[#222222] hover:bg-slate-50"
              }`}
            >
              <Heart className={`size-4 ${isLiked ? "fill-rose-500 text-rose-500" : "text-[#757575]"}`} />
              <span>{isLiked ? "Đã thích hồ sơ" : "Thích hồ sơ"}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-[38px] px-5 rounded-[8px] border border-[#cbcbcb] hover:border-slate-400 bg-white hover:bg-slate-50 text-[#222222] font-medium text-[13px] transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
