"use client"

import React, { useState, useEffect } from "react"

export interface AboutMeCardProps {
  className?: string
  bio?: string
  onSaveBio?: (newBio: string) => void | Promise<void>
}

/**
 * AboutMeCard component matching Figma nodes:
 * - Empty State: Node 6818:50099 (my resume/input/about me)
 * - Filled State: Node 5875:27826 (Frame 2147225298)
 */
export default function AboutMeCard({
  className,
  bio = "",
  onSaveBio
}: AboutMeCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftBio, setDraftBio] = useState(bio)

  useEffect(() => {
    setDraftBio(bio)
  }, [bio])

  const handleStartEdit = () => {
    setDraftBio(bio)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setDraftBio(bio)
    setIsEditing(false)
  }

  const handleSave = () => {
    if (onSaveBio) {
      onSaveBio(draftBio.trim())
    }
    setIsEditing(false)
  }

  const hasContent = Boolean(bio && bio.trim().length > 0)

  return (
    <section
      className={
        className ||
        "bg-white border border-[#EDEDED] flex flex-col gap-[16px] p-[20px] rounded-[16px] w-full shadow-xs"
      }
      data-node-id={hasContent ? "5875:27826" : "6818:50099"}
      data-name="my resume/input/about me"
    >
      {/* Title Header */}
      <div
        className="flex items-center justify-between w-full"
        data-node-id={hasContent ? "5875:27827" : "I6818:50099;5928:48697"}
        data-name="my resume/ title"
      >
        <div className="flex gap-[8px] items-center">
          {/* User Icon */}
          <div className="size-[20px] shrink-0 flex items-center justify-center text-[#222222]" data-name="user-alt">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="size-full"
            >
              <path
                d="M12.009 10.75C9.66503 10.75 7.75903 8.843 7.75903 6.5C7.75903 4.157 9.66503 2.25 12.009 2.25C14.353 2.25 16.259 4.157 16.259 6.5C16.259 8.843 14.353 10.75 12.009 10.75ZM12.009 3.75C10.492 3.75 9.25903 4.983 9.25903 6.5C9.25903 8.017 10.492 9.25 12.009 9.25C13.526 9.25 14.759 8.017 14.759 6.5C14.759 4.983 13.525 3.75 12.009 3.75ZM19.75 21V18.019C19.75 15.358 18.244 12.25 14 12.25H10C5.756 12.25 4.25 15.357 4.25 18.019V21C4.25 21.414 4.586 21.75 5 21.75C5.414 21.75 5.75 21.414 5.75 21V18.019C5.75 17.018 6.057 13.75 10 13.75H14C17.943 13.75 18.25 17.017 18.25 18.019V21C18.25 21.414 18.586 21.75 19 21.75C19.414 21.75 19.75 21.414 19.75 21Z"
                fill="currentColor"
              />
            </svg>
          </div>
          {/* Title Text */}
          <h3 className="font-semibold text-[#222222] text-[16px] leading-normal font-['Inter'] whitespace-nowrap">
            Giới thiệu bản thân
          </h3>
        </div>

        {/* Edit Button in Filled State */}
        {hasContent && !isEditing && (
          <button
            type="button"
            onClick={handleStartEdit}
            aria-label="Chỉnh sửa giới thiệu bản thân"
            className="size-[20px] shrink-0 p-0 text-[#005DDC] hover:opacity-80 transition-opacity cursor-pointer flex items-center justify-center"
            data-name="edit"
          >
            <svg
              width="20"
              height="20"
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

      {/* Editing Mode */}
      {isEditing ? (
        <div className="w-full flex flex-col gap-2.5">
          <textarea
            rows={3}
            value={draftBio}
            onChange={(e) => setDraftBio(e.target.value)}
            placeholder="Viết một đoạn ngắn giới thiệu bản thân..."
            className="w-full p-2.5 rounded-[8px] border border-[#005DDC] font-['Inter'] text-[13.5px] text-[#222222] leading-relaxed focus:outline-none bg-white resize-y"
            autoFocus
          />
          <div className="flex justify-end items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3 py-1.5 rounded-[8px] border border-[#EDEDED] font-['Inter'] text-[13px] font-medium text-[#757575] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-[8px] bg-[#005DDC] hover:bg-[#004EB7] font-['Inter'] text-[13px] font-medium text-white transition-colors cursor-pointer shadow-xs"
            >
              Lưu
            </button>
          </div>
        </div>
      ) : hasContent ? (
        /* Filled State */
        <div
          className="border border-[#F4F4F4] flex items-center px-[14px] py-[12px] rounded-[10px] w-full bg-slate-50/50"
          data-node-id="5875:27828"
        >
          <p
            className="w-full font-['Inter'] font-normal text-[13.5px] text-[#333333] leading-[1.6] whitespace-pre-line"
            data-node-id="5875:27829"
          >
            {bio}
          </p>
        </div>
      ) : (
        /* Empty State */
        <div
          className="border border-[#CBCBCB] border-dashed flex flex-col gap-[10px] items-center justify-center p-[16px] rounded-[12px] w-full min-h-[90px]"
          data-node-id="I6818:50099;5928:48718"
        >
          <p
            className="font-['Inter'] font-normal text-[13px] text-[#757575] leading-normal text-center"
            data-node-id="I6818:50099;5928:48719"
          >
            Chưa có lời giới thiệu bản thân
          </p>
          <button
            type="button"
            onClick={handleStartEdit}
            className="inline-flex gap-[6px] h-[34px] items-center justify-center px-[12px] py-[6px] rounded-[8px] hover:bg-blue-50/70 transition-colors cursor-pointer text-[#005DDC]"
            data-node-id="I6818:50099;5928:48720"
            data-name="Buttons"
          >
            <div className="size-[16px] shrink-0 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-full"
              >
                <path
                  d="M19.75 12C19.75 12.414 19.414 12.75 19 12.75H12.75V19C12.75 19.414 12.414 19.75 12 19.75C11.586 19.75 11.25 19.414 11.25 19V12.75H5C4.586 12.75 4.25 12.414 4.25 12C4.25 11.586 4.586 11.25 5 11.25H11.25V5C11.25 4.586 11.586 4.25 12 4.25C12.414 4.25 12.75 4.586 12.75 5V11.25H19C19.414 11.25 19.75 11.586 19.75 12Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span className="font-['Inter'] font-medium text-[13px] leading-normal whitespace-nowrap">
              Thêm giới thiệu
            </span>
          </button>
        </div>
      )}
    </section>
  )
}
