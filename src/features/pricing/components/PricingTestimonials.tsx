"use client"

import React, { useState } from "react"

// Exact SVG from Figma node I5875:28787;2428:41982
function FigmaQuoteIcon({ className = "w-[30.15px] h-[27px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 31 27"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.296555 15.5C2.58315 10.2334 5.51905 5.49578 8.50718 0.645672C8.74233 0.263982 9.20274 0.0851289 9.6338 0.20829L11.2667 0.674828C11.8619 0.844885 12.1612 1.50937 11.8941 2.06781L6.9048 12.5C10.8302 13.0753 12.4933 14.5 13.699 17.5C14.6043 19.7523 14.4089 27 6.90886 27C-0.591133 27 -0.355247 17 0.296555 15.5Z"
        fill="#1C6FE3"
      />
      <path
        d="M16.3713 15.5C18.6579 10.2334 21.5938 5.49578 24.582 0.645672C24.8171 0.263982 25.2775 0.0851289 25.7086 0.20829L27.3415 0.674828C27.9367 0.844885 28.236 1.50937 27.9689 2.06781L22.9796 12.5C26.905 13.0753 28.568 14.5 29.7738 17.5C30.6791 19.7523 30.4836 27 22.9837 27C15.4837 27 15.7195 17 16.3713 15.5Z"
        fill="#1C6FE3"
      />
    </svg>
  )
}

// Exact SVG from Figma node I5875:28787;2428:41991
function FigmaStarIcon({ className = "w-[12px] h-[12px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.33979 1.26691C5.48757 1.01081 5.73387 0.857143 5.98017 0.857143C6.22647 0.857143 6.47277 1.01081 6.62055 1.26691L7.85205 3.62306C7.85205 3.67429 7.90131 3.67429 7.90131 3.67429C7.90131 3.67429 7.95057 3.72551 7.99983 3.72551L10.5613 4.18649C10.8076 4.23771 11.0539 4.4426 11.1032 4.6987C11.2017 4.9548 11.1032 5.26213 10.9554 5.46701L9.1328 7.4134C9.1328 7.4134 9.08354 7.46462 9.08354 7.51584C9.08354 7.56706 9.08354 7.56706 9.08354 7.61828L9.42836 10.2818C9.47762 10.5379 9.32984 10.8452 9.1328 10.9989C8.93576 11.1525 8.6402 11.2037 8.39391 11.0501L6.07869 9.872C6.02943 9.872 6.02943 9.872 5.98017 9.872C5.93091 9.872 5.93091 9.872 5.88165 9.872L3.56644 11.0501C3.32014 11.1525 3.02458 11.1013 2.82754 10.9476C2.6305 10.794 2.48272 10.4866 2.53198 10.2305L2.8768 7.56706C2.8768 7.51584 2.8768 7.51584 2.8768 7.46462C2.8768 7.4134 2.82754 7.4134 2.82754 7.36218L1.05418 5.46701C0.857143 5.26213 0.807883 4.9548 0.906403 4.6987C1.00492 4.4426 1.20196 4.23771 1.44826 4.18649L4.00978 3.72551C4.05904 3.72551 4.05904 3.72551 4.1083 3.67429L4.15756 3.62306L5.33979 1.26691Z"
        fill="#F6B500"
      />
    </svg>
  )
}

