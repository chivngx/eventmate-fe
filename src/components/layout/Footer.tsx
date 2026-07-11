"use client"

import Link from"next/link"
import { Mail, Phone, MapPin } from"lucide-react"

export default function Footer() {
 return (
 <footer className="border-t border-slate-200 bg-white">
 <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
 <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
 {/* Brand */}
 <div className="lg:col-span-2 space-y-4">
 <Link href="/" className="inline-block text-2xl font-extrabold tracking-tight text-slate-900">
 Event<span className="text-primary">Mate</span>
 </Link>
 <p className="text-sm leading-relaxed text-slate-500 max-w-md">
 Nền tảng kết nối sinh viên với cơ hội sự kiện và ban tổ chức tại Đà Nẵng.
 Tìm sự kiện linh hoạt, quản lý nhân sự hiệu quả.
 </p>
 <div className="flex items-center gap-2 pt-2">
 <a
 href="https://facebook.com"
 target="_blank"
 rel="noreferrer"
 aria-label="Facebook"
 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-accent hover:text-primary text-slate-500 flex items-center justify-center transition-colors"
 >
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6c0-.55.45-1 1-1h1.72V1H12C9.79 1 8 2.79 8 5v3H9z" /></svg>
 </a>
 <a
 href="https://linkedin.com"
 target="_blank"
 rel="noreferrer"
 aria-label="LinkedIn"
 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-accent hover:text-primary text-slate-500 flex items-center justify-center transition-colors"
 >
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
 </a>
 <a
 href="https://youtube.com"
 target="_blank"
 rel="noreferrer"
 aria-label="YouTube"
 className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-accent hover:text-primary text-slate-500 flex items-center justify-center transition-colors"
 >
 <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.099C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.564c-1.025.273-1.827 1.077-2.099 2.099C0 8.013 0 12 0 12s0 3.987.502 5.837c.272 1.022 1.074 1.826 2.099 2.099C4.45 20.5 12 20.5 12 20.5s7.55 0 9.4-.564c1.025-.273 1.827-1.077 2.099-2.099C24 15.987 24 12 24 12s0-3.987-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
 </a>
 </div>
 </div>

 {/* For students */}
 <div>
 <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
 Dành cho sinh viên
 </h3>
 <ul className="space-y-2.5 text-sm">
 <li><Link href="/" className="text-slate-500 hover:text-primary transition-colors">Tìm sự kiện</Link></li>
 <li><Link href="/my-jobs" className="text-slate-500 hover:text-primary transition-colors">Việc đã đăng ký</Link></li>
 <li><Link href="/saved" className="text-slate-500 hover:text-primary transition-colors">Việc đã lưu</Link></li>
 <li><Link href="/cv" className="text-slate-500 hover:text-primary transition-colors">Hồ sơ năng lực</Link></li>
 </ul>
 </div>

 {/* Contact */}
 <div>
 <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
 Liên hệ
 </h3>
 <ul className="space-y-3 text-sm text-slate-500">
 <li className="flex items-start gap-2.5">
 <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
 <span>Đường Ngũ Hành Sơn, TP. Đà Nẵng</span>
 </li>
 <li className="flex items-center gap-2.5">
 <Phone className="w-4 h-4 text-slate-400 shrink-0" />
 <span>+84 236 395 1234</span>
 </li>
 <li className="flex items-center gap-2.5">
 <Mail className="w-4 h-4 text-slate-400 shrink-0" />
 <a href="mailto:support@eventmate.vn" className="hover:text-primary transition-colors">support@eventmate.vn</a>
 </li>
 </ul>
 </div>
 </div>

 {/* Bottom bar */}
 <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
 <p>© {new Date().getFullYear()} EventMate. Tất cả các quyền được bảo lưu.</p>
 <div className="flex items-center gap-4">
 <Link href="/" className="hover:text-slate-600 transition-colors">Điều khoản</Link>
 <Link href="/" className="hover:text-slate-600 transition-colors">Bảo mật</Link>
 </div>
 </div>
 </div>
 </footer>
 )
}
