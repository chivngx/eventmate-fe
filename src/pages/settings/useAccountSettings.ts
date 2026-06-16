import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useAccountSettings() {
    // State quản lý hệ thống
    const [hasPassword, setHasPassword] = useState(true)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    // State quản lý dữ liệu Tab 1 (Thông tin cá nhân)
    const [userId, setUserId] = useState<string>("")
    const [fullName, setFullName] = useState<string>("")
    const [email, setEmail] = useState<string>("")

    // State quản lý dữ liệu Tab 2 (Đổi mật khẩu)
    const [currentPassword, setCurrentPassword] = useState<string>("")
    const [newPassword, setNewPassword] = useState<string>("")

    // Tự động lấy dữ liệu khi render
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setLoading(false)
                return
            }

            setUserId(user.id)
            setEmail(user.email || "")

            const providers = user.app_metadata?.providers || []
            setHasPassword(providers.includes('email'))

            const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
            if (profile) {
                setRole(profile.role)
                setFullName(profile.full_name || "")
            }
            setLoading(false)
        }

        fetchUserData()
    }, [])

    // Tự động ẩn thông báo sau 3 giây
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000)
            return () => clearTimeout(timer)
        }
    }, [message])

    // Logic cập nhật Họ tên
    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setUpdating(true)
        setMessage(null)

        const { error } = await supabase
            .from("profiles")
            .update({ full_name: fullName })
            .eq("id", userId)

        setUpdating(false)
        if (error) {
            setMessage({ type: "error", text: "Cập nhật thất bại: " + error.message })
        } else {
            setMessage({ type: "success", text: "Đã cập nhật thông tin cá nhân thành công!" })
        }
    }

    // Logic đổi mật khẩu
    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || newPassword.length < 6) {
            setMessage({ type: "error", text: "Mật khẩu mới phải có tối thiểu 6 ký tự!" })
            return
        }

        setUpdating(true)
        setMessage(null)

        const { error } = await supabase.auth.updateUser({
            password: newPassword
        })

        setUpdating(false)
        if (error) {
            setMessage({ type: "error", text: "Đổi mật khẩu thất bại: " + error.message })
        } else {
            setMessage({ type: "success", text: "Đã cập nhật mật khẩu mới thành công!" })
            setCurrentPassword("")
            setNewPassword("")
        }
    }

    return {
        role,
        loading,
        updating,
        message,
        fullName,
        setFullName,
        email,
        currentPassword,
        setCurrentPassword,
        newPassword,
        setNewPassword,
        handleUpdateProfile,
        handleUpdatePassword,
        hasPassword
    }
}