"use client"

import React, { useState } from "react"
import { Calendar, Video } from "lucide-react"

export interface InterviewItem {
  id: string
  name: string
  role: string
  time: string
  meetLink?: string
}

interface ScheduleWidgetProps {
  interviews?: InterviewItem[]
  onOpenMeet?: (item: InterviewItem) => void
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
  interviews = [],
  onOpenMeet
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

      {/* 2. Phần Phỏng vấn hôm nay (Today's Interview) */}
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center w-full">
          <h4 className="text-[16px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
            Phỏng vấn hôm nay
          </h4>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {interviews.length === 0 ? (
            <div className="py-6 text-center rounded-[8px] border border-dashed border-[#ededed] dark:border-zinc-800 text-[13px] text-[#757575] dark:text-zinc-400">
              Không có lịch phỏng vấn nào hôm nay
            </div>
          ) : (
            interviews.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-2.5 flex items-start justify-between gap-3 hover:border-slate-300 dark:hover:border-zinc-700 transition"
              >
                <div className="flex flex-col gap-2 items-start min-w-0 flex-1">
                  <p className="text-[10px] font-medium text-[#757575] dark:text-zinc-400 leading-normal truncate w-full">
                    Phỏng vấn cùng{" "}
                    <span className="text-[#282828] dark:text-zinc-100 font-semibold">{item.name}</span>
                  </p>
                  <div className="flex flex-col gap-1 items-start w-full">
                    <p className="text-[12px] font-medium text-[#282828] dark:text-zinc-200 leading-tight">
                      {item.time}
                    </p>
                    <p className="text-[12px] font-normal text-[#757575] dark:text-zinc-400 leading-tight truncate w-full">
                      {item.role}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onOpenMeet
                      ? onOpenMeet(item)
                      : window.open(item.meetLink || "https://meet.google.com/new", "_blank")
                  }
                  title="Tham gia Google Meet"
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] bg-[#f4f4f4] dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-[#282828] dark:text-white flex items-center justify-center shrink-0 transition"
                >
                  <Video className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
