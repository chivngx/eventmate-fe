"use client"

import { Users, CircleDollarSign, MoreVertical, ChevronRight } from "lucide-react"

export interface EventItem {
  id: string
  title: string
  position_type?: string
  salary_amount?: string | number
  salary_type?: string
  event_date?: string
  applications?: any[]
  status?: string
}

interface RecentlyPostedJobsTableProps {
  events?: EventItem[]
  onViewAll?: () => void
  onViewApplications?: (event: EventItem) => void
  onEditEvent?: (event: EventItem) => void
  onDeleteEvent?: (id: string) => void
}

export default function RecentlyPostedJobsTable({
  events = [],
  onViewAll,
  onViewApplications,
  onEditEvent,
  onDeleteEvent
}: RecentlyPostedJobsTableProps) {
  const displayEvents = events.slice(0, 5)

  const calculateDaysRemaining = (dateString?: string) => {
    if (!dateString) return "Chưa ấn định"
    const target = new Date(dateString).getTime()
    const now = new Date().getTime()
    const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24))
    return diff > 0 ? `Còn ${diff} ngày` : "Hôm nay"
  }

  return (
    <div className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] p-6 shadow-none flex flex-col gap-4">
      {/* 1. Header Row */}
      <div className="flex items-center justify-between w-full">
        <h3 className="text-[18px] font-semibold text-[#222222] dark:text-zinc-100 leading-normal">
          Tin tuyển dụng gần đây
        </h3>

        {onViewAll && (
          <button
            type="button"
            onClick={onViewAll}
            className="inline-flex items-center gap-1 text-[14px] font-medium text-[#222222] dark:text-zinc-200 hover:text-black dark:hover:text-white transition cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-4 h-4 text-[#222222] dark:text-zinc-300" />
          </button>
        )}
      </div>

      {/* 2. Table Container */}
      <div className="overflow-x-auto no-scrollbar w-full">
        <div className="min-w-[760px]">
          {/* Table Header Bar */}
          <div className="bg-[#f4f4f4] dark:bg-zinc-800/70 rounded-[8px] px-4 py-2 grid grid-cols-12 items-center text-[12px] font-normal text-[#515151] dark:text-zinc-400">
            <div className="col-span-4">Tin tuyển dụng</div>
            <div className="col-span-2 text-center">Trạng thái</div>
            <div className="col-span-2 text-center">Đơn ứng tuyển</div>
            <div className="col-span-2 text-center">Mức lương</div>
            <div className="col-span-2 text-right pr-3">Thao tác</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[#ededed] dark:divide-zinc-800">
            {displayEvents.length === 0 ? (
              <div className="py-8 text-center text-[14px] text-[#757575] dark:text-zinc-400">
                Chưa có tin tuyển dụng nào được đăng tải.
              </div>
            ) : (
              displayEvents.map((ev: any) => {
                const appCount = ev.applications?.length || 0
                const isEventActive =
                  ev.status !== "closed" &&
                  (!ev.event_date || new Date(ev.event_date) >= new Date())
                const daysRemaining = calculateDaysRemaining(ev.event_date)

                return (
                  <div
                    key={ev.id}
                    className="px-4 py-3.5 grid grid-cols-12 items-center text-sm hover:bg-[#fafafa] dark:hover:bg-zinc-800/40 transition"
                  >
                    {/* Cột 1: Vị trí & Thời hạn */}
                    <div className="col-span-4 pr-3">
                      <p className="font-semibold text-[14px] text-[#222222] dark:text-zinc-100 truncate">
                        {ev.title}
                      </p>
                      <p className="text-[12px] font-normal text-[#757575] dark:text-zinc-400 mt-0.5 truncate flex items-center gap-1.5">
                        <span>{ev.position_type || "Toàn thời gian"}</span>
                        <span>•</span>
                        <span>{daysRemaining}</span>
                      </p>
                    </div>

                    {/* Cột 2: Trạng thái (Active / Closed Badge) */}
                    <div className="col-span-2 flex justify-center">
                      {isEventActive ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] border border-[#009e00] text-[#009e00] text-[12px] font-normal leading-normal">
                          Đang mở
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] border border-[#757575] text-[#757575] text-[12px] font-normal leading-normal">
                          Đã đóng
                        </span>
                      )}
                    </div>

                    {/* Cột 3: Đơn ứng tuyển */}
                    <div className="col-span-2 flex items-center justify-center gap-1.5 text-[12px] font-normal text-[#282828] dark:text-zinc-200">
                      <Users className="w-4 h-4 text-[#282828] dark:text-zinc-400 shrink-0" />
                      <span className="truncate">{appCount} đơn ứng tuyển</span>
                    </div>

                    {/* Cột 4: Mức lương */}
                    <div className="col-span-2 flex items-center justify-center gap-1.5 text-[12px] font-normal text-[#282828] dark:text-zinc-200">
                      <CircleDollarSign className="w-4 h-4 text-[#282828] dark:text-zinc-400 shrink-0" />
                      <span className="truncate">
                        {ev.salary_amount
                          ? `${Number(String(ev.salary_amount).replace(/\D/g, "")).toLocaleString()}đ`
                          : "Thỏa thuận"}
                      </span>
                    </div>

                    {/* Cột 5: Nút hành động */}
                    <div className="col-span-2 flex items-center justify-end gap-2 pr-1">
                      <button
                        type="button"
                        onClick={() =>
                          onViewApplications
                            ? onViewApplications(ev)
                            : onViewAll && onViewAll()
                        }
                        className="border border-[#282828] dark:border-zinc-400 text-[#282828] dark:text-zinc-100 hover:bg-[#282828] hover:text-white dark:hover:bg-zinc-100 dark:hover:text-[#282828] rounded-[8px] h-8 px-3 text-[14px] font-medium transition cursor-pointer whitespace-nowrap"
                      >
                        Xem đơn
                      </button>

                      {onEditEvent && (
                        <button
                          type="button"
                          onClick={() => onEditEvent(ev)}
                          className="w-8 h-8 rounded-[8px] hover:bg-slate-100 dark:hover:bg-zinc-800 text-[#282828] dark:text-zinc-400 flex items-center justify-center transition cursor-pointer"
                          title="Tùy chọn khác"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

