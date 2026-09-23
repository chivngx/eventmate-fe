"use client"

import React, { useState, useEffect } from "react"
import { Plus, X } from "lucide-react"
import { EditIcon } from "@/components/icons"

export interface ProfessionalSkillsCardProps {
  className?: string
  skills?: string[]
  onSaveSkills?: (newSkills: string[]) => void | Promise<void>
}

// Gợi ý kỹ năng & ngoại ngữ phổ biến cho nhân sự sự kiện
export const DEFAULT_POPULAR_SKILLS = [
  "Lễ tân & Chào đón",
  "Check-in & Soát vé",
  "Hậu cần & Setup sự kiện",
  "MC & Hoạt náo",
  "Điều phối sự kiện",
  "Tiếng Anh giao tiếp",
  "Tiếng Trung cơ bản",
  "Tiếng Hàn cơ bản",
  "Chụp ảnh & Media",
  "Kỹ thuật âm thanh / Ánh sáng",
  "Tư vấn & Bán hàng (PG/PB)",
  "Giao tiếp & Ứng xử"
]

/**
 * ProfessionalSkillsCard component matching Figma nodes:
 * - Empty State: Node 6818:50100 (my resume/ No-Data)
 * - Filled State: Node 5875:27830 (Frame 2147225301)
 */
