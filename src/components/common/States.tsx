"use client"

import React from "react"
import { SearchX, AlertCircle } from "lucide-react"

// 1. Result Count & Reset Filters Header
export interface ResultCountHeaderProps {
  totalItems: number
  entityName?: string
  hasActiveFilters: boolean
  onResetFilters: () => void
  className?: string
}

export function ResultCountHeader({
  totalItems,
  entityName = "kết quả",
  hasActiveFilters,
  onResetFilters,
  className = "",
}: ResultCountHeaderProps) {
  return (
    <div className={`flex items-center justify-between pb-4 mb-4 border-b border-[#ededed] text-sm ${className}`}>
      <span className="text-[#515151] font-medium">
        Tìm thấy <strong className="text-[#222222] font-semibold">{totalItems}</strong> {entityName}
      </span>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-[#005ddc] hover:underline font-medium cursor-pointer"
        >
          Xóa tất cả bộ lọc
        </button>
      )}
    </div>
  )
}

// 2. Empty State
export interface EmptyStateProps {
  icon?: React.ReactNode
  title?: string
  description?: string
  actionText?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title = "Không tìm thấy kết quả phù hợp",
  description = "Không có mục nào khớp với tiêu chí tìm kiếm hoặc bộ lọc hiện tại của bạn.",
  actionText = "Xóa tất cả bộ lọc",
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-20 bg-white rounded-[8px] border border-dashed border-slate-200 p-8 ${className}`}>
      {icon || <SearchX className="w-12 h-12 text-slate-400 mx-auto mb-3" />}
      <h3 className="text-lg font-bold text-[#222222] mb-1">{title}</h3>
      <p className="text-sm text-[#515151] max-w-sm mx-auto mb-5">{description}</p>
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[8px] text-sm font-medium transition-all cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

// 3. Error State
export interface ErrorStateProps {
  icon?: React.ReactNode
  title?: string
  message?: string
  retryText?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  icon,
  title = "Đã xảy ra lỗi",
  message = "Không thể tải dữ liệu. Vui lòng thử lại sau.",
  retryText = "Thử lại",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div className={`text-center py-16 bg-white rounded-[8px] border border-dashed border-red-200 p-8 ${className}`}>
      {icon || <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />}
      <h3 className="text-lg font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-4">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-4 py-2 bg-[#005ddc] text-white rounded-[8px] text-sm font-medium hover:bg-[#004eb7] transition-all cursor-pointer"
        >
          {retryText}
        </button>
      )}
    </div>
  )
}
