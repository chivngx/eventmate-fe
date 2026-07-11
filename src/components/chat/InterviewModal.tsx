"use client"

import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

/**
 * InterviewModal — form để organizer tạo lịch phỏng vấn cho student.
 *
 * Extracted from Chat.tsx (Phase 2 Task 5) để giảm file size.
 * State lives in parent; component chỉ nhận props.
 */
interface InterviewModalProps {
  isOpen: boolean
  onClose: () => void
  interviewTitle: string
  setInterviewTitle: (v: string) => void
  interviewDate: string
  setInterviewDate: (v: string) => void
  interviewLink: string
  setInterviewLink: (v: string) => void
  creatingInterview: boolean
  onSubmit: (e: React.FormEvent) => void
}

export default function InterviewModal({
  isOpen,
  onClose,
  interviewTitle,
  setInterviewTitle,
  interviewDate,
  setInterviewDate,
  interviewLink,
  setInterviewLink,
  creatingInterview,
  onSubmit,
}: InterviewModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            Hẹn phỏng vấn
          </h3>
          <button
            onClick={onClose}
            aria-label="Đóng form hẹn phỏng vấn"
            className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            Đóng
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chủ đề phỏng vấn *</label>
            <input
              type="text"
              required
              placeholder="Ví dụ: Phỏng vấn vị trí CTV Sự Kiện..."
              value={interviewTitle}
              onChange={(e) => setInterviewTitle(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:text-slate-150 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời gian diễn ra *</label>
            <input
              type="datetime-local"
              required
              value={interviewDate}
              onChange={(e) => setInterviewDate(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:text-slate-150 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Link phòng họp (Google Meet, Zoom...) - Không bắt buộc</label>
            <input
              type="text"
              placeholder="Ví dụ: meet.google.com/abc-defg-hij"
              value={interviewLink}
              onChange={(e) => setInterviewLink(e.target.value)}
              className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:text-slate-150 transition-colors"
            />
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              disabled={creatingInterview}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              {creatingInterview ? "Đang lên lịch..." : "Gửi lời mời phỏng vấn"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
