import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, DollarSign, Video, Briefcase } from "lucide-react"

interface EventData {
  id: string
  title: string
  location: string
  event_date: string
  position_type: string
  benefits: string
  danang_wards?: { name: string }
}

interface ApplicationData {
  id: string
  status: string
  events: EventData
}

interface InterviewData {
  id: string
  title: string
  scheduled_at: string
  meeting_link?: string
  status: string
  events?: {
    id: string
    title: string
    location: string
  }
}

interface CalendarEntry {
  id: string
  title: string
  location: string
  time?: string
  meetingLink?: string
  type: "event" | "interview"
  positionType?: string
  benefits?: string
}

interface ScheduleCalendarProps {
  applications: ApplicationData[]
  interviews?: InterviewData[]
}

export default function ScheduleCalendar({ applications, interviews = [] }: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Lấy các đơn ứng tuyển đã được duyệt
  const approvedApps = applications.filter((app) => app.status === "approved" && app.events?.event_date)

  // Nhóm các sự kiện và lịch phỏng vấn theo ngày (format: YYYY-MM-DD)
  const entriesByDate = [...approvedApps, ...interviews].reduce<Record<string, CalendarEntry[]>>((acc, item) => {
    let dateStr = ""
    let entry: CalendarEntry

    if ("events" in item && "applied_at" in item) {
      // Đơn ứng tuyển (Sự kiện)
      const app = item as ApplicationData
      dateStr = new Date(app.events.event_date).toISOString().split("T")[0]
      entry = {
        id: app.events.id,
        title: app.events.title,
        location: app.events.danang_wards?.name ? `P. ${app.events.danang_wards.name}` : app.events.location,
        type: "event",
        positionType: app.events.position_type,
        benefits: app.events.benefits
      }
    } else {
      // Lịch hẹn phỏng vấn
      const interview = item as InterviewData
      dateStr = new Date(interview.scheduled_at).toISOString().split("T")[0]
      entry = {
        id: interview.id,
        title: `Phỏng vấn: ${interview.title}`,
        location: interview.events?.location || "Trực tuyến",
        time: new Date(interview.scheduled_at).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        }),
        meetingLink: interview.meeting_link,
        type: "interview"
      }
    }

    if (!acc[dateStr]) {
      acc[dateStr] = []
    }
    acc[dateStr].push(entry)
    return acc
  }, {})

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Ngày đầu tiên của tháng
  const firstDayOfMonth = new Date(year, month, 1)
  const startDayOfWeek = firstDayOfMonth.getDay() // 0: CN, 1: T2, ...

  // Số ngày trong tháng
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Mảng chứa các ngày hiển thị trên lịch
  const calendarCells = []

  // Thêm các ô trống trước ngày đầu tiên của tháng
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null)
  }

  // Thêm các ngày trong tháng
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(year, month, day))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
  ]

  const [selectedDateEntries, setSelectedDateEntries] = useState<CalendarEntry[] | null>(null)
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null)

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    const entries = entriesByDate[dateStr] || []
    setSelectedDateEntries(entries.length > 0 ? entries : null)
    setSelectedDateStr(entries.length > 0 ? date.toLocaleDateString("vi-VN") : null)
  }

  const todayStr = new Date().toISOString().split("T")[0]

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800/80 p-6 shadow-xl shadow-slate-100/40 dark:shadow-none transition-all">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Lịch trình cá nhân</h2>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500">Các công việc & lịch phỏng vấn của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
          <button
            onClick={prevMonth}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-black text-slate-800 dark:text-slate-250 px-2 min-w-[90px] text-center">
            {monthNames[month]} {year}
          </span>
          <button
            onClick={nextMonth}
            className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Lưới lịch */}
      <div className="grid grid-cols-7 gap-2 mb-4 text-center">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((dayName, idx) => (
          <span
            key={dayName}
            className={`text-xs font-black pb-2 ${
              idx === 0 ? "text-rose-500" : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {dayName}
          </span>
        ))}

        {calendarCells.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />
          }

          const dateStr = date.toISOString().split("T")[0]
          const isToday = dateStr === todayStr
          const dayEntries = entriesByDate[dateStr] || []
          const hasEntries = dayEntries.length > 0
          const hasEvents = dayEntries.some((e) => e.type === "event")
          const hasInterviews = dayEntries.some((e) => e.type === "interview")

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all group ${
                isToday
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-md font-black"
                  : hasEntries
                  ? "bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-850 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 hover:bg-[#00b14f]/10"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 font-medium"
              }`}
            >
              <span className="text-sm font-bold">{date.getDate()}</span>
              {hasEntries && (
                <div className="absolute bottom-2 flex gap-1 justify-center w-full">
                  {hasEvents && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                  {hasInterviews && <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Chi tiết sự kiện của ngày được chọn */}
      {selectedDateEntries && selectedDateStr && (
        <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-850/80 animate-in fade-in slide-in-from-top-2 duration-350">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400">
              Lịch trình ngày {selectedDateStr}
            </h4>
            <button
              onClick={() => {
                setSelectedDateEntries(null)
                setSelectedDateStr(null)
              }}
              className="text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Đóng
            </button>
          </div>
          <div className="space-y-3">
            {selectedDateEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 shadow-sm space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h5 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                    {entry.title}
                  </h5>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    entry.type === "interview" 
                      ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-100/55 dark:border-blue-900/30" 
                      : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 border border-emerald-100/55 dark:border-emerald-900/30"
                  }`}>
                    {entry.type === "interview" ? "Phỏng vấn" : "Sự kiện"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    {entry.location}
                  </span>
                  {entry.type === "interview" ? (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-500" />
                      Thời gian: {entry.time}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
                      {entry.positionType}
                    </span>
                  )}
                  {entry.type === "event" && entry.benefits && (
                    <span className="flex items-center gap-1.5 col-span-full">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                      Quyền lợi: <strong className="text-slate-800 dark:text-slate-200">{entry.benefits}</strong>
                    </span>
                  )}
                  {entry.type === "interview" && entry.meetingLink && (
                    <a
                      href={entry.meetingLink.startsWith("http") ? entry.meetingLink : `https://${entry.meetingLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 col-span-full font-black text-emerald-600 dark:text-emerald-400 hover:underline mt-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Tham gia cuộc họp online &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
