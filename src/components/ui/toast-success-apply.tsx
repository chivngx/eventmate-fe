"use client"

import React from "react"
import Link from "next/link"

interface ToastSuccessApplyProps {
  title?: string
  message?: string
  actionText?: string
  actionLink?: string
  onDismiss?: () => void
  onActionClick?: () => void
  className?: string
}

/**
 * ToastSuccessApply - Figma Node 7851:39023 (Component 43)
 * Green success toast with 48px checkmark, title, description, and action button.
 */
export default function ToastSuccessApply({
  title = "Successfully apply",
  message = "Your application form sent, we will notify you when something happens",
  actionText = "Go to Dashboard",
  actionLink = "/dashboard",
  onDismiss,
  onActionClick,
  className = ""
}: ToastSuccessApplyProps) {
  return (
    <div
      className={`bg-[#eefff0] border border-[#bbf7d0] content-stretch flex items-start p-[16px] relative rounded-[8px] shadow-lg w-full max-w-[400px] animate-in slide-in-from-bottom-5 fade-in duration-300 ${className}`}
      data-node-id="7851:39023"
      data-name="Component 43"
    >
      {/* 48px Green Checkmark Icon */}
      <div className="relative shrink-0 size-[48px]" data-node-id="3490:86556">
        <img
          src="/images/toast-success-checkmark.svg"
          alt="Success"
          className="absolute block inset-0 max-w-none size-full"
        />
      </div>

      {/* Main Content Area */}
      <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0 flex-1 min-w-0" data-node-id="7851:37427">
        <div className="[word-break:break-word] content-stretch flex flex-col gap-[8px] items-start leading-[normal] not-italic pl-[16px] relative shrink-0 text-[#034203] w-full" data-node-id="7851:37428">
          <p className="font-semibold text-[16px] tracking-tight truncate w-full" data-node-id="7851:37429">
            {title}
          </p>
          <p className="font-normal text-[11px] leading-relaxed w-full opacity-90" data-node-id="7851:37430">
            {message}
          </p>
        </div>

        {/* Action Link / Button (e.g. Go to Dashboard) */}
        {actionLink ? (
          <Link
            href={actionLink}
            onClick={() => {
              if (onActionClick) onActionClick()
              if (onDismiss) onDismiss()
            }}
            className="content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[8px] relative rounded-[8px] shrink-0 text-[#034203] hover:bg-[#dcfce7] transition-colors ml-4 cursor-pointer"
            data-node-id="7851:37431"
          >
            <span className="font-medium leading-[1.6] not-italic relative shrink-0 text-[14px] whitespace-nowrap">
              {actionText}
            </span>
            <div className="relative shrink-0 size-[24px]" data-node-id="3313:18725">
              <img src="/images/toast-arrow-right.svg" alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
          </Link>
        ) : actionText && onActionClick ? (
          <button
            type="button"
            onClick={() => {
              onActionClick()
              if (onDismiss) onDismiss()
            }}
            className="content-stretch flex gap-[8px] h-[32px] items-center justify-center px-[16px] py-[8px] relative rounded-[8px] shrink-0 text-[#034203] hover:bg-[#dcfce7] transition-colors ml-4 cursor-pointer"
            data-node-id="7851:37431"
          >
            <span className="font-medium leading-[1.6] not-italic relative shrink-0 text-[14px] whitespace-nowrap">
              {actionText}
            </span>
            <div className="relative shrink-0 size-[24px]" data-node-id="3313:18725">
              <img src="/images/toast-arrow-right.svg" alt="" className="absolute block inset-0 max-w-none size-full" />
            </div>
          </button>
        ) : null}
      </div>

      {/* Close / Dismiss Button */}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="block cursor-pointer relative shrink-0 size-[24px] p-0.5 hover:opacity-75 transition-opacity"
          data-node-id="7851:37432"
          title="Đóng"
        >
          <img src="/images/toast-times.svg" alt="Close" className="absolute block inset-0 max-w-none size-full" />
        </button>
      )}
    </div>
  )
}
