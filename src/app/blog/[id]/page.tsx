import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import MainLayout from "@/components/layout/MainLayout"
import { BLOG_POSTS } from "../page"
import { Calendar, User, ArrowLeft, Share2, Tag } from "lucide-react"
import Breadcrumb from "@/components/common/Breadcrumb"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const post = BLOG_POSTS.find((p) => p.id === id)
  if (!post) {
    return { title: "Không tìm thấy bài viết — EventMate" }
  }
  return {
    title: `${post.title} — EventMate Blog`,
    description: post.excerpt,
  }
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { id } = await params
  const post = BLOG_POSTS.find((p) => p.id === id)

  if (!post) {
    notFound()
  }

  return (
    <MainLayout fullWidth className="bg-[#f3f5f7]">
      <div className="bg-[#f3f5f7] min-h-[calc(100vh-80px)] py-8 sm:py-14">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Breadcrumb */}
          <div>
            <Breadcrumb
              items={[
                { label: "Blog", href: "/blog" },
                { label: post.title },
              ]}
            />
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center">
              {post.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#EFF5FF] text-[#005DDC]"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-bold text-[#222222] leading-tight tracking-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-[#757575] pt-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-1.5 font-medium text-[#222222]">
                <User className="w-4 h-4 text-[#005DDC]" />
                <span>{post.author}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>

          {/* Hero image */}
          <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 aspect-video max-h-[420px] w-full bg-slate-100">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Excerpt Lead */}
          <div className="p-4 sm:p-6 bg-slate-50 border-l-4 border-[#005DDC] rounded-r-xl">
            <p className="text-base sm:text-lg font-medium text-[#333333] italic leading-relaxed">
              {post.excerpt}
            </p>
          </div>

          {/* Content Body */}
          <div className="prose prose-slate max-w-none text-base text-[#333333] leading-relaxed space-y-4 whitespace-pre-line">
            {post.content}
          </div>

          {/* Footer of article */}
          <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-[#222222] hover:bg-slate-50 transition-colors"
            >
              ← Xem các bài viết khác
            </Link>

            <Link
              href="/events"
              className="px-6 py-2.5 rounded-xl bg-[#005DDC] text-white text-sm font-semibold hover:bg-[#004bb3] transition-colors shadow-sm"
            >
              Ứng tuyển sự kiện ngay
            </Link>
          </div>
        </article>
      </div>
    </MainLayout>
  )
}
