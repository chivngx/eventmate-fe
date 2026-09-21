"use client"

import Link from "next/link"

const ARTICLES = [
  {
    id: "blog-1",
    title: "Bí quyết viết CV xin việc sự kiện gây ấn tượng mạnh",
    author: "Ban Biên Tập EventMate",
    date: "15 Th03, 2025",
    tags: ["Mẹo viết CV", "Sự nghiệp"],
    excerpt:
      "Một bộ hồ sơ xin việc chuẩn chỉnh và làm nổi bật kinh nghiệm thực chiến giúp bạn tăng 80% cơ hội trúng tuyển vào các vị trí điều phối, lễ tân hay hậu cần sự kiện lớn.",
    imageUrl: "/images/home/blog-figma-1.png",
  },
  {
    id: "blog-2",
    title: "5 Kỹ năng cốt lõi của một Event Coordinator chuyên nghiệp",
    author: "Minh Trí (Lead Coordinator)",
    date: "28 Th02, 2025",
    tags: ["Kỹ năng mềm", "Điều phối"],
    excerpt:
      "Khám phá cách quản lý rủi ro, phân bổ thời gian và điều phối các bộ phận ăn khớp khi vận hành sự kiện trực tiếp với hàng ngàn khách tham dự.",
    imageUrl: "/images/home/blog-figma-2.png",
  },
  {
    id: "blog-3",
    title: "Những kỹ năng hàng đầu nhà tuyển dụng sự kiện tìm kiếm",
    author: "Thảo Nhi (CTV DIFF)",
    date: "12 Th01, 2025",
    tags: ["Sự nghiệp", "Phỏng vấn"],
    excerpt:
      "Ban tổ chức luôn đánh giá cao sự kết hợp giữa kỹ năng chuyên môn, tinh thần trách nhiệm, phản xạ giải quyết vấn đề linh hoạt và kỹ năng giao tiếp truyền tải thông tin.",
    imageUrl: "/images/home/blog-figma-3.png",
  },
]

export default function EventBlogSection() {
  return (
    <section
      className="w-full"
      data-node-id="5875:29518"
      data-name="Frame 2147225767"
    >
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0">
        {/* Section Header (Figma node 5875:29519: Titr home) */}
        <div
          className="relative flex flex-col items-center justify-center mb-10 text-center"
          data-node-id="5875:29519"
          data-name="Titr home"
        >
          {/* Title & Subtitle block (Centered across 1232px) */}
          <div className="flex flex-col items-center gap-[8px] w-full max-w-[800px] px-4">
            <h2
              className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] leading-tight tracking-tight text-center"
              data-node-id="I5875:29519;874:9496"
            >
              Cẩm Nang & Kinh Nghiệm Nghề Sự Kiện
            </h2>
            <p
              className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] text-center"
              data-node-id="I5875:29519;874:9497"
            >
              Cập nhật kiến thức, kỹ năng và xu hướng tuyển dụng mới nhất trong ngành sự kiện
            </p>
          </div>

          {/* "Xem thêm >" Action Link (Figma node I5875:29519;3988:40331 - Far Right on Desktop) */}
          <div
            className="lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 mt-2 lg:mt-0 shrink-0"
            data-node-id="I5875:29519;3985:41205"
          >
            <Link
              href="/blog"
              className="h-[32px] px-[16px] py-[8px] rounded-[8px] hover:bg-[#EFF5FF] text-[#005DDC] transition-colors flex items-center gap-[8px] text-[14px] font-['Inter'] font-medium leading-[1.6] group cursor-pointer"
              data-node-id="I5875:29519;3988:40331"
              data-name="Buttons"
            >
              <span>Xem thêm</span>
              <div className="relative shrink-0 size-[24px] flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                <img
                  src="/images/home/angle-right-small.svg"
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>
        </div>

        {/* 3 Blog Cards Grid (Figma node 5875:29520: Frame 2147225766) */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[16px] items-stretch justify-items-center"
          data-node-id="5875:29520"
        >
          {ARTICLES.map((article, idx) => (
            <Link
              key={article.id}
              href={`/blog/${article.id}`}
              className="bg-white border border-[#F4F4F4] rounded-[8px] w-full max-w-[400px] min-h-[431px] h-auto flex flex-col justify-between overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-[#005DDC]/40 hover:shadow-md transition-all duration-200 group cursor-pointer"
              data-node-id={idx === 0 ? "5875:29521" : idx === 1 ? "5875:29522" : "5875:29523"}
              data-name="BlogCart"
            >
              {/* 240px Image Header (Figma node I5875:29521;5477:36429) */}
              <div className="h-[220px] sm:h-[240px] w-full relative overflow-hidden rounded-tl-[8px] rounded-tr-[8px] shrink-0 bg-slate-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                />
              </div>

              {/* Card Body Content (Figma node I5875:29521;5477:36430) */}
              <div className="p-4 sm:p-5 pb-6 flex flex-col gap-3 flex-1 justify-between text-left">
                <div className="flex flex-col gap-3">
                  {/* Badges container (Figma node I5875:29521;5498:36155) */}
                  <div className="flex flex-wrap gap-[8px] items-center">
                    {article.tags.map((tag, tagIdx) => (
                      <div
                        key={tagIdx}
                        className="border border-[#A5A5A5] rounded-[4px] h-[20px] px-[8px] py-[3px] flex items-center justify-center shrink-0"
                        data-name="Badge"
                      >
                        <span className="font-['Inter'] font-normal text-[12px] text-[#515151] leading-none whitespace-nowrap">
                          {tag}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Author, Date & Title block (Figma node I5875:29521;5498:36158) */}
                  <div className="flex flex-col gap-1.5">
                    {/* Author & Date metadata */}
                    <div className="flex items-center gap-[4px] font-['Inter'] font-normal text-[12px] text-[#A5A5A5] whitespace-nowrap">
                      <span>Bởi {article.author}</span>
                      <span className="px-0.5">•</span>
                      <span>{article.date}</span>
                    </div>

                    {/* Blog Title (allow 2 lines without truncation) */}
                    <h3 className="font-['Inter'] font-semibold text-[18px] sm:text-[20px] text-[#222222] leading-[1.35] group-hover:text-[#005DDC] transition-colors">
                      {article.title}
                    </h3>
                  </div>
                </div>

                {/* Excerpt Description (Figma node I5875:29521;5477:36446) */}
                <p className="font-['Inter'] font-normal text-[14px] text-[#757575] leading-[1.6] line-clamp-3 text-ellipsis">
                  {article.excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
