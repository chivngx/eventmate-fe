import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number | ((prev: number) => number)) => void
  totalItems: number
  itemsPerPage: number
}

export default function Pagination({
  currentPage,
  totalPages,
  setCurrentPage,
  totalItems,
  itemsPerPage
}: PaginationProps) {
  if (totalItems <= itemsPerPage) return null

  return (
    <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100 mt-6">
      <button
        disabled={currentPage === 1}
        onClick={() => {
          setCurrentPage(prev => Math.max(prev - 1, 1))
          window.scrollTo({ top: 400, behavior: 'smooth' })
        }}
        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      
      <span className="text-sm font-bold text-slate-600">
        {currentPage} / {totalPages} trang
      </span>
      
      <button
        disabled={currentPage === totalPages}
        onClick={() => {
          setCurrentPage(prev => Math.min(prev + 1, totalPages))
          window.scrollTo({ top: 400, behavior: 'smooth' })
        }}
        className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-emerald-600 disabled:opacity-50 disabled:hover:text-slate-500 disabled:hover:border-slate-200 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