export default function ProfessionalSkillsCard({
  className,
  skills = [],
  onSaveSkills
}: ProfessionalSkillsCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftSkills, setDraftSkills] = useState<string[]>(skills)
  const [newSkillInput, setNewSkillInput] = useState("")

  useEffect(() => {
    setDraftSkills(skills)
  }, [skills])

  const handleStartEdit = () => {
    setDraftSkills(skills)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraftSkills(skills)
    setNewSkillInput("")
    setIsEditing(false)
  }

  const handleSave = () => {
    if (onSaveSkills) {
      onSaveSkills(draftSkills)
    }
    setNewSkillInput("")
    setIsEditing(false)
  }

  const handleAddSkill = (skillToAdd?: string) => {
    const skill = (skillToAdd || newSkillInput).trim()
    if (skill) {
      setDraftSkills((prev) => (prev.includes(skill) ? prev : [...prev, skill]))
      setNewSkillInput("")
    }
  }

  const handleRemoveSkill = (indexToRemove: number) => {
    setDraftSkills((prev) => prev.filter((_, idx) => idx !== indexToRemove))
  }

  const hasContent = Boolean(skills && skills.length > 0)

  return (
    <section
      className={
        className ||
        "bg-white border border-[#EDEDED] flex flex-col gap-[24px] sm:gap-[32px] items-start px-[16px] py-[24px] rounded-[8px] w-full shadow-xs"
      }
      data-node-id={hasContent ? "5875:27830" : "6818:50100"}
      data-name="Professional Skills"
    >
      {/* Title Header (Figma: my resume/ title) */}
      <div
        className="flex items-center justify-between w-full"
        data-node-id={hasContent ? "5875:27831" : "I6818:50100;5928:48697"}
        data-name="my resume/ title"
      >
        <div className="flex gap-[8px] items-center">
          {/* Medal Star Icon (Figma: medal-star - 24x24 SVG) */}
          <div className="size-[24px] shrink-0 flex items-center justify-center" data-name="medal-star">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-full"
            >
              <path
                d="M21.657 2.63901C21.525 2.39901 21.273 2.25 21 2.25H16C15.743 2.25 15.505 2.38099 15.367 2.59799L12.397 7.26999C12.265 7.26299 12.134 7.25 12 7.25C11.866 7.25 11.735 7.26299 11.603 7.26999L8.63308 2.59799C8.49508 2.38099 8.25702 2.25 8.00002 2.25H3.00002C2.72702 2.25 2.47504 2.39901 2.34304 2.63901C2.21104 2.87901 2.22097 3.17101 2.36697 3.40201L6.45608 9.83801C5.39308 11.1 4.75002 12.725 4.75002 14.5C4.75002 18.498 8.00202 21.75 12 21.75C15.998 21.75 19.25 18.498 19.25 14.5C19.25 12.725 18.607 11.1 17.544 9.83801L21.6331 3.40201C21.7791 3.17101 21.789 2.87901 21.657 2.63901ZM7.58803 3.75L9.99599 7.53799C9.10099 7.79599 8.27806 8.22201 7.56106 8.78101L4.36599 3.75H7.58803ZM12 20.25C8.82902 20.25 6.25002 17.671 6.25002 14.5C6.25002 11.329 8.82902 8.75 12 8.75C15.171 8.75 17.75 11.329 17.75 14.5C17.75 17.671 15.171 20.25 12 20.25ZM16.439 8.78101C15.722 8.22301 14.8991 7.79599 14.0041 7.53799L16.412 3.75H19.635L16.439 8.78101ZM14.8211 12.827L13.543 12.642L12.9931 11.533C12.8051 11.153 12.425 10.917 12 10.917C11.575 10.917 11.1951 11.153 11.0081 11.532L10.4571 12.642L9.17898 12.827C8.76798 12.886 8.43198 13.169 8.30398 13.565C8.17498 13.96 8.281 14.386 8.579 14.676L9.50198 15.571L9.29201 16.786C9.22001 17.204 9.387 17.619 9.73 17.869C10.073 18.119 10.519 18.154 10.898 17.956L12.001 17.379L13.104 17.956C13.267 18.041 13.444 18.084 13.62 18.084C13.849 18.084 14.077 18.012 14.271 17.87C14.615 17.62 14.782 17.205 14.709 16.789L14.499 15.571L15.422 14.675C15.721 14.385 15.826 13.96 15.697 13.564C15.568 13.169 15.2321 12.886 14.8211 12.827ZM11.648 12.198C11.648 12.199 11.648 12.198 11.648 12.198V12.198ZM13.297 14.647C13.039 14.896 12.9221 15.255 12.9831 15.608L13.095 16.258L12.5031 15.948C12.1891 15.784 11.812 15.784 11.497 15.948L10.9051 16.258L11.017 15.607C11.078 15.255 10.96 14.895 10.704 14.647L10.2321 14.19L10.886 14.095C11.239 14.045 11.544 13.824 11.703 13.504L11.999 12.907L12.2951 13.504C12.4541 13.823 12.76 14.044 13.111 14.094L13.766 14.189L13.297 14.647Z"
                fill="#222222"
              />
            </svg>
          </div>
          <h3 className="font-semibold text-[#222222] text-[18px] leading-normal font-['Inter'] whitespace-nowrap">
            Kỹ năng nổi bật
          </h3>
        </div>

        {/* Edit Button in Filled State (Figma node 5875:27831 > edit icon) */}
        {hasContent && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            aria-label="Chỉnh sửa kỹ năng nổi bật"
            className="size-[30px] rounded-[8px] text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            data-name="edit"
          >
            <EditIcon className="size-[17px]" />
          </button>
        )}
      </div>

      {/* EDITING MODE */}
      {isEditing ? (
        <div className="w-full flex flex-col gap-4">
          {/* Input field to add custom skill */}
          <div className="flex gap-2 w-full">
            <input
              type="text"
              placeholder="Nhập tên kỹ năng (VD: Check-in, Lễ tân, MC, Quản lý sự kiện)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddSkill()
                }
              }}
              className="flex-1 h-10 px-3 rounded-[8px] border border-[#005DDC] font-['Inter'] text-[14px] text-[#282828] focus:outline-none bg-white"
              autoFocus
            />
            <button
              type="button"
              onClick={() => handleAddSkill()}
              className="px-4 h-10 rounded-[8px] bg-[#005DDC] hover:bg-[#004EB7] font-['Inter'] text-[14px] font-medium text-white transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm</span>
            </button>
          </div>

          {/* Current draft skills list */}
          {draftSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 w-full pt-1">
              {draftSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-[#EDEDED] flex items-center gap-2 h-[32px] px-[12px] rounded-[8px] text-[#353535] font-['Inter'] text-[14px] font-normal"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(idx)}
                    aria-label={`Xóa kỹ năng ${skill}`}
                    className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer flex items-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Quick suggestions for event skills */}
          <div className="pt-2 border-t border-[#EDEDED]">
            <span className="font-['Inter'] text-[12px] font-semibold text-[#757575] uppercase tracking-wider block mb-2">
              Gợi ý kỹ năng cho sự kiện:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_POPULAR_SKILLS.filter((s) => !draftSkills.includes(s)).map((popSkill, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleAddSkill(popSkill)}
                  className="px-3 py-1.5 rounded-[6px] bg-slate-100 hover:bg-blue-50 hover:text-[#005DDC] hover:border-blue-200 border border-transparent font-['Inter'] text-[13px] text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>{popSkill}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end items-center gap-2 pt-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-[8px] border border-[#EDEDED] font-['Inter'] text-[14px] font-medium text-[#757575] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-[8px] bg-[#005DDC] hover:bg-[#004EB7] font-['Inter'] text-[14px] font-medium text-white transition-colors cursor-pointer shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      ) : hasContent ? (
        /* FILLED STATE (Matching Figma node 5875:27830 - Frame 2147225301) */
        <div
          className="flex flex-wrap gap-[12px] items-center w-full"
          data-node-id="5875:27832"
        >
          {skills.map((skill, idx) => (
            <div
              key={idx}
              className="bg-[#EDEDED] flex items-center justify-center h-[32px] px-[12px] rounded-[8px]"
              data-node-id="4488:62732"
              data-name="badge"
            >
              <span className="font-['Inter'] font-normal text-[#353535] text-[14px] whitespace-nowrap">
                {skill}
              </span>
            </div>
          ))}
        </div>
      ) : (
        /* EMPTY STATE (Matching Figma node 6818:50100 - my resume/ No-Data) */
        <div
          className="border border-[#CBCBCB] border-dashed flex flex-col gap-[12px] items-center justify-center p-[16px] rounded-[8px] w-full min-h-[103px]"
          data-node-id="I6818:50100;5928:48718"
        >
          <p
            className="font-['Inter'] font-medium text-[16px] text-[#757575] leading-normal text-center"
            data-node-id="I6818:50100;5928:48719"
          >
            Chưa có thông tin kỹ năng nổi bật
          </p>
          <button
            type="button"
            onClick={handleStartEdit}
            className="flex gap-[8px] h-[40px] items-center justify-center px-[16px] py-[8px] rounded-[8px] hover:bg-blue-50/60 transition-colors cursor-pointer"
            data-node-id="I6818:50100;5928:48720"
            data-name="Buttons"
          >
            <div className="size-[24px] shrink-0 flex items-center justify-center" data-name="angle-left-small">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full"
              >
                <path
                  d="M19.75 12C19.75 12.414 19.414 12.75 19 12.75H12.75V19C12.75 19.414 12.414 19.75 12 19.75C11.586 19.75 11.25 19.414 11.25 19V12.75H5C4.586 12.75 4.25 12.414 4.25 12C4.25 11.586 4.586 11.25 5 11.25H11.25V5C11.25 4.586 11.586 4.25 12 4.25C12.414 4.25 12.75 4.586 12.75 5V11.25H19C19.414 11.25 19.75 11.586 19.75 12Z"
                  fill="#005DDC"
                />
              </svg>
            </div>
            <span className="font-['Inter'] font-medium text-[16px] text-[#005DDC] leading-normal whitespace-nowrap">
              Thêm kỹ năng
            </span>
          </button>
        </div>
      )}
    </section>
  )
}
