"use client"

import React, { useState, useEffect } from "react"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/providers/ToastProvider"
import { useUser } from "@/components/providers/AuthProvider"
import { supabase } from "@/lib/supabase"
import {
  Star,
  Sparkles,
  Bug,
  Layout,
  MessageSquare,
  CheckCircle2,
  Send,
  Loader2,
  HeartHandshake
} from "lucide-react"

export interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackCategory = "feature" | "bug" | "ux" | "general"

const CATEGORIES: { id: FeedbackCategory; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "feature", label: "Ý tưởng & Tính năng", icon: Sparkles },
  { id: "bug", label: "Báo lỗi sự cố", icon: Bug },
  { id: "ux", label: "Giao diện & Tiện ích", icon: Layout },
  { id: "general", label: "Góp ý chung", icon: MessageSquare },
]

const RATING_LABELS: Record<number, { text: string; emoji: string }> = {
  1: { text: "Rất tệ", emoji: "😞" },
  2: { text: "Chưa tốt", emoji: "😕" },
  3: { text: "Bình thường", emoji: "😐" },
  4: { text: "Hài lòng", emoji: "🙂" },
  5: { text: "Tuyệt vời!", emoji: "🤩" },
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const { user, profile, role } = useUser()
  const { showToast } = useToast()

  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [category, setCategory] = useState<FeedbackCategory>("general")
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Điền trước thông tin nếu đã đăng nhập
  useEffect(() => {
    if (user || profile) {
      setFullName(profile?.full_name || (user?.user_metadata?.full_name || user?.user_metadata?.name || ""))
      setEmail(user?.email || profile?.email || "")
    }
  }, [user, profile])

  const handleReset = () => {
    setTitle("")
    setContent("")
    setRating(5)
    setCategory("general")
    setIsSuccess(false)
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      showToast({
        title: "Thiếu nội dung",
        message: "Vui lòng nhập nội dung góp ý của bạn.",
        type: "error",
      })
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        user_id: user?.id || null,
        full_name: fullName.trim() || null,
        email: email.trim() || null,
        role: role || (user ? "student" : "guest"),
        category,
        rating,
        title: title.trim() || null,
        content: content.trim(),
        status: "pending",
      }

      const { error } = await supabase.from("feedbacks").insert(payload)

      if (error) {
        throw error
      }

      setIsSuccess(true)
      showToast({
        title: "Gửi phản hồi thành công",
        message: "Cảm ơn bạn đã đóng góp ý kiến giúp EventMate ngày càng hoàn thiện!",
        type: "success",
      })
    } catch (err: any) {
      console.error("[FeedbackModal] Submit error:", err)
      showToast({
        title: "Không thể gửi phản hồi",
        message: err?.message || "Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.",
        type: "error",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const currentRating = hoverRating || rating

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClassName="max-w-lg"
      panelClassName="p-0 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-2xl"
    >
      {isSuccess ? (
        <div className="p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-slate-900">Cảm ơn bạn rất nhiều!</h3>
            <p className="text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              Mỗi ý kiến đóng góp của bạn là động lực to lớn giúp đội ngũ phát triển EventMate nâng cao trải nghiệm mỗi ngày.
            </p>
          </div>
          <div className="pt-2">
            <Button
              type="button"
              onClick={handleClose}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 h-10 font-semibold cursor-pointer"
            >
              Hoàn tất
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary">
              <HeartHandshake className="w-5 h-5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Hòm thư góp ý</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">
              Đóng góp ý kiến cho EventMate
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              Chia sẻ trải nghiệm hoặc báo cáo sự cố để chúng tôi hỗ trợ và cải thiện tốt hơn.
            </p>
          </div>

          {/* Rating */}
          <div className="space-y-2 rounded-xl bg-slate-50 p-4 border border-slate-100 text-center">
            <label className="text-xs font-medium text-slate-600 block">
              Mức độ hài lòng của bạn khi sử dụng website:
            </label>
            <div className="flex items-center justify-center gap-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  aria-label={`Đánh giá ${star} sao`}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= currentRating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-xs font-semibold text-slate-700 h-4">
              {RATING_LABELS[currentRating]?.emoji} {RATING_LABELS[currentRating]?.text}
            </div>
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700">Chủ đề phản hồi</label>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon
                const isSelected = category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all text-left cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-primary" : "text-slate-400"}`} />
                    <span className="truncate">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label htmlFor="feedback-title" className="text-xs font-semibold text-slate-700">
              Tiêu đề tóm tắt (không bắt buộc)
            </label>
            <Input
              id="feedback-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Giao diện tìm kiếm sự kiện rất nhanh..."
              className="h-10 text-xs sm:text-sm rounded-xl"
              maxLength={120}
            />
          </div>

          {/* Content */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="feedback-content" className="text-xs font-semibold text-slate-700">
                Nội dung góp ý / Báo lỗi <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{content.length}/1000</span>
            </div>
            <textarea
              id="feedback-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              maxLength={1000}
              placeholder="Mô tả chi tiết những gì bạn thích, hoặc lỗi bạn gặp phải (kèm bước thực hiện nếu có)..."
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
            />
          </div>

          {/* Guest Info (chỉ hiện nếu chưa login hoặc cho phép chỉnh sửa) */}
          {!user && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Họ và tên của bạn</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Email liên hệ lại</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="h-9 text-xs rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-xl h-10 px-4 text-xs font-semibold cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl h-10 px-5 text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang gửi...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi góp ý</span>
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
