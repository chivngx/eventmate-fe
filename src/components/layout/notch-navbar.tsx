"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, Calendar, Building2, FileText, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const NavLink = ({ href, icon: Icon, label, onClick }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string; onClick?: (e: React.MouseEvent) => void }) => {
  const pathname = usePathname()
  const isActive = href === "/" ? pathname === "/" : (pathname?.startsWith(href) ?? false)

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors",
        isActive
          ? "text-slate-900 bg-slate-100"
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive ? "text-slate-700" : "text-slate-400")} />
      <span>{label}</span>
    </Link>
  )
}

const protectedClick = (e: React.MouseEvent, role?: string) => {
  if (role === "guest") {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent("open-auth-modal", { detail: { mode: "login" } }))
  }
}

export function NotchNavbar({ className, logo, rightActions, role }: { className?: string, logo?: React.ReactNode, rightActions?: React.ReactNode, role?: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <header className={cn("sticky top-0 z-50 bg-white border-b border-slate-200", className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Left: logo + nav */}
            <div className="flex items-center gap-1 min-w-0">
              {logo}
              <nav className="hidden md:flex items-center gap-1 ml-4">
                {role === "organizer" ? (
                  <NavLink href="/" icon={Calendar} label="Quản lý sự kiện" />
                ) : (
                  <>
                    <NavLink href="/" icon={Calendar} label="Sự kiện" />
                    <NavLink href="/companies" icon={Building2} label="Ban tổ chức" />
                    <NavLink
                      href="/cv"
                      icon={FileText}
                      label="Hồ sơ"
                      onClick={(e) => protectedClick(e, role)}
                    />
                  </>
                )}
              </nav>
            </div>

            {/* Right: actions + mobile toggle */}
            <div className="flex items-center gap-2">
              {rightActions}
              <button
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-slate-200"
          >
            <nav className="px-4 py-3 flex flex-col gap-1">
              <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>
                <Calendar className="w-5 h-5 text-slate-400" /> Sự kiện
              </Link>
              <Link href="/companies" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>
                <Building2 className="w-5 h-5 text-slate-400" /> Ban tổ chức
              </Link>
              <Link
                href="/cv"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                onClick={(e) => { setIsMobileMenuOpen(false); protectedClick(e, role) }}
              >
                <FileText className="w-5 h-5 text-slate-400" /> Hồ sơ
              </Link>
              <Link
                href="/chat"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 font-medium text-slate-700"
                onClick={(e) => { setIsMobileMenuOpen(false); protectedClick(e, role) }}
              >
                <MessageSquare className="w-5 h-5 text-slate-400" /> Trò chuyện
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
