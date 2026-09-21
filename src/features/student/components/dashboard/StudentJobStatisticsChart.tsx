"use client"

import React, { useMemo, useState } from "react"
import { TrendingUp } from "lucide-react"

interface StudentJobStatisticsChartProps {
  timePeriod: "week" | "month" | "year"
  setTimePeriod: (p: "week" | "month" | "year") => void
  chartData: { label: string; dateStr: string; views: number; apps: number }[]
  dateRangeLabel: string
  periodViewsCount: number
  periodAppsCount: number
  periodLabel: string
  viewsGrowthPct: number
  appsGrowthPct: number
}

export default function StudentJobStatisticsChart({
  timePeriod,
  setTimePeriod,
  chartData,
  dateRangeLabel,
  periodViewsCount,
  periodAppsCount,
  periodLabel,
  viewsGrowthPct,
  appsGrowthPct,
}: StudentJobStatisticsChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  // SVG Spline calculations for Line Chart matching Figma Node 6498:44924
  const { viewsPath, appsPath, viewsAreaPath, appsAreaPath, viewPoints, appPoints, yAxisLevels, plotBounds } = useMemo(() => {
    const rawMax = Math.max(...chartData.map(r => Math.max(r.views, r.apps)), 1)
    let maxVal = 5
    if (rawMax > 5 && rawMax <= 10) maxVal = 10
    else if (rawMax > 10 && rawMax <= 25) maxVal = 25
    else if (rawMax > 25 && rawMax <= 50) maxVal = 50
    else if (rawMax > 50 && rawMax <= 100) maxVal = 100
    else if (rawMax > 100) maxVal = Math.ceil(rawMax / 50) * 50

    const plotLeft = 32
    const plotRight = 482
    const plotWidth = plotRight - plotLeft
    const topY = 16
    const botY = 144
    const plotHeight = botY - topY

    // 5 horizontal grid lines from top (maxVal) down to bottom (0)
    const yLevels = [
      { val: maxVal, y: topY },
      { val: Math.round(maxVal * 0.75), y: topY + plotHeight * 0.25 },
      { val: Math.round(maxVal * 0.5), y: topY + plotHeight * 0.5 },
      { val: Math.round(maxVal * 0.25), y: topY + plotHeight * 0.75 },
      { val: 0, y: botY },
    ]

    const N = chartData.length
    const vPoints = chartData.map((d, i) => {
      const x = N <= 1 ? plotLeft + plotWidth / 2 : plotLeft + (i / (N - 1)) * plotWidth
      const y = botY - (d.views / maxVal) * plotHeight
      return { x, y, val: d.views, label: d.label, dateStr: d.dateStr }
    })

    const aPoints = chartData.map((d, i) => {
      const x = N <= 1 ? plotLeft + plotWidth / 2 : plotLeft + (i / (N - 1)) * plotWidth
      const y = botY - (d.apps / maxVal) * plotHeight
      return { x, y, val: d.apps, label: d.label, dateStr: d.dateStr }
    })

    const generateSpline = (pts: { x: number; y: number }[]) => {
      if (pts.length === 0) return ""
      if (pts.length === 1) return `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = i > 0 ? pts[i - 1] : pts[i]
        const p1 = pts[i]
        const p2 = pts[i + 1]
        const p3 = i < pts.length - 2 ? pts[i + 2] : p2

        const cp1x = p1.x + (p2.x - p0.x) / 5
        const cp1y = p1.y + (p2.y - p0.y) / 5
        const cp2x = p2.x - (p3.x - p1.x) / 5
        const cp2y = p2.y - (p3.y - p1.y) / 5

        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
      }
      return d
    }

    const vPath = generateSpline(vPoints)
    const aPath = generateSpline(aPoints)

    const vArea = vPoints.length > 0 ? `${vPath} L ${vPoints[vPoints.length - 1].x.toFixed(1)} ${botY} L ${vPoints[0].x.toFixed(1)} ${botY} Z` : ""
    const aArea = aPoints.length > 0 ? `${aPath} L ${aPoints[aPoints.length - 1].x.toFixed(1)} ${botY} L ${aPoints[0].x.toFixed(1)} ${botY} Z` : ""

    return {
      viewsPath: vPath,
      appsPath: aPath,
      viewsAreaPath: vArea,
      appsAreaPath: aArea,
      viewPoints: vPoints,
      appPoints: aPoints,
      yAxisLevels: yLevels,
      plotBounds: { plotLeft, plotRight, topY, botY, width: 500, height: 175 },
    }
  }, [chartData])

  return (
    <div className="bg-white rounded-[16px] border border-[#ededed] p-6 shadow-xs flex flex-col gap-6">
      {/* Header: Title + Period Filter Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
        <div className="flex flex-col gap-1">
          <h3 className="font-['Inter'] font-semibold text-[18px] text-[#222222]">
            Thống kê việc làm
          </h3>
          <p className="font-['Inter'] font-normal text-[12px] text-[#757575]">
            {dateRangeLabel}
          </p>
        </div>

        {/* Period Filter Switch */}
        <div className="flex items-center border border-[#cbcbcb] rounded-[8px] h-[32px] overflow-hidden shrink-0 w-[255px] bg-white p-0">
          <button
            type="button"
            onClick={() => setTimePeriod("week")}
            className={`w-[85px] h-full font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors cursor-pointer flex items-center justify-center rounded-[7px] ${
              timePeriod === "week"
                ? "bg-[#004eb7] text-white"
                : "text-[#757575] hover:bg-slate-50"
            }`}
          >
            Tuần
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod("month")}
            className={`w-[85px] h-full font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors cursor-pointer flex items-center justify-center rounded-[7px] ${
              timePeriod === "month"
                ? "bg-[#004eb7] text-white"
                : "text-[#757575] hover:bg-slate-50"
            }`}
          >
            Tháng
          </button>
          <button
            type="button"
            onClick={() => setTimePeriod("year")}
            className={`w-[85px] h-full font-['Inter'] font-medium text-[14px] leading-[1.6] transition-colors cursor-pointer flex items-center justify-center rounded-[7px] ${
              timePeriod === "year"
                ? "bg-[#004eb7] text-white"
                : "text-[#757575] hover:bg-slate-50"
            }`}
          >
            Năm
          </button>
        </div>
      </div>

      {/* Main Grid: Left Chart + Right 2 Metric Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_217px] gap-6 items-stretch w-full">
        {/* Left Chart View */}
        <div className="flex flex-col justify-between gap-6 w-full">
          {/* Subheader & Legend */}
          <div className="flex flex-col gap-2 w-full">
            <p className="font-['Inter'] font-semibold text-[16px] text-[#222222]">
              Thống kê
            </p>
            <div className="flex items-center gap-4 text-[12px] text-[#757575]">
              <div className="flex items-center gap-1.5">
                <div className="bg-[#004eb7] rounded-[4px] size-[8px] shrink-0" />
                <span>Lượt xem hồ sơ</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="bg-[#6eabff] rounded-[4px] size-[8px] shrink-0" />
                <span>Đã ứng tuyển</span>
              </div>
            </div>
          </div>

          {/* Visual Chart Frame: Unified SVG Canvas */}
          <div className="w-full relative select-none pt-2">
            <div className="relative w-full h-[180px]">
              <svg
                className="w-full h-full overflow-visible"
                viewBox={`0 0 ${plotBounds.width} ${plotBounds.height}`}
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#004EB7" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#004EB7" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="appsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6EABFF" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#6EABFF" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* 1. Horizontal Grid Lines & Y-Axis Labels */}
                {yAxisLevels.map((lvl, idx) => (
                  <g key={`lvl-${idx}`}>
                    <text
                      x={plotBounds.plotLeft - 8}
                      y={lvl.y + 4}
                      textAnchor="end"
                      fill="#757575"
                      fontSize="11"
                      fontFamily="Inter"
                      className="select-none font-normal"
                    >
                      {lvl.val >= 1000 ? `${lvl.val / 1000}k` : lvl.val}
                    </text>
                    <line
                      x1={plotBounds.plotLeft}
                      y1={lvl.y}
                      x2={plotBounds.plotRight}
                      y2={lvl.y}
                      stroke="#EDEDED"
                      strokeDasharray={idx === yAxisLevels.length - 1 ? "none" : "4 4"}
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* 2. Gradient Area Fills */}
                {viewsAreaPath && <path d={viewsAreaPath} fill="url(#viewsGrad)" />}
                {appsAreaPath && <path d={appsAreaPath} fill="url(#appsGrad)" />}

                {/* 3. Spline Lines */}
                {viewsPath && (
                  <path
                    d={viewsPath}
                    fill="none"
                    stroke="#004EB7"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {appsPath && (
                  <path
                    d={appsPath}
                    fill="none"
                    stroke="#6EABFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* 4. Hover Vertical Guide Line */}
                {hoveredIndex !== null && viewPoints[hoveredIndex] && (
                  <line
                    x1={viewPoints[hoveredIndex].x}
                    y1={plotBounds.topY}
                    x2={viewPoints[hoveredIndex].x}
                    y2={plotBounds.botY}
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="pointer-events-none transition-all duration-75"
                  />
                )}

                {/* 5. Data Points (Views - Navy & Apps - Sky Blue) */}
                {viewPoints.map((pt, idx) => (
                  <g key={`v-${idx}`} className="group pointer-events-none">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredIndex === idx ? 6 : 4.5}
                      fill="#004EB7"
                      stroke="#FFFFFF"
                      strokeWidth={hoveredIndex === idx ? 2.5 : 2}
                      className="transition-all duration-150 origin-center"
                    />
                    {hoveredIndex === idx && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={10}
                        fill="#004EB7"
                        opacity={0.2}
                        className="animate-ping origin-center"
                      />
                    )}
                  </g>
                ))}

                {appPoints.map((pt, idx) => (
                  <g key={`a-${idx}`} className="group pointer-events-none">
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredIndex === idx ? 6 : 4.5}
                      fill="#6EABFF"
                      stroke="#FFFFFF"
                      strokeWidth={hoveredIndex === idx ? 2.5 : 2}
                      className="transition-all duration-150 origin-center"
                    />
                    {hoveredIndex === idx && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={10}
                        fill="#6EABFF"
                        opacity={0.25}
                        className="animate-ping origin-center"
                      />
                    )}
                  </g>
                ))}

                {/* 6. X-Axis Day Labels */}
                {viewPoints.map((pt, idx) => (
                  <text
                    key={`xlbl-${idx}`}
                    x={pt.x}
                    y={plotBounds.botY + 20}
                    textAnchor="middle"
                    fill={hoveredIndex === idx ? "#004EB7" : "#A5A5A5"}
                    fontWeight={hoveredIndex === idx ? "600" : "400"}
                    fontSize="12"
                    fontFamily="Inter"
                    className="cursor-pointer select-none transition-colors"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {pt.label}
                  </text>
                ))}

                {/* 7. Interactive Hover Hit Columns */}
                {viewPoints.map((pt, idx) => {
                  const colW = (plotBounds.plotRight - plotBounds.plotLeft) / Math.max(viewPoints.length - 1, 1)
                  const startX = idx === 0 ? plotBounds.plotLeft - colW / 2 : pt.x - colW / 2
                  return (
                    <rect
                      key={`hover-${idx}`}
                      x={startX}
                      y={0}
                      width={colW}
                      height={plotBounds.height}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(idx)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onTouchStart={() => setHoveredIndex(idx)}
                    />
                  )
                })}
              </svg>

              {/* Floating Tooltip Card */}
              {hoveredIndex !== null && chartData[hoveredIndex] && viewPoints[hoveredIndex] && (
                <div
                  className="absolute z-30 pointer-events-none transition-all duration-150 ease-out bg-[#1e293b]/95 backdrop-blur-md text-white rounded-lg shadow-xl px-3 py-2 border border-slate-700/60 whitespace-nowrap text-xs flex flex-col gap-1 min-w-[130px]"
                  style={{
                    left: `${(viewPoints[hoveredIndex].x / plotBounds.width) * 100}%`,
                    top: `${Math.max(10, Math.min(viewPoints[hoveredIndex].y, appPoints[hoveredIndex].y) - 12)}px`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1 mb-0.5 flex items-center justify-between gap-2">
                    <span>{chartData[hoveredIndex].label}</span>
                    {chartData[hoveredIndex].dateStr && (
                      <span className="text-[10px] text-slate-400 font-normal">{chartData[hoveredIndex].dateStr}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-300">
                      <div className="size-2 rounded-full bg-[#004eb7]" />
                      <span>Lượt xem:</span>
                    </div>
                    <span className="font-bold text-white">{chartData[hoveredIndex].views}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5 text-sky-300">
                      <div className="size-2 rounded-full bg-[#6eabff]" />
                      <span>Ứng tuyển:</span>
                    </div>
                    <span className="font-bold text-white">{chartData[hoveredIndex].apps}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 2 Metric Cards */}
        <div className="flex flex-col gap-4 w-full lg:w-[217px] justify-between">
          {/* Insight 1: Lượt xem hồ sơ */}
          <div className="bg-white border border-[#ededed] rounded-[16px] px-4 py-6 flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs w-full">
            <p className="font-['Inter'] font-normal text-[#757575] text-[16px] leading-[1.6]">
              Lượt xem hồ sơ
            </p>
            <p className="font-['Inter'] font-semibold text-[#353535] text-[28px] leading-normal">
              {periodViewsCount}
            </p>
            <div className="flex items-center gap-2 text-[16px]">
              <span className="font-['Inter'] font-medium text-[#a5a5a5]">{periodLabel}</span>
              <span className="font-['Inter'] font-semibold text-[#009e00]">
                {viewsGrowthPct >= 0 ? `+${viewsGrowthPct}%` : `${viewsGrowthPct}%`}
              </span>
              <TrendingUp className="size-4 text-[#009e00]" />
            </div>
          </div>

          {/* Insight 2: Đã ứng tuyển */}
          <div className="bg-white border border-[#ededed] rounded-[16px] px-4 py-6 flex flex-col items-center justify-center text-center gap-2.5 shadow-2xs w-full">
            <p className="font-['Inter'] font-normal text-[#757575] text-[16px] leading-[1.6]">
              Đã ứng tuyển
            </p>
            <p className="font-['Inter'] font-semibold text-[#353535] text-[28px] leading-normal">
              {periodAppsCount}
            </p>
            <div className="flex items-center gap-2 text-[16px]">
              <span className="font-['Inter'] font-medium text-[#a5a5a5]">{periodLabel}</span>
              <span className="font-['Inter'] font-semibold text-[#009e00]">
                {appsGrowthPct >= 0 ? `+${appsGrowthPct}%` : `${appsGrowthPct}%`}
              </span>
              <TrendingUp className="size-4 text-[#009e00]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
