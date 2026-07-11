"use client"

import { Avatar, AvatarFallback, AvatarImage } from"@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from"@/components/ui/dropdown-menu"
import { LogOut, Briefcase, ChevronDown, ChevronUp, Mail, Shield, Crown, FileText, Building2 } from"lucide-react"

interface UserProfileDropdownProps {
 avatarUrl: string
 fullName: string
 role?: string
 user: any
 email: string
 expandedSections: Record<string, boolean>
 toggleSection: (section: string) => void
 navigate: (path: string) => void
 handleLogout: () => Promise<void>
}

export default function UserProfileDropdown({
 avatarUrl,
 fullName,
 role,
 user,
 email,
 expandedSections,
 toggleSection,
 navigate,
 handleLogout
}: UserProfileDropdownProps) {
 const getInitial = (name: string) => name ? name.charAt(0).toUpperCase() :"U"

 return (
 <DropdownMenu>
 <DropdownMenuTrigger className="rounded-full outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 shrink-0">
 <Avatar className="h-9 w-9 sm:h-10 sm:w-10 cursor-pointer border-2 border-white shadow-sm transition-transform hover:scale-105">
 <AvatarImage src={avatarUrl} />
 <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-sm">
 {getInitial(fullName)}
 </AvatarFallback>
 </Avatar>
 </DropdownMenuTrigger>
 <DropdownMenuContent align="end" className="w-[320px] max-h-[85vh] overflow-y-auto mt-2 rounded-2xl p-4 shadow-md border border-slate-100 bg-white space-y-4 text-slate-900">
 {/* Header */}
 <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
 <Avatar className="h-12 w-12 rounded-full border border-slate-100 shrink-0">
 <AvatarImage src={avatarUrl} />
 <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-lg">
 {getInitial(fullName)}
 </AvatarFallback>
 </Avatar>
 <div className="min-w-0 flex-1">
 <p className="text-sm font-bold text-slate-800 truncate" title={fullName}>{fullName}</p>
 <p className="text-xs text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
 {role === 'organizer' ?"Nhà tuyển nhân sự" :"Sinh viên"}
 </p>
 <p className="text-xs text-slate-400 mt-1 truncate">
 {user?.id ? `ID ${user.id.substring(0, 7).toUpperCase()}` :"ID 123456"} <span className="text-slate-400">|</span> {email}
 </p>
 </div>
 </div>

 {/* Accordion Menu */}
 {role === 'organizer' ? (
 <div className="space-y-3.5">
 {/* 1. Quản lý tuyển nhân sự */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("jobSearch")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Briefcase className="w-4 h-4 text-slate-500" />
 <span>Quản lý tuyển nhân sự</span>
 </div>
 {expandedSections.jobSearch ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.jobSearch && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/dashboard')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Danh sách sự kiện
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Quản lý hồ sơ người tham gia
 </button>
 </div>
 )}
 </div>

 {/* 2. Hồ sơ doanh nghiệp */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("cvManage")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Building2 className="w-4 h-4 text-slate-500" />
 <span>Hồ sơ doanh nghiệp</span>
 </div>
 {expandedSections.cvManage ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.cvManage && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Thông tin doanh nghiệp
 </button>
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Cài đặt tài khoản
 </button>
 </div>
 )}
 </div>

 {/* 3. Cài đặt & Bảo mật */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("personalSecurity")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Shield className="w-4 h-4 text-slate-500" />
 <span>Cài đặt & Bảo mật</span>
 </div>
 {expandedSections.personalSecurity ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.personalSecurity && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Cài đặt cá nhân
 </button>
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Đổi mật khẩu
 </button>
 </div>
 )}
 </div>

 {/* 4. Dịch vụ & Nâng cấp */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("upgrade")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Crown className="w-4 h-4 text-slate-500" />
 <span>Dịch vụ & Nâng cấp</span>
 </div>
 {expandedSections.upgrade ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.upgrade && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => alert("Chức năng mua gói VIP Tuyển nhân sự đang được phát triển!")}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Đăng ký gói VIP tuyển nhân sự
 </button>
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="space-y-3.5">
 {/* 1. Quản lý tìm sự kiện */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("jobSearch")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Briefcase className="w-4 h-4 text-slate-500" />
 <span>Quản lý tìm sự kiện</span>
 </div>
 {expandedSections.jobSearch ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.jobSearch && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/saved')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Sự kiện đã lưu
 </button>
 {role === 'student' && (
 <button
 type="button"
 onClick={() => navigate('/my-jobs')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Sự kiện đã đăng ký
 </button>
 )}
 </div>
 )}
 </div>

 {/* 2. Quản lý hồ sơ */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("cvManage")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <FileText className="w-4 h-4 text-slate-500" />
 <span>Quản lý hồ sơ</span>
 </div>
 {expandedSections.cvManage ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.cvManage && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Thông tin hồ sơ của tôi
 </button>
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Mẫu hồ sơ cá nhân
 </button>
 </div>
 )}
 </div>

 {/* 3. Cài đặt email & thông báo */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("emailConfig")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Mail className="w-4 h-4 text-slate-500" />
 <span>Cài đặt email & thông báo</span>
 </div>
 {expandedSections.emailConfig ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.emailConfig && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Cài đặt thông báo sự kiện
 </button>
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Cài đặt nhận email
 </button>
 </div>
 )}
 </div>

 {/* 4. Cá nhân & Bảo mật */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("personalSecurity")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Shield className="w-4 h-4 text-slate-500" />
 <span>Cá nhân & Bảo mật</span>
 </div>
 {expandedSections.personalSecurity ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.personalSecurity && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Cài đặt thông tin cá nhân
 </button>
 <button
 type="button"
 onClick={() => navigate('/settings')}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Đổi mật khẩu tài khoản
 </button>
 </div>
 )}
 </div>

 {/* 5. Nâng cấp tài khoản */}
 <div className="space-y-1">
 <button
 type="button"
 onClick={() => toggleSection("upgrade")}
 className="w-full flex items-center justify-between py-1 text-slate-700 hover:text-slate-900 transition-colors"
 >
 <div className="flex items-center gap-2.5 font-bold text-xs">
 <Crown className="w-4 h-4 text-slate-500" />
 <span>Nâng cấp tài khoản</span>
 </div>
 {expandedSections.upgrade ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
 </button>
 {expandedSections.upgrade && (
 <div className="pl-6.5 flex flex-col gap-2 pt-1 pb-2">
 <button
 type="button"
 onClick={() => alert("Chức năng nâng cấp tài khoản VIP đang phát triển!")}
 className="text-left text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
 >
 Nâng cấp tài khoản VIP
 </button>
 </div>
 )}
 </div>
 </div>
 )}

 {/* Bottom Logout Button */}
 <div className="border-t border-slate-100 pt-3">
 <button
 type="button"
 onClick={handleLogout}
 className="w-full py-2.5 rounded-lg bg-slate-50 hover:bg-destructive/10 text-slate-700 hover:text-destructive font-bold text-xs flex items-center justify-center gap-2 border border-slate-100 hover:border-destructive/20 transition-all active:scale-[0.98]"
 >
 <LogOut className="w-4 h-4" />
 Đăng xuất
 </button>
 </div>
 </DropdownMenuContent>
 </DropdownMenu>
 )
}
