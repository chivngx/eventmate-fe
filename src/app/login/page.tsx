import type { Metadata } from "next"
import LoginView from "@/features/auth/LoginView"

export const metadata: Metadata = {
  title: "Đăng nhập",
  description: "Đăng nhập vào tài khoản EventMate của bạn.",
}

export default function LoginPage() {
  return <LoginView />
}
