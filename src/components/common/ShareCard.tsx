"use client"

import { useState } from "react"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/components/providers/ToastProvider"

export interface ShareCardProps {
  title?: string
  url?: string
  shareText?: string
  className?: string
}

export default function ShareCard({
  title = "Chia sẻ",
  url,
  shareText = "EventMate - Nền tảng kết nối sự kiện & việc làm sinh viên",
  className = "",
}: ShareCardProps) {
  const { showToast } = useToast()
  const [copied, setCopied] = useState(false)

  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "")

  const handleCopy = () => {
    if (!currentUrl) return
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true)
      showToast({
        type: "success",
        title: "Đã sao chép liên kết",
        message: "Đường dẫn đã được sao chép vào bộ nhớ tạm.",
      })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleSocialShare = (platform: "facebook" | "x" | "linkedin") => {
    if (!currentUrl) return
    const encodedUrl = encodeURIComponent(currentUrl)
    const encodedText = encodeURIComponent(shareText)
    let shareLink = ""

    switch (platform) {
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
        break
      case "x":
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`
        break
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
        break
    }

    if (typeof window !== "undefined") {
      window.open(shareLink, "_blank", "noopener,noreferrer,width=600,height=500")
    }
  }

  return (
    <section className={`bg-white border border-[#EDEDED] rounded-[16px] p-6 space-y-4 shadow-xs ${className}`}>
      <h3 className="font-['Inter'] font-bold text-[16px] text-[#222222]">
        {title}
      </h3>

      {/* Copy link input */}
      <div>
        <p className="text-xs text-slate-500 mb-1.5">Sao chép đường dẫn</p>
        <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-2 bg-slate-50">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="bg-transparent text-xs text-slate-500 font-medium select-all outline-none w-full truncate"
          />
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Sao chép liên kết"
            className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded transition-all shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Social buttons */}
      <div>
        <p className="text-xs text-slate-500 mb-2">Chia sẻ qua mạng xã hội</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSocialShare("facebook")}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Facebook"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleSocialShare("x")}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="X"
          >
            <span className="font-bold text-sm">𝕏</span>
          </button>
          <button
            type="button"
            onClick={() => handleSocialShare("linkedin")}
            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="LinkedIn"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
              <rect x="2" y="9" width="4" height="12" />
              <circle cx="4" cy="4" r="2" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
