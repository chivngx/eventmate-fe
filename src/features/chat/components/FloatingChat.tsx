"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { supabase } from "@/lib/supabase"
import { Send, User, ArrowLeft, X } from "lucide-react"
import { MessageIcon } from "@/components/icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import type { ChatItem, Message, ChatPartnerProfile } from "../types"
import { formatReplyContent, parseReplyContent, formatTimeAgo } from "../utils/chatHelpers"
import ChatMessageList from "./ChatMessageList"
import ChatReplyBanner from "./ChatReplyBanner"
import { cn } from "@/lib/utils"
import { isOrganizerRole } from "@/lib/auth-constants"

export default function FloatingChat({ user, role }: { user: any; role: string }) {
    const isOrg = isOrganizerRole(role)
    const [isOpen, setIsOpen] = useState(false)
    const [chats, setChats] = useState<ChatItem[]>([])
    const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [replyingMessage, setReplyingMessage] = useState<Message | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    const totalUnreadCount = useMemo(() => {
        return chats.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0)
    }, [chats])

    // Fetch list of chats
    const fetchChats = async () => {
        if (!user) return

        const { data, error } = await supabase
            .from("chats")
            .select(`
                id, event_id, student_id, organizer_id, created_at,
                events (title),
                student_profile:profiles!student_id (id, full_name, avatar_url),
                organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
            `)
            .or(`student_id.eq.${user.id},organizer_id.eq.${user.id}`)
            .order("created_at", { ascending: false })

        if (!error && data) {
            const chatIds = data.map((item: any) => item.id)
            let existingChatIdsWithMessages = new Set<string>()
            const messagesMap: Record<string, { content: string; created_at: string | null }> = {}
            const unreadMap: Record<string, number> = {}

            if (chatIds.length > 0) {
                const { data: msgData } = await supabase
                    .from("messages")
                    .select("chat_id, content, created_at, is_read, sender_id")
                    .in("chat_id", chatIds)
                    .order("created_at", { ascending: false })

                if (msgData) {
                    existingChatIdsWithMessages = new Set(msgData.map((m: any) => m.chat_id))
                    for (const msg of msgData) {
                        if (msg.chat_id && !messagesMap[msg.chat_id]) {
                            messagesMap[msg.chat_id] = { content: msg.content, created_at: msg.created_at }
                        }
                        if (msg.chat_id && !msg.is_read && msg.sender_id !== user.id) {
                            unreadMap[msg.chat_id] = (unreadMap[msg.chat_id] || 0) + 1
                        }
                    }
                }
            }

            const formattedChats = data
                .filter((item: any) => existingChatIdsWithMessages.has(item.id))
                .map((item: any) => {
                    const msg = messagesMap[item.id]
                    let displayLastMsg = ""
                    if (msg?.content) {
                        let c = msg.content
                        if (c.startsWith("__INTERVIEW_REQUEST__:")) c = "📅 Lời mời phỏng vấn"
                        else if (c.startsWith("__REPLY__:")) {
                            const parts = c.split(":::")
                            c = parts[2] || "Tin nhắn trả lời"
                        } else if (c.startsWith("__VOICE__:")) c = "🎤 Tin nhắn thoại"
                        displayLastMsg = c
                    }

                    return {
                        ...item,
                        partnerId: item.organizer_id === user.id ? item.student_id : item.organizer_id,
                        allEvents: [{ chatId: item.id, eventId: item.event_id, eventTitle: item.events?.title || "Sự kiện chung" }],
                        allChatIds: [item.id],
                        events: Array.isArray(item.events) ? item.events[0] || { title: "Sự kiện chung" } : item.events || { title: "Sự kiện chung" },
                        student_profile: Array.isArray(item.student_profile) ? item.student_profile[0] || { id: "", full_name: "Người tham gia", avatar_url: "" } : item.student_profile || { id: "", full_name: "Người tham gia", avatar_url: "" },
                        organizer_profile: Array.isArray(item.organizer_profile) ? item.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" } : item.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" },
                        lastMessage: displayLastMsg,
                        lastMessageTime: msg?.created_at || item.created_at,
                        unreadCount: unreadMap[item.id] || 0,
                    }
                }) as ChatItem[]

            // Sort by most recent interaction first
            formattedChats.sort((a, b) => {
                const timeA = new Date(a.lastMessageTime || a.created_at).getTime()
                const timeB = new Date(b.lastMessageTime || b.created_at).getTime()
                return timeB - timeA
            })

            setChats(formattedChats)
        }
    }

    useEffect(() => {
        if (user) {
            fetchChats()
        }
    }, [user, role])

    useEffect(() => {
        if (isOpen && user) {
            fetchChats()
        }
    }, [isOpen])

    useEffect(() => {
        const handleMsgsRead = () => {
            fetchChats()
        }
        window.addEventListener("messages-read", handleMsgsRead)
        return () => {
            window.removeEventListener("messages-read", handleMsgsRead)
        }
    }, [user])

    const activeChatRef = useRef<ChatItem | null>(null)
    useEffect(() => {
        activeChatRef.current = activeChat
    }, [activeChat])

    // Fetch messages of active chat
    useEffect(() => {
        if (activeChat) {
            const fetchMessages = async () => {
                const { data, error } = await supabase
                    .from("messages")
                    .select("*")
                    .eq("chat_id", activeChat.id)
                    .order("created_at", { ascending: true })

                if (!error && data) {
                    setMessages(data as Message[])
                    scrollToBottom()

                    if (user?.id) {
                        const { error: updateErr } = await supabase
                            .from("messages")
                            .update({ is_read: true })
                            .eq("chat_id", activeChat.id)
                            .neq("sender_id", user.id)
                            .eq("is_read", false)
                        if (!updateErr) {
                            window.dispatchEvent(new CustomEvent("messages-read"))
                        }
                    }
                }
            }

            fetchMessages()
        }
    }, [activeChat?.id])

    // Global realtime subscription for user messages
    useEffect(() => {
        if (!user) return

        const channel = supabase
            .channel(`floating-chat-user-${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages"
                },
                async (payload) => {
                    const newMsg = payload.new as Message
                    if (!newMsg || !newMsg.chat_id) return

                    let preview = newMsg.content
                    if (preview.startsWith("__INTERVIEW_REQUEST__:")) preview = "📅 Lời mời phỏng vấn"
                    else if (preview.startsWith("__REPLY__:")) {
                        const parts = preview.split(":::")
                        preview = parts[2] || "Tin nhắn trả lời"
                    } else if (preview.startsWith("__VOICE__:")) preview = "🎤 Tin nhắn thoại"

                    const currentActive = activeChatRef.current
                    const isActiveMessage = Boolean(currentActive && (currentActive.id === newMsg.chat_id || currentActive.allChatIds.includes(newMsg.chat_id)))

                    // 1. If currently in this active chat, append message and scroll
                    if (isActiveMessage) {
                        setMessages((prev) => {
                            if (prev.some((m) => m.id === newMsg.id)) return prev
                            return [...prev, newMsg]
                        })
                        scrollToBottom()

                        if (newMsg.sender_id !== user.id) {
                            const { error: updateErr } = await supabase
                                .from("messages")
                                .update({ is_read: true })
                                .eq("id", newMsg.id)
                            if (!updateErr) {
                                window.dispatchEvent(new CustomEvent("messages-read"))
                            }
                        }
                    }

                    // 2. Update conversation list: update lastMessage, timestamp, and MOVE TO TOP!
                    setChats((prev) => {
                        const index = prev.findIndex((c) => c.id === newMsg.chat_id || c.allChatIds.includes(newMsg.chat_id!))
                        if (index === -1) {
                            fetchChats()
                            return prev
                        }

                        const targetChat = prev[index]
                        const isRead = isActiveMessage || newMsg.sender_id === user.id
                        const updatedChat: ChatItem = {
                            ...targetChat,
                            lastMessage: preview,
                            lastMessageTime: newMsg.created_at || new Date().toISOString(),
                            unreadCount: isRead ? 0 : (targetChat.unreadCount || 0) + 1,
                        }

                        return [updatedChat, ...prev.filter((_, i) => i !== index)]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user?.id])

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }, 100)
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !activeChat || !user || sending) return

        setSending(true)
        const contentToSend = newMessage
        let payloadContent = contentToSend

        if (replyingMessage) {
            const partner = getPartnerProfile(activeChat)
            const senderName = replyingMessage.sender_id === user.id ? "Bạn" : partner.full_name
            const cleanReplyingContent = replyingMessage.content.startsWith("__REPLY__:")
                ? parseReplyContent(replyingMessage.content).actualText
                : replyingMessage.content
            payloadContent = formatReplyContent(senderName || "Đối tác", cleanReplyingContent, contentToSend)
        }

        setNewMessage("")
        setReplyingMessage(null)

        const { data, error } = await supabase
            .from("messages")
            .insert([
                {
                    chat_id: activeChat.id,
                    sender_id: user.id,
                    content: payloadContent
                }
            ])
            .select()
            .single()

        setSending(false)

        if (error) {
            console.error("[FloatingChat] send error:", error)
            setNewMessage(contentToSend)
        } else if (data) {
            setMessages((prev) => [...prev, data as Message])
            // Update preview in chat list and move conversation to top
            setChats((prev) => {
                const index = prev.findIndex((c) => c.id === activeChat.id)
                if (index === -1) return prev
                const updatedChat: ChatItem = {
                    ...prev[index],
                    lastMessage: contentToSend,
                    lastMessageTime: data.created_at || new Date().toISOString(),
                    unreadCount: 0,
                }
                return [updatedChat, ...prev.filter((_, i) => i !== index)]
            })
            scrollToBottom()
        }
    }

    const getPartnerProfile = (chat: ChatItem): ChatPartnerProfile => {
        if (!chat) return { id: "", full_name: "Người dùng", avatar_url: "" }
        if (user?.id) {
            if (chat.organizer_id === user.id) return chat.student_profile
            if (chat.student_id === user.id) return chat.organizer_profile
        }
        return isOrg ? chat.student_profile : chat.organizer_profile
    }

    if (!user) return null

    return (
        <div className="fixed bottom-6 right-6 z-50 font-['Inter',sans-serif] flex flex-col items-end">
            {/* Messenger Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="w-[min(92vw,390px)] h-[540px] bg-white border border-slate-200/90 rounded-[20px] shadow-[0_16px_48px_rgba(0,0,0,0.18)] flex flex-col mb-3.5 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-[#222222] text-white px-4 py-3.5 flex items-center justify-between shadow-xs shrink-0">
                            <div className="flex items-center gap-2.5 min-w-0">
                                {activeChat && (
                                    <button
                                        onClick={() => setActiveChat(null)}
                                        aria-label="Quay lại danh sách"
                                        className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors focus-visible:outline-none cursor-pointer"
                                    >
                                        <ArrowLeft className="size-4.5" />
                                    </button>
                                )}
                                {activeChat ? (
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <Avatar className="size-9 border-2 border-white/40 shrink-0">
                                            <AvatarImage src={getPartnerProfile(activeChat).avatar_url || undefined} />
                                            <AvatarFallback className="bg-white/20 text-white font-bold text-xs">
                                                {getPartnerProfile(activeChat).full_name?.charAt(0).toUpperCase() || <User className="size-4" />}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <h4 className="font-semibold text-sm leading-tight truncate">
                                                {getPartnerProfile(activeChat).full_name}
                                            </h4>
                                            <p className="text-[11px] text-white/75 font-normal">
                                                Trực tuyến
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 rounded-full bg-white/15 flex items-center justify-center">
                                            <MessageIcon className="size-4 text-white" />
                                        </div>
                                        <h3 className="font-semibold text-[15px] leading-none">Tin nhắn EventMate</h3>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Đóng"
                                className="p-1.5 hover:bg-white/15 rounded-full text-white transition-colors focus-visible:outline-none cursor-pointer"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-hidden flex flex-col bg-white">
                            {activeChat ? (
                                <>
                                    {/* Chat Room Messages (Messenger Style Reused Component) */}
                                    <div className="flex-1 overflow-y-auto px-3 py-3">
                                        <ChatMessageList
                                            messages={messages}
                                            currentUserId={user.id}
                                            partnerProfile={getPartnerProfile(activeChat)}
                                            currentUserProfile={user.user_metadata}
                                            onReply={(msg) => setReplyingMessage(msg)}
                                            messagesEndRef={messagesEndRef}
                                            compact={true}
                                        />
                                    </div>

                                    {/* Reused Reply Banner */}
                                    <ChatReplyBanner
                                        replyingMessage={replyingMessage}
                                        onCancel={() => setReplyingMessage(null)}
                                        compact={true}
                                    />

                                    {/* Form Input */}
                                    <form
                                        onSubmit={handleSendMessage}
                                        className="p-2.5 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0"
                                    >
                                        <input
                                            type="text"
                                            placeholder="Nhập tin nhắn..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            className="flex-1 h-9 bg-slate-50 hover:bg-slate-100/60 focus:bg-white rounded-[16px] px-3.5 text-[13px] font-normal text-[#222222] placeholder:text-[#A5A5A5] outline-none border border-slate-200 transition-all focus:border-[#222222] focus:ring-2 focus:ring-[#222222]/15"
                                        />
                                        <Button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            aria-label="Gửi tin nhắn"
                                            className="rounded-full disabled:opacity-40 text-white size-9 shrink-0 p-0 flex items-center justify-center shadow-xs cursor-pointer focus-visible:outline-none transition-all bg-[#222222] hover:bg-black active:bg-black"
                                        >
                                            <Send className="size-3.5" />
                                        </Button>
                                    </form>
                                </>
                            ) : (
                                /* Chat List */
                                <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                                    {chats.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                            <div className="size-12 rounded-full flex items-center justify-center mb-3 bg-slate-100 text-[#222222]">
                                                <MessageIcon className="size-6" />
                                            </div>
                                            <h4 className="text-[13px] font-semibold text-[#222222] mb-1">Chưa có cuộc trò chuyện nào</h4>
                                            <p className="text-[11px] text-[#757575] max-w-[220px]">
                                                Hội thoại với Ban tổ chức sẽ hiển thị tại đây khi bạn ứng tuyển sự kiện.
                                            </p>
                                        </div>
                                    ) : (
                                        chats.map((chat) => {
                                            const partner = getPartnerProfile(chat)
                                            const hasUnread = (chat.unreadCount || 0) > 0
                                            return (
                                                <button
                                                    key={chat.id}
                                                    onClick={() => {
                                                        setActiveChat(chat)
                                                        setChats((prev) =>
                                                            prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
                                                        )
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 rounded-[14px] bg-white hover:bg-slate-50 hover:border-slate-200 transition-all text-left border border-slate-100 shadow-2xs group cursor-pointer"
                                                >
                                                    <div className="relative shrink-0">
                                                        <Avatar className="size-10 border border-slate-200/80 shadow-xs">
                                                            <AvatarImage src={partner.avatar_url || undefined} />
                                                            <AvatarFallback className="bg-slate-100 text-[#222222] font-bold text-xs">
                                                                {partner.full_name?.charAt(0).toUpperCase() || <User className="size-4" />}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-1 mb-0.5">
                                                            <h4 className={cn("text-[13px] truncate group-hover:text-black transition-colors", hasUnread ? "font-bold text-black" : "font-semibold text-[#222222]")}>
                                                                {partner.full_name}
                                                            </h4>
                                                            <span className={cn("text-[10px] shrink-0", hasUnread ? "font-semibold text-[#222222]" : "text-[#757575] font-normal")}>
                                                                {formatTimeAgo(chat.lastMessageTime || chat.created_at)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-1.5">
                                                            <p className={cn("text-[11px] truncate flex-1", hasUnread ? "font-semibold text-black" : "text-[#757575]")}>
                                                                {chat.lastMessage || "Bắt đầu cuộc trò chuyện..."}
                                                            </p>
                                                            {hasUnread && (
                                                                <span className="size-2 rounded-full bg-[#222222] shrink-0" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            )
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Messenger Circle Bubble Button */}
            <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Trò chuyện"
                aria-pressed={isOpen}
                className="relative size-[56px] text-white rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 focus-visible:outline-none bg-[#222222] hover:bg-black shadow-[0_8px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.45)] focus-visible:ring-2 focus-visible:ring-[#222222]/40"
                title="Trò chuyện"
            >
                {/* Unread count badge on floating icon when closed */}
                {!isOpen && totalUnreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1.5 bg-[#EF4444] text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm pointer-events-none z-10 leading-none">
                        {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </span>
                )}

                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                        >
                            <X className="size-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="relative"
                        >
                            <MessageIcon className="size-6" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
