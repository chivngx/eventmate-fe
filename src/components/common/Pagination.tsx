"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange?: (page: number) => void
  setCurrentPage?: (page: number | ((prev: number) => number)) => void
  scrollToTop?: boolean
  className?: string
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  setCurrentPage,
  scrollToTop = true,
  className = "",
}: PaginationProps) {
  if (totalItems <= itemsPerPage || totalPages <= 1) return null

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      if (onPageChange) {
        onPageChange(page)
      } else if (setCurrentPage) {
        setCurrentPage(page)
      }
      if (scrollToTop && typeof window !== "undefined") {
        window.scrollTo({ top: 250, behavior: "smooth" })
      }
    }
  }

  // Generate page numbers with ellipsis according to Figma
  const getPageNumbers = () => {
    const pages: Array<number | string> = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) {
        pages.push("...")
      }
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) {
        pages.push("...")
      }
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className={`flex items-center justify-center gap-3 sm:gap-5 py-8 ${className}`} data-name="pagination">
      {/* Prev button */}
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => handlePageClick(currentPage - 1)}
        aria-label="Trang trước"
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] flex items-center justify-center text-[#282828] hover:text-[#005ddc] hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#282828] disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Number buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {getPageNumbers().map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[#a5a5a5] font-medium text-[16px] select-none"
              >
                ...
              </span>
            )
          }

          const pageNum = Number(item)
          const isActive = currentPage === pageNum

          return (
            <button
              key={`page-${pageNum}`}
              type="button"
              onClick={() => handlePageClick(pageNum)}
              aria-current={isActive ? "page" : undefined}
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[8px] flex items-center justify-center text-[15px] sm:text-[16px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "border border-[#222222] text-[#222222] font-semibold bg-white shadow-xs"
                  : "text-[#282828] hover:bg-slate-100"
              }`}
            >
              {pageNum}
            </button>
          )
        })}
      </div>

      {/* Next button */}
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => handlePageClick(currentPage + 1)}
        aria-label="Trang sau"
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-[8px] flex items-center justify-center text-[#282828] hover:text-[#005ddc] hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-[#282828] disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  )
}
