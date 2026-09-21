"use client"

import React, { useState, useEffect } from "react"
import { Plus, X, Trash2, Edit3, Briefcase } from "lucide-react"

export interface ExperienceItem {
  id: string
  title: string
  company: string
  year: string
  description?: string
}

export interface WorkExperienceCardProps {
  className?: string
  experiences?: ExperienceItem[]
  onSaveExperiences?: (newExperiences: ExperienceItem[]) => void | Promise<void>
}

// Gợi ý nhanh các vai trò sự kiện thường gặp
export const DEFAULT_SUGGESTED_ROLES = [
  { title: "Leader Check-in Sự kiện", company: "TechFest Vietnam", year: "2023 - 2024" },
  { title: "Lễ tân & Điều phối khách mời VIP", company: "Sun Group Gala", year: "2024" },
  { title: "Điều phối sân khấu (Stage Coordinator)", company: "Vietnam GameVerse", year: "2023" },
  { title: "Nhân viên hỗ trợ hậu cần sự kiện", company: "Marathon Quốc tế", year: "2024" }
]

/**
 * WorkExperienceCard component matching Figma nodes:
 * - Empty State: Node 6818:50101 (my resume/ No-Data)
 * - Filled State: Node 5875:27836 (Frame with BadgeFill items)
 */
