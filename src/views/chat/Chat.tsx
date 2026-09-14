"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "@/lib/router"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import MainLayout from "@/components/layout/MainLayout"
import OrgLayout from "@/components/layout/OrgLayout"
import { Send, MessageSquare, User, ArrowLeft, Calendar, Video, Clock, Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import InterviewModal from "@/components/chat/InterviewModal"

interface ChatItem {
  id: string
  event_id: string
  student_id: string
  organizer_id: string
  created_at: string
  events: { title: string }
  student_profile: { id: string; full_name: string; avatar_url: string }
  organizer_profile: { id: string; full_name: string; avatar_url: string }
}

interface Message {
  id: string
  chat_id: string | null
  sender_id: string | null
  content: string
  created_at: string | null
}

export default function Chat() {
  const { id: routeChatId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, role, isPremium, loading: authLoading } = useUser()
  const currentUser = user

  const [loading, setLoading] = useState(true)

  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const [messagesLimit, setMessagesLimit] = useState(20)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [interviewTitle, setInterviewTitle] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewLink, setInterviewLink] = useState("")
  const [interviews, setInterviews] = useState<Record<string, any>>({})
  const [creatingInterview, setCreatingInterview] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

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

    const isOrg = role === "organizer"
    const queryField = isOrg ? "organizer_id" : "student_id"

    const { data, error } = await supabase
      .from("chats")
      .select(`
        id, event_id, student_id, organizer_id, created_at,
        events (title),
        student_profile:profiles!student_id (id, full_name, avatar_url),
        organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
      `)
      .eq(queryField, currentUser?.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Lỗi fetchChats:", error)
    }

    if (!error && data) {
      const formattedChats = data.map((item: any) => ({
        ...item,
        events: Array.isArray(item.events) ? item.events[0] || { title: "Sự kiện chung" } : item.events || { title: "Sự kiện chung" },
        student_profile: Array.isArray(item.student_profile) ? item.student_profile[0] || { id: "", full_name: "Người tham gia", avatar_url: "" } : item.student_profile || { id: "", full_name: "Người tham gia", avatar_url: "" },
        organizer_profile: Array.isArray(item.organizer_profile) ? item.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" } : item.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" }
      })) as ChatItem[]

      setChats(formattedChats)

      if (routeChatId) {
        const found = formattedChats.find(c => c.id === routeChatId)
        if (found) {
          setActiveChat(found)
        } else {
          const { data: directChat } = await supabase
            .from("chats")
            .select(`
              id, event_id, student_id, organizer_id, created_at,
              events (title),
              student_profile:profiles!student_id (id, full_name, avatar_url),
              organizer_profile:profiles!organizer_id (id, full_name, avatar_url)
            `)
            .eq("id", routeChatId)
            .maybeSingle()

          if (directChat) {
            const formatted = {
              ...directChat,
              events: Array.isArray(directChat.events) ? directChat.events[0] || { title: "Sự kiện chung" } : directChat.events || { title: "Sự kiện chung" },
              student_profile: Array.isArray(directChat.student_profile) ? directChat.student_profile[0] || { id: "", full_name: "Người tham gia", avatar_url: "" } : directChat.student_profile || { id: "", full_name: "Người tham gia", avatar_url: "" },
              organizer_profile: Array.isArray(directChat.organizer_profile) ? directChat.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" } : directChat.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" }
            } as ChatItem
            setActiveChat(formatted)
          }
        }
      } else if (formattedChats.length > 0 && !activeChat) {
        setActiveChat(formattedChats[0])
      }
    }
  }

  useEffect(() => {
    if (currentUser) {
      fetchChats()
    }
  }, [currentUser, role, routeChatId])

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

  const fetchMessages = async (chatId: string, currentLimit = 20) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(currentLimit)

    if (!error && data) {
      const reversed = [...data].reverse()
      setMessages(reversed)
      setHasMoreMessages(data.length === currentLimit)
    }
  }

  useEffect(() => {
    if (activeChat) {
      setMessagesLimit(20)
      fetchMessages(activeChat.id, 20)
      fetchInterviews(activeChat)

      const channel = supabase
        .channel(`chat-room-${activeChat.id}`)
        .on("postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages"
          },
          (payload) => {
            const newMsg = payload.new as Message
            if (newMsg.chat_id === activeChat.id) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
              })

              if (newMsg.content.startsWith("__INTERVIEW_REQUEST__:")) {
                fetchInterviews(activeChat)
              }

              scrollToBottom()
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [activeChat])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || !currentUser || sending) return

    setSending(true)
    const tempMsg = newMessage
    setNewMessage("")

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          chat_id: activeChat.id,
          sender_id: currentUser?.id,
          content: tempMsg
        }
      ])
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error("Lỗi gửi tin nhắn:", error)
      setNewMessage(tempMsg)
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data as Message]
      })
      scrollToBottom()
    }
  }

  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeChat || !currentUser || !interviewTitle || !interviewDate || creatingInterview) return

    setCreatingInterview(true)
    try {
      const { data: interview, error: intError } = await supabase
        .from("interviews")
        .insert([
          {
            event_id: activeChat.event_id,
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
            chat_id: activeChat.id,
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
    } catch (err: any) {
      console.error("Lỗi tạo lịch hẹn:", err)
      alert(getUserFacingMessage(err, "Không thể tạo lịch hẹn. Vui lòng thử lại."))
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
    } catch (err: any) {
      console.error("Lỗi cập nhật lịch hẹn:", err)
      alert(getUserFacingMessage(err, "Không thể cập nhật trạng thái. Vui lòng thử lại."))
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    )
  }

  const getPartnerProfile = (chat: ChatItem) => {
    return role === "organizer" ? chat.student_profile : chat.organizer_profile
  }

  const chatUI = (
    <div className="mx-auto flex h-[calc(100vh-9rem)] w-full max-w-6xl overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:h-[calc(100vh-7rem)]">
      {/* LEFT: chat list */}
      <section
        className={`w-full flex-col border-r border-border md:flex md:w-80 ${activeChat ? "hidden md:flex" : "flex"}`}
        aria-label="Danh sách hội thoại"
      >
        <header className="border-b border-border p-4">
          <h1 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <MessageSquare className="h-4 w-4 text-slate-600" />
            Hội thoại
          </h1>
          <p className="mt-0.5 text-xs text-muted-foreground">{chats.length} cuộc trò chuyện</p>
        </header>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="px-3 py-12 text-center text-xs text-muted-foreground">
              Chưa có hội thoại nào
            </div>
          ) : (
            chats.map((chat) => {
              const partner = getPartnerProfile(chat)
              const isActive = activeChat?.id === chat.id
              return (
                <button
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat)
                    navigate(`/chat/${chat.id}`)
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors ${isActive
                    ? "bg-slate-100"
                    : "hover:bg-muted border border-transparent"
                    }`}
                >
                  <Avatar className="h-10 w-10 shrink-0 border border-border">
                    <AvatarImage src={partner.avatar_url} />
                    <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                      {partner.full_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <h4 className={`truncate text-sm font-semibold ${isActive ? "text-slate-900" : "text-foreground"}`}>
                      {partner.full_name}
                    </h4>
                    <p className="truncate text-xs text-muted-foreground">
                      {chat.events.title}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </section>

      {/* RIGHT: message thread */}
      <section
        className={`flex-1 flex-col ${!activeChat ? "hidden md:flex md:items-center md:justify-center" : "flex"}`}
        aria-label="Luồng tin nhắn"
      >
        {activeChat ? (
          <>
            {/* Thread header */}
            <header className="flex items-center justify-between border-b border-border bg-card p-3 sm:p-4">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => {
                    setActiveChat(null)
                    navigate("/chat")
                  }}
                  aria-label="Quay lại danh sách hội thoại"
                  className="mr-1 shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground md:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <Avatar className="h-9 w-9 shrink-0 border border-border">
                  <AvatarImage src={getPartnerProfile(activeChat).avatar_url} />
                  <AvatarFallback className="bg-muted text-sm font-semibold text-foreground">
                    {getPartnerProfile(activeChat).full_name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-foreground">
                    {getPartnerProfile(activeChat).full_name}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {activeChat.events.title}
                  </p>
                </div>
              </div>

              {role === "organizer" && (
                <Button
                  onClick={() => setIsInterviewModalOpen(true)}
                  className="shrink-0 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Hẹn phỏng vấn</span>
                </Button>
              )}
            </header>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto bg-muted/30 p-3 sm:p-4">
              {hasMoreMessages && (
                <div className="flex justify-center pb-2">
                  <button
                    onClick={() => {
                      const nextLimit = messagesLimit + 20
                      setMessagesLimit(nextLimit)
                      fetchMessages(activeChat.id, nextLimit)
                    }}
                    className="rounded-full bg-card px-3 py-1 text-xs font-medium text-slate-600 border border-border hover:bg-slate-100 transition-colors"
                  >
                    Tải tin nhắn cũ hơn
                  </button>
                </div>
              )}

              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUser?.id

                // Interview request message
                if (msg.content.startsWith("__INTERVIEW_REQUEST__:")) {
                  const interviewId = msg.content.substring("__INTERVIEW_REQUEST__:".length)
                  const interview = interviews[interviewId]

                  if (!interview) {
                    return (
                      <div key={msg.id} className="flex justify-center py-2">
                        <div className="rounded-lg bg-muted px-3 py-1.5 text-xs text-muted-foreground">
                          Đang tải thông tin phỏng vấn...
                        </div>
                      </div>
                    )
                  }

                  const isStudent = role === "student"

                  return (
                    <div key={msg.id} className="flex justify-center py-3">
                      <div className="w-full max-w-md rounded-xl border border-border bg-card p-4 shadow-sm">
                        <div className="flex items-center gap-3 border-b border-border pb-3">
                          <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">Lời mời phỏng vấn</h4>
                            <p className="text-xs text-muted-foreground">Hẹn lịch trực tuyến</p>
                          </div>
                        </div>

                        <div className="space-y-2 py-3 text-xs">
                          <div>
                            <span className="block text-muted-foreground">Chủ đề</span>
                            <span className="font-medium text-foreground">{interview.title}</span>
                          </div>
                          <div>
                            <span className="block text-muted-foreground">Thời gian</span>
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              <Clock className="h-3.5 w-3.5 text-slate-600" />
                              {new Date(interview.scheduled_at).toLocaleString("vi-VN", {
                                dateStyle: "medium",
                                timeStyle: "short"
                              })}
                            </span>
                          </div>
                          {interview.meeting_link && (
                            <div>
                              <span className="block text-muted-foreground">Link phòng họp</span>
                              <a
                                href={interview.meeting_link.startsWith("http") ? interview.meeting_link : `https://${interview.meeting_link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-slate-600 hover:underline"
                              >
                                <Video className="h-3.5 w-3.5" />
                                Tham gia cuộc gọi
                              </a>
                            </div>
                          )}
                        </div>

                        <div className="border-t border-border pt-3">
                          {interview.status === "pending" ? (
                            isStudent ? (
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleUpdateInterviewStatus(interview.id, "accepted")}
                                  className="flex-1 rounded-lg bg-primary py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                  Đồng ý
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => handleUpdateInterviewStatus(interview.id, "rejected")}
                                  className="flex-1 rounded-lg border-destructive/20 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
                                >
                                  <X className="h-3.5 w-3.5" />
                                  Từ chối
                                </Button>
                              </div>
                            ) : (
                              <div className="rounded-lg bg-muted px-3 py-2 text-center text-xs font-medium text-muted-foreground">
                                Đang chờ phản hồi từ người tham gia
                              </div>
                            )
                          ) : interview.status === "accepted" ? (
                            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600">
                              <Check className="h-3.5 w-3.5" />
                              Đã chấp nhận lịch hẹn
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">
                              <X className="h-3.5 w-3.5" />
                              Lịch hẹn bị từ chối
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                }

                // Regular message bubble
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                  >
                    <div
                      className={`max-w-[75%] rounded-xl px-3 py-2 text-sm leading-relaxed sm:max-w-[70%] ${isMe
                        ? "rounded-tr-sm bg-primary text-primary-foreground"
                        : "rounded-tl-sm bg-muted text-foreground"
                        }`}
                    >
                      <p className="break-words">{msg.content}</p>
                      <span className={`mt-1 block text-right text-xs ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg.created_at || Date.now()).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 border-t border-border bg-card p-3 sm:gap-3 sm:p-4"
            >
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:h-11 sm:px-4"
              />
              <Button
                type="submit"
                disabled={sending}
                aria-label="Gửi tin nhắn"
                className="h-10 w-10 shrink-0 rounded-lg bg-primary p-0 text-primary-foreground hover:bg-primary/90 disabled:opacity-50 sm:h-11 sm:w-11"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-3 p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Chọn cuộc hội thoại</h3>
            <p className="mx-auto max-w-xs text-xs leading-relaxed text-muted-foreground">
              Chọn một hội thoại ở thanh bên trái hoặc nhắn tin từ bài tuyển nhân sự nhân sự để bắt đầu thảo luận.
            </p>
          </div>
        )}
      </section>

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

  if (role === "organizer") {
    return (
      <OrgLayout
        activeTab="chat"
        setActiveTab={(tab) => navigate(`/?tab=${tab}`)}
        isPremium={isPremium}
        userProfile={{
          fullName: currentUser?.user_metadata?.full_name || "Nhà tuyển nhân sự",
          avatarUrl: currentUser?.user_metadata?.avatar_url || "",
          email: currentUser?.email || ""
        }}
        onLogout={async () => {
          await supabase.auth.signOut()
          navigate("/")
        }}
      >
        <div className="py-2">{chatUI}</div>
      </OrgLayout>
    )
  }

  return (
    <MainLayout role={role ?? undefined}>
      {chatUI}
    </MainLayout>
  )
}
