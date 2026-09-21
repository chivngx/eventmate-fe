import React from "react"
import { X } from "lucide-react"
import { MessengerReplyIcon, parseReplyContent } from "../utils/chatHelpers"
import type { Message } from "../types"

export interface ChatReplyBannerProps {
  replyingMessage: Message | null
  onCancel: () => void
  compact?: boolean
}

export default function ChatReplyBanner({
  replyingMessage,
  onCancel,
  compact = false
}: ChatReplyBannerProps) {
  if (!replyingMessage) return null

  const isReply = replyingMessage.content.startsWith("__REPLY__:")
  const textToShow = isReply
    ? parseReplyContent(replyingMessage.content).actualText || replyingMessage.content
    : replyingMessage.content

  return (
    <div
      className={`${
        compact ? "px-3.5 py-1.5 text-[11px]" : "px-4 py-2 text-xs"
      } bg-[#eff5ff] border-t border-[#0084FF]/20 flex items-center justify-between shrink-0 select-none`}
    >
      <div className="flex items-center gap-1.5 truncate min-w-0">
        <MessengerReplyIcon className="size-3 text-[#0084FF] shrink-0" />
        <span className="text-[#515151] truncate">
          Đang trả lời: <span className="font-medium text-[#222]">{textToShow}</span>
        </span>
      </div>
      <button
        type="button"
        onClick={onCancel}
        className="text-[#757575] hover:text-[#222] p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer shrink-0"
        title="Hủy trả lời"
      >
        <X className={compact ? "size-3" : "size-3.5"} />
      </button>
    </div>
  )
}