export default function WorkExperienceCard({
  className,
  experiences = [],
  onSaveExperiences
}: WorkExperienceCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftList, setDraftList] = useState<ExperienceItem[]>(experiences)
  const [itemForm, setItemForm] = useState<Omit<ExperienceItem, "id">>({
    title: "",
    company: "",
    year: "",
    description: ""
  })
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  useEffect(() => {
    setDraftList(experiences)
  }, [experiences])

  const handleStartAdd = () => {
    setDraftList(experiences)
    setEditingItemId(null)
    setItemForm({ title: "", company: "", year: "", description: "" })
    setIsEditing(true)
  }

  const handleStartEditItem = (item: ExperienceItem) => {
    setEditingItemId(item.id)
    setItemForm({
      title: item.title,
      company: item.company,
      year: item.year,
      description: item.description || ""
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraftList(experiences)
    setEditingItemId(null)
    setItemForm({ title: "", company: "", year: "", description: "" })
    setIsEditing(false)
  }

  const handleSaveAll = () => {
    if (onSaveExperiences) {
      onSaveExperiences(draftList)
    }
    setEditingItemId(null)
    setItemForm({ title: "", company: "", year: "", description: "" })
    setIsEditing(false)
  }

  const handleAddOrUpdateItem = () => {
    if (!itemForm.title.trim() || !itemForm.company.trim()) return

    if (editingItemId) {
      // Cập nhật item đang sửa
      setDraftList((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? { ...item, ...itemForm, title: itemForm.title.trim(), company: itemForm.company.trim(), year: itemForm.year.trim() }
            : item
        )
      )
      setEditingItemId(null)
    } else {
      // Thêm mới item
      const newItem: ExperienceItem = {
        id: Date.now().toString(),
        title: itemForm.title.trim(),
        company: itemForm.company.trim(),
        year: itemForm.year.trim(),
        description: itemForm.description?.trim()
      }
      setDraftList((prev) => [...prev, newItem])
    }

    setItemForm({ title: "", company: "", year: "", description: "" })
  }

  const handleRemoveDraftItem = (idToRemove: string) => {
    setDraftList((prev) => prev.filter((item) => item.id !== idToRemove))
    if (editingItemId === idToRemove) {
      setEditingItemId(null)
      setItemForm({ title: "", company: "", year: "", description: "" })
    }
  }

  const handleApplyPreset = (preset: { title: string; company: string; year: string }) => {
    setItemForm({
      title: preset.title,
      company: preset.company,
      year: preset.year,
      description: ""
    })
  }

  const hasContent = Boolean(experiences && experiences.length > 0)

  return (
    <section
      className={
        className ||
        "bg-white border border-[#EDEDED] flex flex-col gap-[24px] sm:gap-[32px] items-start px-[16px] py-[24px] rounded-[8px] w-full shadow-xs"
      }
      data-node-id={hasContent ? "5875:27836" : "6818:50101"}
      data-name="Work Experience"
    >
      {/* Title Header (Figma: my resume/ title) */}
      <div
        className="flex items-center justify-between w-full"
        data-node-id={hasContent ? "5875:27837" : "I6818:50101;5928:48697"}
        data-name="my resume/ title"
      >
        <div className="flex gap-[8px] items-center">
          {/* Building Icon (Figma: building 24x24 SVG #222222) */}
          <div className="size-[24px] shrink-0 flex items-center justify-center" data-name="building">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-full"
            >
              <path
                d="M3 21.25H21C21.414 21.25 21.75 20.914 21.75 20.5C21.75 20.086 21.414 19.75 21 19.75H20.25V4C20.25 3.31 19.69 2.75 19 2.75H13C12.31 2.75 11.75 3.31 11.75 4V7.75H5C4.31 7.75 3.75 8.31 3.75 9V19.75H3C2.586 19.75 2.25 20.086 2.25 20.5C2.25 20.914 2.586 21.25 3 21.25ZM13.25 4.25H18.75V19.75H13.25V4.25ZM5.25 9.25H11.75V19.75H5.25V9.25ZM7 11.25H10C10.414 11.25 10.75 11.586 10.75 12C10.75 12.414 10.414 12.75 10 12.75H7C6.586 12.75 6.25 12.414 6.25 12C6.25 11.586 6.586 11.25 7 11.25ZM7 15.25H10C10.414 15.25 10.75 15.586 10.75 16C10.75 16.414 10.414 16.75 10 16.75H7C6.586 16.75 6.25 16.414 6.25 16C6.25 15.586 6.586 15.25 7 15.25ZM15 6.25H17C17.414 6.25 17.75 6.586 17.75 7C17.75 7.414 17.414 7.75 17 7.75H15C14.586 7.75 14.25 7.414 14.25 7C14.25 6.586 14.586 6.25 15 6.25ZM15 10.25H17C17.414 10.25 17.75 10.586 17.75 11C17.75 11.414 17.414 11.75 17 11.75H15C14.586 11.75 14.25 11.414 14.25 11C14.25 10.586 14.586 10.25 15 10.25ZM15 14.25H17C17.414 14.25 17.75 14.586 17.75 15C17.75 15.414 17.414 15.75 17 15.75H15C14.586 15.75 14.25 15.414 14.25 15C14.25 14.586 14.586 14.25 15 14.25Z"
                fill="#222222"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-[#222222] text-[18px] leading-normal font-['Inter'] whitespace-nowrap">
            Kinh nghiệm làm việc
          </h3>
        </div>

        {/* Edit Button in Filled State (Figma node 5875:27837 > edit icon #005DDC) */}
        {hasContent && !isEditing && (
          <button
            type="button"
            onClick={handleStartAdd}
            aria-label="Chỉnh sửa kinh nghiệm"
            className="size-[24px] shrink-0 p-0 text-[#005DDC] hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
            data-name="edit"
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

      {/* EDITING MODE */}
      {isEditing ? (
        <div className="w-full flex flex-col gap-4">
          {/* List of currently drafted experiences */}
          {draftList.length > 0 && (
            <div className="flex flex-col gap-2.5 w-full">
              <label className="text-xs font-semibold text-[#515151] uppercase tracking-wider">
                Danh sách kinh nghiệm ({draftList.length})
              </label>
              <div className="flex flex-col gap-2">
                {draftList.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-[#EDEDED] rounded-[8px] px-[12px] py-[8px] bg-[#FDFDFD] hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col gap-0.5 min-w-0 pr-2">
                      <p className="font-medium text-[#515151] text-[14px] truncate">{item.title}</p>
                      <p className="text-[#757575] text-[13px] truncate">
                        {item.company} {item.year ? `• ${item.year}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEditItem(item)}
                        className="p-1.5 text-slate-500 hover:text-[#005DDC] hover:bg-blue-50 rounded-[6px] transition-colors cursor-pointer"
                        title="Chỉnh sửa mục này"
                      >
                        <Edit3 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveDraftItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-[6px] transition-colors cursor-pointer"
                        title="Xóa mục này"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form to Add / Edit item */}
          <div className="bg-[#F9FAFB] border border-[#EDEDED] rounded-[8px] p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#222222]">
                {editingItemId ? "Chỉnh sửa kinh nghiệm" : "+ Thêm kinh nghiệm mới"}
              </span>
              {editingItemId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingItemId(null)
                    setItemForm({ title: "", company: "", year: "", description: "" })
                  }}
                  className="text-xs text-slate-500 hover:underline cursor-pointer"
                >
                  Hủy chỉnh sửa mục này
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#515151]">
                  Vị trí / Vai trò <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: Leader Check-in Sự kiện"
                  value={itemForm.title}
                  onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                  className="h-9 px-3 rounded-[6px] border border-[#EDEDED] bg-white text-sm focus:outline-none focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-[#515151]">
                  Công ty / Tên sự kiện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="VD: TechFest Vietnam 2024"
                  value={itemForm.company}
                  onChange={(e) => setItemForm({ ...itemForm, company: e.target.value })}
                  className="h-9 px-3 rounded-[6px] border border-[#EDEDED] bg-white text-sm focus:outline-none focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-[#515151]">Thời gian hoạt động</label>
              <input
                type="text"
                placeholder="VD: 2023 - 2024 hoặc 06/2024 - 08/2024"
                value={itemForm.year}
                onChange={(e) => setItemForm({ ...itemForm, year: e.target.value })}
                className="h-9 px-3 rounded-[6px] border border-[#EDEDED] bg-white text-sm focus:outline-none focus:border-[#005DDC] focus:ring-1 focus:ring-[#005DDC]"
              />
            </div>

            {/* Quick suggested presets */}
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-[11px] text-[#757575] font-medium">Gợi ý vai trò phổ biến:</span>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SUGGESTED_ROLES.map((role, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(role)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#EDEDED] text-[#515151] hover:border-[#005DDC] hover:text-[#005DDC] hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    + {role.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddOrUpdateItem}
                disabled={!itemForm.title.trim() || !itemForm.company.trim()}
                className="px-3.5 py-1.5 rounded-[6px] bg-slate-900 hover:bg-black text-white text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                {editingItemId ? "Cập nhật vào danh sách" : "+ Thêm vào danh sách"}
              </button>
            </div>
          </div>

          {/* Action buttons (Hủy / Lưu thay đổi) */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#F4F4F4]">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-[#757575] hover:text-[#222222] bg-transparent hover:bg-slate-100 rounded-[8px] transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 text-sm font-medium text-white bg-[#005DDC] hover:bg-[#004eb7] rounded-[8px] shadow-sm transition-colors cursor-pointer"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      ) : hasContent ? (
        /* FILLED STATE (Figma Node 5875:27836) */
        <div className="flex flex-col gap-[12px] w-full" data-node-id="5875:27836">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="border border-[#F4F4F4] flex items-center justify-between gap-[4px] px-[12px] py-[8px] rounded-[8px] w-full bg-white hover:border-[#EDEDED] transition-colors"
              data-node-id="4490:77885"
            >
              <div className="flex flex-1 flex-col gap-[4px] items-start min-w-0" data-node-id="4490:77855">
                {/* Role / Job Title (Figma: font-medium 14px text-[#515151]) */}
                <p className="font-['Inter'] font-medium leading-[1.6] text-[#515151] text-[14px] truncate w-full" data-node-id="4490:77856">
                  {exp.title}
                </p>
                {/* Caption / Company & Year (Figma: font-normal 14px text-[#757575]) */}
                <div className="flex flex-col items-start w-full" data-node-id="4490:77857">
                  <p className="font-['Inter'] font-normal leading-normal text-[#757575] text-[14px] truncate w-full" data-node-id="4490:77858">
                    {exp.company}
                    {exp.year ? ` _ ${exp.year}` : ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE (Figma Node 6818:50101) */
        <div
          className="border border-[#CBCBCB] border-dashed flex flex-col gap-[12px] items-center justify-center p-[16px] rounded-[8px] w-full"
          data-node-id="I6818:50101;5928:48718"
        >
          <p
            className="font-['Inter'] font-medium leading-normal text-[#757575] text-[16px] whitespace-nowrap text-center"
            data-node-id="I6818:50101;5928:48719"
          >
            Chưa có thông tin kinh nghiệm
          </p>
          <button
            type="button"
            onClick={handleStartAdd}
            className="flex gap-[8px] h-[40px] items-center justify-center px-[16px] py-[8px] rounded-[8px] hover:bg-blue-50/60 transition-colors cursor-pointer"
            data-node-id="I6818:50101;5928:48720"
            data-name="Buttons"
          >
            {/* Plus Icon (Figma: 24x24 SVG #005DDC) */}
            <div className="size-[24px] shrink-0 flex items-center justify-center" data-name="plus">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full"
              >
                <path
                  d="M12 4.75V19.25M4.75 12H19.25"
                  stroke="#005DDC"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span
              className="font-['Inter'] font-medium leading-normal text-[#005DDC] text-[16px] whitespace-nowrap"
              data-node-id="I6818:50101;5928:48720;2626:8339"
            >
              Thêm kinh nghiệm
            </span>
          </button>
        </div>
      )}
    </section>
  )
}
