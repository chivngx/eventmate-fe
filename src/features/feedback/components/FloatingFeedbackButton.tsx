"use client"

import React, { useState, useEffect } from "react"
import FeedbackModal from "./FeedbackModal"
import { MessageSquarePlus } from "lucide-react"

export default function FloatingFeedbackButton() {
  const [isOpen, setIsOpen] = useState(false)

  // Listen for global custom event 'open-feedback-modal'
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-feedback-modal", handleOpen)
    return () => window.removeEventListener("open-feedback-modal", handleOpen)
  }, [])

  return (
    <>
      {/* Floating button on the bottom-left */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:block">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 bg-white/95 hover:bg-white text-slate-700 hover:text-primary px-3.5 py-2 rounded-full border border-slate-200/90 shadow-md hover:shadow-lg transition-all duration-200 backdrop-blur-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95"
          title="Đóng góp ý kiến & Báo lỗi"
          aria-label="Đóng góp ý kiến & Báo lỗi"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <MessageSquarePlus className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold tracking-tight">Góp ý</span>
        </button>
      </div>

      {/* Modal */}
      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
