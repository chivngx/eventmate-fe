import React from "react"
import { Check, X } from "lucide-react"
import type { Message, ChatPartnerProfile } from "../types"
import {
  MessengerReplyIcon,
  getBubbleRadius,
  shouldShowTimestamp,
  formatGroupTimestamp,
  getShortName,
  parseReplyContent
} from "../utils/chatHelpers"

export interface ChatMessageListProps {
  messages: Message[]
  currentUserId?: string
  partnerProfile: ChatPartnerProfile
  currentUserProfile?: { full_name?: string | null }
  onReply: (msg: Message) => void
  messagesEndRef?: React.RefObject<HTMLDivElement | null>
  compact?: boolean
  showHeader?: boolean
  role?: string | null
}

export default function ChatMessageList({
  messages,
  currentUserId,
  partnerProfile,
  currentUserProfile,
  onReply,
  messagesEndRef,
  compact = false,
  showHeader = true,
  role
}: ChatMessageListProps) {
  const myName = currentUserProfile?.full_name || "Bạn"
  const partnerName = partnerProfile.full_name || "Người dùng"
  const defaultPartnerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    partnerName
  )}&background=18181B&color=fff`

  return (
    <div className="space-y-1">
      {/* 1. Conversation Header (Profile info) */}
      {showHeader && (
        <div
          className={`flex flex-col items-center justify-center ${
            compact ? "pt-6 pb-2" : "pt-8 pb-4"
          } text-center select-none`}
        >
          <div
            className={`${
              compact
                ? "size-14 mb-2 border border-slate-200/80 shadow-2xs"
                : "size-20 mb-3 border-2 border-slate-100 shadow-sm"
            } rounded-full overflow-hidden bg-slate-100`}
          >
            <img
              src={partnerProfile.avatar_url || defaultPartnerAvatar}
              alt={partnerName}
              className="size-full object-cover"
            />
          </div>
          <h3
            className={`${
              compact ? "text-[14px]" : "text-[17px]"
            } font-bold text-[#050505]`}
          >
            {partnerName}
          </h3>
          <p
            className={`${
              compact ? "text-[11px]" : "text-[13px]"
            } text-[#65676B] mt-0.5`}
          >
            Các bạn đã kết nối trên EventMate
          </p>
        </div>
      )}

      {/* 2. Messages Loop */}
      {messages.map((msg, index) => {
        const isMe = msg.sender_id === currentUserId
        const prevMsg = index > 0 ? messages[index - 1] : null
        const nextMsg = index < messages.length - 1 ? messages[index + 1] : null

        const isReply = msg.content.startsWith("__REPLY__:")

        const showTimestamp = shouldShowTimestamp(msg, prevMsg)
        const nextShowTimestamp = nextMsg ? shouldShowTimestamp(nextMsg, msg) : false
        const isFirstInGroup = !prevMsg || prevMsg.sender_id !== msg.sender_id || showTimestamp
        const isLastInGroup = !nextMsg || nextMsg.sender_id !== msg.sender_id || nextShowTimestamp
        const isVeryLastMessage = index === messages.length - 1

        const radiusClass = getBubbleRadius(isMe, isFirstInGroup, isLastInGroup)

        const timeStr = msg.created_at
          ? new Date(msg.created_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""

        return (
          <div key={msg.id || index} className={isLastInGroup ? (compact ? "mb-2.5" : "mb-3") : "mb-[2px]"}>
            {/* Timestamp Separator */}
            {showTimestamp && (
              <div className="text-center py-2 select-none">
                <span
                  className={`${
                    compact ? "text-[11px]" : "text-[12px]"
                  } text-[#65676B] font-medium`}
                >
                  {formatGroupTimestamp(msg.created_at)}
                </span>
              </div>
            )}

            {/* REPLY MESSAGE BUBBLE */}
            {isReply &&
              (() => {
                const { quotedAuthor, quotedText, actualText } = parseReplyContent(msg.content)
                const isQuotedMe = quotedAuthor === "Bạn" || quotedAuthor === "bạn" || quotedAuthor === myName
                const replyLabel = isMe
                  ? isQuotedMe
                    ? "Bạn đã trả lời chính mình"
                    : `Bạn đã trả lời ${getShortName(quotedAuthor)}`
                  : isQuotedMe
                  ? `${getShortName(partnerName)} đã trả lời bạn`
                  : `${getShortName(partnerName)} đã trả lời ${getShortName(quotedAuthor)}`

                return (
                  <div className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    <div
                      className={`flex items-end gap-1.5 ${
                        compact ? "max-w-[85%]" : "max-w-[85%] sm:max-w-[70%]"
                      } ${isMe ? "flex-row-reverse" : "flex-row"}`}
                    >
                      {!isMe &&
                        (isLastInGroup ? (
                          <div
                            className={`${
                              compact ? "size-6" : "size-7"
                            } rounded-full overflow-hidden shrink-0 bg-slate-100 mb-0.5 border border-slate-200/60 self-end`}
                          >
                            <img
                              src={partnerProfile.avatar_url || defaultPartnerAvatar}
                              alt=""
                              className="size-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className={`${compact ? "w-6" : "w-7"} shrink-0`} />
                        ))}

                      <div
                        className={`flex flex-col ${
                          isMe ? "items-end" : "items-start"
                        } max-w-full`}
                      >
                        {/* Messenger Reply Header with curved arrow */}
                        <div
                          className={`flex items-center gap-1 mb-1 px-1 ${
                            compact ? "text-[11px]" : "text-[12px]"
                          } text-[#65676B] select-none ${
                            isMe ? "justify-end" : "justify-start"
                          }`}
                        >
                          <MessengerReplyIcon
                            className={`${compact ? "size-2.5" : "size-3"} shrink-0 text-[#65676B]`}
                          />
                          <span>{replyLabel}</span>
                        </div>

                        {/* Quoted Bubble */}
                        <div
                          className={`bg-[#E4E6EB]/80 text-[#65676B] ${
                            compact
                              ? "text-[12px] leading-[16px] px-3 pt-1.5 pb-[16px]"
                              : "text-[13px] leading-[18px] px-3.5 pt-2 pb-[16px]"
                          } max-w-full break-words select-none ${
                            isMe
                              ? `${compact ? "rounded-[16px]" : "rounded-[18px]"} rounded-br-[4px] self-end`
                              : `${compact ? "rounded-[16px]" : "rounded-[18px]"} rounded-bl-[4px] self-start`
                          }`}
                        >
                          {quotedText}
                        </div>

                        {/* Main Reply Bubble + Reply Button (positioned tightly beside the bubble) */}
                        <div
                          className={`relative z-10 ${
                            compact ? "-mt-[12px]" : "-mt-[14px]"
                          } flex items-center gap-1 max-w-full ${
                            isMe ? "flex-row-reverse self-end" : "flex-row self-start"
                          }`}
                        >
                          <div
                            className={`${
                              compact
                                ? "px-3 py-1.5 text-[13.5px] leading-[18px]"
                                : "px-3.5 py-2 text-[15px] leading-[20px]"
                            } break-words ${
                              isMe
                                ? `bg-zinc-900 text-white ${
                                    compact ? "rounded-[16px]" : "rounded-[18px]"
                                  } ${!isLastInGroup ? "rounded-br-[4px]" : ""} shadow-xs`
                                : `bg-zinc-100 text-zinc-900 ${
                                    compact ? "rounded-[16px]" : "rounded-[18px]"
                                  } ${!isLastInGroup ? "rounded-bl-[4px]" : ""} shadow-xs ring-1 ring-zinc-200/60`
                            }`}
                          >
                            {actualText}
                          </div>

                          <button
                            type="button"
                            onClick={() => onReply({ ...msg, content: actualText })}
                            className={`opacity-0 group-hover:opacity-100 ${
                              compact ? "size-6" : "size-7"
                            } rounded-full flex items-center justify-center text-[#65676B] hover:bg-black/5 hover:text-[#050505] transition-opacity duration-150 shrink-0 cursor-pointer select-none`}
                            title="Trả lời"
                          >
                            <MessengerReplyIcon className={compact ? "size-3" : "size-3.5"} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isVeryLastMessage && isMe && (
                      <span
                        className={`${
                          compact ? "text-[10px]" : "text-[11px]"
                        } text-[#65676B] text-right mt-1 mr-1 select-none`}
                      >
                        Đã gửi lúc {timeStr}
                      </span>
                    )}
                  </div>
                )
              })()}

            {/* REGULAR TEXT MESSAGE */}
            {!isReply &&
              (() => (
                <div className={`group flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                  <div
                    className={`flex items-end gap-1.5 ${
                      compact ? "max-w-[85%]" : "max-w-[85%] sm:max-w-[70%]"
                    } ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isMe &&
                      (isLastInGroup ? (
                        <div
                          className={`${
                            compact ? "size-6" : "size-7"
                          } rounded-full overflow-hidden shrink-0 bg-slate-100 mb-0.5 border border-slate-200/60 self-end`}
                        >
                          <img
                            src={partnerProfile.avatar_url || defaultPartnerAvatar}
                            alt=""
                            className="size-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className={`${compact ? "w-6" : "w-7"} shrink-0`} />
                      ))}

                    <div
                      className={`${
                        compact
                          ? "px-3 py-1.5 text-[13.5px] leading-[18px]"
                          : "px-3.5 py-2 text-[15px] leading-[20px]"
                      } break-words ${radiusClass} ${
                        isMe ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900 ring-1 ring-zinc-200/60"
                      }`}
                    >
                      {msg.content}
                    </div>

                    {/* Reply hover action */}
                    <button
                      type="button"
                      onClick={() => onReply(msg)}
                      className={`opacity-0 group-hover:opacity-100 ${
                        compact ? "size-6" : "size-7"
                      } rounded-full flex items-center justify-center text-[#65676B] hover:bg-black/5 hover:text-[#050505] transition-opacity duration-150 shrink-0 self-center cursor-pointer select-none ${
                        isMe ? "mr-1" : "ml-1"
                      }`}
                      title="Trả lời"
                    >
                      <MessengerReplyIcon className={compact ? "size-3" : "size-3.5"} />
                    </button>
                  </div>

                  {isVeryLastMessage && isMe && (
                    <span
                      className={`${
                        compact ? "text-[10px]" : "text-[11px]"
                      } text-[#65676B] text-right mt-1 mr-1 select-none`}
                    >
                      Đã gửi lúc {timeStr}
                    </span>
                  )}
                </div>
              ))()}
          </div>
        )
      })}
      <div ref={messagesEndRef} />
    </div>
  )
}
