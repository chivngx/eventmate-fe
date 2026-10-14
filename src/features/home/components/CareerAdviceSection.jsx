"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronRight, ChevronLeft, ArrowRight, BookOpen } from "lucide-react"
import { BLOG_POSTS } from "@/data/blogData"

const ADVICE_TABS = [
  { id: "all", label: "Tất cả bài viết" },
  { id: "jobseeker", label: "Kinh nghiệm nhân sự" },
  { id: "industry", label: "Kiến thức ngành" },
  { id: "employer", label: "Cẩm nang tổ chức" },
]

export default function CareerAdviceSection() {
  const router = useRouter()
  const scrollRef = useRef(null)
  const [activeTab, setActiveTab] = useState("all")
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const filteredArticles = activeTab === "all"
    ? BLOG_POSTS
    : BLOG_POSTS.filter((item) => item.category === activeTab)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
  }, [filteredArticles.length])

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 260
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount * 2 : -scrollAmount * 2,
        behavior: "smooth",
      })
    }
  }

  return (
    <section
      className="w-full bg-white rounded-xl p-6 sm:p-8 border border-gray-200/90 shadow-2xs flex flex-col gap-5"
      aria-label="Tư vấn việc làm"
    >
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Cẩm nang & Kinh nghiệm ngành sự kiện
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kiến thức thực chiến và quy chuẩn nghề nghiệp từ các chuyên gia
          </p>
        </div>
      </div>

      {/* 2. Filter Tabs */}
      <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none">
        {ADVICE_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-[34px] px-3.5 rounded-md border text-xs font-medium transition-colors whitespace-nowrap cursor-pointer select-none flex items-center justify-center ${
                isActive
                  ? "bg-[#0D9488] border-[#0D9488] text-white shadow-xs"
                  : "bg-white border-gray-200 text-slate-600 hover:bg-slate-50 hover:border-teal-200"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 3. Horizontal Scrollable Cards Container */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Xem bài viết trước"
            className="absolute -left-3 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center z-20 hover:bg-slate-50 hover:border-teal-300 hover:text-[#0D9488] transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Xem thêm bài viết"
            className="absolute -right-3 top-1/2 -translate-y-1/2 size-9 rounded-lg bg-white shadow-md border border-gray-200 flex items-center justify-center z-20 hover:bg-slate-50 hover:border-teal-300 hover:text-[#0D9488] transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4 text-slate-600" />
          </button>
        )}

        {/* Cards Row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none flex gap-4 items-stretch"
        >
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              onClick={() => router.push(`/blog/${article.id}`)}
              className="w-[240px] min-w-[240px] rounded-lg border border-gray-200 bg-white flex flex-col shrink-0 overflow-hidden hover:border-teal-300 hover:shadow-xs transition-all group/card cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-full h-[140px] relative bg-slate-100 overflow-hidden shrink-0">
                <img
                  src={article.imageSrc}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Description */}
              <div className="p-3.5 flex flex-col gap-1.5 flex-1 justify-between">
                <div>
                  <h3
                    className="text-sm font-bold text-slate-900 leading-[1.35] line-clamp-2 group-hover/card:text-[#0D9488] transition-colors"
                    title={article.title}
                  >
                    {article.title}
                  </h3>
                  <p
                    className="text-xs text-slate-500 leading-relaxed line-clamp-2 mt-1"
                    title={article.description}
                  >
                    {article.description}
                  </p>
                </div>
                <div className="pt-2 text-[11px] font-semibold text-[#0D9488] group-hover/card:text-[#0F766E] flex items-center gap-1 transition-colors">
                  <span>Đọc tiếp</span>
                  <ArrowRight className="w-3 h-3 group-hover/card:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 4. Bottom Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => router.push("/blog")}
          className="h-[38px] px-6 rounded-md border border-teal-200 bg-teal-50/50 hover:bg-teal-50 text-[#0D9488] hover:text-[#0F766E] text-xs font-semibold shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <span>Xem tất cả bài viết</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#0D9488]" />
        </button>
      </div>
    </section>
  )
}
