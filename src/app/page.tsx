import type { Metadata } from "next"
import HomeView from "@/features/home/HomeView"

export const metadata: Metadata = {
  title: "EventMate — Cổng việc làm & Nhân sự sự kiện Đà Nẵng",
  description: "Nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
}

export default function HomePage() {
  return <HomeView />
}
