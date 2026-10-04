import type { Metadata } from "next"
import MainLayout from "@/components/layout/MainLayout"
import Link from "next/link"
import { Calendar, User, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Cẩm Nang Nghề Sự Kiện — EventMate Đà Nẵng",
  description: "Chia sẻ kinh nghiệm thực chiến, kỹ năng điều phối và bí quyết viết CV xin việc sự kiện tại Đà Nẵng.",
}

import { BLOG_POSTS } from "@/data/blogData"
export { BLOG_POSTS }

export default function BlogListPage() {
  return (
    <MainLayout fullWidth className="bg-[#f3f5f7]">
      <div className="bg-[#f3f5f7] min-h-[calc(100vh-80px)] py-10 sm:py-16">
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
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-zinc-900/40 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
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
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-zinc-950 shadow-xs"
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

                    <h2 className="text-lg font-bold text-[#222222] group-hover:text-zinc-950 transition-colors line-clamp-2">
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
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-950 group-hover:gap-2.5 transition-all"
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
