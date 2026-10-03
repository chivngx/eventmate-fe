"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"

interface AdviceItem {
  id: string
  title: string
  description: string
  imageSrc: string
  category: "all" | "jobseeker" | "industry" | "employer"
  url?: string
}

const ADVICE_TABS = [
  { id: "all", label: "Tin nổi bật" },
  { id: "jobseeker", label: "Cẩm nang tìm việc" },
  { id: "industry", label: "Cẩm nang ngành nghề" },
  { id: "employer", label: "Cẩm nang tuyển dụng" },
]

const ADVICE_ARTICLES: AdviceItem[] = [
  {
    id: "muc-luong-viec-lam-tphcm",
    title: "Mức lương việc làm TPHCM theo ngành: So sánh thu nhập các nghề",
    description: "Tìm hiểu mức lương việc làm TPHCM theo ngành năm 2026 chi tiết nhất giúp bạn so sánh thu nhập các nghề.",
    imageSrc: "/images/advice/blog-1.png",
    category: "jobseeker",
  },
  {
    id: "benchmark-luong",
    title: "Benchmark lương là gì? Cách xây dựng khung lương chuẩn thị trường",
    description: "Benchmark lương giúp doanh nghiệp xác định mức thu nhập cạnh tranh để thu hút nhân tài.",
    imageSrc: "/images/advice/blog-2.png",
    category: "employer",
  },
  {
    id: "ngay-van-hoa-viet-nam-24-11",
    title: "Ngày văn hóa Việt Nam 24/11 áp dụng từ khi nào?",
    description: "Ngày văn hóa Việt Nam 24/11 sắp được áp dụng chính thức. Người lao động có được nghỉ…",
    imageSrc: "/images/advice/blog-3.png",
    category: "jobseeker",
  },
  {
    id: "lich-nghi-le-2-9-may-ngay",
    title: "Lịch nghỉ lễ 2/9 năm 2026: Được nghỉ mấy ngày hưởng lương?",
    description: "Lịch nghỉ lễ 2/9 năm 2026 chính thức cho CBCCVC và người lao động. Bao nhiêu ngày được nghỉ hưởng lương?",
    imageSrc: "/images/advice/blog-4.png",
    category: "jobseeker",
  },
  {
    id: "lich-nghi-le-2-9-5-ngay",
    title: "Lịch nghỉ lễ 2/9 năm 2026: Có được nghỉ liên tiếp 5 ngày?",
    description: "Lịch nghỉ lễ 2/9 năm 2026 chính thức được công bố. Người lao động có thể nghỉ đến 5 ngày liên tục.",
    imageSrc: "/images/advice/blog-5.png",
    category: "jobseeker",
  },
  {
    id: "hdld-xac-dinh-thoi-han-ky-lan-3",
    title: "HĐLĐ xác định thời hạn ký lần 3 bị phạt bao nhiêu?",
    description: "HĐLĐ xác định thời hạn chỉ được ký tối đa 2 lần. Nếu ký lần 3 sẽ bị phạt bao nhiêu và có…",
    imageSrc: "/images/advice/blog-6.png",
    category: "employer",
  },
  {
    id: "cham-dut-hop-dong-thu-viec-mang-thai",
    title: "Chấm dứt hợp đồng thử việc với lao động nữ mang thai được không?",
    description: "Chấm dứt hợp đồng thử việc với lao động nữ mang thai có đúng luật không? Cập nhật…",
    imageSrc: "/images/advice/blog-7.png",
    category: "industry",
  },
  {
    id: "tien-tro-cap-that-nghiep",
    title: "Trợ cấp thất nghiệp bao giờ nhận được tiền đầu tiên?",
    description: "Trợ cấp thất nghiệp được nhận trong bao nhiêu ngày? Quy định mới nhất về thời gian,…",
    imageSrc: "/images/advice/blog-8.png",
    category: "jobseeker",
  },
]

export default function CareerAdviceSection() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const filteredArticles = activeTab === "all"
    ? ADVICE_ARTICLES
    : ADVICE_ARTICLES.filter((item) => item.category === activeTab)

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

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 234 // 222px card + 12px gap
      scrollRef.current.scrollBy({
        left: direction === "right" ? scrollAmount * 2 : -scrollAmount * 2,
        behavior: "smooth",
      })
    }
  }

  return (
    <section
      className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-xs flex flex-col gap-3"
      aria-label="Tư vấn việc làm"
    >
      {/* 1. Header */}
      <div className="pb-1">
        <h2 className="text-[18px] md:text-[20px] font-bold text-[#222222] leading-[28px]">
          Tư vấn việc làm
        </h2>
      </div>

      {/* 2. Filter Pills Tabs */}
      <div className="flex gap-2 items-center overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        {ADVICE_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-[32px] px-3 rounded-[16px] border text-[14px] leading-[21px] transition-colors whitespace-nowrap cursor-pointer select-none flex items-center justify-center font-normal ${
                isActive
                  ? "bg-[#222222] border-[#222222] text-white"
                  : "bg-[#f4f4f4] border-[#c0c0c0] text-[#222222] hover:bg-gray-200/70"
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* 3. Horizontal Scrollable Cards Container */}
      <div className="relative w-full mt-2">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Xem bài viết trước"
            className="absolute -left-3 sm:-left-4 top-[140px] -translate-y-1/2 size-11 rounded-full bg-white shadow-[0px_4px_8px_rgba(34,34,34,0.12)] border border-gray-100 flex items-center justify-center z-20 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-180">
              <path d="M1.5 1L8.5 8L1.5 15" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Xem thêm bài viết"
            className="absolute -right-3 sm:-right-4 top-[140px] -translate-y-1/2 size-11 rounded-full bg-white shadow-[0px_4px_8px_rgba(34,34,34,0.12)] border border-gray-100 flex items-center justify-center z-20 hover:bg-gray-50 transition-all active:scale-95 cursor-pointer"
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.5 1L8.5 8L1.5 15" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* Cards Row */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="overflow-x-auto scroll-smooth py-1 px-1 -mx-1 scrollbar-none [&::-webkit-scrollbar]:hidden flex gap-[12px] items-stretch"
        >
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="w-[222px] min-w-[222px] rounded-xl border border-[#e8e8e8] bg-white flex flex-col shrink-0 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all group/card cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="w-full h-[164px] relative bg-gray-100 overflow-hidden shrink-0">
                <img
                  src={article.imageSrc}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>

              {/* Description */}
              <div className="p-3 flex flex-col gap-2 flex-1">
                <h3
                  className="text-[16px] font-semibold text-[#222222] leading-[20px] line-clamp-3 h-[60px] group-hover/card:text-blue-600 transition-colors"
                  title={article.title}
                >
                  {article.title}
                </h3>
                <p
                  className="text-[14px] text-[#595959] leading-[20px] line-clamp-3 h-[60px] font-normal"
                  title={article.description}
                >
                  {article.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 4. Bottom "Xem thêm" Button */}
      <div className="flex justify-center pt-3 pb-1">
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="h-[40px] w-full max-w-[343px] border border-[#ddd] rounded-full bg-white text-[#222222] font-bold text-[16px] leading-[24px] hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center justify-center cursor-pointer active:scale-[0.98]"
        >
          Xem thêm
        </button>
      </div>
    </section>
  )
}
