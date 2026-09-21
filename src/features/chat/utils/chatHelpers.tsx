import React from "react"
import type { Message } from "../types"

export const MessengerReplyIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={className}>
    <path d="M6.497 1.035C7.593-.088 9.5.688 9.5 2.257V4.54c1.923.215 3.49 1.246 4.593 2.672C15.328 8.808 16 10.91 16 13v.305c0 .632-.465 1.017-.893 1.127-.422.11-.99.005-1.318-.493-.59-.894-1.2-1.482-1.951-1.859-.611-.307-1.359-.496-2.338-.558v2.23c0 1.57-1.908 2.346-3.003 1.222L.893 9.223a1.75 1.75 0 0 1 .001-2.444l5.603-5.744z" />
  </svg>
)

export function formatTimeAgo(dateStr?: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHr / 24)

  if (diffMin < 1) return "Vừa xong"
  if (diffMin < 60) return `${diffMin}p trước`
  if (diffHr < 24) return `${diffHr}h trước`
  if (diffDays < 7) return `${diffDays} ngày trước`
  return d.toLocaleDateString("vi-VN", { month: "numeric", day: "numeric" })
}

export function shouldShowTimestamp(currentMsg: Message, prevMsg: Message | null): boolean {
  if (!prevMsg || !prevMsg.created_at || !currentMsg.created_at) return true
  const prevTime = new Date(prevMsg.created_at).getTime()
  const currTime = new Date(currentMsg.created_at).getTime()
  return currTime - prevTime > 60 * 60 * 1000
}

export function getShortName(fullName?: string | null): string {
  if (!fullName) return "người dùng"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 2) return fullName
  return parts[parts.length - 1]
}

export function getBubbleRadius(isMe: boolean, isFirstInGroup: boolean, isLastInGroup: boolean): string {
  if (isFirstInGroup && isLastInGroup) {
    return "rounded-[18px]"
  }
  if (isMe) {
    if (isFirstInGroup) return "rounded-[18px] rounded-br-[4px]"
    if (isLastInGroup) return "rounded-[18px] rounded-tr-[4px]"
    return "rounded-[18px] rounded-r-[4px]"
  } else {
    if (isFirstInGroup) return "rounded-[18px] rounded-bl-[4px]"
    if (isLastInGroup) return "rounded-[18px] rounded-tl-[4px]"
    return "rounded-[18px] rounded-l-[4px]"
  }
}

export function formatGroupTimestamp(dateStr?: string | null): string {
  if (!dateStr) return ""
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleString("vi-VN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function parseReplyContent(content: string) {
  if (!content.startsWith("__REPLY__:")) {
    return { isReply: false, quotedAuthor: "", quotedText: "", actualText: content }
  }
  const parts = content.substring("__REPLY__:".length).split(":::")
  return {
    isReply: true,
    quotedAuthor: parts[0] || "Người gửi",
    quotedText: parts[1] || "",
    actualText: parts[2] || ""
  }
}

export function formatReplyContent(quotedAuthor: string, quotedText: string, actualText: string): string {
  return `__REPLY__:${quotedAuthor}:::${quotedText}:::${actualText}`
}
