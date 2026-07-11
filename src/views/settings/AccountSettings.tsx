"use client"

import { Navigate } from "@/lib/router"
import { cn } from "@/lib/utils"
import MainLayout from "@/components/layout/MainLayout"
import { SkeletonGenericPage } from "@/components/ui/Skeleton"
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
import { useAccountSettings } from "@/hooks/useAccountSettings"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Upload } from "lucide-react"

export default function AccountSettings() {
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
      <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground">
            Cài đặt tài khoản
          </h1>
          <p className="text-sm text-muted-foreground">
            Quản lý bảo mật và thông tin định danh cá nhân.
          </p>
        </div>

        {/* Status alert */}
        {message && (
          <div
            role="alert"
            className={cn(
              "p-3 sm:p-4 rounded-lg text-sm font-medium border",
              message.type === "success"
                ? "bg-slate-100 border-slate-200 text-slate-600"
                : "bg-destructive/10 border-destructive/20 text-destructive"
            )}
          >
            {message.text}
          </div>
        )}

        {/* Tabs: clean pill strip (responsive) */}
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto sm:inline-flex bg-muted p-1 rounded-lg h-auto gap-1">
            <TabsTrigger
              value="account"
              className="rounded-md py-2 font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-colors"
            >
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger
              value="password"
              className="rounded-md py-2 font-medium text-muted-foreground data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-colors"
            >
              Mật khẩu & Bảo mật
            </TabsTrigger>
          </TabsList>

          {/* Account info tab */}
          <TabsContent value="account" className="outline-none mt-0">
            <form onSubmit={handleUpdateProfile}>
              <Card className="border border-border shadow-sm rounded-xl bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">Hồ sơ cá nhân</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Thông tin này dùng để hiển thị trên CV đăng ký của bạn.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Avatar upload */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 bg-muted rounded-lg border border-border">
                    <Avatar className="h-16 w-16 border border-border shadow-sm shrink-0 rounded-full">
                      <AvatarImage src={avatarUrl} className="object-cover rounded-full" />
                      <AvatarFallback className="bg-slate-100 text-slate-600 font-semibold text-xl rounded-full">
                        {fullName ? fullName.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center sm:items-start gap-2 min-w-0">
                      <Label
                        htmlFor="avatar-file"
                        className="text-sm font-medium text-foreground cursor-pointer bg-card border border-border hover:bg-slate-100 px-3.5 py-2 rounded-lg inline-flex items-center gap-2 shadow-sm transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        {uploadingAvatar ? "Đang tải lên..." : "Tải ảnh đại diện mới"}
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
                      <span className="text-xs text-muted-foreground">
                        Định dạng JPG, PNG. Tối đa 2MB.
                      </span>
                    </div>
                  </div>

                  {/* Full name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">
                      Họ và tên
                    </Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nhập họ và tên đầy đủ..."
                      className="h-11 rounded-lg bg-card border-border focus-visible:ring-ring text-sm text-foreground"
                    />
                  </div>

                  {/* Email (readonly) */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Địa chỉ Email (không thể sửa)
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      disabled
                      value={email}
                      className="h-11 rounded-lg bg-muted border-border text-muted-foreground text-sm cursor-not-allowed"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-5">
                  <Button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-primary text-slate-600-foreground font-medium hover:bg-primary/90 h-10 px-5 text-sm transition-colors shadow-sm"
                  >
                    {updating ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>

          {/* Password tab */}
          <TabsContent value="password" className="outline-none mt-0">
            <form onSubmit={handleUpdatePassword}>
              <Card className="border border-border shadow-sm rounded-xl bg-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {hasPassword ? "Đổi mật khẩu" : "Tạo mật khẩu đăng nhập"}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    {hasPassword
                      ? "Nên đặt mật khẩu mạnh gồm cả chữ và số để đảm bảo an toàn."
                      : "Tài khoản của bạn đang liên kết với Google. Bạn có thể tạo thêm mật khẩu để đăng nhập trực tiếp bằng Email."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {hasPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="current" className="text-sm font-medium text-foreground">
                        Mật khẩu hiện tại
                      </Label>
                      <Input
                        id="current"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="h-11 rounded-lg bg-card border-border focus-visible:ring-ring text-sm text-foreground"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="new" className="text-sm font-medium text-foreground">
                      {hasPassword ? "Mật khẩu mới" : "Nhập mật khẩu mới"}
                    </Label>
                    <Input
                      id="new"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-11 rounded-lg bg-card border-border focus-visible:ring-ring text-sm text-foreground"
                    />
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-5">
                  <Button
                    type="submit"
                    disabled={updating}
                    className="rounded-lg bg-foreground text-background font-medium hover:bg-foreground/90 h-10 px-5 text-sm transition-colors"
                  >
                    {updating ? "Đang xử lý..." : (hasPassword ? "Cập nhật mật khẩu" : "Lưu mật khẩu mới")}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
