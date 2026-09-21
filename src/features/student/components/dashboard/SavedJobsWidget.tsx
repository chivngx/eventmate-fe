"use client"

import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"

interface SavedJobsWidgetProps {
  savedJobs: any[]
}

export default function SavedJobsWidget({ savedJobs = [] }: SavedJobsWidgetProps) {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[12px] items-start px-[24px] py-[16px] relative rounded-[16px] w-full border border-[#ededed] shadow-xs">
      {/* Header */}
      <div className="content-stretch flex items-center justify-between relative shrink-0 w-full">
        <h3 className="[word-break:break-word] font-['Inter'] font-semibold leading-normal not-italic relative shrink-0 text-[#222222] text-[18px] whitespace-nowrap">
          Việc làm đã lưu
        </h3>
        <Link
          href="/my-events?tab=saved_job"
          className="content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[12px] py-[6px] relative rounded-[8px] shrink-0 text-[#005ddc] hover:bg-blue-50/60 transition-colors group cursor-pointer"
        >
          <span className="[word-break:break-word] font-['Inter'] font-medium leading-[1.6] not-italic relative shrink-0 text-[#005ddc] text-[14px] whitespace-nowrap">
            Xem tất cả
          </span>
          <ChevronRight className="w-4 h-4 text-[#005ddc] shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* List Container */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-full divide-y divide-[#ededed]">
        {savedJobs.length > 0 ? (
          savedJobs.map((job) => {
            const org = job.organizer || job.profiles
            const orgName = org?.full_name || org?.university || "Doanh nghiệp / Ban tổ chức"
            const orgAvatar = org?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=005DDC&color=fff`
            const jobLocation = job.danang_wards?.name || job.location || "Đà Nẵng"
            const jobType = job.position_type || "Toàn thời gian"

            // Calculate remaining days
            let badgeText = "Còn 3 ngày ứng tuyển"
            if (job.application_deadline || job.event_date) {
              const targetDate = new Date(job.application_deadline || job.event_date).getTime()
              const diffDays = Math.ceil((targetDate - Date.now()) / (1000 * 60 * 60 * 24))
              if (diffDays > 0) {
                badgeText = `Còn ${diffDays} ngày ứng tuyển`
              } else if (diffDays === 0) {
                badgeText = "Hôm nay hết hạn"
              } else {
                badgeText = "Đã hết hạn"
              }
            }

            return (
              <div
                key={job.id}
                className="bg-white content-stretch flex flex-col items-center justify-center py-[10px] px-[4px] relative shrink-0 w-full hover:bg-slate-50/50 transition-colors"
              >
                <div className="content-stretch flex items-center justify-between relative shrink-0 w-full gap-3">
                  <Link
                    href={`/events/${job.id}`}
                    className="content-stretch flex gap-[12px] items-center relative shrink-0 min-w-0 flex-1 group"
                  >
                    <div className="relative rounded-[32px] shrink-0 size-[40px] overflow-hidden border border-[#ededed] bg-slate-100">
                      <img
                        alt={orgName}
                        className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[32px] size-full"
                        src={orgAvatar}
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=005DDC&color=fff`
                        }}
                      />
                    </div>
                    <div className="[word-break:break-word] content-stretch flex flex-col gap-[2px] items-start not-italic relative shrink-0 min-w-0 flex-1">
                      <p className="font-['Inter'] font-medium leading-[1.6] relative shrink-0 text-[#222222] text-[14px] w-full truncate group-hover:text-[#005ddc] transition-colors">
                        {job.title}
                      </p>
                      <div className="content-stretch flex font-['Inter'] font-normal gap-[4px] items-center leading-normal relative shrink-0 text-[#757575] w-full whitespace-nowrap text-[12px] truncate">
                        <span className="overflow-hidden relative shrink-0 text-[12px] text-ellipsis max-w-[140px]">
                          {orgName}
                        </span>
                        <span className="relative shrink-0 text-[14px] text-[#757575] leading-none">
                          •
                        </span>
                        <span className="relative shrink-0 text-[12px]">
                          {jobType}
                        </span>
                        <span className="relative shrink-0 text-[14px] text-[#757575] leading-none">
                          •
                        </span>
                        <span className="relative shrink-0 text-[12px] truncate max-w-[120px]">
                          {jobLocation}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <div
                    className="bg-[#fee] content-stretch flex h-[20px] items-center justify-center px-[8px] py-[4px] relative rounded-[4px] shrink-0"
                  >
                    <p className="[word-break:break-word] font-['Inter'] font-normal leading-normal not-italic relative shrink-0 text-[#dc0000] text-[12px] whitespace-nowrap">
                      {badgeText}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="w-full py-8 text-center flex flex-col items-center justify-center gap-2">
            <p className="font-['Inter'] text-[14px] text-[#757575]">
              Bạn chưa lưu việc làm nào
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-1 font-['Inter'] text-[13px] font-medium text-[#005ddc] hover:underline"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Khám phá việc làm & sự kiện ngay</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
