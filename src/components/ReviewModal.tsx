"use client"

import { useState } from"react"
import { Star } from"lucide-react"
import { Button } from"@/components/ui/button"
import { Modal } from"@/components/ui/modal"
import { supabase } from"@/lib/supabase"
import { getUserFacingMessage } from"@/lib/error"

interface ReviewModalProps {
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
 const [rating, setRating] = useState<number>(5)
 const [comment, setComment] = useState("")
 const [submitting, setSubmitting] = useState(false)
 const [hoverRating, setHoverRating] = useState<number | null>(null)

 if (!isOpen) return null

 // 🔒 P2.3: early return kept for backward-compat (Modal also guards internally)

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
 if (error.code ==="23505") {
 alert("Bạn đã đánh giá đối phương cho sự kiện này rồi!")
 } else {
 alert(getUserFacingMessage(error,"Không thể gửi đánh giá. Vui lòng thử lại."))
 }
 } else {
 alert("🎉 Cảm ơn bạn đã gửi đánh giá!")
 if (onReviewSuccess) onReviewSuccess()
 onClose()
 }
 setSubmitting(false)
 }

 return (
 <Modal isOpen={isOpen} onClose={onClose} label="Đánh giá dịch vụ" maxWidthClassName="max-w-md" panelClassName="rounded-2xl border border-slate-200 p-6 sm:p-8 overflow-hidden">
 <h3 className="text-xl font-bold text-slate-900 mb-2">Đánh giá dịch vụ</h3>
 <p className="text-sm font-semibold text-slate-500 mb-6">
 Nhận xét của bạn về: <strong className="text-primary">{revieweeName}</strong>
 </p>

 <form onSubmit={handleSubmit} className="space-y-6">
 <div className="flex flex-col items-center justify-center gap-2">
 <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mức độ hài lòng</span>
 <div className="flex items-center gap-1.5">
 {[1, 2, 3, 4, 5].map((star) => (
 <button
 type="button"
 key={star}
 onClick={() => setRating(star)}
 onMouseEnter={() => setHoverRating(star)}
 onMouseLeave={() => setHoverRating(null)}
 aria-label={`Đánh giá ${star} sao`}
 aria-pressed={rating === star}
 className="p-1 hover:scale-110 transition-transform text-amber-400 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 rounded"
 >
 <Star
 className="w-8 h-8"
 fill={(hoverRating !== null ? star <= hoverRating : star <= rating) ?"currentColor" :"none"}
 />
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-2">
 <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Ý kiến đóng góp</label>
 <textarea
 required
 rows={4}
 placeholder="Chia sẻ trải nghiệm làm việc của bạn..."
 value={comment}
 onChange={(e) => setComment(e.target.value)}
 className="w-full rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-sm font-medium focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
 />
 </div>

 <div className="flex gap-3 pt-2">
 <Button
 type="button"
 onClick={onClose}
 variant="outline"
 className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50 font-bold h-11 text-xs"
 >
 Hủy
 </Button>
 <Button
 type="submit"
 disabled={submitting}
 className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs shadow-md shadow-emerald-600/20"
 >
 {submitting ?"Đang gửi..." :"Gửi đánh giá"}
 </Button>
 </div>
 </form>
 </Modal>
 )
}
