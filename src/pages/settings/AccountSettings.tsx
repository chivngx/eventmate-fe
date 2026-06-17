import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { cn } from "@/lib/utils" // Sử dụng hàm cn chuẩn từ utils dự án
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MainLayout from "@/components/layout/MainLayout"
import { useAccountSettings } from "@/pages/settings/useAccountSettings" // Import Hook vừa tạo

export default function AccountSettings() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Hút toàn bộ dữ liệu và hàm từ Hook logic ra
    const {
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
    } = useAccountSettings()

    if (loading) return null
    if (!role) return <Navigate to="/login" replace />

    return (
        <MainLayout role={role}>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

                {/* Tiêu đề trang */}
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Quản lý bảo mật và thông tin định danh cá nhân.</p>
                </div>

                {/* Thanh Alert thông báo trạng thái */}
                {message && (
                    <div className={cn(
                        "p-4 rounded-xl text-sm font-bold border",
                        message.type === "success"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                            : "bg-rose-50 border-rose-100 text-rose-800"
                    )}>
                        {message.text}
                    </div>
                )}

                {/* Cấu trúc Layout gồm cụm Tab dọc (desktop) và ngang (mobile) */}
                <Tabs defaultValue="account" orientation={isMobile ? "horizontal" : "vertical"} className="flex flex-col md:flex-row gap-6">

                    {/* Cột Điều hướng danh mục */}
                    <TabsList className="flex flex-row md:flex-col w-full md:w-52 shrink-0 h-auto bg-slate-100 md:bg-transparent p-1 md:p-0 rounded-xl md:rounded-none space-x-1 md:space-x-0 md:space-y-1">
                        <TabsTrigger
                            value="account"
                            className="flex-1 md:flex-initial w-auto md:w-full justify-center md:justify-start px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-2xl font-bold text-slate-500 data-[state=active]:bg-white md:data-[state=active]:bg-emerald-50 data-[state=active]:text-slate-900 md:data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm md:data-[state=active]:shadow-none transition-all"
                        >
                            Thông tin cá nhân
                        </TabsTrigger>
                        <TabsTrigger
                            value="password"
                            className="flex-1 md:flex-initial w-auto md:w-full justify-center md:justify-start px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-2xl font-bold text-slate-500 data-[state=active]:bg-white md:data-[state=active]:bg-emerald-50 data-[state=active]:text-slate-900 md:data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm md:data-[state=active]:shadow-none transition-all"
                        >
                            Mật khẩu & Bảo mật
                        </TabsTrigger>
                    </TabsList>

                    {/* Cột Nội dung hiển thị các Form */}
                    <div className="flex-1 w-full">

                        {/* TAB THÔNG TIN CÁ NHÂN */}
                        <TabsContent value="account" className="mt-0 outline-none">
                            <form onSubmit={handleUpdateProfile}>
                                <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white">
                                    <CardHeader className="pb-4">
                                        <CardTitle className="text-lg font-bold text-slate-900">Hồ sơ cá nhân</CardTitle>
                                        <CardDescription className="text-xs font-medium text-slate-500">
                                            Thông tin này dùng để hiển thị trên CV ứng tuyển của bạn.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-xs font-bold text-slate-700">Họ và tên</Label>
                                            <Input
                                                id="name"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                placeholder="Nhập họ và tên đầy đủ..."
                                                className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-emerald-500 font-medium text-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-xs font-bold text-slate-700">Địa chỉ Email (Không được sửa)</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                disabled
                                                value={email}
                                                className="h-11 rounded-xl bg-slate-50 border-slate-100 text-slate-400 font-medium text-sm cursor-not-allowed"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 pb-5">
                                        <Button
                                            type="submit"
                                            disabled={updating}
                                            className="rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 h-10 px-5 text-sm transition-colors"
                                        >
                                            {updating ? "Đang lưu..." : "Lưu thay đổi"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>

                        {/* TAB ĐỔI / TẠO MẬT KHẨU */}
                        <TabsContent value="password" className="mt-0 outline-none">
                            <form onSubmit={handleUpdatePassword}>
                                <Card className="border border-slate-200/60 shadow-sm rounded-2xl bg-white">
                                    <CardHeader className="pb-4">
                                        {/* Đổi tiêu đề linh hoạt */}
                                        <CardTitle className="text-lg font-bold text-slate-900">
                                            {hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu đăng nhập"}
                                        </CardTitle>
                                        <CardDescription className="text-xs font-medium text-slate-500">
                                            {hasPassword
                                                ? "Nên đặt mật khẩu mạnh gồm cả chữ và số để đảm bảo an toàn."
                                                : "Tài khoản của bạn đang liên kết với Google. Bạn có thể tạo thêm mật khẩu để đăng nhập trực tiếp bằng Email."}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">

                                        {/* CHỈ HIỂN THỊ Ô NÀY NẾU ĐÃ CÓ PASSWORD */}
                                        {hasPassword && (
                                            <div className="space-y-2">
                                                <Label htmlFor="current" className="text-xs font-bold text-slate-700">Mật khẩu hiện tại</Label>
                                                <Input
                                                    id="current"
                                                    type="password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-emerald-500 text-sm"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label htmlFor="new" className="text-xs font-bold text-slate-700">
                                                {hasPassword ? "Mật khẩu mới" : "Nhập mật khẩu mới"}
                                            </Label>
                                            <Input
                                                id="new"
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="h-11 rounded-xl bg-white border-slate-200 focus-visible:ring-emerald-500 text-sm"
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 pb-5">
                                        <Button
                                            type="submit"
                                            disabled={updating}
                                            className="rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 h-10 px-5 text-sm transition-colors"
                                        >
                                            {updating ? "Đang xử lý..." : (hasPassword ? "Cập nhật mật khẩu" : "Lưu mật khẩu mới")}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </form>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </MainLayout>
    )
}