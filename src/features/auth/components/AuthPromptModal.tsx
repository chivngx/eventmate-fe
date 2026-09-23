"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"
import { EventMateLogo } from "@/components/common/EventMateLogo"

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  customMessage?: string
  redirectPath?: string
  role?: string
}

export default function AuthPromptModal({
  isOpen,
  onClose,
  customMessage,
  redirectPath,
  role,
}: AuthPromptModalProps) {
  const router = useRouter()

  const isEmployer =
    role === "organizer" ||
    role === "employer" ||
    redirectPath?.startsWith("/for-employers") ||
    redirectPath?.startsWith("/organizer")

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden"
      window.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.body.style.overflow = "unset"
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleLogin = () => {
    onClose()
    const base = isEmployer ? "/login?role=organizer" : "/login"
    const target = redirectPath
      ? `${base}${base.includes("?") ? "&" : "?"}redirect=${encodeURIComponent(redirectPath)}`
      : base
    router.push(target)
  }

  const handleSignUp = () => {
    onClose()
    const base = isEmployer ? "/register?role=organizer" : "/register"
    const target = redirectPath
      ? `${base}${base.includes("?") ? "&" : "?"}redirect=${encodeURIComponent(redirectPath)}`
      : base
    router.push(target)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Yêu cầu đăng nhập hoặc đăng ký"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* 401x284px Modal Box (Figma node 5982:50636) */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-[401px] rounded-[16px] px-[38px] py-[32px] shadow-2xl flex flex-col gap-[32px] items-center animate-in zoom-in-95 duration-200"
      >
        {/* Close button (Figma node 5982:50637) */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng hộp thoại"
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-[#515151] hover:text-[#222222] hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Center Content: Logo + Prompt text (Figma node 5982:50639) */}
        <div className="flex flex-col gap-6 items-center justify-center w-full">
          {/* Brand Logo */}
          <div className="flex items-center justify-center py-2 select-none">
            <EventMateLogo iconSize={48} idPrefix="modal" />
          </div>

          {/* Message Prompt (Figma node 5982:50642) */}
          <p className="text-[#353535] text-[16px] font-normal leading-[1.6] text-center max-w-[325px]">
            {customMessage || "Vui lòng đăng nhập vào tài khoản của bạn hoặc đăng ký nếu bạn chưa có tài khoản"}
          </p>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center gap-3 w-full">
          {/* Login Button */}
          <button
            type="button"
            onClick={handleLogin}
            className="flex-1 h-11 border border-zinc-200 hover:border-zinc-300 text-zinc-900 hover:bg-zinc-50 active:scale-[0.98] rounded-xl font-medium text-[15px] flex items-center justify-center transition-all cursor-pointer whitespace-nowrap"
          >
            Đăng nhập
          </button>

          {/* Sign Up Button */}
          <button
            type="button"
            onClick={handleSignUp}
            className="flex-1 h-11 bg-zinc-900 hover:bg-zinc-800 text-white active:scale-[0.98] rounded-xl font-medium text-[15px] flex items-center justify-center transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            Đăng ký
          </button>
        </div>
      </div>
    </div>
  )
}
