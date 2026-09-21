"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/components/providers/ToastProvider"
import { getUserFacingMessage } from "@/lib/error"

export interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    eventId: string
    reviewerId: string
    revieweeId: string
    revieweeName: string
    onReviewSuccess?: () => void
}

export default function ReviewModal({
    isOpen,
    onClose,
    eventId,
    reviewerId,
    revieweeId,
    revieweeName,
    onReviewSuccess
}: ReviewModalProps) {
    const { showToast } = useToast()
    const [rating, setRating] = useState<number>(5)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [hoverRating, setHoverRating] = useState<number | null>(null)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        const { error } = await supabase.from("reviews").insert([
            {
                event_id: eventId,
                reviewer_id: reviewerId,
                reviewee_id: revieweeId,
                rating,
                comment
            }
        ])

        if (error) {
            if (error.code === "23505") {
                showToast({
                    title: "Đã đánh giá",
                    message: "Bạn đã đánh giá đối phương cho sự kiện này rồi!",
                    type: "info"
                })
            } else {
                showToast({
                    title: "Lỗi",
                    message: getUserFacingMessage(error, "Không thể gửi đánh giá. Vui lòng thử lại."),
                    type: "error"
                })
            }
        } else {
            showToast({
                title: "Thành công",
                message: "🎉 Cảm ơn bạn đã gửi đánh giá!",
                type: "success"
            })
            if (onReviewSuccess) onReviewSuccess()
            onClose()
        }
        setSubmitting(false)
    }

    const ratingLabels: Record<number, string> = {
        1: "Rất không hài lòng (1 sao)",
        2: "Chưa hài lòng (2 sao)",
        3: "Tạm được (3 sao)",
        4: "Hài lòng & Tốt (4 sao)",
        5: "Tuyệt vời & Xuất sắc (5 sao)"
    }

    const currentScore = hoverRating !== null ? hoverRating : rating

    return (
        <Modal isOpen={isOpen} onClose={onClose} label="Đánh giá người tham gia" maxWidthClassName="max-w-md" panelClassName="rounded-[16px] border border-[#ededed] bg-white p-6 sm:p-7 overflow-hidden shadow-xl">
            <h3 className="font-['Inter'] font-semibold text-[18px] text-[#222222] mb-1">Đánh giá người tham gia</h3>
            <p className="text-[13px] text-[#757575] mb-5">
                Nhận xét hiệu quả làm việc của: <strong className="text-[#222222] font-semibold">{revieweeName}</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col items-center justify-center gap-2 p-4 bg-[#fafafa] rounded-[12px] border border-[#ededed]">
                    <span className="text-[12px] font-medium text-[#757575]">Mức độ hài lòng & hoàn thành nhiệm vụ</span>
                    <div className="flex items-center gap-2 my-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                type="button"
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(null)}
                                aria-label={`Đánh giá ${star} sao`}
                                aria-pressed={rating === star}
                                className="p-1 hover:scale-115 transition-transform text-amber-400 hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#222222] rounded cursor-pointer"
                            >
                                <Star
                                    className="size-7"
                                    fill={(hoverRating !== null ? star <= hoverRating : star <= rating) ? "currentColor" : "none"}
                                />
                            </button>
                        ))}
                    </div>
                    <span className="text-[12px] font-semibold text-amber-700">
                        {ratingLabels[currentScore] || "5 sao"}
                    </span>
                </div>

                <div className="relative pt-1">
                    <label className="absolute -top-2 left-3 bg-white px-1.5 text-[12px] font-medium text-[#222222] z-10">
                        Ý kiến đóng góp & Nhận xét
                    </label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Chia sẻ trải nghiệm làm việc, tinh thần trách nhiệm và thái độ của ứng viên..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="w-full rounded-[8px] bg-white border border-[#cbcbcb] p-3.5 text-[13px] text-[#222222] placeholder:text-[#8c8c8c] focus:outline-none focus:border-[#222222] focus:ring-1 focus:ring-[#222222] transition-all resize-none leading-relaxed"
                    />
                </div>

                <div className="flex gap-3 pt-1">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-[42px] rounded-[8px] border border-[#cbcbcb] hover:border-slate-400 bg-white hover:bg-slate-50 font-medium text-[13px] text-[#222222] transition cursor-pointer"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 h-[42px] rounded-[8px] bg-[#222222] hover:bg-black text-white font-medium text-[13px] shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
