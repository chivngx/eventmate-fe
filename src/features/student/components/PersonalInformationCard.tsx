"use client"

import React, { useState, useEffect } from "react"
import { ShieldCheck, ExternalLink } from "lucide-react"

export interface PersonalInfoData {
  fullName: string
  email: string
  phone: string
  city: string
  university?: string
  socialLink?: string
  birthYear: string
  gender: string
  reliabilityScore?: number
}

export interface PersonalInformationCardProps {
  className?: string
  data: PersonalInfoData
  onSave?: (updatedData: PersonalInfoData) => void | Promise<void>
}

/**
 * PersonalInformationCard component implemented from Figma node 5875:27797 (Frame 2147225296)
 * Tinh gọn và tối ưu cho nhân sự sự kiện (Họ tên, SĐT Zalo, Email, Khu vực, Trường học, MXH, Năm sinh, Giới tính)
 */
export default function PersonalInformationCard({
  className,
  data,
  onSave
}: PersonalInformationCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<PersonalInfoData>(data)

  useEffect(() => {
    setFormData(data)
  }, [data])

  const handleCancel = () => {
    setFormData(data)
    setIsEditing(false)
  }

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
    }
    setIsEditing(false)
  }

  return (
    <section
      className={
        className ||
        "bg-white border border-[#EDEDED] flex flex-col gap-[24px] sm:gap-[32px] items-start px-[16px] py-[24px] rounded-[8px] w-full shadow-xs"
      }
      data-node-id="5875:27797"
      data-name="Personal Information"
    >
      {/* Title Header (Figma: my resume/ title) */}
      <div
        className="flex items-center justify-between w-full"
        data-node-id="5875:27798"
        data-name="my resume/ title"
      >
        <div className="flex gap-[8px] items-center">
          {/* User Tag Icon (Figma: user-tag - 24x24 SVG) */}
          <div className="size-[24px] shrink-0 flex items-center justify-center" data-name="user-tag">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-full"
            >
              <path
                d="M12 22.75C11.231 22.75 10.527 22.397 10.066 21.783L8.56702 19.783C8.39402 19.553 8.12001 19.416 7.83301 19.416H6.33301C3.70001 19.416 2.25 17.966 2.25 15.333V5.33301C2.25 2.70001 3.70001 1.25 6.33301 1.25H17.667C20.3 1.25 21.75 2.70001 21.75 5.33301V15.333C21.75 17.966 20.3 19.416 17.667 19.416H16.167C15.88 19.416 15.605 19.5531 15.433 19.7841L13.933 21.7841C13.473 22.3971 12.769 22.75 12 22.75ZM6.33301 2.75C4.52201 2.75 3.75 3.52201 3.75 5.33301V15.333C3.75 17.144 4.52201 17.916 6.33301 17.916H7.83301C8.58901 17.916 9.31197 18.277 9.76697 18.882L11.267 20.882C11.617 21.349 12.385 21.348 12.733 20.882L14.234 18.882C14.688 18.277 15.412 17.915 16.168 17.915H17.668C19.479 17.915 20.251 17.143 20.251 15.332V5.33203C20.251 3.52103 19.479 2.74902 17.668 2.74902H6.33301V2.75ZM12 9.75C10.621 9.75 9.5 8.628 9.5 7.25C9.5 5.872 10.621 4.75 12 4.75C13.379 4.75 14.5 5.872 14.5 7.25C14.5 8.628 13.379 9.75 12 9.75ZM12 6.25C11.448 6.25 11 6.699 11 7.25C11 7.801 11.448 8.25 12 8.25C12.552 8.25 13 7.801 13 7.25C13 6.699 12.552 6.25 12 6.25ZM13.994 16.25H9.99695C8.58695 16.25 7.745 15.412 7.745 14.009C7.745 12.386 8.75 10.75 10.995 10.75H12.995C15.24 10.75 16.245 12.387 16.245 14.009C16.245 15.412 15.403 16.25 13.994 16.25ZM10.995 12.25C9.473 12.25 9.245 13.352 9.245 14.009C9.245 14.584 9.41395 14.75 9.99695 14.75H13.994C14.577 14.75 14.745 14.584 14.745 14.009C14.745 13.352 14.517 12.25 12.995 12.25H10.995Z"
                fill="#222222"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-[#222222] text-[18px] leading-normal font-['Inter'] whitespace-nowrap">
            Thông tin cá nhân & Liên hệ
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Điểm uy tín */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Điểm uy tín: {data.reliabilityScore ?? 100}/100</span>
          </div>

          {/* Nút chỉnh sửa / Edit icon */}
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              aria-label="Chỉnh sửa thông tin cá nhân"
              className="size-[24px] shrink-0 p-0 text-[#005DDC] hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full"
              >
                <path
                  d="M19.75 15V18C19.75 20.418 18.418 21.75 16 21.75H6C3.582 21.75 2.25 20.418 2.25 18V8C2.25 5.582 3.582 4.25 6 4.25H9C9.414 4.25 9.75 4.586 9.75 5C9.75 5.414 9.414 5.75 9 5.75H6C4.423 5.75 3.75 6.423 3.75 8V18C3.75 19.577 4.423 20.25 6 20.25H16C17.577 20.25 18.25 19.577 18.25 18V15C18.25 14.586 18.586 14.25 19 14.25C19.414 14.25 19.75 14.586 19.75 15ZM21.75 6.056C21.749 6.643 21.52 7.194 21.104 7.608L12.141 16.531C12 16.671 11.81 16.75 11.612 16.75H8C7.586 16.75 7.25 16.414 7.25 16V12.389C7.25 12.191 7.32799 12 7.46899 11.86L16.392 2.896C16.805 2.48 17.357 2.251 17.944 2.25C17.945 2.25 17.946 2.25 17.947 2.25C18.533 2.25 19.084 2.47801 19.499 2.89301L21.108 4.50201C21.522 4.91701 21.751 5.469 21.75 6.056ZM17.617 8.96301L15.037 6.383L8.75 12.699V15.251H11.302L17.617 8.96301ZM20.25 6.05399C20.25 5.86799 20.178 5.69301 20.047 5.56201L18.438 3.953C18.307 3.822 18.132 3.75 17.947 3.75H17.946C17.76 3.75 17.586 3.82301 17.455 3.95401L16.096 5.319L18.681 7.90399L20.046 6.54501C20.177 6.41501 20.249 6.23999 20.25 6.05399Z"
                  fill="#005DDC"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE */}
      {!isEditing ? (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-6 sm:gap-y-7 w-full"
          data-node-id="5875:27799"
        >
          {/* Cột trái */}
          <div className="flex flex-col gap-[20px] sm:gap-[24px] items-start w-full">
            {/* Họ và tên */}
            <div className="flex flex-col gap-[4px] items-start w-full">
              <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                Họ và tên
              </span>
              <span className="font-['Inter'] font-medium text-[#282828] text-[16px] truncate max-w-full">
                {data.fullName?.trim() || (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[#005DDC] underline cursor-pointer hover:opacity-80"
                  >
                    Thêm họ tên
                  </button>
                )}
              </span>
            </div>

            {/* Email liên hệ */}
            <div className="flex flex-col gap-[4px] items-start w-full">
              <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                Email
              </span>
              <span className="font-['Inter'] font-medium text-[#282828] text-[16px] truncate max-w-full">
                {data.email?.trim() || (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[#005DDC] underline cursor-pointer hover:opacity-80"
                  >
                    Thêm email
                  </button>
                )}
              </span>
            </div>

            {/* Tỉnh / Thành phố */}
            <div className="flex flex-col gap-[4px] items-start w-full">
              <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                Tỉnh / Thành phố sinh sống
              </span>
              <span className="font-['Inter'] font-medium text-[#282828] text-[16px] truncate max-w-full">
                {data.city?.trim() || (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[#005DDC] underline cursor-pointer hover:opacity-80"
                  >
                    Thêm khu vực
                  </button>
                )}
              </span>
            </div>

            {/* Trường Đại học / Cao đẳng */}
            <div className="flex flex-col gap-[4px] items-start w-full">
              <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                Trường Đại học / Cao đẳng
              </span>
              <span className="font-['Inter'] font-medium text-[#282828] text-[16px] truncate max-w-full">
                {data.university?.trim() || (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[#005DDC] underline cursor-pointer hover:opacity-80"
                  >
                    Thêm trường học
                  </button>
                )}
              </span>
            </div>
          </div>

          {/* Cột phải */}
          <div className="flex flex-col gap-[20px] sm:gap-[24px] items-start w-full">
            {/* Số điện thoại */}
            <div className="flex flex-col gap-[4px] items-start w-full">
              <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                Số điện thoại (Zalo)
              </span>
              <span className="font-['Inter'] font-medium text-[#282828] text-[16px] truncate max-w-full">
                {data.phone?.trim() || (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[#005DDC] underline cursor-pointer hover:opacity-80"
                  >
                    Thêm SĐT
                  </button>
                )}
              </span>
            </div>

            {/* Giới tính & Năm sinh */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex flex-col gap-[4px] items-start">
                <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Giới tính
                </span>
                <span className="font-['Inter'] font-medium text-[#282828] text-[16px]">
                  {data.gender || "Nam"}
                </span>
              </div>
              <div className="flex flex-col gap-[4px] items-start">
                <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Năm sinh
                </span>
                <span className="font-['Inter'] font-medium text-[#282828] text-[16px]">
                  {data.birthYear?.trim() || "Chưa cập nhật"}
                </span>
              </div>
            </div>

            {/* Link Mạng xã hội (Facebook / Instagram / TikTok) */}
            <div className="flex flex-col gap-[4px] items-start w-full">
              <span className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                Mạng xã hội (Facebook / TikTok)
              </span>
              <span className="font-['Inter'] font-medium text-[#282828] text-[16px] truncate max-w-full">
                {data.socialLink?.trim() ? (
                  <a
                    href={data.socialLink.startsWith("http") ? data.socialLink : `https://${data.socialLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#005DDC] hover:underline flex items-center gap-1.5 truncate max-w-full"
                  >
                    <span className="truncate">{data.socialLink.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="size-3.5 shrink-0" />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="text-[#005DDC] underline cursor-pointer hover:opacity-80"
                  >
                    Thêm liên kết mạng xã hội
                  </button>
                )}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* EDIT MODE */
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSave()
          }}
          className="w-full flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 sm:gap-x-16 gap-y-6 sm:gap-y-7 w-full">
            {/* Cột trái */}
            <div className="flex flex-col gap-[18px] sm:gap-[20px] items-start w-full">
              {/* Họ và tên */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                />
              </div>

              {/* Tỉnh / Thành phố sinh sống */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Tỉnh / Thành phố sinh sống
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ví dụ: Đà Nẵng, TP.HCM, Hà Nội..."
                  className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                />
              </div>

              {/* Trường Đại học / Cao đẳng */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Trường Đại học / Cao đẳng
                </label>
                <input
                  type="text"
                  value={formData.university || ""}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="Ví dụ: ĐH Bách Khoa, ĐH Kinh Tế..."
                  className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                />
              </div>
            </div>

            {/* Cột phải */}
            <div className="flex flex-col gap-[18px] sm:gap-[20px] items-start w-full">
              {/* Số điện thoại (Zalo) */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Số điện thoại (Zalo)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ví dụ: 0905123456"
                  className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                />
              </div>

              {/* Giới tính & Năm sinh */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="flex flex-col gap-1.5 items-start">
                  <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 items-start">
                  <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                    Năm sinh
                  </label>
                  <input
                    type="text"
                    value={formData.birthYear}
                    onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                    placeholder="Ví dụ: 2005"
                    className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                  />
                </div>
              </div>

              {/* Mạng xã hội (Facebook / TikTok) */}
              <div className="flex flex-col gap-1.5 items-start w-full">
                <label className="font-['Inter'] font-normal text-[#A5A5A5] text-[14px]">
                  Mạng xã hội (Facebook / TikTok)
                </label>
                <input
                  type="url"
                  value={formData.socialLink || ""}
                  onChange={(e) => setFormData({ ...formData, socialLink: e.target.value })}
                  placeholder="https://facebook.com/username hoặc https://tiktok.com/@username"
                  className="w-full h-10 px-3.5 rounded-[8px] bg-[#f9f9f9] border border-[#E5E5E5] focus:border-[#005ddc] focus:bg-white text-[15px] font-medium text-[#282828] transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end items-center gap-2 pt-2 border-t border-[#F0F0F0]">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-[8px] border border-[#EDEDED] font-['Inter'] text-[14px] font-medium text-[#757575] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-[8px] bg-[#005DDC] hover:bg-[#004EB7] font-['Inter'] text-[14px] font-medium text-white transition-colors cursor-pointer shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      )}
    </section>
  )
}
