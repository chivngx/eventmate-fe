import React, { useState } from "react"
import { Calendar, MapPin, Users } from "lucide-react"

export interface ScheduleEventItem {
  id: string
  title: string
  location?: string
  date: string
  applicantsCount?: number
}

interface ScheduleWidgetProps {
  events?: ScheduleEventItem[]
  onSelectEvent?: (id: string) => void
}

const getWeekDays = () => {
  const days = []
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const now = new Date()
  for (let i = -2; i <= 2; i++) {
    const d = new Date()
    d.setDate(now.getDate() + i)
    days.push({
      day: dayNames[d.getDay()],
      num: String(d.getDate()),
      isToday: i === 0
    })
  }
  return days
}

export default function ScheduleWidget({
  events = [],
  onSelectEvent
}: ScheduleWidgetProps) {
  const days = getWeekDays()
  const todayNum = String(new Date().getDate())
  const [selectedDay, setSelectedDay] = useState(todayNum)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-4 flex flex-col gap-6 shadow-none">
      {/* 1. Phần Lịch trình (Schedule) */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center justify-between w-full">
          <h4 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
            Lịch trình
          </h4>
          <Calendar className="w-5 h-5 text-[#222222] dark:text-zinc-300 stroke-[1.75]" />
        </div>

        {/* Thanh ngày trong tuần (DayOfSchedule Strip) */}
        <div className="flex items-center justify-between gap-1.5 w-full">
          {days.map((item) => {
            const isActive = selectedDay === item.num
            return (
              <button
                key={item.num}
                type="button"
                onClick={() => setSelectedDay(item.num)}
                className={`flex-1 min-w-[44px] py-1.5 px-2 rounded-[8px] flex flex-col items-center gap-1 transition-all ${
                  isActive
                    ? "bg-[#282828] dark:bg-white text-white dark:text-[#282828] border border-transparent shadow-sm"
                    : "border border-[#ededed] dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-transparent"
                }`}
              >
                <span
                  className={`text-[12px] font-normal leading-normal ${
                    isActive ? "text-[#cbcbcb] dark:text-[#757575]" : "text-[#a5a5a5] dark:text-zinc-400"
                  }`}
                >
                  {item.day}
                </span>
                <span
                  className={`text-[14px] font-medium leading-[1.6] ${
                    isActive ? "text-white dark:text-[#282828]" : "text-[#222222] dark:text-zinc-100"
                  }`}
                >
                  {item.num}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. Phần Sự kiện sắp diễn ra (Upcoming Events) */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center w-full">
          <h4 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
            Sự kiện sắp diễn ra
          </h4>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {events.length === 0 ? (
            <div className="py-6 text-center rounded-[8px] border border-dashed border-[#ededed] dark:border-zinc-800 text-[13px] text-[#757575] dark:text-zinc-400">
              Chưa có sự kiện nào sắp tới
            </div>
          ) : (
            events.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectEvent && onSelectEvent(item.id)}
                className="bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-2.5 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition cursor-pointer"
              >
                <div className="flex flex-col gap-1 items-start min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-[#282828] dark:text-zinc-100 leading-snug line-clamp-1">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-[#757575] dark:text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>
                    {item.location && (
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </span>
                    )}
                  </div>
                </div>

                {item.applicantsCount !== undefined && (
                  <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full shrink-0">
                    <Users className="w-3 h-3" />
                    <span>{item.applicantsCount}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
