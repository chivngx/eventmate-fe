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
    id: "pg-pb-su-kien",
    name: "PG & PB Sự kiện",
    lines: ["PG & PB", "Sự kiện"],
    imageSrc: "/images/categories/pg-pb.png",
    searchKeyword: "PG & PB Sự kiện",
  },
  {
    id: "le-tan-check-in",
    name: "Lễ tân & Check-in",
    lines: ["Lễ tân &", "Check-in"],
    imageSrc: "/images/categories/le-tan.png",
    searchKeyword: "Lễ tân & Check-in",
  },
  {
    id: "hau-can-san-khau",
    name: "Hậu cần & Sân khấu",
    lines: ["Hậu cần &", "Sân khấu"],
    imageSrc: "/images/categories/hau-can.png",
    searchKeyword: "Hậu cần & Sân khấu",
  },
  {
    id: "dieu-phoi-su-kien",
    name: "Điều phối sự kiện",
    lines: ["Điều phối", "sự kiện"],
    imageSrc: "/images/categories/dieu-phoi.png",
    searchKeyword: "Điều phối sự kiện",
  },
  {
    id: "mc-hoat-nao",
    name: "MC & Hoạt náo",
    lines: ["MC &", "Hoạt náo"],
    imageSrc: "/images/categories/mc-hoat-nao.png",
    searchKeyword: "MC & Hoạt náo",
  },
  {
    id: "quay-phim-chup-anh",
    name: "Quay phim & Chụp ảnh",
    lines: ["Quay phim &", "Chụp ảnh"],
    imageSrc: "/images/categories/media.png",
    searchKeyword: "Quay phim & Chụp ảnh",
  },
  {
    id: "phuc-vu-tiec-banquet",
    name: "Phục vụ tiệc (Banquet)",
    lines: ["Phục vụ tiệc", "(Banquet)"],
    imageSrc: "/images/categories/banquet.png",
    searchKeyword: "Phục vụ tiệc (Banquet)",
  },
  {
    id: "pha-che-su-kien",
    name: "Pha chế sự kiện",
    lines: ["Pha chế", "sự kiện"],
    imageSrc: "/images/categories/pha-che.png",
    searchKeyword: "Pha chế sự kiện",
  },
  {
    id: "mascot-bieu-dien",
    name: "Mascot & Biểu diễn",
    lines: ["Mascot &", "Biểu diễn"],
    imageSrc: "/images/categories/mascot.png",
    searchKeyword: "Mascot & Biểu diễn",
  },
  {
    id: "tinh-nguyen-vien",
    name: "Tình nguyện viên",
    lines: ["Tình nguyện", "viên"],
    imageSrc: "/images/categories/soat-ve.png",
    searchKeyword: "Tình nguyện viên",
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
        Các vị trí phổ biến
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
          Xem tất cả
        </button>
      </div>
    </section>
  )
}
