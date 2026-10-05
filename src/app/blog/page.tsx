import type { Metadata } from "next"
import BlogListView from "@/features/blog/BlogListView"
import { BLOG_POSTS } from "@/data/blogData"

export const metadata: Metadata = {
  title: "Cẩm Nang & Kinh Nghiệm Nghề Sự Kiện — EventMate Đà Nẵng",
  description: "Chia sẻ kinh nghiệm thực chiến, kỹ năng điều phối và bí quyết viết CV xin việc sự kiện tại Đà Nẵng.",
}

export { BLOG_POSTS }

export default function BlogListPage() {
  return <BlogListView />
}

