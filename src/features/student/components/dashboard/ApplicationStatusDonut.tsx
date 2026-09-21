interface ApplicationStatusDonutProps {
  applicationStats: {
    total: number
    underReview: number
    accepted: number
    rejected: number
  }
  reviewPct: number
  acceptPct: number
  rejectPct: number
}

export function ApplicationStatusDonut({
  applicationStats,
  reviewPct,
  acceptPct,
  rejectPct,
}: ApplicationStatusDonutProps) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  return (
    <div className="bg-white rounded-[16px] border border-[#ededed] p-5 shadow-xs flex flex-col justify-between gap-5 relative overflow-hidden">
      {/* Top: Donut Chart + Key Legend (Figma Node 6465:30186) */}
      <div className="flex items-center justify-between gap-4 w-full">
        {/* Donut Graphic (150x150) (Figma Node 6465:30187) */}
        <div className="relative size-[150px] shrink-0 flex items-center justify-center">
          <svg className="size-full -rotate-90" viewBox="0 0 150 150">
            {/* Background Track */}
            <circle
              cx="75"
              cy="75"
              r="54"
              stroke="#EDEDED"
              strokeWidth="18"
              fill="transparent"
            />
            {/* Under Review Segment */}
            {applicationStats.underReview > 0 && (
              <circle
                cx="75"
                cy="75"
                r="54"
                stroke="#004EB7"
                strokeWidth="18"
                fill="transparent"
                strokeDasharray={`${(reviewPct / 100) * 339.292} 339.292`}
                strokeDashoffset="0"
              />
            )}
            {/* Accepted Segment */}
            {applicationStats.accepted > 0 && (
              <circle
                cx="75"
                cy="75"
                r="54"
                stroke="#6EABFF"
                strokeWidth="18"
                fill="transparent"
                strokeDasharray={`${(acceptPct / 100) * 339.292} 339.292`}
                strokeDashoffset={-((reviewPct / 100) * 339.292)}
              />
            )}
            {/* Rejected Segment */}
            {applicationStats.rejected > 0 && (
              <circle
                cx="75"
                cy="75"
                r="54"
                stroke="#CFE3FF"
                strokeWidth="18"
                fill="transparent"
                strokeDasharray={`${(rejectPct / 100) * 339.292} 339.292`}
                strokeDashoffset={-(((reviewPct + acceptPct) / 100) * 339.292)}
              />
            )}
          </svg>

          {/* Center Metrics Text (Figma Node 6465:30192) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="font-['Inter'] font-semibold text-[#222222] text-[18px] leading-tight">
              {applicationStats.total}
            </span>
            <span className="font-['Inter'] font-normal text-[#515151] text-[12px] leading-tight">
              Tổng đơn
            </span>
          </div>
        </div>

        {/* Key Legend (148px) (Figma Node 6465:30196) */}
        <div className="flex flex-col gap-[10px] items-start flex-1 min-w-0">
          {/* Line 1: Under Review (Figma Node 6465:30197) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[12px] min-w-0">
              <div className="bg-[#004EB7] rounded-full size-[16px] shrink-0" />
              <p className="font-['Inter'] font-medium text-[#515151] text-[14px] truncate">
                Chờ duyệt
              </p>
            </div>
            <p className="font-['Inter'] font-medium text-[#222222] text-[14px] shrink-0 ml-2">
              {applicationStats.underReview}
            </p>
          </div>

          {/* Line 2: Accepted (Figma Node 6465:30202) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[12px] min-w-0">
              <div className="bg-[#6EABFF] rounded-full size-[16px] shrink-0" />
              <p className="font-['Inter'] font-medium text-[#515151] text-[14px] truncate">
                Trúng tuyển
              </p>
            </div>
            <p className="font-['Inter'] font-medium text-[#222222] text-[14px] shrink-0 ml-2">
              {applicationStats.accepted}
            </p>
          </div>

          {/* Line 3: Rejected (Figma Node 6465:30208) */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-[12px] min-w-0">
              <div className="bg-[#CFE3FF] rounded-full size-[16px] shrink-0" />
              <p className="font-['Inter'] font-medium text-[#515151] text-[14px] truncate">
                Từ chối
              </p>
            </div>
            <p className="font-['Inter'] font-medium text-[#222222] text-[14px] shrink-0 ml-2">
              {applicationStats.rejected}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom: Card Header + Description (Figma Node 6465:30212) */}
      <div className="flex flex-col gap-[8px] w-full">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-['Inter'] font-semibold text-[#222222] text-[18px] sm:text-[20px]">
            Trạng thái ứng tuyển
          </h3>
          <span className="font-['Inter'] font-normal text-[#515151] text-[12px] capitalize">
            Tháng {currentMonth}, {currentYear}
          </span>
        </div>
        <p className="font-['Inter'] font-normal leading-[1.6] text-[#757575] text-[13px] sm:text-[14px]">
          Theo dõi tiến độ duyệt hồ sơ sự kiện và nhận thông báo kết quả ngay khi BTC phê duyệt.
        </p>
      </div>
    </div>
  )
}
