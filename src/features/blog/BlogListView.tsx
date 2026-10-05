"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { Search, Calendar, User, ArrowRight, BookOpen } from "lucide-react"
import MainLayout from "@/components/layout/MainLayout"
import HeroSearchBanner from "@/features/home/components/HeroSearchBanner"
import { BLOG_POSTS, BlogPostItem } from "@/data/blogData"
import { useUser } from "@/components/providers/AuthProvider"
import { cn } from "@/lib/utils"

const CATEGORY_TABS = [
  { id: "all", label: "Tất cả bài viết" },
  { id: "jobseeker", label: "Cẩm nang tìm việc" },
  { id: "industry", label: "Kinh nghiệm ngành nghề" },
  { id: "employer", label: "Cẩm nang tuyển dụng" },
]

export default function BlogListView() {
  const { user, role } = useUser()
  const userRole = user ? role || "student" : "guest"

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter((post) => {
      const matchCategory =
        selectedCategory === "all" || post.category === selectedCategory

      const query = searchTerm.toLowerCase().trim()
      const matchSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.excerpt.toLowerCase().includes(query) ||
        post.tags.some((tag) => tag.toLowerCase().includes(query))

      return matchCategory && matchSearch
    })
  }, [searchTerm, selectedCategory])

  return (
    <MainLayout role={userRole} fullWidth className="bg-[#F2F6FC]">
      {/* 1. Hero Search Banner with Blog Title and Search Capsule */}
      <HeroSearchBanner title="Cẩm Nang & Kinh Nghiệm Nghề Sự Kiện">
        <div className="bg-white rounded-2xl md:rounded-full shadow-lg p-2 md:p-2.5 flex items-center gap-2 max-w-2xl mx-auto border border-gray-100 text-gray-800">
          <div className="flex items-center gap-2.5 px-3 py-2 flex-1">
            <Search className="w-5 h-5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm bài viết, cẩm nang, kỹ năng sự kiện..."
              className="w-full bg-transparent text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="text-xs font-semibold text-gray-400 hover:text-gray-700 px-3 py-1 cursor-pointer transition-colors"
            >
              Xóa
            </button>
          )}
        </div>
      </HeroSearchBanner>

      {/* 2. Main Content Body */}
      <div className="w-full min-h-[calc(100vh-80px)] pt-8 sm:pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-in fade-in duration-300">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setSelectedCategory(tab.id)}
                    className={cn(
                      "px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer",
                      isActive
                        ? "bg-[#FB7328] text-white shadow-xs"
                        : "bg-white text-gray-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              Hiển thị <strong className="text-gray-900">{filteredPosts.length}</strong> bài viết
            </div>
          </div>

          {/* Blog Cards Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-[#FB7328]/50 hover:shadow-lg transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Thumbnail Image */}
                    <div className="h-48 w-full bg-slate-100 overflow-hidden relative">
                      <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {post.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 backdrop-blur-xs text-zinc-900 shadow-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Metadata & Title */}
                    <div className="p-5 sm:p-6 space-y-3">
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {post.date}
                        </span>
                      </div>

                      <h2 className="text-lg font-bold text-gray-900 group-hover:text-[#FB7328] transition-colors line-clamp-2 leading-snug">
                        <Link href={`/blog/${post.id}`}>{post.title}</Link>
                      </h2>

                      <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Read More Action */}
                  <div className="p-5 sm:p-6 pt-0">
                    <Link
                      href={`/blog/${post.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#FB7328] group-hover:gap-2.5 transition-all"
                    >
                      <span>Đọc tiếp</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
              <div className="size-12 rounded-full bg-orange-50 text-[#FB7328] flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Không tìm thấy bài viết phù hợp
              </h3>
              <p className="text-sm text-gray-500">
                Hãy thử tìm kiếm với từ khóa khác hoặc chuyển sang danh mục bài viết khác.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCategory("all")
                }}
                className="px-4 py-2 rounded-xl bg-[#FB7328] text-white text-xs font-semibold hover:bg-[#ea580c] transition-colors cursor-pointer"
              >
                Đặt lại bộ lọc
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  )
}
