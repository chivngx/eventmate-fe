"use client"

import { useState, useEffect } from"react"
import { Navigate } from"@/lib/router"
import { cn } from"@/lib/utils"
import MainLayout from"@/components/layout/MainLayout"
import { SkeletonGenericPage } from"@/components/ui/Skeleton"
import { Button } from"@/components/ui/button"
import {
 Card,
 CardContent,
 CardDescription,
 CardFooter,
 CardHeader,
 CardTitle,
} from"@/components/ui/card"
import { Input } from"@/components/ui/input"
import { Label } from"@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from"@/components/ui/tabs"
import { useAccountSettings } from "@/hooks/useAccountSettings"
import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import { User, Upload } from"lucide-react"

export default function AccountSettings() {
 const [isMobile, setIsMobile] = useState(false)

 useEffect(() => {
 const checkMobile = () => setIsMobile(window.innerWidth < 768)
 checkMobile()
 window.addEventListener("resize", checkMobile)
 return () => window.removeEventListener("resize", checkMobile)
 }, [])

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
 hasPassword,
 avatarUrl,
 uploadingAvatar,
 handleUploadAvatar
 } = useAccountSettings()

 if (loading) return <SkeletonGenericPage />
 if (!role) return <Navigate to="/login" replace />

 return (
 <MainLayout role={role ?? undefined}>
 <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

 {/* Tiêu đề trang */}
 <div>
 <h1 className="text-2xl font-black text-foreground tracking-tight">Cài đặt tài khoản</h1>
 <p className="text-sm font-medium text-muted-foreground mt-1">Quản lý bảo mật và thông tin định danh cá nhân.</p>
 </div>

 {/* Thanh Alert thông báo trạng thái */}
 {message && (
 <div className={cn("p-4 rounded-xl text-sm font-bold border",
 message.type ==="success"
 ?"bg-accent border-primary/20 text-primary"
 :"bg-destructive/10 border-destructive/20 text-destructive"
 )}>
 {message.text}
 </div>
 )}

 {/* Cấu trúc Layout gồm cụm Tab dọc (desktop) và ngang (mobile) */}
 <Tabs defaultValue="account" orientation={isMobile ?"horizontal" :"vertical"} className="flex flex-col md:flex-row gap-6">

 {/* Cột Điều hướng danh mục */}
 <TabsList className="flex flex-row md:flex-col w-full md:w-52 shrink-0 h-auto bg-muted p-1 md:p-0 rounded-xl md:rounded-none space-x-1 md:space-x-0 md:space-y-1 md:bg-transparent">
 <TabsTrigger
 value="account"
 className="flex-1 md:flex-initial w-auto md:w-full justify-center md:justify-start px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold text-muted-foreground data-[state=active]:bg-card md:data-[state=active]:bg-accent data-[state=active]:text-foreground md:data-[state=active]:text-primary data-[state=active]:shadow-sm md:data-[state=active]:shadow-none transition-all"
 >
 Thông tin cá nhân
 </TabsTrigger>
 <TabsTrigger
 value="password"
 className="flex-1 md:flex-initial w-auto md:w-full justify-center md:justify-start px-3 md:px-4 py-2 md:py-3 rounded-lg font-bold text-muted-foreground data-[state=active]:bg-card md:data-[state=active]:bg-accent data-[state=active]:text-foreground md:data-[state=active]:text-primary data-[state=active]:shadow-sm md:data-[state=active]:shadow-none transition-all"
 >
 Mật khẩu & Bảo mật
 </TabsTrigger>
 </TabsList>

 {/* Cột Nội dung hiển thị các Form */}
 <div className="flex-1 w-full">

 {/* TAB THÔNG TIN CÁ NHÂN */}
 <TabsContent value="account" className="mt-0 outline-none">
 <form onSubmit={handleUpdateProfile}>
 <Card className="border border-border shadow-sm rounded-2xl bg-card">
 <CardHeader className="pb-4">
 <CardTitle className="text-lg font-bold text-foreground">Hồ sơ cá nhân</CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground">
 Thông tin này dùng để hiển thị trên CV ứng tuyển của bạn.
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 {/* TẢI ẢNH ĐẠI DIỆN TRỰC TIẾP */}
 <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted rounded-xl border border-border mb-2">
 <Avatar className="h-16 w-16 border border-border shadow-sm shrink-0 rounded-2xl">
 <AvatarImage src={avatarUrl} className="object-cover rounded-2xl" />
 <AvatarFallback className="bg-accent text-primary font-black text-xl rounded-2xl">
 {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col items-center sm:items-start gap-1">
 <Label htmlFor="avatar-file" className="text-xs font-black text-foreground cursor-pointer bg-card border border-border hover:bg-accent px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
 <Upload className="w-3.5 h-3.5" />
 {uploadingAvatar ?"Đang tải lên..." :"Tải ảnh đại diện mới"}
 </Label>
 <input
 type="file"
 id="avatar-file"
 accept="image/*"
 disabled={uploadingAvatar}
 onChange={async (e) => {
 const file = e.target.files?.[0]
 if (file) {
 await handleUploadAvatar(file)
 }
 }}
 className="hidden"
 />
 <span className="text-[10px] text-muted-foreground font-semibold">Định dạng JPG, PNG. Dung lượng tối đa 2MB.</span>
 </div>
 </div>

 <div className="space-y-2">
 <Label htmlFor="name" className="text-xs font-bold text-foreground">Họ và tên</Label>
 <Input
 id="name"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 placeholder="Nhập họ và tên đầy đủ..."
 className="h-11 rounded-xl bg-card border-border focus-visible:ring-ring font-medium text-sm text-foreground"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="email" className="text-xs font-bold text-foreground">Địa chỉ Email (Không được sửa)</Label>
 <Input
 id="email"
 type="email"
 disabled
 value={email}
 className="h-11 rounded-xl bg-muted border-border text-muted-foreground font-medium text-sm cursor-not-allowed"
 />
 </div>
 </CardContent>
 <CardFooter className="pt-2 pb-5">
 <Button
 type="submit"
 disabled={updating}
 className="rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 h-10 px-5 text-sm transition-colors shadow-sm"
 >
 {updating ?"Đang lưu..." :"Lưu thay đổi"}
 </Button>
 </CardFooter>
 </Card>
 </form>
 </TabsContent>

 {/* TAB ĐỔI / TẠO MẬT KHẨU */}
 <TabsContent value="password" className="mt-0 outline-none">
 <form onSubmit={handleUpdatePassword}>
 <Card className="border border-border shadow-sm rounded-2xl bg-card">
 <CardHeader className="pb-4">
 <CardTitle className="text-lg font-bold text-foreground">
 {hasPassword ?"Đổi mật khẩu" :"Tạo mật khẩu đăng nhập"}
 </CardTitle>
 <CardDescription className="text-xs font-medium text-muted-foreground">
 {hasPassword
 ?"Nên đặt mật khẩu mạnh gồm cả chữ và số để đảm bảo an toàn."
 :"Tài khoản của bạn đang liên kết với Google. Bạn có thể tạo thêm mật khẩu để đăng nhập trực tiếp bằng Email."}
 </CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">

 {/* CHỈ HIỂN THỊ Ô NÀY NẾU ĐÃ CÓ PASSWORD */}
 {hasPassword && (
 <div className="space-y-2">
 <Label htmlFor="current" className="text-xs font-bold text-foreground">Mật khẩu hiện tại</Label>
 <Input
 id="current"
 type="password"
 value={currentPassword}
 onChange={(e) => setCurrentPassword(e.target.value)}
 className="h-11 rounded-xl bg-card border-border focus-visible:ring-ring text-sm text-foreground"
 />
 </div>
 )}

 <div className="space-y-2">
 <Label htmlFor="new" className="text-xs font-bold text-foreground">
 {hasPassword ?"Mật khẩu mới" :"Nhập mật khẩu mới"}
 </Label>
 <Input
 id="new"
 type="password"
 value={newPassword}
 onChange={(e) => setNewPassword(e.target.value)}
 className="h-11 rounded-xl bg-card border-border focus-visible:ring-ring text-sm text-foreground"
 />
 </div>
 </CardContent>
 <CardFooter className="pt-2 pb-5">
 <Button
 type="submit"
 disabled={updating}
 className="rounded-xl bg-foreground text-background font-bold hover:bg-foreground/90 h-10 px-5 text-sm transition-colors"
 >
 {updating ?"Đang xử lý..." : (hasPassword ?"Cập nhật mật khẩu" :"Lưu mật khẩu mới")}
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