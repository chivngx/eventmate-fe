"use client"

import React, { useState } from "react"
import MainLayout from "@/components/layout/MainLayout"
import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/providers/ToastProvider"

export default function ContactPage() {
  const { showToast } = useToast()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
      showToast({
        title: "Đã gửi thông tin",
        message: "Cảm ơn bạn! Đội ngũ EventMate sẽ liên hệ lại trong vòng 24 giờ.",
        type: "success",
      })
    }, 1000)
  }

  return (
    <MainLayout>
      <div className="bg-white min-h-screen py-10 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
              Liên Hệ & Hợp Tác
            </h1>
            <p className="text-sm sm:text-base text-[#515151]">
              Bạn có câu hỏi, đề xuất hợp tác tổ chức sự kiện hoặc cần hỗ trợ? Hãy kết nối ngay với chúng tôi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Contact info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
                <h2 className="text-lg font-semibold text-[#222222]">Thông Tin Liên Hệ</h2>

                <div className="space-y-4 text-sm text-[#515151]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#005DDC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#222222]">Địa chỉ văn phòng:</p>
                      <p>Số 120 đường 2 Tháng 9, Quận Hải Châu, TP. Đà Nẵng</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-[#005DDC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#222222]">Hotline hỗ trợ:</p>
                      <p>(+84) 0987 654 321</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#005DDC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#222222]">Email hợp tác:</p>
                      <p>contact@eventmate.vn</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-xs text-[#757575]">
                  Thời gian làm việc: Thứ 2 – Thứ 7 (8:00 – 18:00)
                </div>
              </div>
            </div>

            {/* Right Column: Contact form */}
            <div className="lg:col-span-7">
              {submitted ? (
                <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-4">
                  <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-emerald-900">Tin Nhắn Đã Được Gửi!</h3>
                  <p className="text-sm text-emerald-700">
                    Cảm ơn bạn đã liên hệ với EventMate. Đội ngũ chăm sóc khách hàng của chúng tôi sẽ phản hồi sớm nhất có thể.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setFormData({ fullName: "", email: "", phone: "", subject: "", message: "" })
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Gửi tin nhắn khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-5 bg-white shadow-xs">
                  <h2 className="text-lg font-semibold text-[#222222]">Gửi Lời Nhắn Trực Tiếp</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#222222]">Họ và tên *</label>
                      <input
                        type="text"
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Nguyễn Văn A"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#222222]">Số điện thoại *</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="0912 345 678"
                        className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#222222]">Email liên hệ *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="ban@example.com"
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#222222]">Chủ đề liên hệ</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Hợp tác sự kiện, đăng ký gói doanh nghiệp..."
                      className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#222222]">Nội dung tin nhắn *</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Nhập chi tiết yêu cầu của bạn tại đây..."
                      className="w-full p-3.5 rounded-lg border border-slate-300 text-sm focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-lg bg-[#005DDC] hover:bg-[#004EB7] text-white font-medium text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-4 h-4" />
                    <span>{loading ? "Đang gửi..." : "Gửi Lời Nhắn"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
