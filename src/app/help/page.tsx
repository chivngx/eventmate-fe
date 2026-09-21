"use client"

import React, { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { HelpCircle, ChevronDown, Search, MessageSquare, BookOpen, CreditCard } from "lucide-react"
import Link from "next/link"

const FAQS = [
  {
    q: "Làm thế nào để sinh viên ứng tuyển vào một sự kiện?",
    a: "Bạn chỉ cần đăng nhập tài khoản Sinh viên, cập nhật đầy đủ thông tin hồ sơ (Họ tên, SĐT, Trường học, Kinh nghiệm) tại trang Hồ sơ, sau đó duyệt danh sách sự kiện và bấm nút 'Ứng tuyển ngay'. Bạn có thể để lại lời nhắn cho Ban tổ chức."
  },
  {
    q: "Hệ thống tính điểm tín nhiệm (Reliability Score) như thế nào?",
    a: "Điểm tín nhiệm khởi điểm là 100%. Khi bạn hoàn thành tốt ca làm sự kiện và được Ban tổ chức xác nhận check-in hoặc đánh giá cao, điểm số sẽ được giữ vững hoặc tăng. Ngược lại, nếu hủy ca sát giờ hoặc vắng mặt không lý do (No-show), điểm tín nhiệm sẽ bị trừ."
  },
  {
    q: "Làm sao để Ban tổ chức đăng ký gói dịch vụ VIP?",
    a: "Ban tổ chức truy cập mục 'Bảng giá' (/pricing), lựa chọn gói Standard hoặc Starter theo tháng hoặc năm, sau đó chuyển sang trang thanh toán. Hệ thống hỗ trợ quét mã VietQR ngân hàng tự động kích hoạt gói VIP tức thì."
  },
  {
    q: "Tôi có thể liên hệ với ứng viên trước khi duyệt đơn không?",
    a: "Có! Tính năng Chat trên EventMate cho phép Ban tổ chức và ứng viên trò chuyện trực tiếp, trao đổi yêu cầu công việc hoặc lên lịch phỏng vấn trước khi đưa ra quyết định duyệt đơn."
  },
]

export default function HelpCenterPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="bg-white min-h-screen py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
              Trung Tâm Trợ Giúp EventMate
            </h1>
            <p className="text-sm sm:text-base text-[#515151]">
              Tìm kiếm câu trả lời nhanh chóng cho các thắc mắc về ứng tuyển, đăng tin và quản lý sự kiện.
            </p>

            {/* Search FAQ */}
            <div className="relative max-w-lg mx-auto pt-2">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm câu hỏi (vd: thanh toán, ứng tuyển...)"
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-300 text-sm focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] outline-none shadow-xs"
              />
            </div>
          </div>

          {/* Quick Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#005DDC]" />
              <span className="text-sm font-semibold text-[#222222]">Cẩm nang ứng viên</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-[#222222]">Gói dịch vụ & VIP</span>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold text-[#222222]">Tương tác & Lịch hẹn</span>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#222222] mb-4">Câu Hỏi Thường Gặp</h2>
            {filteredFaqs.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">Không tìm thấy câu hỏi phù hợp với từ khóa.</p>
            ) : (
              filteredFaqs.map((faq, idx) => {
                const isOpen = openIdx === idx
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-xl overflow-hidden transition-colors bg-white"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIdx(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#222222] hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-[#005DDC] shrink-0" />
                        {faq.q}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-sm text-[#515151] leading-relaxed border-t border-slate-100 bg-slate-50/40">
                        {faq.a}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* Still need help? */}
          <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-3">
            <h3 className="font-bold text-[#222222]">Vẫn cần hỗ trợ trực tiếp?</h3>
            <p className="text-xs sm:text-sm text-[#757575]">
              Đội ngũ EventMate luôn sẵn sàng đồng hành cùng bạn trên mọi hành trình sự kiện.
            </p>
            <Link
              href="/contact"
              className="inline-block px-5 py-2 rounded-lg bg-[#005DDC] hover:bg-[#004EB7] text-white text-xs font-semibold"
            >
              Liên hệ chúng tôi
            </Link>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
