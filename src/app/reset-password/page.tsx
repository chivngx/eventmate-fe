import type { Metadata } from "next"
import ResetPasswordView from "@/features/auth/ResetPasswordView"

export const metadata: Metadata = {
    title: "Đặt lại mật khẩu - EventMate",
    description: "Cập nhật mật khẩu mới cho tài khoản EventMate của bạn.",
}

export default function ResetPasswordPage() {
    return <ResetPasswordView />
}
