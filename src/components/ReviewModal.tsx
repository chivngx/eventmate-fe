import { useState } from "react"
import { X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

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
        alert("Bạn đã đánh giá đối phương cho sự kiện này rồi!")
      } else {
        alert("Lỗi khi gửi đánh giá: " + error.message)
      }
    } else {
      alert("🎉 Cảm ơn bạn đã gửi đánh giá!")
      if (onReviewSuccess) onReviewSuccess()
      onClose()
    }
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 w-full max-w-md shadow-2xl p-6 relative overflow-hidden transition-all">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Đánh giá dịch vụ</h3>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-6">
          Nhận xét của bạn về: <strong className="text-emerald-600 dark:text-emerald-400">{revieweeName}</strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mức độ hài lòng</span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 hover:scale-110 transition-transform text-amber-400 hover:text-amber-500"
                >
                  <Star
                    className="w-8 h-8"
                    fill={(hoverRating !== null ? star <= hoverRating : star <= rating) ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Ý kiến đóng góp</label>
            <textarea
              required
              rows={4}
              placeholder="Chia sẻ trải nghiệm làm việc của bạn..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-800 p-3.5 text-sm font-medium focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-slate-100 transition-colors resize-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold h-11 text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-11 text-xs shadow-md shadow-emerald-600/20"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
