import type { Metadata } from "next"
import MainLayout from "@/components/layout/MainLayout"
import Link from "next/link"
import { Calendar, User, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Cẩm Nang Nghề Sự Kiện — EventMate Đà Nẵng",
  description: "Chia sẻ kinh nghiệm thực chiến, kỹ năng điều phối và bí quyết viết CV xin việc sự kiện tại Đà Nẵng.",
}

export const BLOG_POSTS = [
  {
    id: "blog-1",
    title: "Bí quyết viết CV xin việc sự kiện gây ấn tượng mạnh",
    author: "Ban Biên Tập EventMate",
    date: "15 Th03, 2026",
    tags: ["Mẹo viết CV", "Sự nghiệp"],
    excerpt:
      "Một bộ hồ sơ xin việc chuẩn chỉnh và làm nổi bật kinh nghiệm thực chiến giúp bạn tăng 80% cơ hội trúng tuyển vào các vị trí điều phối, lễ tân hay hậu cần sự kiện lớn.",
    content: `Ngành sự kiện luôn đòi hỏi tốc độ, sự thích ứng và tinh thần trách nhiệm cao. Khi ứng tuyển vào các vị trí nhân sự sự kiện (Event Crew, Check-in Coordinator, MC hay Stage Support), hồ sơ của bạn cần thể hiện rõ tính cách năng động và khả năng làm việc nhóm.

1. Làm nổi bật các sự kiện từng tham gia: Đừng chỉ liệt kê chức danh, hãy ghi rõ quy mô sự kiện (ví dụ: Hội nghị 500 khách, Lễ hội âm nhạc 5.000 khán giả) và nhiệm vụ cụ thể bạn đảm nhận.
2. Nêu bật các kỹ năng mềm quan trọng: Giao tiếp linh hoạt, phản xạ xử lý sự cố, chịu được áp lực thời gian và sự tỉ mỉ.
3. Uy tín và cam kết: Ban tổ chức đặc biệt trân trọng những ứng viên đúng giờ, tuân thủ ca làm và không bỏ ca sát giờ. Điểm tín nhiệm trên EventMate chính là minh chứng rõ nhất cho độ tin cậy của bạn!`,
    imageUrl: "/images/home/blog-figma-1.png",
  },
  {
    id: "blog-2",
    title: "5 Kỹ năng cốt lõi của một Event Coordinator chuyên nghiệp",
    author: "Minh Trí (Lead Coordinator)",
    date: "28 Th02, 2026",
    tags: ["Kỹ năng mềm", "Điều phối"],
    excerpt:
      "Khám phá cách quản lý rủi ro, phân bổ thời gian và điều phối các bộ phận ăn khớp khi vận hành sự kiện trực tiếp với hàng ngàn khách tham dự.",
    content: `Để một sự kiện diễn ra suôn sẻ, vai trò của người điều phối (Event Coordinator) là mắt xích không thể thiếu kết nối ban tổ chức và nhân sự hiện trường.

1. Khả năng bao quát và chú ý tiểu tiết: Từ khâu sắp xếp bàn đón khách, âm thanh micro cho đến biển chỉ dẫn.
2. Quản lý thời gian theo Timeline chặt chẽ: Mỗi tiết mục, bài phát biểu đều có khung giờ vàng cần tuân thủ.
3. Kỹ năng giao tiếp qua bộ đàm: Ngắn gọn, rõ ràng, tập trung vào giải pháp thay vì phàn nàn sự cố.
4. Tinh thần bình tĩnh trước khủng hoảng: Luôn có phương án dự phòng (Plan B) cho thời tiết, kỹ thuật và phát sinh ngoài ý muốn.
5. Thái độ phục vụ và chăm sóc khách hàng: Nụ cười và sự niềm nở luôn tạo ấn tượng đẹp nhất cho người tham dự.`,
    imageUrl: "/images/home/blog-figma-2.png",
  },
  {
    id: "blog-3",
    title: "Những kỹ năng hàng đầu nhà tuyển dụng sự kiện tìm kiếm",
    author: "Thảo Nhi (DIFF Organizer)",
    date: "12 Th01, 2026",
    tags: ["Sự nghiệp", "Phỏng vấn"],
    excerpt:
      "Ban tổ chức luôn đánh giá cao sự kết hợp giữa kỹ năng chuyên môn, tinh thần trách nhiệm, phản xạ giải quyết vấn đề linh hoạt và kỹ năng giao tiếp truyền tải thông tin.",
    content: `Các nhà tổ chức lễ hội lớn tại Đà Nẵng như Lễ hội pháo hoa quốc tế DIFF, Marathon Quốc tế hay TechFest luôn tìm kiếm những gương mặt trẻ có tinh thần lăn xả và nhiệt huyết.

1. Ngoại ngữ giao tiếp (Tiếng Anh, Hàn, Trung): Điểm cộng cực lớn khi Đà Nẵng là thành phố du lịch quốc tế đón hàng triệu lượt du khách.
2. Khả năng làm việc dưới áp lực cao: Những ca làm việc kéo dài cả ngày đòi hỏi thể lực tốt và tinh thần bền bỉ.
3. Kỹ năng công nghệ cơ bản: Sử dụng thành thạo các ứng dụng check-in QR code, máy POS hay bộ đàm cầm tay.
4. Tác phong trang phục chuyên nghiệp: Tuân thủ quy định dresscode của từng chương trình.`,
    imageUrl: "/images/home/blog-figma-3.png",
  },
]

export default function BlogListPage() {
  return (
    <MainLayout>
      <div className="bg-white min-h-screen py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
              Cẩm Nang & Kinh Nghiệm Nghề Sự Kiện
            </h1>
            <p className="text-sm sm:text-base text-[#515151]">
              Cập nhật kiến thức thực chiến, xu hướng tuyển dụng và bí quyết phát triển nghề nghiệp trong ngành sự kiện tại Đà Nẵng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#005DDC]/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {post.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-[#005DDC]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <div className="flex items-center gap-4 text-xs text-[#757575]">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {post.date}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-[#222222] group-hover:text-[#005DDC] transition-colors line-clamp-2">
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </h2>

                    <p className="text-sm text-[#515151] line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-5 sm:p-6 pt-0">
                  <Link
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#005DDC] group-hover:gap-2.5 transition-all"
                  >
                    <span>Đọc tiếp</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
