"use client"

import { useRouter } from "next/navigation"

interface PopularCategoryItem {
  id: string
  name: string
  lines: string[]
  imageSrc: string
  searchKeyword: string
}

const POPULAR_CATEGORIES: PopularCategoryItem[] = [
  {
    id: "nhan-vien-kinh-doanh",
    name: "Nhân viên kinh doanh",
    lines: ["Nhân viên", "kinh doanh"],
    imageSrc: "/images/categories/nhan-vien-kinh-doanh.png",
    searchKeyword: "Kinh doanh",
  },
  {
    id: "nhan-vien-phuc-vu",
    name: "Nhân viên phục vụ",
    lines: ["Nhân viên", "phục vụ"],
    imageSrc: "/images/categories/nhan-vien-phuc-vu.png",
    searchKeyword: "Phục vụ",
  },
  {
    id: "ban-hang",
    name: "Bán hàng",
    lines: ["Bán hàng"],
    imageSrc: "/images/categories/ban-hang.png",
    searchKeyword: "Bán hàng",
  },
  {
    id: "bao-ve",
    name: "Bảo vệ",
    lines: ["Bảo vệ"],
    imageSrc: "/images/categories/bao-ve.png",
    searchKeyword: "Bảo vệ",
  },
  {
    id: "tai-xe-o-to",
    name: "Tài xế ô tô",
    lines: ["Tài xế ô tô"],
    imageSrc: "/images/categories/tai-xe-o-to.png",
    searchKeyword: "Tài xế",
  },
  {
    id: "cong-nhan",
    name: "Công nhân",
    lines: ["Công nhân"],
    imageSrc: "/images/categories/cong-nhan.png",
    searchKeyword: "Công nhân",
  },
  {
    id: "nhan-vien-kho-van",
    name: "Nhân viên kho vận",
    lines: ["Nhân viên", "kho vận"],
    imageSrc: "/images/categories/nhan-vien-kho-van.png",
    searchKeyword: "Kho vận",
  },
  {
    id: "nhan-vien-giao-hang",
    name: "Nhân viên giao hàng",
    lines: ["Nhân viên", "giao hàng"],
    imageSrc: "/images/categories/nhan-vien-giao-hang.png",
    searchKeyword: "Giao hàng",
  },
  {
    id: "phu-bep",
    name: "Phụ bếp",
    lines: ["Phụ bếp"],
    imageSrc: "/images/categories/phu-bep.png",
    searchKeyword: "Phụ bếp",
  },
  {
    id: "pha-che",
    name: "Pha chế",
    lines: ["Pha chế"],
    imageSrc: "/images/categories/pha-che.png",
    searchKeyword: "Pha chế",
  },
]

export default function PopularCategories() {
  const router = useRouter()

  const handleCategoryClick = (keyword: string) => {
    router.push(`/events?search=${encodeURIComponent(keyword)}`)
  }

  return (
    <section className="w-full bg-white rounded-2xl p-5 md:p-6 shadow-xs" aria-label="Các ngành nghề phổ biến">
      {/* Title */}
      <h2 className="text-[20px] font-bold text-[#222222] leading-[30px] mb-3">
        Các ngành nghề phổ biến
      </h2>

      {/* Grid of 10 category cards */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-1.5 sm:gap-2.5 md:gap-3 items-start pt-2">
        {POPULAR_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryClick(cat.searchKeyword)}
            className="group flex flex-col items-center justify-start p-1 sm:p-1.5 md:p-2 rounded-xl hover:bg-gray-50/80 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <div className="w-13 h-13 sm:w-16 sm:h-16 md:w-[92px] md:h-[92px] relative flex items-center justify-center shrink-0">
              <img
                src={cat.imageSrc}
                alt={cat.name}
                className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            </div>
            <div className="mt-1.5 sm:mt-2 text-center text-[#222222] text-[11px] sm:text-xs md:text-[16px] leading-[15px] sm:leading-[18px] md:leading-[24px] font-normal">
              {cat.lines.map((line, idx) => (
                <p key={idx} className="m-0 whitespace-nowrap">
                  {line}
                </p>
              ))}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Button: Xem tất cả ngành nghề */}
      <div className="mt-5 md:mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => router.push("/events")}
          className="h-[40px] px-6 rounded-full border border-[#dadada] bg-white hover:bg-gray-50 hover:border-gray-400 text-[#222222] text-[15px] md:text-[16px] font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.98]"
        >
          Xem tất cả ngành nghề
        </button>
      </div>
    </section>
  )
}
