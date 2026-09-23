"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import { useParams, useNavigate, useSearchParams } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import { isOrganizerRole } from "@/lib/auth-constants"
import {
  Calendar,
  Send,
  MessageSquare,
  ArrowLeft,
  Check,
  X,
  Star,
  Trash2,
  Lock,
} from "lucide-react"
import { cn } from "@/lib/utils"
import InterviewModal from "./components/InterviewModal"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import type { EventContextItem, ChatItem, Message, ChatProps, ChatPartnerProfile } from "./types"
export type { EventContextItem, ChatItem, Message, ChatProps, ChatPartnerProfile }
import {
  formatTimeAgo,
  MessengerReplyIcon,
  formatReplyContent,
  parseReplyContent
} from "./utils/chatHelpers"
import ChatMessageList from "./components/ChatMessageList"
import ChatReplyBanner from "./components/ChatReplyBanner"

export default function Chat({ embedded = false, initialChatId = null }: ChatProps = {}) {
  const { id: routeChatId } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const queryOrganizerId = searchParams.get("organizerId")
  const queryEventId = searchParams.get("eventId")
  const targetChatId = initialChatId || routeChatId
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { user, profile, role, isPremium, loading: authLoading } = useUser()
  const currentUser = user

  const [loading, setLoading] = useState(true)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [selectedChatId, setSelectedChatId] = useState<string>("")
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchTopQuery, setSearchTopQuery] = useState("")

  // Interactive UI states
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null)
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null)
  const [isFavoriteChat, setIsFavoriteChat] = useState(false)
  const [starredPartnerIds, setStarredPartnerIds] = useState<string[]>([])
  const [showMoreMenu, setShowMoreMenu] = useState(false)

  useEffect(() => {
    if (!currentUser?.id) return
    try {
      const stored = localStorage.getItem(`eventmate_starred_chats_${currentUser.id}`)
      if (stored) {
        setStarredPartnerIds(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Lỗi đọc starred chats:", e)
    }
  }, [currentUser?.id])

  useEffect(() => {
    if (activeChat) {
      setIsFavoriteChat(starredPartnerIds.includes(activeChat.partnerId))
    } else {
      setIsFavoriteChat(false)
    }
  }, [activeChat?.partnerId, starredPartnerIds])

  // Pagination
  const [messagesLimit, setMessagesLimit] = useState(20)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  // Interview state
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [interviewTitle, setInterviewTitle] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewLink, setInterviewLink] = useState("")
  const [interviews, setInterviews] = useState<Record<string, any>>({})
  const [creatingInterview, setCreatingInterview] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const isFirstLoadRef = useRef(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    isFirstLoadRef.current = true
  }, [activeChat?.partnerId])

  useEffect(() => {
    if (isFirstLoadRef.current && messages.length > 0) {
      scrollToBottom("auto")
      isFirstLoadRef.current = false
    }
  }, [messages])

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      navigate("/login")
      return
    }
    setLoading(false)
  }, [user, authLoading, navigate])

  const fetchChats = async () => {
    if (!currentUser) return

    const isOrg = isOrganizerRole(role) || isOrganizerRole(profile?.role)

    const { data, error } = await supabase
      .from("chats")
      .select(`
        id, event_id, student_id, organizer_id, created_at,
        events (id, title),
        student_profile:profiles!student_id (id, full_name, avatar_url),
        organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
      `)
      .or(`student_id.eq.${currentUser?.id},organizer_id.eq.${currentUser?.id}`)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Lỗi fetchChats:", error)
      return
    }

    if (data) {
      const allRawChatIds = data.map((item: any) => item.id)
      const messagesMap: Record<string, { content: string; created_at: string | null }> = {}
      const unreadMap: Record<string, number> = {}

      if (allRawChatIds.length > 0) {
        const { data: latestMsgs } = await supabase
          .from("messages")
          .select("chat_id, content, created_at, is_read, sender_id")
          .in("chat_id", allRawChatIds)
          .order("created_at", { ascending: false })

        if (latestMsgs) {
          for (const msg of latestMsgs) {
            if (msg.chat_id && !messagesMap[msg.chat_id]) {
              messagesMap[msg.chat_id] = { content: msg.content, created_at: msg.created_at }
            }
            if (msg.chat_id && !msg.is_read && msg.sender_id !== currentUser?.id) {
              unreadMap[msg.chat_id] = (unreadMap[msg.chat_id] || 0) + 1
            }
          }
        }
      }

      // Group raw chat records by partner ID
      const partnerGroups = new Map<
        string,
        {
          partnerId: string
          chats: any[]
          newestMessage?: { content: string; created_at: string | null }
        }
      >()

      data.forEach((item: any) => {
        const partnerId = item.organizer_id === currentUser?.id ? item.student_id : item.organizer_id
        if (!partnerGroups.has(partnerId)) {
          partnerGroups.set(partnerId, {
            partnerId,
            chats: [],
          })
        }
        const group = partnerGroups.get(partnerId)!
        group.chats.push(item)

        const msg = messagesMap[item.id]
        if (msg) {
          if (
            !group.newestMessage ||
            (msg.created_at && (!group.newestMessage.created_at || new Date(msg.created_at).getTime() > new Date(group.newestMessage.created_at).getTime()))
          ) {
            group.newestMessage = msg
          }
        }
      })

      const groupedChats: ChatItem[] = Array.from(partnerGroups.values()).map((group) => {
        const primaryChat = group.chats[0]
        const allChatIds = group.chats.map((c) => c.id)

        // Deduplicate events across chats
        const allEvents: EventContextItem[] = []
        const seenEventIds = new Set<string>()

        group.chats.forEach((c) => {
          const ev = Array.isArray(c.events) ? c.events[0] : c.events
          const eventId = c.event_id || ev?.id || ""
          const eventTitle = ev?.title || "Sự kiện chung"
          if (!seenEventIds.has(eventId)) {
            seenEventIds.add(eventId)
            allEvents.push({
              chatId: c.id,
              eventId,
              eventTitle,
            })
          }
        })

        const studentProf = Array.isArray(primaryChat.student_profile)
          ? primaryChat.student_profile[0] || { id: "", full_name: "Người tham gia", avatar_url: "" }
          : primaryChat.student_profile || { id: "", full_name: "Người tham gia", avatar_url: "" }

        const orgProf = Array.isArray(primaryChat.organizer_profile)
          ? primaryChat.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" }
          : primaryChat.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" }

        let displayLastMsg = ""
        if (group.newestMessage) {
          let c = group.newestMessage.content
          if (c.startsWith("__INTERVIEW_REQUEST__:")) c = "📅 Lời mời phỏng vấn"
          else if (c.startsWith("__REPLY__:")) {
            const parts = c.split(":::")
            c = parts[2] || "Tin nhắn trả lời"
          } else if (c.startsWith("__VOICE__:")) c = "🎤 Tin nhắn thoại"
          displayLastMsg = c
        }

        const totalUnread = group.chats.reduce((acc, c) => acc + (unreadMap[c.id] || 0), 0)

        return {
          id: primaryChat.id,
          partnerId: group.partnerId,
          event_id: primaryChat.event_id,
          student_id: primaryChat.student_id,
          organizer_id: primaryChat.organizer_id,
          created_at: primaryChat.created_at,
          events: {
            title: allEvents[0]?.eventTitle || "Trực tuyến",
          },
          allEvents,
          allChatIds,
          student_profile: studentProf,
          organizer_profile: orgProf,
          lastMessage: displayLastMsg,
          lastMessageTime: group.newestMessage?.created_at || primaryChat.created_at,
          unreadCount: totalUnread,
        }
      })

      // Sort conversations so partner with most recent interaction appears first
      groupedChats.sort((a, b) => {
        const timeA = new Date(a.lastMessageTime || a.created_at).getTime()
        const timeB = new Date(b.lastMessageTime || b.created_at).getTime()
        return timeB - timeA
      })

      // Filter out conversations that don't have any messages yet,
      // UNLESS the conversation is explicitly targeted by targetChatId or queryOrganizerId
      const visibleChats = groupedChats.filter((c) => {
        const hasMessage = !!c.lastMessage
        const isTargeted = Boolean(
          (targetChatId && (c.id === targetChatId || c.allChatIds.includes(targetChatId))) ||
          (queryOrganizerId && (c.partnerId === queryOrganizerId || c.organizer_id === queryOrganizerId))
        )
        return hasMessage || isTargeted
      })

      setChats(visibleChats)

      let resolvedChat: ChatItem | null = null
      let initialSelectedChatId = ""

      if (targetChatId) {
        const found = groupedChats.find(
          (c) => c.id === targetChatId || c.allChatIds.includes(targetChatId)
        )
        if (found) {
          resolvedChat = found
          initialSelectedChatId = targetChatId
        } else {
          const { data: directChat } = await supabase
            .from("chats")
            .select(`
              id, event_id, student_id, organizer_id, created_at,
              events (id, title),
              student_profile:profiles!student_id (id, full_name, avatar_url),
              organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
            `)
            .eq("id", targetChatId)
            .maybeSingle()

          if (directChat) {
            const ev = Array.isArray(directChat.events) ? directChat.events[0] : directChat.events
            const eventTitle = ev?.title || "Sự kiện chung"
            const partnerId = (directChat.organizer_id === currentUser?.id ? directChat.student_id : directChat.organizer_id) || (isOrg ? directChat.student_id : directChat.organizer_id) || ""
            resolvedChat = {
              id: directChat.id,
              partnerId,
              event_id: directChat.event_id || "",
              student_id: directChat.student_id || "",
              organizer_id: directChat.organizer_id || "",
              created_at: directChat.created_at || "",
              events: { title: eventTitle },
              allEvents: [{ chatId: directChat.id, eventId: directChat.event_id || "", eventTitle }],
              allChatIds: [directChat.id],
              student_profile: Array.isArray(directChat.student_profile)
                ? directChat.student_profile[0] || { id: "", full_name: "Người tham gia", avatar_url: "" }
                : directChat.student_profile || { id: "", full_name: "Người tham gia", avatar_url: "" },
              organizer_profile: Array.isArray(directChat.organizer_profile)
                ? directChat.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" }
                : directChat.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" },
            }
            initialSelectedChatId = directChat.id
          }
        }
      } else if (queryOrganizerId) {
        if (queryOrganizerId === currentUser.id) {
          showToast({ title: "Thông báo", message: "Bạn không thể tự nhắn tin cho chính mình.", type: "info" })
        } else {
          let found = groupedChats.find(
            (c) => c.partnerId === queryOrganizerId || c.organizer_id === queryOrganizerId
          )

          if (found) {
            resolvedChat = found
            if (queryEventId) {
              const matchEvent = found.allEvents.find((e) => e.eventId === queryEventId)
              if (matchEvent) {
                initialSelectedChatId = matchEvent.chatId
              } else {
                // Create sub-chat for this event
                const { data: newEventChat } = await supabase
                  .from("chats")
                  .insert({
                    student_id: isOrg ? queryOrganizerId : currentUser.id,
                    organizer_id: isOrg ? currentUser.id : queryOrganizerId,
                    event_id: queryEventId,
                  })
                  .select(`
                    id, event_id, student_id, organizer_id, created_at,
                    events (id, title)
                  `)
                  .maybeSingle()

                if (newEventChat) {
                  const ev = Array.isArray(newEventChat.events) ? newEventChat.events[0] : newEventChat.events
                  const eventTitle = ev?.title || "Sự kiện chung"
                  found.allEvents.push({
                    chatId: newEventChat.id,
                    eventId: queryEventId,
                    eventTitle,
                  })
                  found.allChatIds.push(newEventChat.id)
                  initialSelectedChatId = newEventChat.id
                }
              }
            }
          } else {
            // Not in groupedChats, check Supabase or create new chat
            const studentId = isOrg ? queryOrganizerId : currentUser.id
            const organizerId = isOrg ? currentUser.id : queryOrganizerId

            let { data: existingChat } = await supabase
              .from("chats")
              .select(`
                id, event_id, student_id, organizer_id, created_at,
                events (id, title),
                student_profile:profiles!student_id (id, full_name, avatar_url),
                organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
              `)
              .eq("student_id", studentId)
              .eq("organizer_id", organizerId)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle()

            if (!existingChat) {
              const { data: createdChat, error: createError } = await supabase
                .from("chats")
                .insert({
                  student_id: studentId,
                  organizer_id: organizerId,
                  event_id: queryEventId || null,
                })
                .select(`
                  id, event_id, student_id, organizer_id, created_at,
                  events (id, title),
                  student_profile:profiles!student_id (id, full_name, avatar_url),
                  organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
                `)
                .maybeSingle()

              if (!createError && createdChat) {
                existingChat = createdChat
              } else if (createError) {
                console.error("Lỗi tạo cuộc trò chuyện mới:", createError)
              }
            }

            if (existingChat) {
              const ev = Array.isArray(existingChat.events) ? existingChat.events[0] : existingChat.events
              const eventTitle = ev?.title || "Sự kiện chung"
              const partnerId = queryOrganizerId
              const studentProf = Array.isArray(existingChat.student_profile)
                ? existingChat.student_profile[0] || { id: studentId, full_name: "Người tham gia", avatar_url: "" }
                : existingChat.student_profile || { id: studentId, full_name: "Người tham gia", avatar_url: "" }
              const orgProf = Array.isArray(existingChat.organizer_profile)
                ? existingChat.organizer_profile[0] || { id: organizerId, full_name: "Ban tổ chức", avatar_url: "" }
                : existingChat.organizer_profile || { id: organizerId, full_name: "Ban tổ chức", avatar_url: "" }

              resolvedChat = {
                id: existingChat.id,
                partnerId,
                event_id: existingChat.event_id || "",
                student_id: existingChat.student_id || "",
                organizer_id: existingChat.organizer_id || "",
                created_at: existingChat.created_at || "",
                events: { title: eventTitle },
                allEvents: [{ chatId: existingChat.id, eventId: existingChat.event_id || "", eventTitle }],
                allChatIds: [existingChat.id],
                student_profile: studentProf,
                organizer_profile: orgProf,
                lastMessage: "",
                lastMessageTime: existingChat.created_at,
              }
              initialSelectedChatId = existingChat.id

              setChats((prev) => {
                if (prev.some((c) => c.partnerId === partnerId || c.id === existingChat!.id)) {
                  return prev
                }
                return [resolvedChat!, ...prev]
              })
            }
          }
        }
      }

      if (resolvedChat) {
        setActiveChat(resolvedChat)
        setSelectedChatId(initialSelectedChatId || resolvedChat.allEvents[0]?.chatId || resolvedChat.id)
      }
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchChats()
    }
  }, [currentUser, role, targetChatId, queryOrganizerId, queryEventId])

  useEffect(() => {
    if (initialChatId && chats.length > 0) {
      const found = chats.find(c => c.id === initialChatId || c.allChatIds.includes(initialChatId))
      if (found) {
        setActiveChat(found)
        setSelectedChatId(initialChatId)
      }
    }
  }, [initialChatId, chats])

  const fetchInterviews = async (chat: ChatItem) => {
    const { data, error } = await supabase
      .from("interviews")
      .select("*")
      .eq("student_id", chat.student_id)
      .eq("organizer_id", chat.organizer_id)

    if (!error && data) {
      const map: Record<string, any> = {}
      data.forEach((item) => {
        map[item.id] = item
      })
      setInterviews(map)
    }
  }

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    const doScroll = () => {
      if (messagesContainerRef.current) {
        if (behavior === "auto") {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
        } else {
          messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "smooth"
          })
        }
      }
      messagesEndRef.current?.scrollIntoView({ behavior })
    }

    doScroll()
    requestAnimationFrame(() => {
      doScroll()
      setTimeout(doScroll, 100)
    })
  }

  const fetchMessages = async (chatIds: string[], currentLimit = 20, shouldScrollBottom = false) => {
    if (!chatIds || chatIds.length === 0) {
      setMessages([])
      return
    }

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .in("chat_id", chatIds)
      .order("created_at", { ascending: false })
      .limit(currentLimit)

    if (!error && data) {
      const reversed = [...data].reverse()
      setMessages(reversed)
      setHasMoreMessages(data.length === currentLimit)
      if (shouldScrollBottom) {
        scrollToBottom("auto")
      }

      // Mark unread messages in these chats as read
      if (currentUser?.id) {
        supabase
          .from("messages")
          .update({ is_read: true })
          .in("chat_id", chatIds)
          .neq("sender_id", currentUser.id)
          .eq("is_read", false)
          .then(({ error }) => {
            if (!error) {
              window.dispatchEvent(new CustomEvent("messages-read", { detail: { chatIds } }))
            }
          })
      }
    }
  }

  const activeChatRef = useRef<ChatItem | null>(null)
  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  useEffect(() => {
    if (activeChat) {
      setMessagesLimit(20)
      fetchMessages(activeChat.allChatIds, 20, true)
      fetchInterviews(activeChat)

      if (!selectedChatId || !activeChat.allChatIds.includes(selectedChatId)) {
        setSelectedChatId(activeChat.allEvents[0]?.chatId || activeChat.id)
      }
    }
  }, [activeChat?.id, activeChat?.partnerId])

  useEffect(() => {
    if (!currentUser) return

    const channel = supabase
      .channel(`global-user-messages-${currentUser.id}`)
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
          const isActiveMessage = Boolean(currentActive && currentActive.allChatIds.includes(newMsg.chat_id))

          // 1. If it belongs to active chat, update message stream
          if (isActiveMessage) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev
              return [...prev, newMsg]
            })

            if (newMsg.content.startsWith("__INTERVIEW_REQUEST__:")) {
              if (currentActive) fetchInterviews(currentActive)
            }

            scrollToBottom("smooth")

            if (newMsg.sender_id !== currentUser.id) {
              const { error } = await supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id)
              if (!error) {
                window.dispatchEvent(new CustomEvent("messages-read", { detail: { msgId: newMsg.id } }))
              }
            }
          }

          // 2. Update conversation list: update lastMessage, timestamp, and MOVE TO TOP!
          setChats((prev) => {
            const index = prev.findIndex((c) => c.allChatIds.includes(newMsg.chat_id!))
            if (index === -1) {
              fetchChats()
              return prev
            }

            const targetChat = prev[index]
            const isRead = isActiveMessage || newMsg.sender_id === currentUser.id
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
  }, [currentUser?.id])

  const handleSendMessage = async (e?: React.FormEvent, customContent?: string) => {
    if (e) e.preventDefault()
    const contentToSend = customContent !== undefined ? customContent : newMessage
    if (!contentToSend.trim() || !activeChat || !currentUser || sending) return

    setSending(true)
    let payloadContent = contentToSend

    // Include reply context if replying
    if (replyingMessage) {
      const partner = getPartnerProfile(activeChat)
      const senderName = replyingMessage.sender_id === currentUser.id ? "Bạn" : partner.full_name
      const cleanReplyingContent = replyingMessage.content.startsWith("__REPLY__:")
        ? parseReplyContent(replyingMessage.content).actualText
        : replyingMessage.content
      payloadContent = formatReplyContent(senderName || "Đối tác", cleanReplyingContent, contentToSend)
    }

    setNewMessage("")
    setReplyingMessage(null)

    const targetChatId = selectedChatId || activeChat.allEvents[0]?.chatId || activeChat.id

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          chat_id: targetChatId,
          sender_id: currentUser?.id,
          content: payloadContent
        }
      ])
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error("Lỗi gửi tin nhắn:", error)
      showToast({ title: "Lỗi", message: "Không thể gửi tin nhắn. Vui lòng thử lại.", type: "error" })
      setNewMessage(contentToSend)
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data as Message]
      })
      // Update preview in left list and move conversation to top
      setChats((prev) => {
        const index = prev.findIndex((c) => c.partnerId === activeChat.partnerId)
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !activeChat || !currentUser) return

    showToast({ title: "Đang tải", message: `Đang tải lên tệp ${file.name}...`, type: "info" })
    try {
      const targetChatId = selectedChatId || activeChat.allEvents[0]?.chatId || activeChat.id
      const fileExt = file.name.split(".").pop()
      const filePath = `chat-attachments/${targetChatId}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("cvs")
        .upload(filePath, file)

      let attachmentUrl = ""
      if (!uploadError) {
        const { data: pubData } = supabase.storage.from("cvs").getPublicUrl(filePath)
        attachmentUrl = pubData.publicUrl
      }

      const fileMsg = attachmentUrl ? `[Tệp đính kèm: ${file.name}](${attachmentUrl})` : `📎 Đã gửi tệp: ${file.name}`
      await handleSendMessage(undefined, fileMsg)
      showToast({ title: "Thành công", message: "Đã gửi tệp đính kèm!", type: "success" })
    } catch (_err: any) {
      showToast({ title: "Lỗi", message: "Không thể tải lên tệp.", type: "error" })
    }
  }

  const handleToggleFavorite = () => {
    if (!activeChat || !currentUser) return
    const isNowFav = !isFavoriteChat
    setIsFavoriteChat(isNowFav)
    const nextStarred = isNowFav
      ? Array.from(new Set([...starredPartnerIds, activeChat.partnerId]))
      : starredPartnerIds.filter((id) => id !== activeChat.partnerId)
    setStarredPartnerIds(nextStarred)
    try {
      localStorage.setItem(`eventmate_starred_chats_${currentUser.id}`, JSON.stringify(nextStarred))
    } catch (e) {
      console.error("Lỗi lưu starred chats:", e)
    }
    showToast({
      title: isNowFav ? "Đã lưu" : "Bỏ lưu",
      message: isNowFav ? "Đã ghim cuộc hội thoại vào mục yêu thích" : "Đã bỏ cuộc hội thoại khỏi mục yêu thích",
      type: "info",
    })
  }

  const handleDeleteConversation = async () => {
    if (!activeChat || !currentUser) return
    setShowMoreMenu(false)
    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử tin nhắn của cuộc hội thoại này?")) {
      return
    }

    try {
      const chatIdsToDelete =
        activeChat.allChatIds && activeChat.allChatIds.length > 0
          ? activeChat.allChatIds
          : [activeChat.id]

      const { error: delErr } = await supabase
        .from("messages")
        .delete()
        .in("chat_id", chatIdsToDelete)

      if (delErr) throw delErr

      setMessages([])
      setChats((prev) =>
        prev.map((c) =>
          c.partnerId === activeChat.partnerId
            ? { ...c, lastMessage: "Đã làm trống lịch sử tin nhắn", unreadCount: 0 }
            : c
        )
      )

      showToast({
        title: "Đã xóa",
        message: "Đã xóa toàn bộ lịch sử tin nhắn trong cuộc hội thoại.",
        type: "success",
      })
    } catch (err: any) {
      console.error("Lỗi xóa tin nhắn:", err)
      showToast({
        title: "Lỗi",
        message: getUserFacingMessage(err, "Không thể xóa lịch sử tin nhắn."),
        type: "error",
      })
    }
  }

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPremium) {
      showToast({
        title: "Tính năng VIP",
        message: "Hệ thống lên lịch Phỏng vấn / Casting dành riêng cho gói Doanh Nghiệp VIP. Vui lòng nâng cấp!",
        type: "error",
      })
      navigate("/pricing")
      return
    }
    if (!activeChat || !currentUser || !interviewTitle || !interviewDate || creatingInterview) return

    setCreatingInterview(true)
    try {
      const targetEventItem = activeChat.allEvents.find((e) => e.chatId === selectedChatId) || activeChat.allEvents[0]
      const targetEventId = targetEventItem?.eventId || activeChat.event_id
      const targetChatId = targetEventItem?.chatId || selectedChatId || activeChat.id

      const { data: interview, error: intError } = await supabase
        .from("interviews")
        .insert([
          {
            event_id: targetEventId,
            organizer_id: currentUser?.id,
            student_id: activeChat.student_id,
            title: interviewTitle,
            scheduled_at: new Date(interviewDate).toISOString(),
            meeting_link: interviewLink || null,
            status: "pending"
          }
        ])
        .select()
        .single()

      if (intError) throw intError

      const { data: messageData, error: msgError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: targetChatId,
            sender_id: currentUser?.id,
            content: `__INTERVIEW_REQUEST__:${interview.id}`
          }
        ])
        .select()
        .single()

      if (msgError) throw msgError

      setInterviews(prev => ({ ...prev, [interview.id]: interview }))
      if (messageData) {
        setMessages(prev => [...prev, messageData as Message])
      }

      setInterviewTitle("")
      setInterviewDate("")
      setInterviewLink("")
      setIsInterviewModalOpen(false)
      scrollToBottom()
      showToast({ title: "Thành công", message: "Đã gửi lời mời phỏng vấn!", type: "success" })
    } catch (err: any) {
      console.error("Lỗi tạo lịch hẹn:", err)
      showToast({ title: "Lỗi", message: getUserFacingMessage(err, "Không thể tạo lịch hẹn."), type: "error" })
    } finally {
      setCreatingInterview(false)
    }
  }

  const handleUpdateInterviewStatus = async (interviewId: string, newStatus: "accepted" | "rejected") => {
    try {
      const interview = interviews[interviewId]
      if (!interview) return

      const { error } = await supabase
        .from("interviews")
        .update({ status: newStatus })
        .eq("id", interviewId)

      if (error) throw error

      setInterviews(prev => ({
        ...prev,
        [interviewId]: { ...prev[interviewId], status: newStatus }
      }))

      await supabase.from("notifications").insert([
        {
          user_id: interview.organizer_id,
          title: newStatus === "accepted" ? "Lịch phỏng vấn được chấp nhận" : "Lịch phỏng vấn bị từ chối",
          message: `Người tham gia đã ${newStatus === "accepted" ? "chấp nhận" : "từ chối"} lịch hẹn phỏng vấn: ${interview.title}`,
          is_read: false
        }
      ])
      showToast({
        title: "Cập nhật",
        message: newStatus === "accepted" ? "Đã chấp nhận lời mời phỏng vấn!" : "Đã từ chối lời mời phỏng vấn.",
        type: newStatus === "accepted" ? "success" : "info"
      })
    } catch (err: any) {
      console.error("Lỗi cập nhật lịch hẹn:", err)
      showToast({ title: "Lỗi", message: getUserFacingMessage(err, "Không thể cập nhật trạng thái."), type: "error" })
    }
  }

  const getPartnerProfile = (chat: ChatItem): ChatPartnerProfile => {
    if (!chat) return { id: "", full_name: "Người dùng", avatar_url: "" }
    if (currentUser?.id) {
      if (chat.organizer_id === currentUser.id) return chat.student_profile
      if (chat.student_id === currentUser.id) return chat.organizer_profile
    }
    const isOrg = isOrganizerRole(role) || isOrganizerRole(profile?.role)
    return isOrg ? chat.student_profile : chat.organizer_profile
  }

  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats
    const q = searchQuery.toLowerCase()
    return chats.filter(c => {
      const partner = getPartnerProfile(c)
      const matchesPartner = partner.full_name?.toLowerCase().includes(q)
      const matchesEvent = c.allEvents.some(e => e.eventTitle.toLowerCase().includes(q))
      const matchesMsg = c.lastMessage?.toLowerCase().includes(q)
      return matchesPartner || matchesEvent || matchesMsg
    })
  }, [chats, searchQuery, role])

  const eventByChatId = useMemo(() => {
    const map: Record<string, EventContextItem> = {}
    if (activeChat) {
      activeChat.allEvents.forEach((ev) => {
        map[ev.chatId] = ev
      })
    }
    return map
  }, [activeChat])

  const userAvatar = profile?.avatar_url || user?.user_metadata?.avatar_url || "/images/chat-avatar-user.png"
  const userName = profile?.full_name || user?.user_metadata?.full_name || "Kathryn Murphy"
  const userEmail = profile?.email || user?.email || "Kathrynmurphy@gmail.com"

  if (loading || authLoading) {
    if (embedded) {
      return (
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="size-6 border-2 border-[#005DDC] border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-slate-500">Đang tải tin nhắn...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const chatCard = (
    <div className="bg-white dark:bg-zinc-900 rounded-[16px] border border-[#ededed] dark:border-zinc-800 flex flex-col md:flex-row overflow-hidden shadow-xs relative h-[calc(100vh-140px)] min-h-[580px] w-full">
      {/* LEFT PANE: CONVERSATION LIST */}
      <section
        aria-label="Danh sách tin nhắn"
        className={`w-full md:w-[320px] lg:w-[360px] xl:w-[380px] border-r border-[#ededed] dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900 shrink-0 ${activeChat ? "hidden md:flex" : "flex"
          }`}
      >
              {/* Search input in conversation list */}
              <div className="p-3 border-b border-[#ededed]/60">
                <div className="h-[40px] rounded-[16px] border border-[#ededed] bg-white px-3 flex items-center gap-2">
                  <img src="/images/chat-search.svg" alt="" className="size-4 opacity-60 shrink-0" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-[13px] text-[#353535] placeholder:text-[#757575] focus:outline-none"
                  />
                </div>
              </div>

              {/* Chat Items List */}
              <div className="flex-1 overflow-y-auto divide-y divide-[#ededed]/30">
                {filteredChats.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#757575]">
                    {searchQuery ? "Không tìm thấy cuộc hội thoại nào" : "Chưa có cuộc trò chuyện nào. Hãy ứng tuyển hoặc nhắn tin từ sự kiện!"}
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const partner = getPartnerProfile(chat)
                    const isActive = activeChat?.partnerId === chat.partnerId
                    const hasUnread = (chat.unreadCount || 0) > 0 && !isActive
                    return (
                      <button
                        key={chat.partnerId || chat.id}
                        onClick={() => {
                          setActiveChat(chat)
                          setSelectedChatId(chat.allEvents[0]?.chatId || chat.id)
                          setChats((prev) =>
                            prev.map((c) =>
                              c.partnerId === chat.partnerId ? { ...c, unreadCount: 0 } : c
                            )
                          )
                          if (!embedded) {
                            navigate(`/chat/${chat.id}`)
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors cursor-pointer relative ${isActive ? "bg-[#ededed]" : "hover:bg-[#f9f9f9]"
                          }`}
                      >
                        <div className="size-10 rounded-[32px] overflow-hidden shrink-0 bg-slate-100 border border-[#ededed] relative">
                          <img
                            src={partner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.full_name || "User")}&background=005DDC&color=fff`}
                            alt={partner.full_name}
                            onError={(e) => {
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(partner.full_name || "User")}&background=005DDC&color=fff`
                            }}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className={`text-[14px] truncate ${hasUnread ? "font-bold text-[#111]" : "font-medium text-[#222]"}`}>
                                {partner.full_name}
                              </p>
                              {starredPartnerIds.includes(chat.partnerId) && (
                                <Star className="size-3.5 fill-amber-400 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <span className={`text-[10px] shrink-0 ${hasUnread ? "font-semibold text-[#005DDC]" : "text-[#757575] font-normal"}`}>
                              {formatTimeAgo(chat.lastMessageTime || chat.created_at)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-1.5 mt-0.5">
                            <p className={`text-[12px] truncate flex-1 ${hasUnread ? "font-semibold text-[#111]" : "text-[#555]"}`}>
                              {chat.lastMessage || "Bắt đầu cuộc trò chuyện..."}
                            </p>
                            {hasUnread && (
                              <span className="size-2 rounded-full bg-[#005DDC] shrink-0" />
                            )}
                          </div>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </section>

            {/* RIGHT PANE: ACTIVE MESSAGE THREAD */}
            <section
              aria-label="Khung trò chuyện"
              className={`flex-1 flex flex-col justify-between bg-white min-w-0 ${!activeChat ? "hidden md:flex md:items-center md:justify-center bg-slate-50/30" : "flex"
                }`}
            >
              {activeChat ? (
                <>
                  {/* Thread Header */}
                  <header className="h-[72px] border-b border-[#ededed] px-5 flex items-center justify-between shrink-0 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => {
                          setActiveChat(null)
                          if (!embedded) {
                            navigate("/chat")
                          }
                        }}
                        className="md:hidden size-9 rounded-full flex items-center justify-center hover:bg-slate-100 -ml-2"
                        title="Quay lại"
                      >
                        <ArrowLeft className="size-5 text-[#353535]" />
                      </button>

                      <div className="size-[48px] sm:size-[56px] rounded-[32px] overflow-hidden shrink-0 border border-[#ededed] bg-slate-100">
                        <img
                          src={getPartnerProfile(activeChat).avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(getPartnerProfile(activeChat).full_name || "User")}&background=005DDC&color=fff`}
                          alt={getPartnerProfile(activeChat).full_name}
                          onError={(e) => {
                            e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getPartnerProfile(activeChat).full_name || "User")}&background=005DDC&color=fff`
                          }}
                          className="size-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <h2 className="text-[16px] font-semibold text-[#222] truncate">
                          {getPartnerProfile(activeChat).full_name}
                        </h2>
                        <p className="text-[12px] text-[#757575] truncate mt-0.5">
                          Trực tuyến
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Organizer Interview Booking Button */}
                      {(isOrganizerRole(role) || isOrganizerRole(profile?.role)) && (
                        <button
                          onClick={() => {
                            if (!isPremium) {
                              showToast({
                                title: "Tính năng VIP",
                                message: "Hệ thống lên lịch Phỏng vấn / Casting dành riêng cho gói Doanh Nghiệp VIP. Vui lòng nâng cấp!",
                                type: "error",
                              })
                              navigate("/pricing")
                              return
                            }
                            setIsInterviewModalOpen(true)
                          }}
                          className={cn(
                            "hidden sm:inline-flex items-center gap-1.5 rounded-[8px] px-3.5 py-2 text-[13px] font-medium transition-colors shadow-2xs cursor-pointer",
                            isPremium
                              ? "bg-[#005DDC] text-white hover:bg-[#004eb7]"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          )}
                          title={isPremium ? "Hẹn phỏng vấn" : "Nâng cấp VIP để mở khóa lịch phỏng vấn"}
                        >
                          {isPremium ? <Calendar className="size-4" /> : <Lock className="size-3.5 text-slate-500" />}
                          <span>Hẹn phỏng vấn</span>
                        </button>
                      )}

                      {/* Favorite button */}
                      <button
                        onClick={handleToggleFavorite}
                        className="size-10 sm:size-12 rounded-[53px] flex items-center justify-center hover:bg-slate-100 transition-colors"
                        title={isFavoriteChat ? "Bỏ đánh dấu sao" : "Đánh dấu sao"}
                      >
                        <Star className={`size-5 transition-colors ${isFavoriteChat ? "fill-amber-400 text-amber-500" : "text-slate-400 hover:text-slate-600"}`} />
                      </button>

                      {/* More Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowMoreMenu(!showMoreMenu)}
                          className="size-10 sm:size-12 rounded-[53px] flex items-center justify-center hover:bg-slate-100 transition-colors"
                          title="Tùy chọn"
                        >
                          <img src="/images/chat-more.svg" alt="More" className="size-5 opacity-80" />
                        </button>

                        {showMoreMenu && (
                          <div className="absolute right-0 mt-2 w-48 rounded-[12px] bg-white p-1.5 shadow-lg border border-[#ededed] z-30 text-xs">
                            {(isOrganizerRole(role) || isOrganizerRole(profile?.role)) && (
                              <button
                                onClick={() => {
                                  setShowMoreMenu(false)
                                  if (!isPremium) {
                                    showToast({
                                      title: "Tính năng VIP",
                                      message: "Hệ thống lên lịch Phỏng vấn / Casting dành riêng cho gói Doanh Nghiệp VIP. Vui lòng nâng cấp!",
                                      type: "error",
                                    })
                                    navigate("/pricing")
                                    return
                                  }
                                  setIsInterviewModalOpen(true)
                                }}
                                className="sm:hidden flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[#353535] hover:bg-slate-50"
                              >
                                {isPremium ? <Calendar className="size-4 text-[#005DDC]" /> : <Lock className="size-4 text-slate-400" />}
                                <span>Hẹn phỏng vấn {!isPremium && "(VIP)"}</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setShowMoreMenu(false)
                                showToast({ title: "Thông báo", message: "Đã bật thông báo cho cuộc hội thoại này.", type: "success" })
                              }}
                              className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[#353535] hover:bg-slate-50"
                            >
                              <span>Bật thông báo</span>
                            </button>
                            <button
                              onClick={handleDeleteConversation}
                              className="flex w-full items-center gap-2 rounded-[8px] px-3 py-2 text-left text-[#dc0000] hover:bg-red-50"
                            >
                              <Trash2 className="size-4 text-[#dc0000]" />
                              <span>Xóa cuộc hội thoại</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </header>

                  {/* Messages Feed */}
                  <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-3 sm:px-6 sm:py-4">
                    {hasMoreMessages && (
                      <div className="flex justify-center pb-2">
                        <button
                          onClick={() => {
                            const nextLimit = messagesLimit + 20
                            setMessagesLimit(nextLimit)
                            fetchMessages(activeChat.allChatIds, nextLimit)
                          }}
                          className="rounded-full bg-[#f9f9f9] border border-[#ededed] px-4 py-1.5 text-[11px] font-medium text-[#757575] hover:bg-[#ededed] transition-colors"
                        >
                          Tải tin nhắn cũ hơn
                        </button>
                      </div>
                    )}

                    <ChatMessageList
                      messages={messages}
                      currentUserId={currentUser?.id}
                      partnerProfile={getPartnerProfile(activeChat)}
                      currentUserProfile={profile || currentUser?.user_metadata}
                      onReply={(msg) => setReplyingMessage(msg)}
                      playingVoiceId={playingVoiceId}
                      onToggleVoice={(id) => setPlayingVoiceId((prev) => (prev === id ? null : id))}
                      messagesEndRef={messagesEndRef}
                      compact={false}
                      showHeader={!hasMoreMessages}
                      interviews={interviews}
                      onUpdateInterviewStatus={handleUpdateInterviewStatus}
                      role={role}
                    />
                  </div>

                  {/* Reply Banner */}
                  <ChatReplyBanner
                    replyingMessage={replyingMessage}
                    onCancel={() => setReplyingMessage(null)}
                    compact={false}
                  />


                  {/* BOTTOM INPUT BAR (`BoxMassages` Figma) */}
                  <div className="p-4 bg-white border-t border-[#ededed] relative">
                    <form
                      onSubmit={(e) => handleSendMessage(e)}
                      className="border border-[#ededed] rounded-[16px] h-[52px] px-2 sm:px-3 flex items-center justify-between gap-2 bg-white"
                    >
                      {/* Attachment Button */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="size-10 rounded-[53px] flex items-center justify-center hover:bg-slate-100 shrink-0 transition-colors"
                        title="Đính kèm tệp"
                      >
                        <img src="/images/msg-link.svg" alt="Attach" className="size-5" />
                      </button>

                      {/* Text Input */}
                      <input
                        type="text"
                        placeholder="Write a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1 min-w-0 bg-transparent text-[14px] text-[#222] placeholder:text-[#a5a5a5] focus:outline-none px-2"
                      />

                      {/* Send Button */}
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="size-10 rounded-[12px] bg-[#005DDC] text-white flex items-center justify-center hover:bg-[#004eb7] disabled:opacity-40 shrink-0 transition-colors shadow-2xs"
                        title="Gửi"
                      >
                        <Send className="size-4" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* Empty Chat state */
                <div className="p-8 text-center max-w-sm mx-auto space-y-3">
                  <div className="size-16 rounded-2xl bg-[#eff5ff] text-[#005DDC] flex items-center justify-center mx-auto">
                    <MessageSquare className="size-8" />
                  </div>
                  <h3 className="text-[16px] font-semibold text-[#222]">Chọn cuộc hội thoại</h3>
                  <p className="text-[12px] text-[#757575] leading-relaxed">
                    Chọn một cuộc trò chuyện từ danh sách bên trái hoặc ứng tuyển sự kiện để bắt đầu trao đổi trực tiếp với nhà tuyển dụng.
                  </p>
                </div>
              )}
            </section>
    </div>
  )

  if (embedded) {
    return (
      <div className="w-full">
        {chatCard}
        {/* INTERVIEW MODAL */}
        {isInterviewModalOpen && (
          <InterviewModal
            isOpen={isInterviewModalOpen}
            onClose={() => setIsInterviewModalOpen(false)}
            interviewTitle={interviewTitle}
            setInterviewTitle={setInterviewTitle}
            interviewDate={interviewDate}
            setInterviewDate={setInterviewDate}
            interviewLink={interviewLink}
            setInterviewLink={setInterviewLink}
            creatingInterview={creatingInterview}
            onSubmit={handleCreateInterview}
          />
        )}
      </div>
    )
  }

  const userRole = (isOrganizerRole(role) || isOrganizerRole(profile?.role)) ? "organizer" : "student"
  const fullNameFormatted = userName || profile?.full_name || ""

  return (
    <DashboardLayout
      role={userRole}
      activeTab={userRole === "organizer" ? "chat" : "message"}
      activeItem={userRole === "organizer" ? "chat" : "message"}
      title="Tin nhắn"
      subtitle={
        userRole === "organizer"
          ? "Kênh trao đổi trực tiếp với ứng viên và điều phối viên"
          : "Trò chuyện và kết nối trực tiếp với Nhà tuyển dụng sự kiện"
      }
      searchQuery={searchTopQuery}
      setSearchQuery={setSearchTopQuery}
      avatarUrl={userAvatar}
      userProfile={{
        fullName: fullNameFormatted,
        avatarUrl: userAvatar,
        email: userEmail,
      }}
    >
      <div className="w-full">
        {chatCard}
      </div>

      {/* INTERVIEW MODAL */}
      {isInterviewModalOpen && (
        <InterviewModal
          isOpen={isInterviewModalOpen}
          onClose={() => setIsInterviewModalOpen(false)}
          interviewTitle={interviewTitle}
          setInterviewTitle={setInterviewTitle}
          interviewDate={interviewDate}
          setInterviewDate={setInterviewDate}
          interviewLink={interviewLink}
          setInterviewLink={setInterviewLink}
          creatingInterview={creatingInterview}
          onSubmit={handleCreateInterview}
        />
      )}
    </DashboardLayout>
  )
}
