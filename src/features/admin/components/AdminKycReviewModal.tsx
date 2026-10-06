"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  User,
  Calendar,
  MapPin,
  ExternalLink,
  Loader2,
  IdCard,
  Camera,
} from "lucide-react"

export interface AdminKycReviewModalProps {
  isOpen: boolean
  student: any | null
  onClose: () => void
  onApprove: (studentId: string, updatedProfileData: any) => Promise<void>
  onReject: (studentId: string, reason: string) => Promise<void>
}

const QUICK_REJECTION_REASONS = [
  "Ảnh CCCD bị mờ hoặc chói lóa không nhận diện được",
  "Ảnh chân dung selfie không khớp với khuôn mặt trên CCCD",
  "Mã QR trên CCCD bị mất góc hoặc không đọc được dữ liệu",
  "Giấy tờ có dấu hiệu chỉnh sửa hoặc không phải bản gốc",
  "CCCD đã hết hạn sử dụng",
]

export default function AdminKycReviewModal({
  isOpen,
  student,
  onClose,
  onApprove,
  onReject,
}: AdminKycReviewModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [rejectReason, setRejectReason] = useState(QUICK_REJECTION_REASONS[0])
  const [customReason, setCustomReason] = useState("")

  if (!isOpen || !student) return null

  const kycData = student.kyc_data || {}
  const cccdUrl = kycData.cccd_front_url
  const selfieUrl = kycData.selfie_url

  const handleApprove = async () => {
    setSubmitting(true)
    try {
      await onApprove(student.id, {
        is_verified: true,
        kyc_status: "approved",
        full_name: kycData.full_name || student.full_name,
        gender: kycData.gender || student.gender,
        birth_year: kycData.dob ? parseInt(kycData.dob.slice(-4), 10) : student.birth_year,
      })
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  const handleReject = async () => {
    const finalReason = customReason.trim() || rejectReason
    if (!finalReason) return

    setSubmitting(true)
    try {
      await onReject(student.id, finalReason)
      onClose()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={submitting ? undefined : onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-200 dark:border-zinc-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-800/50 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-bold">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Đối soát hồ sơ eKYC
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      student.kyc_status === "approved" || student.is_verified
                        ? "bg-emerald-100 text-emerald-800"
                        : student.kyc_status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : student.kyc_status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {student.kyc_status === "approved" || student.is_verified
                      ? "Đã duyệt"
                      : student.kyc_status === "pending"
                      ? "Chờ duyệt"
                      : student.kyc_status === "rejected"
                      ? "Bị từ chối"
                      : "Chưa gửi"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Ứng viên: <strong className="text-zinc-900 dark:text-zinc-200">{student.full_name}</strong> ({student.email})
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="size-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="size-4.5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* Visual Comparison: CCCD vs Selfie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cột 1: CCCD Mặt trước */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 bg-slate-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-1.5">
                    <IdCard className="size-3.5 text-blue-600" />
                    1. Mặt trước CCCD
                  </span>
                  {cccdUrl && (
                    <a
                      href={cccdUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Xem ảnh gốc</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                  {cccdUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cccdUrl}
                      alt="Ảnh mặt trước CCCD"
                      className="size-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">Ứng viên chưa tải ảnh thẻ CCCD</p>
                  )}
                </div>

                {/* Bảng dữ liệu trích xuất từ QR */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Số CCCD:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                      {kycData.id_card_number_full || kycData.id_card_number_masked || "Chưa có"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Họ và tên:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase">
                      {kycData.full_name || student.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ngày sinh:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {kycData.dob || student.birth_year || "Chưa rõ"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Giới tính:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {kycData.gender || student.gender || "Chưa rõ"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-slate-500 shrink-0">Địa chỉ:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 text-right line-clamp-2">
                      {kycData.address || student.address || "Chưa có"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cột 2: Ảnh chân dung Selfie */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 p-4 space-y-3 bg-slate-50/50 dark:bg-zinc-800/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 uppercase flex items-center gap-1.5">
                    <Camera className="size-3.5 text-emerald-600" />
                    2. Chân dung Selfie
                  </span>
                  {selfieUrl && (
                    <a
                      href={selfieUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Xem ảnh gốc</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                <div className="relative w-full h-[180px] rounded-lg overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center">
                  {selfieUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selfieUrl}
                      alt="Ảnh selfie đối chiếu"
                      className="size-full object-contain"
                    />
                  ) : (
                    <p className="text-xs text-slate-400 italic">Ứng viên chưa tải ảnh selfie</p>
                  )}
                </div>

                {/* Thông tin tài khoản ứng viên */}
                <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200 dark:border-zinc-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avatar hiện tại:</span>
                    <div className="size-6 rounded-full overflow-hidden border border-slate-300">
                      {student.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={student.avatar_url} alt="Avatar" className="size-full object-cover" />
                      ) : (
                        <div className="size-full bg-slate-200 flex items-center justify-center text-[10px]">
                          {student.full_name?.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">SĐT / Zalo:</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                      {student.phone || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Trường ĐH / CĐ:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {student.university || "Chưa cập nhật"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thời gian nộp:</span>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                      {kycData.submitted_at
                        ? new Date(kycData.submitted_at).toLocaleString("vi-VN")
                        : "Không rõ"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form từ chối nếu Admin chọn Từ chối */}
            {showRejectForm && (
              <div className="p-4 rounded-xl bg-red-50/80 border border-red-200 dark:border-red-900/40 space-y-3">
                <p className="font-semibold text-xs text-red-800 dark:text-red-400">
                  Chọn hoặc nhập lý do từ chối eKYC:
                </p>
                <div className="space-y-1.5">
                  {QUICK_REJECTION_REASONS.map((r, i) => (
                    <label
                      key={i}
                      className="flex items-center gap-2 text-xs text-zinc-800 dark:text-zinc-200 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="rejectReason"
                        checked={rejectReason === r && !customReason}
                        onChange={() => {
                          setRejectReason(r)
                          setCustomReason("")
                        }}
                        className="text-red-600 focus:ring-red-500"
                      />
                      <span>{r}</span>
                    </label>
                  ))}
                </div>

                <div>
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Hoặc nhập lý do khác chi tiết..."
                    className="w-full h-9 px-3 text-xs rounded-lg border border-red-200 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={submitting}
                    className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    {submitting && <Loader2 className="size-3.5 animate-spin" />}
                    <span>Xác nhận từ chối</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 bg-slate-50/80 dark:bg-zinc-800/50 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-10 px-4 rounded-xl border border-slate-300 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>

            {!showRejectForm && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(true)}
                  disabled={submitting}
                  className="h-10 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Từ chối eKYC
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={submitting}
                  className="h-10 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  {submitting && <Loader2 className="size-4 animate-spin" />}
                  <CheckCircle2 className="size-4" />
                  <span>Phê duyệt KYC</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
