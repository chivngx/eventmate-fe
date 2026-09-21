import type { Metadata } from "next"
import RegisterView from "@/features/auth/RegisterView"

export const metadata: Metadata = {
  title: "Đăng ký tài khoản",
  description: "Tạo tài khoản EventMate để bắt đầu tham gia và tổ chức các sự kiện sôi động tại Đà Nẵng.",
}

export default function RegisterPage() {
  return <RegisterView />
}