// Exact SVG from Figma node I5875:28787;2428:41996
function FigmaLikeIcon({ className = "w-[24px] h-[24px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.176 9.60799C20.73 8.98799 19.7991 8.25001 17.9041 8.25001H14.748V5.76301C14.748 4.50701 14.124 3.34102 13.079 2.64302C12.482 2.24502 11.748 2.14299 11.066 2.36299C10.382 2.58299 9.84596 3.094 9.58496 3.795L7.45703 10.25H4.50098C3.26098 10.25 2.25098 11.259 2.25098 12.5V19.5C2.25098 20.741 3.26098 21.75 4.50098 21.75H15.905C18.401 21.75 19.012 20.537 19.463 19.186L21.462 13.186C21.929 11.782 21.827 10.511 21.176 9.60799ZM3.75 19.5V12.5C3.75 12.086 4.087 11.75 4.5 11.75H6.5V20.25H4.5C4.087 20.25 3.75 19.914 3.75 19.5ZM20.037 12.711L18.038 18.711C17.683 19.778 17.4601 20.25 15.9041 20.25H8V11.75C8.324 11.75 8.61006 11.542 8.71106 11.235L10.998 4.29402C11.089 4.05302 11.28 3.87003 11.525 3.79103C11.77 3.71103 12.032 3.74901 12.246 3.89101C12.873 4.30901 13.2469 5.00901 13.2469 5.76301V9.00001C13.2469 9.41401 13.5829 9.75001 13.9969 9.75001H17.903C18.599 9.75001 19.521 9.877 19.959 10.485C20.315 10.979 20.345 11.791 20.037 12.711Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Exact SVG from Figma node I5875:28787;2428:42000
function FigmaDislikeIcon({ className = "w-[24px] h-[24px]" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.5 2.25H8.09592C5.59992 2.25 4.98894 3.46303 4.53794 4.81403L2.53891 10.814C2.07091 12.218 2.17295 13.489 2.82395 14.392C3.26995 15.012 4.20092 15.75 6.09592 15.75H9.25193V18.237C9.25193 19.493 9.87599 20.6591 10.921 21.3571C11.311 21.6171 11.76 21.751 12.214 21.751C12.455 21.751 12.6969 21.713 12.9339 21.637C13.6179 21.417 14.154 20.906 14.415 20.205L16.5429 13.75H19.499C20.739 13.75 21.749 12.741 21.749 11.5V4.5C21.75 3.259 20.74 2.25 19.5 2.25ZM15.2889 12.765L13.0019 19.706C12.9109 19.947 12.7199 20.13 12.4749 20.209C12.2289 20.288 11.967 20.251 11.754 20.109C11.127 19.691 10.753 18.991 10.753 18.237V15C10.753 14.586 10.417 14.25 10.003 14.25H6.09702C5.40102 14.25 4.47899 14.123 4.04099 13.515C3.68499 13.02 3.65499 12.209 3.96299 11.288L5.96201 5.28802C6.31701 4.22102 6.53992 3.74902 8.09592 3.74902H16V12.249C15.676 12.251 15.3899 12.458 15.2889 12.765ZM20.25 11.5C20.25 11.914 19.913 12.25 19.5 12.25H17.5V3.75H19.5C19.913 3.75 20.25 4.086 20.25 4.5V11.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

interface ReviewItem {
  id: string
  name: string
  role: string
  avatar: string
  rating: number
  comment: string
  likes: number
  dislikes: number
}

const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "Cody Fisher",
    role: "Ứng viên sự kiện",
    avatar: "/images/avatar-cody.png",
    rating: 3.5,
    comment:
      "Nền tảng giúp mình tìm được nhiều ca làm việc sự kiện linh hoạt tại Đà Nẵng với mức thù lao rất tốt. Mọi thông tin mô tả công việc, thời gian và địa điểm đều rõ ràng, nhận thù lao đúng hẹn ngay sau sự kiện.",
    likes: 60,
    dislikes: 0,
  },
  {
    id: "rev-2",
    name: "Darlene Robertson",
    role: "Nhà tổ chức sự kiện",
    avatar: "/images/avatar-darlene.png",
    rating: 4.5,
    comment:
      "Gói Standard hỗ trợ đội ngũ chúng tôi tuyển đủ hơn 150 nhân sự lễ tân và điều phối chỉ trong 3 ngày. Khả năng lọc hồ sơ nhanh chóng và mở khóa liên hệ ứng viên trực tiếp giúp tiết kiệm rất nhiều thời gian.",
    likes: 25,
    dislikes: 0,
  },
  {
    id: "rev-3",
    name: "Marvin McKinney",
    role: "Quản lý nhân sự",
    avatar: "/images/avatar-marvin.png",
    rating: 4.3,
    comment:
      "Lực lượng ứng viên trẻ trên EventMate rất năng động, nhiệt huyết và có tinh thần trách nhiệm cao. Bảng giá dịch vụ minh bạch, hỗ trợ chăm sóc tận tình 24/7 giúp các sự kiện lớn diễn ra vô cùng thuận lợi.",
    likes: 14,
    dislikes: 0,
  },
]

interface PricingTestimonialsProps {
  title?: string
  caption?: string
}

export default function PricingTestimonials({
  title = "Đánh Giá & Phản Hồi Từ Khách Hàng",
  caption = "Xem những trải nghiệm thực tế từ các Nhà tổ chức và ứng viên đã đồng hành cùng EventMate.",
}: PricingTestimonialsProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(INITIAL_REVIEWS)
  const [userInteractions, setUserInteractions] = useState<
    Record<string, "liked" | "disliked" | null>
  >({})

  const handleLike = (id: string) => {
    const current = userInteractions[id]
    if (current === "liked") {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, likes: r.likes - 1 } : r))
      )
      setUserInteractions((prev) => ({ ...prev, [id]: null }))
    } else {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              likes: r.likes + 1,
              dislikes: current === "disliked" ? r.dislikes - 1 : r.dislikes,
            }
          }
          return r
        })
      )
      setUserInteractions((prev) => ({ ...prev, [id]: "liked" }))
    }
  }

  const handleDislike = (id: string) => {
    const current = userInteractions[id]
    if (current === "disliked") {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, dislikes: r.dislikes - 1 } : r))
      )
      setUserInteractions((prev) => ({ ...prev, [id]: null }))
    } else {
      setReviews((prev) =>
        prev.map((r) => {
          if (r.id === id) {
            return {
              ...r,
              dislikes: r.dislikes + 1,
              likes: current === "liked" ? r.likes - 1 : r.likes,
            }
          }
          return r
        })
      )
      setUserInteractions((prev) => ({ ...prev, [id]: "disliked" }))
    }
  }

  return (
    <section className="max-w-[1232px] mx-auto w-full flex flex-col gap-[32px] items-center">
      {/* Titr home (Figma node 5875:28785) */}
      <div className="flex flex-col items-center justify-center gap-[8px] text-center w-full">
        <h2 className="font-['Inter'] font-semibold text-[32px] sm:text-[36px] text-[#222222] leading-normal tracking-tight">
          {title}
        </h2>
        <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] max-w-[500px]">
          {caption}
        </p>
      </div>

      {/* 3 Review Cards Grid (Figma node 5875:28786) */}
      <div className="flex flex-col lg:flex-row gap-[16px] items-center justify-center w-full">
        {reviews.map((rev) => {
          const userAction = userInteractions[rev.id]

          return (
            <div
              key={rev.id}
              className="w-full lg:w-[400px] h-auto lg:h-[288px] bg-white border border-[#EDEDED] rounded-[8px] p-[16px] flex flex-col gap-[16px] shrink-0"
            >
              {/* Header: Quotation Mark + Avatar + Name + Rating (Figma node I5875:28787;2428:41980) */}
              <div className="flex items-start justify-between w-full">
                <div className="flex gap-[20px] items-start min-w-0">
                  {/* Blue Quote Icon (Figma node I5875:28787;2428:41982) */}
                  <FigmaQuoteIcon className="w-[30.15px] h-[27px] shrink-0" />

                  {/* Avatar & Info */}
                  <div className="flex gap-[8px] items-start min-w-0">
                    <div className="w-[40px] h-[40px] rounded-full overflow-hidden shrink-0 border border-slate-100">
                      <img
                        src={rev.avatar}
                        alt={rev.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col h-[40px] justify-between">
                      <h3 className="font-['Inter'] font-medium text-[18px] text-[#222222] leading-normal truncate">
                        {rev.name}
                      </h3>
                      <p className="font-['Inter'] font-normal text-[12px] text-[#A5A5A5] leading-normal">
                        {rev.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Star Rating (Figma node I5875:28787;2428:41990) */}
                <div className="flex gap-[2px] items-center shrink-0 pt-0.5">
                  <FigmaStarIcon className="w-[12px] h-[12px]" />
                  <span className="font-['Inter'] text-[12px] font-normal text-[#515151] leading-none">
                    {rev.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Comment body (Figma node I5875:28787;2428:41993) */}
              <p className="font-['Inter'] font-normal text-[16px] text-[#222222] leading-[1.6] h-[160px] overflow-hidden">
                {rev.comment}
              </p>

              {/* Bottom Reaction Bar: No border-t, gap-16, h-24 (Figma node I5875:28787;2428:41994) */}
              <div className="flex items-center gap-[16px] h-[24px]">
                <button
                  type="button"
                  onClick={() => handleLike(rev.id)}
                  className={`flex items-center gap-[8px] transition-colors cursor-pointer ${
                    userAction === "liked"
                      ? "text-[#1C6FE3] font-medium"
                      : "text-[#222222] hover:text-[#1C6FE3]"
                  }`}
                  title="Hữu ích"
                >
                  <FigmaLikeIcon className="w-[24px] h-[24px]" />
                  <span className="font-['Inter'] text-[16px] leading-[1.6]">
                    {rev.likes}
                  </span>
                </button>

                <div className="h-[24px] w-px bg-[#EDEDED]" />

                <button
                  type="button"
                  onClick={() => handleDislike(rev.id)}
                  className={`flex items-center gap-[8px] transition-colors cursor-pointer ${
                    userAction === "disliked"
                      ? "text-rose-600 font-medium"
                      : "text-[#222222] hover:text-rose-600"
                  }`}
                  title="Không hữu ích"
                >
                  <FigmaDislikeIcon className="w-[24px] h-[24px]" />
                  <span className="font-['Inter'] text-[16px] leading-[1.6]">
                    {rev.dislikes}
                  </span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
