"use client"

import { Calendar } from"lucide-react"
import { Button } from"@/components/ui/button"
import { Modal } from"@/components/ui/modal"

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
 <Modal isOpen={isOpen} onClose={onClose} label="Hẹn phỏng vấn" maxWidthClassName="max-w-md" panelClassName="rounded-2xl border border-slate-200 overflow-hidden">
 <div className="p-6 border-b border-slate-100 flex items-center bg-slate-50/50">
 <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
 <Calendar className="w-5 h-5 text-slate-500" />
 Hẹn phỏng vấn
 </h3>
 </div>

 <form onSubmit={onSubmit} className="p-6 space-y-4">
 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">Chủ đề phỏng vấn *</label>
 <input
 type="text"
 required
 placeholder="Ví dụ: Phỏng vấn vị trí CTV Sự Kiện..."
 value={interviewTitle}
 onChange={(e) => setInterviewTitle(e.target.value)}
 className="w-full h-11 bg-slate-50 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 transition-colors"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">Thời gian diễn ra *</label>
 <input
 type="datetime-local"
 required
 value={interviewDate}
 onChange={(e) => setInterviewDate(e.target.value)}
 className="w-full h-11 bg-slate-50 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 transition-colors"
 />
 </div>

 <div className="space-y-1.5">
 <label className="text-xs font-bold text-slate-700">Link phòng họp (Google Meet, Zoom...) - Không bắt buộc</label>
 <input
 type="text"
 placeholder="Ví dụ: meet.google.com/abc-defg-hij"
 value={interviewLink}
 onChange={(e) => setInterviewLink(e.target.value)}
 className="w-full h-11 bg-slate-50 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 transition-colors"
 />
 </div>

 <div className="pt-3">
 <Button
 type="submit"
 disabled={creatingInterview}
 className="w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-11 flex items-center justify-center gap-1.5 shadow-md shadow-slate-200"
 >
 {creatingInterview ?"Đang lên lịch..." :"Gửi lời mời phỏng vấn"}
 </Button>
 </div>
 </form>
 </Modal>
 )
}
