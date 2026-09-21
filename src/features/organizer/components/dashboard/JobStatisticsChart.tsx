"use client"

import React, { useState } from "react"
import { FolderOpen, Eye, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface JobStatisticsChartProps {
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
  totalViews = 0,
  totalApplied = 0,
  totalOpened = 0,
}: JobStatisticsChartProps) {
  const [period, setPeriod] = useState<PeriodType>("Month")

  // Data series matching Figma chart points scaled to viewBox 600x160
  // Y values mapped from 5k (y=10) to 1k (y=150)
  // X values: CN(30), T2(120), T3(210), T4(300), T5(390), T6(480), T7(570)
  const chartData: Record<PeriodType, { views: string; applied: string; opened: string }> = {
    Month: {
      // Dark Blue (#004eb7): CN(1k) -> T2(1.8k) -> T3(2k) -> T4(2.5k) -> T5(4.2k) -> T6(4.4k) -> T7(5k)
      views: "30,150 120,125 210,120 300,105 390,45 480,40 570,10",
      // Light Blue (#6eabff): CN(1k) -> T2(2.8k) -> T3(3.2k) -> T4(2.9k) -> T5(3k) -> T6(4.7k) -> T7(5k)
      applied: "30,150 120,95 210,80 300,90 390,88 480,25 570,10",
      // Yellow (#f6b500): CN(1k) -> T2(1.5k) -> T3(2.4k) -> T4(2.3k) -> T5(4.8k) -> T6(4.6k) -> T7(5k)
      opened: "30,150 120,135 210,108 300,112 390,20 480,30 570,10",
    },
    Week: {
      views: "30,140 120,110 210,95 300,80 390,60 480,35 570,15",
      applied: "30,150 120,120 210,100 300,85 390,70 480,45 570,20",
      opened: "30,150 120,130 210,115 300,95 390,75 480,50 570,25",
    },
    Year: {
      views: "30,130 120,100 210,75 300,60 390,40 480,25 570,10",
      applied: "30,140 120,110 210,85 300,70 390,50 480,30 570,15",
      opened: "30,150 120,125 210,95 300,80 390,55 480,35 570,20",
    },
  }

  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"]
  const yLabels = ["5k", "4k", "3k", "2k", "1k"]

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[16px] p-6 w-full space-y-6">
      {/* 1. TOP HEADER: Title & Period Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-['Inter'] font-semibold text-[18px] text-[#222222] dark:text-white leading-[normal]">
            Thống kê tuyển dụng
          </h3>
          <p className="font-['Inter'] font-normal text-[12px] text-[#757575] dark:text-zinc-400 mt-1 leading-[normal]">
            Hiển thị thống kê {period === "Month" ? "từ ngày 1 - 30 Th07" : period === "Week" ? "trong tuần này" : "trong năm nay"}
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
            {/* Y-Axis Labels (5k -> 1k) */}
            <div className="flex flex-col justify-between text-[12px] font-['Inter'] text-[#515151] dark:text-zinc-400 pb-6 pr-1 shrink-0 select-none">
              {yLabels.map((y) => (
                <span key={y} className="leading-none">{y}</span>
              ))}
            </div>

            {/* Chart Grid & SVG Polyline */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="relative h-[160px] w-full">
                {/* Horizontal Dashed Gridlines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  {yLabels.map((y, index) => (
                    <div
                      key={`grid-${index}`}
                      className="border-b border-dashed border-[#ededed] dark:border-zinc-800 w-full"
                    />
                  ))}
                </div>

                {/* Polylines */}
                <svg
                  viewBox="0 0 600 160"
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full overflow-visible"
                >
                  {/* Line 1: Lượt xem tin (Dark Blue #004eb7) */}
                  <polyline
                    fill="none"
                    stroke="#004eb7"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData[period].views}
                  />

                  {/* Line 2: Lượt ứng tuyển (Light Blue #6eabff) */}
                  <polyline
                    fill="none"
                    stroke="#6eabff"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData[period].applied}
                  />

                  {/* Line 3: Tin đang mở (Yellow #f6b500) */}
                  <polyline
                    fill="none"
                    stroke="#f6b500"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData[period].opened}
                  />
                </svg>
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
          <div className="flex-1 lg:w-[131px] h-[88px] bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-3 flex flex-col justify-between">
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
              <span className="text-[#009e00] font-medium text-[10px] flex items-center">
                ▲ 8.4
              </span>
            </div>
          </div>

          {/* Card 2: Lượt xem tin */}
          <div className="flex-1 lg:w-[131px] h-[88px] bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-3 flex flex-col justify-between">
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
              <span className="text-[#009e00] font-medium text-[10px] flex items-center">
                ▲ 8.4
              </span>
            </div>
          </div>

          {/* Card 3: Lượt ứng tuyển */}
          <div className="flex-1 lg:w-[131px] h-[88px] bg-white dark:bg-zinc-900 border border-[#f4f4f4] dark:border-zinc-800 rounded-[8px] p-3 flex flex-col justify-between">
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
              <span className="text-[#dc0000] font-medium text-[10px] flex items-center">
                ▼ 8.4
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
