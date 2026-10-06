import type { Metadata } from "next"
import CVProfileView from "@/features/student/CVProfileView"

export const metadata: Metadata = {
  title: "Hồ sơ của tôi | EventMate",
  description: "Cập nhật thông tin liên hệ, kỹ năng và kinh nghiệm để ứng tuyển sự kiện nhanh chóng.",
}

export default function ProfilePage() {
  return <CVProfileView embedded={true} />
}
