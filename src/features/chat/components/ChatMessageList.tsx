import React from "react"
import { Play, Pause, Calendar, Clock, Video, Check, X } from "lucide-react"
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
  playingVoiceId?: string | null
  onToggleVoice?: (msgId: string) => void
  messagesEndRef?: React.RefObject<HTMLDivElement | null>
  compact?: boolean
  showHeader?: boolean
  interviews?: Record<string, any>
  onUpdateInterviewStatus?: (interviewId: string, status: "accepted" | "rejected") => void
  role?: string | null
}

export default function ChatMessageList({
  messages,
  currentUserId,
  partnerProfile,
  currentUserProfile,
  onReply,
  playingVoiceId,
  onToggleVoice,
  messagesEndRef,
  compact = false,
  showHeader = true,
  interviews,
  onUpdateInterviewStatus,
  role
}: ChatMessageListProps) {
  const myName = currentUserProfile?.full_name || "Bạn"
  const partnerName = partnerProfile.full_name || "Người dùng"
  const defaultPartnerAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    partnerName
  )}&background=0084FF&color=fff`

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

        const isInterview = msg.content.startsWith("__INTERVIEW_REQUEST__:")
        const isVoice = msg.is_voice || msg.content.startsWith("__VOICE__:")
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

            {/* INTERVIEW INVITATION CARD */}
            {isInterview &&
              (() => {
                const interviewId = msg.content.substring("__INTERVIEW_REQUEST__:".length)
                const interview = interviews ? interviews[interviewId] : null

                if (!interview) {
                  return (
                    <div className="flex justify-center py-2">
                      <div className="rounded-[12px] bg-[#f9f9f9] border border-[#ededed] px-3 py-1.5 text-xs text-[#757575]">
                        Đang tải thông tin phỏng vấn...
                      </div>
                    </div>
                  )
                }

                const isStudent = role === "student"
                return (
                  <div className="flex justify-center py-2">
                    <div className="w-full max-w-md rounded-[16px] border border-[#ededed] bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3 border-b border-[#ededed] pb-3">
                        <div className="rounded-[8px] bg-[#eff5ff] p-2 text-[#005DDC]">
                          <Calendar className="size-4" />
                        </div>
                        <div>
                          <h4 className="text-[14px] font-semibold text-[#282828]">Lời mời phỏng vấn</h4>
                          <p className="text-[11px] text-[#757575]">Hẹn lịch trực tuyến</p>
                        </div>
                      </div>

                      <div className="space-y-2 py-3 text-[12px]">
                        <div>
                          <span className="block text-[#757575] text-[11px]">Chủ đề</span>
                          <span className="font-medium text-[#222]">{interview.title}</span>
                        </div>
                        <div>
                          <span className="block text-[#757575] text-[11px]">Thời gian</span>
                          <span className="flex items-center gap-1.5 font-medium text-[#222]">
                            <Clock className="size-3.5 text-[#005DDC]" />
                            {new Date(interview.scheduled_at).toLocaleString("vi-VN", {
                              dateStyle: "medium",
                              timeStyle: "short"
                            })}
                          </span>
                        </div>
                        {interview.meeting_link && (
                          <div>
                            <span className="block text-[#757575] text-[11px]">Link phòng họp</span>
                            <a
                              href={
                                interview.meeting_link.startsWith("http")
                                  ? interview.meeting_link
                                  : `https://${interview.meeting_link}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-medium text-[#005DDC] hover:underline"
                            >
                              <Video className="size-3.5" />
                              Tham gia cuộc gọi
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-[#ededed] pt-3">
                        {interview.status === "pending" ? (
                          isStudent ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateInterviewStatus &&
                                  onUpdateInterviewStatus(interview.id, "accepted")
                                }
                                className="flex-1 rounded-[8px] bg-[#005DDC] py-2 text-[12px] font-medium text-white hover:bg-[#004eb7] flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Check className="size-3.5" />
                                Đồng ý
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateInterviewStatus &&
                                  onUpdateInterviewStatus(interview.id, "rejected")
                                }
                                className="flex-1 rounded-[8px] border border-red-200 py-2 text-[12px] font-medium text-[#dc0000] hover:bg-red-50 flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <X className="size-3.5" />
                                Từ chối
                              </button>
                            </div>
                          ) : (
                            <div className="rounded-[8px] bg-[#f9f9f9] py-2 text-center text-[12px] font-medium text-[#757575]">
                              Đang chờ phản hồi từ người tham gia
                            </div>
                          )
                        ) : interview.status === "accepted" ? (
                          <div className="flex items-center justify-center gap-1.5 rounded-[8px] bg-emerald-50 text-emerald-700 py-2 text-[12px] font-medium">
                            <Check className="size-3.5" />
                            Đã chấp nhận lịch hẹn
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1.5 rounded-[8px] bg-red-50 text-red-600 py-2 text-[12px] font-medium">
                            <X className="size-3.5" />
                            Lịch hẹn bị từ chối
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })()}

            {/* VOICE MESSAGE */}
            {isVoice && (
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
                    className={`flex items-center gap-2 px-3 py-2 ${radiusClass} ${
                      isMe ? "bg-[#0084FF] text-white" : "bg-[#F0F2F5] text-[#050505]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onToggleVoice && onToggleVoice(msg.id)}
                      className={`size-7 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95 cursor-pointer ${
                        isMe
                          ? "bg-white/20 text-white hover:bg-white/30"
                          : "bg-black/10 text-slate-700 hover:bg-black/15"
                      }`}
                    >
                      {playingVoiceId === msg.id ? (
                        <Pause className="size-3.5" />
                      ) : (
                        <Play className="size-3.5 ml-0.5" />
                      )}
                    </button>
                    <div className="h-[18px] w-[130px] sm:w-[170px]">
                      <img
                        src="/images/chat-record-gray.svg"
                        alt="Audio waveform"
                        className={`size-full object-contain ${
                          isMe ? "brightness-0 invert" : "opacity-70"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-normal shrink-0 ${
                        isMe ? "text-blue-100" : "text-[#65676B]"
                      }`}
                    >
                      {timeStr}
                    </span>
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
                                ? `bg-[#0084FF] text-white ${
                                    compact ? "rounded-[16px]" : "rounded-[18px]"
                                  } ${!isLastInGroup ? "rounded-br-[4px]" : ""} shadow-xs`
                                : `bg-[#F0F2F5] text-[#050505] ${
                                    compact ? "rounded-[16px]" : "rounded-[18px]"
                                  } ${!isLastInGroup ? "rounded-bl-[4px]" : ""} shadow-xs ring-1 ring-white/80`
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
            {!isVoice &&
              !isReply &&
              !isInterview &&
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
                        isMe ? "bg-[#0084FF] text-white" : "bg-[#F0F2F5] text-[#050505]"
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
