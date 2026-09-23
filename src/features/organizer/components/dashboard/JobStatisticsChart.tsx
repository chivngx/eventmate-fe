"use client"

import React, { useState, useMemo } from "react"
import { FolderOpen, Eye, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobStatisticsChartProps {
  events?: any[]
  totalViews?: number
  totalApplied?: number
  totalOpened?: number
}

type PeriodType = "Week" | "Month" | "Year"

const PERIOD_LABELS: Record<PeriodType, string> = {
  Week: "Tuần",
  Month: "Tháng",
  Year: "Năm",
}

export default function JobStatisticsChart({
  events = [],
  totalViews = 0,
  totalApplied = 0,
  totalOpened = 0,
}: JobStatisticsChartProps) {
  const [period, setPeriod] = useState<PeriodType>("Month")

  // 1. Dynamic Date Range Subtitle
  const subtitle = useMemo(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const monthStr = month < 10 ? `0${month}` : `${month}`
    const lastDayOfMonth = new Date(now.getFullYear(), month, 0).getDate()

    if (period === "Month") {
      return `Hiển thị thống kê từ ngày 1 - ${lastDayOfMonth} Th${monthStr}`
    }
    if (period === "Week") {
      return `Hiển thị thống kê trong 7 ngày gần nhất`
    }
    return `Hiển thị thống kê trong năm ${now.getFullYear()}`
  }, [period])

  // 2. Aggregate Real Data from Events & Applications
  const { seriesData, maxVal, yLabels, trends } = useMemo(() => {
    const now = Date.now()
    const oneDayMs = 24 * 60 * 60 * 1000
    const sevenDaysMs = 7 * oneDayMs

    // Days array: CN (0), T2 (1), T3 (2), T4 (3), T5 (4), T6 (5), T7 (6)
    const openedCounts = [0, 0, 0, 0, 0, 0, 0]
    const appliedCounts = [0, 0, 0, 0, 0, 0, 0]
    const viewsCounts = [0, 0, 0, 0, 0, 0, 0]

    let thisWeekApps = 0
    let lastWeekApps = 0
    let thisWeekOpened = 0
    let lastWeekOpened = 0
    let thisWeekViews = 0
    let lastWeekViews = 0

    events.forEach((ev) => {
      // Event opened day
      if (ev.created_at) {
        const createdDate = new Date(ev.created_at)
        const dayOfWeek = createdDate.getDay() // 0 = CN, 1 = T2...
        const diffMs = now - createdDate.getTime()

        // Period filtering
        let inPeriod = true
        if (period === "Week") inPeriod = diffMs <= sevenDaysMs
        else if (period === "Month") inPeriod = diffMs <= 30 * oneDayMs
        else if (period === "Year") inPeriod = diffMs <= 365 * oneDayMs

        if (inPeriod) {
          openedCounts[dayOfWeek]++
        }

        // Trend calculation
        if (diffMs <= sevenDaysMs) thisWeekOpened++
        else if (diffMs <= 14 * oneDayMs) lastWeekOpened++
      }

      // Event views
      const views = ev.views_count || 0
      if (ev.created_at) {
        const createdDate = new Date(ev.created_at)
        const dayOfWeek = createdDate.getDay()
        viewsCounts[dayOfWeek] += views
        const diffMs = now - createdDate.getTime()
        if (diffMs <= sevenDaysMs) thisWeekViews += views
        else if (diffMs <= 14 * oneDayMs) lastWeekViews += views
      }

      // Applications
      const apps = ev.applications || []
      apps.forEach((app: any) => {
        if (app.applied_at) {
          const appliedDate = new Date(app.applied_at)
          const dayOfWeek = appliedDate.getDay()
          const diffMs = now - appliedDate.getTime()

          let inPeriod = true
          if (period === "Week") inPeriod = diffMs <= sevenDaysMs
          else if (period === "Month") inPeriod = diffMs <= 30 * oneDayMs
          else if (period === "Year") inPeriod = diffMs <= 365 * oneDayMs

          if (inPeriod) {
            appliedCounts[dayOfWeek]++
          }

          if (diffMs <= sevenDaysMs) thisWeekApps++
          else if (diffMs <= 14 * oneDayMs) lastWeekApps++
        }
      })
    })

    // Calculate Growth Trends
    const calcTrend = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0
      return Math.round(((curr - prev) / prev) * 100)
    }

    const trends = {
      opened: calcTrend(thisWeekOpened, lastWeekOpened),
      views: calcTrend(thisWeekViews, lastWeekViews),
      applied: calcTrend(thisWeekApps, lastWeekApps),
    }

    // Dynamic Max & Y Scale
    const allVals = [...viewsCounts, ...appliedCounts, ...openedCounts]
    const rawMax = Math.max(...allVals, 0)

    let max = 5
    let labels = ["5", "4", "3", "2", "1"]

    if (rawMax === 0) {
      max = 5
      labels = ["5", "4", "3", "2", "1"]
    } else if (rawMax <= 5) {
      max = 5
      labels = ["5", "4", "3", "2", "1"]
    } else if (rawMax <= 10) {
      max = 10
      labels = ["10", "8", "6", "4", "2"]
    } else if (rawMax <= 25) {
      max = 25
      labels = ["25", "20", "15", "10", "5"]
    } else if (rawMax <= 50) {
      max = 50
      labels = ["50", "40", "30", "20", "10"]
    } else if (rawMax <= 100) {
      max = 100
      labels = ["100", "75", "50", "25", "10"]
    } else if (rawMax <= 1000) {
      max = Math.ceil(rawMax / 100) * 100
      labels = [
        `${max}`,
        `${Math.round(max * 0.8)}`,
        `${Math.round(max * 0.6)}`,
        `${Math.round(max * 0.4)}`,
        `${Math.round(max * 0.2)}`,
      ]
    } else {
      max = Math.ceil(rawMax / 1000) * 1000
      labels = [
        `${Math.round(max / 1000)}k`,
        `${Math.round((max * 0.8) / 1000)}k`,
        `${Math.round((max * 0.6) / 1000)}k`,
        `${Math.round((max * 0.4) / 1000)}k`,
        `${Math.round((max * 0.2) / 1000)}k`,
      ]
    }

    // Coordinates mapping:
    // X coordinates: CN(30), T2(120), T3(210), T4(300), T5(390), T6(480), T7(570)
    const xCoords = [30, 120, 210, 300, 390, 480, 570]
    const getY = (val: number) => {
      if (max === 0 || val === 0) return 150
      const clamped = Math.min(val, max)
      return Math.round(150 - (clamped / max) * 140)
    }

    const makePolyline = (counts: number[]) => {
      return counts.map((c, i) => `${xCoords[i]},${getY(c)}`).join(" ")
    }

    return {
      seriesData: {
        views: makePolyline(viewsCounts),
        applied: makePolyline(appliedCounts),
        opened: makePolyline(openedCounts),
        rawApplied: appliedCounts,
        rawOpened: openedCounts,
        rawViews: viewsCounts,
      },
      maxVal: max,
      yLabels: labels,
      trends,
    }
  }, [events, period])

  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]

  const renderTrendBadge = (pct: number) => {
    if (pct > 0) {
      return (
        <span className="text-[#009e00] font-medium text-[10px] flex items-center">
          ▲ {pct}%
        </span>
      )
    }
    if (pct < 0) {
      return (
        <span className="text-[#dc0000] font-medium text-[10px] flex items-center">
          ▼ {Math.abs(pct)}%
        </span>
      )
    }
    return <span className="text-zinc-400 font-normal text-[10px]">— 0%</span>
  }

  const hasAnyData = totalOpened > 0 || totalApplied > 0 || totalViews > 0

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[16px] p-6 w-full space-y-6 border border-zinc-100 dark:border-zinc-800 shadow-xs">
      {/* 1. TOP HEADER: Title & Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-['Inter'] font-semibold text-[18px] text-[#222222] dark:text-white leading-[normal]">
            Thống kê tuyển dụng
          </h3>
          <p className="font-['Inter'] font-normal text-[12px] text-[#757575] dark:text-zinc-400 mt-1 leading-[normal]">
            {subtitle}
          </p>
        </div>

        {/* Period Selector Toggle (Tuần / Tháng / Năm) */}
        <div className="h-[32px] border border-[#cbcbcb] dark:border-zinc-700 rounded-[8px] p-[1px] inline-flex items-center bg-white dark:bg-zinc-900 shrink-0">
          {(["Week", "Month", "Year"] as const).map((p) => {
            const isActive = period === p
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={cn(
                  "h-[28px] px-4 rounded-[6px] font-['Inter'] font-medium text-[14px] transition-colors cursor-pointer flex items-center justify-center",
                  isActive
                    ? "bg-[#282828] text-white dark:bg-zinc-100 dark:text-[#282828]"
                    : "text-[#757575] dark:text-zinc-400 hover:text-[#222222] dark:hover:text-white"
                )}
              >
                {PERIOD_LABELS[p]}
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. MAIN CONTENT: Chart (Left) + 3 Mini KPI Cards (Right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-end">
        {/* Left: Chart Area */}
        <div className="flex-1 w-full space-y-4 min-w-0">
          {/* Subheader: Statistics Title & Legend */}
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-['Inter'] font-semibold text-[16px] text-[#222222] dark:text-white">
              Thống kê
            </span>
            <div className="flex items-center gap-4 text-[12px] text-[#757575] dark:text-zinc-400 font-['Inter']">
              <div className="flex items-center gap-1.5">
                <span className="size-[8px] rounded-[4px] bg-[#004eb7] shrink-0" />
                <span>Lượt xem tin</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-[8px] rounded-[4px] bg-[#6eabff] shrink-0" />
                <span>Lượt ứng tuyển</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-[8px] rounded-[4px] bg-[#f6b500] shrink-0" />
                <span>Tin đang mở</span>
              </div>
            </div>
          </div>

          {/* SVG Chart Container */}
          <div className="flex items-stretch gap-2 pt-2 w-full">
            {/* Y-Axis Labels (Dynamic scale) */}
            <div className="flex flex-col justify-between text-[12px] font-['Inter'] text-[#515151] dark:text-zinc-400 pb-6 pr-1 shrink-0 select-none text-right min-w-[28px]">
              {yLabels.map((y) => (
                <span key={y} className="leading-none">{y}</span>
              ))}
            </div>

            {/* Chart Grid & SVG Polyline */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="relative h-[160px] w-full">
                {/* Horizontal Dashed Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yLabels.map((_, index) => (
                    <div
                      key={`grid-${index}`}
                      className="border-b border-dashed border-[#ededed] dark:border-zinc-800 w-full"
                    />
                  ))}
                </div>

                {/* Polylines with real data */}
                <svg
                  viewBox="0 0 600 160"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full overflow-visible"
                >
                  {/* Line 1: Lượt xem tin (Dark Blue #004eb7) */}
                  <polyline
                    fill="none"
                    stroke="#004eb7"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={seriesData.views}
                    className="transition-all duration-300"
                  />

                  {/* Line 2: Lượt ứng tuyển (Light Blue #6eabff) */}
                  <polyline
                    fill="none"
                    stroke="#6eabff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={seriesData.applied}
                    className="transition-all duration-300"
                  />

                  {/* Line 3: Tin đang mở (Yellow #f6b500) */}
                  <polyline
                    fill="none"
                    stroke="#f6b500"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={seriesData.opened}
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Empty State Overlay if no data at all */}
                {!hasAnyData && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-zinc-900/40 backdrop-blur-[1px] rounded-lg">
                    <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                      Chưa có dữ liệu tuyển dụng trong giai đoạn này
                    </span>
                  </div>
                )}
              </div>

              {/* X-Axis Days Labels (CN -> T7) */}
              <div className="flex items-center justify-between text-[12px] font-['Inter'] text-[#a5a5a5] dark:text-zinc-500 pt-2 px-1 select-none">
                {days.map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: 3 Mini KPI Cards */}
        <div className="flex flex-row lg:flex-col gap-2 w-full lg:w-[131px] shrink-0">
          {/* Card 1: Tin đang mở */}
          <div className="flex-1 lg:w-[131px] h-[88px] bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-3 flex flex-col justify-between shadow-2xs">
            <div className="size-[24px] text-[#222222] dark:text-zinc-200">
              <FolderOpen className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#757575] dark:text-zinc-400 font-['Inter']">Tin đang mở</span>
              <span className="text-[14px] font-semibold text-[#353535] dark:text-zinc-100 font-['Inter']">
                {totalOpened}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] font-['Inter']">
              <span className="text-[#a5a5a5] text-[10px]">Tuần này</span>
              {renderTrendBadge(trends.opened)}
            </div>
          </div>

          {/* Card 2: Lượt xem tin */}
          <div className="flex-1 lg:w-[131px] h-[88px] bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-3 flex flex-col justify-between shadow-2xs">
            <div className="size-[24px] text-[#222222] dark:text-zinc-200">
              <Eye className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#757575] dark:text-zinc-400 font-['Inter']">Lượt xem tin</span>
              <span className="text-[14px] font-semibold text-[#353535] dark:text-zinc-100 font-['Inter']">
                {totalViews}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] font-['Inter']">
              <span className="text-[#a5a5a5] text-[10px]">Tuần này</span>
              {renderTrendBadge(trends.views)}
            </div>
          </div>

          {/* Card 3: Lượt ứng tuyển */}
          <div className="flex-1 lg:w-[131px] h-[88px] bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-3 flex flex-col justify-between shadow-2xs">
            <div className="size-[24px] text-[#222222] dark:text-zinc-200">
              <FileText className="w-5 h-5 stroke-[1.75]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-[#757575] dark:text-zinc-400 font-['Inter']">Lượt ứng tuyển</span>
              <span className="text-[14px] font-semibold text-[#353535] dark:text-zinc-100 font-['Inter']">
                {totalApplied}
              </span>
            </div>
            <div className="flex items-center justify-between text-[12px] font-['Inter']">
              <span className="text-[#a5a5a5] text-[10px]">Tuần này</span>
              {renderTrendBadge(trends.applied)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
