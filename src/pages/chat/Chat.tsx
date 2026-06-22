import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import OrgLayout from "@/components/layout/OrgLayout"
import { Send, MessageSquare, User, ArrowLeft, Calendar, Video, Clock, Check, X } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

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
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function Chat() {
  const { id: routeChatId } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [role, setRole] = useState("student")
  const [loading, setLoading] = useState(true)

  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  // Phân trang
  const [messagesLimit, setMessagesLimit] = useState(20)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  // Hẹn phỏng vấn
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false)
  const [interviewTitle, setInterviewTitle] = useState("")
  const [interviewDate, setInterviewDate] = useState("")
  const [interviewLink, setInterviewLink] = useState("")
  const [interviews, setInterviews] = useState<Record<string, any>>({})
  const [creatingInterview, setCreatingInterview] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Lấy thông tin User hiện tại
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate("/login")
        return
      }
      setCurrentUser(user)

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
      if (profile) setRole(profile.role)

      setLoading(false)
    }
    fetchUser()
  }, [navigate])

  // 2. Fetch danh sách các phòng Chat của User
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
      .eq(queryField, currentUser.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Lỗi fetchChats:", error.message)
    }

    if (!error && data) {
      const formattedChats = data.map((item: any) => ({
        ...item,
        events: Array.isArray(item.events) ? item.events[0] || { title: "Sự kiện chung" } : item.events || { title: "Sự kiện chung" },
        student_profile: Array.isArray(item.student_profile) ? item.student_profile[0] || { id: "", full_name: "Ứng viên", avatar_url: "" } : item.student_profile || { id: "", full_name: "Ứng viên", avatar_url: "" },
        organizer_profile: Array.isArray(item.organizer_profile) ? item.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" } : item.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" }
      })) as ChatItem[]

      setChats(formattedChats)

      // Nếu có chat ID từ Route, set active chat
      if (routeChatId) {
        const found = formattedChats.find(c => c.id === routeChatId)
        if (found) {
          setActiveChat(found)
        } else {
          // Trực tiếp fetch chat nếu không tìm thấy trong list (phòng ngừa lỗi đồng bộ)
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
              student_profile: Array.isArray(directChat.student_profile) ? directChat.student_profile[0] || { id: "", full_name: "Ứng viên", avatar_url: "" } : directChat.student_profile || { id: "", full_name: "Ứng viên", avatar_url: "" },
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

  // Fetch danh sách lịch hẹn phỏng vấn
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

  // 3. Fetch tin nhắn khi đổi Chat room
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

      // 4. Đăng ký Realtime tin nhắn mới của Chat room đang mở
      const channel = supabase
        .channel(`chat-room-${activeChat.id}`)
        .on(
          "postgres_changes",
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

              // Nếu là tin nhắn lịch hẹn mới, tải lại danh sách lịch hẹn
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

  // Polling fallback to fetch messages every 4 seconds (handles cases where Supabase Realtime replication is disabled)
  useEffect(() => {
    if (!activeChat) return

    const interval = setInterval(() => {
      fetchMessages(activeChat.id, messagesLimit)
      fetchInterviews(activeChat)
    }, 4000)

    return () => clearInterval(interval)
  }, [activeChat, messagesLimit])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  // 5. Gửi tin nhắn
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || !currentUser || sending) return

    setSending(true)
    const tempMsg = newMessage
    setNewMessage("")

    // Lưu tin nhắn gửi đi và lấy dữ liệu trả về để cập nhật UI ngay lập tức
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          chat_id: activeChat.id,
          sender_id: currentUser.id,
          content: tempMsg
        }
      ])
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error("Lỗi gửi tin nhắn:", error.message)
      setNewMessage(tempMsg) // Khôi phục lại text
    } else if (data) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === data.id)) return prev
        return [...prev, data as Message]
      })
      scrollToBottom()
    }
  }

  // Tạo lịch phỏng vấn
  const handleCreateInterview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeChat || !currentUser || !interviewTitle || !interviewDate || creatingInterview) return

    setCreatingInterview(true)
    try {
      // 1. Tạo bản ghi lịch hẹn
      const { data: interview, error: intError } = await supabase
        .from("interviews")
        .insert([
          {
            event_id: activeChat.event_id,
            organizer_id: currentUser.id,
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

      // 2. Gửi tin nhắn đặc biệt vào chat room
      const { data: messageData, error: msgError } = await supabase
        .from("messages")
        .insert([
          {
            chat_id: activeChat.id,
            sender_id: currentUser.id,
            content: `__INTERVIEW_REQUEST__:${interview.id}`
          }
        ])
        .select()
        .single()

      if (msgError) throw msgError

      // Cập nhật local state
      setInterviews(prev => ({ ...prev, [interview.id]: interview }))
      if (messageData) {
        setMessages(prev => [...prev, messageData as Message])
      }

      // Reset form
      setInterviewTitle("")
      setInterviewDate("")
      setInterviewLink("")
      setIsInterviewModalOpen(false)
      scrollToBottom()
    } catch (err: any) {
      console.error("Lỗi tạo lịch hẹn:", err.message)
      alert("Lỗi khi tạo lịch hẹn: " + err.message)
    } finally {
      setCreatingInterview(false)
    }
  }

  // Chấp nhận/Từ chối phỏng vấn
  const handleUpdateInterviewStatus = async (interviewId: string, newStatus: "accepted" | "rejected") => {
    try {
      const interview = interviews[interviewId]
      if (!interview) return

      const { error } = await supabase
        .from("interviews")
        .update({ status: newStatus })
        .eq("id", interviewId)

      if (error) throw error

      // Cập nhật state
      setInterviews(prev => ({
        ...prev,
        [interviewId]: { ...prev[interviewId], status: newStatus }
      }))

      // Gửi thông báo đến organizer
      await supabase.from("notifications").insert([
        {
          user_id: interview.organizer_id,
          title: newStatus === "accepted" ? "Lịch phỏng vấn được chấp nhận" : "Lịch phỏng vấn bị từ chối",
          message: `Ứng viên đã ${newStatus === "accepted" ? "chấp nhận" : "từ chối"} lịch hẹn phỏng vấn: ${interview.title}`,
          is_read: false
        }
      ])
    } catch (err: any) {
      console.error("Lỗi cập nhật lịch hẹn:", err.message)
      alert("Không thể cập nhật trạng thái: " + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    )
  }

  const getPartnerProfile = (chat: ChatItem) => {
    return role === "organizer" ? chat.student_profile : chat.organizer_profile
  }

  const chatUI = (
    <>
      <div className="max-w-6xl mx-auto h-[calc(100vh-120px)] flex bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800/80 shadow-2xl overflow-hidden">
        {/* Left Side: Danh sách Chats */}
        <div className={`w-full md:w-80 border-r-2 border-slate-100 dark:border-slate-850 flex flex-col ${activeChat ? "hidden md:flex" : "flex"}`}>
          <div className="p-5 border-b-2 border-slate-100 dark:border-slate-850">
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-500" />
              Hộp thư trò chuyện
            </h1>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {chats.length === 0 ? (
              <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold text-xs">
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
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left ${isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-transparent"
                      }`}
                  >
                    <Avatar className="h-10 w-10 border border-white dark:border-slate-800 shadow-sm shrink-0">
                      <AvatarImage src={partner.avatar_url} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">
                        {partner.full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className={`text-sm font-bold truncate ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-800 dark:text-slate-200"}`}>
                        {partner.full_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate font-semibold">
                        Sự kiện: {chat.events.title}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Right Side: Message Thread */}
        <div className={`flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/20 ${!activeChat ? "hidden md:flex items-center justify-center" : "flex"}`}>
          {activeChat ? (
            <>
              {/* Header */}
              <div className="bg-white dark:bg-slate-900 p-4 border-b-2 border-slate-100 dark:border-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => {
                      setActiveChat(null)
                      navigate("/chat")
                    }}
                    className="md:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors mr-1"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <Avatar className="h-10 w-10 border shadow-inner shrink-0">
                    <AvatarImage src={getPartnerProfile(activeChat).avatar_url} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black">
                      {getPartnerProfile(activeChat).full_name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate">
                      {getPartnerProfile(activeChat).full_name}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
                      Đang liên hệ về: {activeChat.events.title}
                    </p>
                  </div>
                </div>

                {role === "organizer" && (
                  <Button
                    onClick={() => setIsInterviewModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 px-4 flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    Hẹn phỏng vấn
                  </Button>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {/* Nút tải thêm tin nhắn cũ */}
                {hasMoreMessages && (
                  <div className="flex justify-center pb-3">
                    <button
                      onClick={() => {
                        const nextLimit = messagesLimit + 20
                        setMessagesLimit(nextLimit)
                        fetchMessages(activeChat.id, nextLimit)
                      }}
                      className="text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      Tải tin nhắn cũ hơn
                    </button>
                  </div>
                )}

                {messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser.id

                  // Kiểm tra xem tin nhắn có phải là lời mời phỏng vấn không
                  if (msg.content.startsWith("__INTERVIEW_REQUEST__:")) {
                    const interviewId = msg.content.substring("__INTERVIEW_REQUEST__:".length)
                    const interview = interviews[interviewId]

                    if (!interview) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <div className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-400 px-3 py-1.5 rounded-xl font-medium">
                            Đang tải thông tin phỏng vấn...
                          </div>
                        </div>
                      )
                    }

                    const isStudent = role === "student"

                    return (
                      <div key={msg.id} className="flex justify-center my-4 w-full">
                        <div className="bg-white dark:bg-slate-850 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-sm max-w-md w-full space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400">
                              <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">Lời Mời Phỏng Vấn</h4>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">HẸN LỊCH TRỰC TUYẾN</p>
                            </div>
                          </div>

                          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-350">
                            <div>
                              <span className="font-bold text-slate-400 block mb-0.5">Chủ đề:</span>
                              <span className="text-slate-800 dark:text-slate-200 font-black">{interview.title}</span>
                            </div>
                            <div className="flex gap-4">
                              <div className="flex-1">
                                <span className="font-bold text-slate-400 block mb-0.5">Thời gian:</span>
                                <span className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                                  {new Date(interview.scheduled_at).toLocaleString("vi-VN", {
                                    dateStyle: "medium",
                                    timeStyle: "short"
                                  })}
                                </span>
                              </div>
                            </div>
                            {interview.meeting_link && (
                              <div>
                                <span className="font-bold text-slate-400 block mb-0.5">Link phòng họp:</span>
                                <a
                                  href={interview.meeting_link.startsWith("http") ? interview.meeting_link : `https://${interview.meeting_link}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400 hover:underline"
                                >
                                  <Video className="w-3.5 h-3.5" />
                                  Tham gia cuộc gọi trực tuyến
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            {interview.status === "pending" ? (
                              isStudent ? (
                                <div className="flex gap-2">
                                  <Button
                                    onClick={() => handleUpdateInterviewStatus(interview.id, "accepted")}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5 shadow-sm"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Đồng ý
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => handleUpdateInterviewStatus(interview.id, "rejected")}
                                    className="flex-1 border-rose-100 hover:bg-rose-50 text-rose-600 hover:text-rose-700 dark:border-rose-900/30 dark:hover:bg-rose-950/20 font-bold text-xs rounded-xl h-9 flex items-center justify-center gap-1.5"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    Từ chối
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-center text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 py-2 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                                  Đang chờ phản hồi từ ứng viên
                                </div>
                              )
                            ) : interview.status === "accepted" ? (
                              <div className="text-center text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 py-2 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 flex items-center justify-center gap-1.5">
                                <Check className="w-4 h-4" />
                                Đã chấp nhận lịch hẹn
                              </div>
                            ) : (
                              <div className="text-center text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 py-2 rounded-xl border border-rose-100/50 dark:border-rose-900/30 flex items-center justify-center gap-1.5">
                                <X className="w-4 h-4" />
                                Lịch hẹn bị từ chối
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMe ? "justify-end" : "justify-start"} animate-in fade-in duration-150`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm font-medium leading-relaxed shadow-sm ${isMe
                            ? "bg-emerald-600 text-white rounded-tr-none"
                            : "bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800"
                          }`}
                      >
                        <p className="break-words">{msg.content}</p>
                        <span className={`block text-[9px] text-right mt-1.5 font-bold ${isMe ? "text-emerald-200" : "text-slate-400"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("vi-VN", {
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

              {/* Input Form */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 bg-white dark:bg-slate-900 border-t-2 border-slate-100 dark:border-slate-850 flex items-center gap-3"
              >
                <input
                  type="text"
                  placeholder="Nhập tin nhắn..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-12 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:focus:border-emerald-500 dark:text-slate-150 transition-colors"
                />
                <Button
                  type="submit"
                  disabled={sending}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white h-12 w-12 shrink-0 p-0 flex items-center justify-center shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center p-6 space-y-3">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-350">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Chọn cuộc hội thoại</h3>
              <p className="text-xs text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                Chọn một hội thoại ở thanh bên trái hoặc nhắn tin từ bài đăng tuyển dụng để bắt đầu thảo luận.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Lên lịch phỏng vấn (Dành cho Organizer) */}
      {isInterviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-black text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Hẹn phỏng vấn
              </h3>
              <button
                onClick={() => setIsInterviewModalOpen(false)}
                className="text-xs font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Chủ đề phỏng vấn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Phỏng vấn vị trí CTV Sự Kiện..."
                  value={interviewTitle}
                  onChange={(e) => setInterviewTitle(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:text-slate-150 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Thời gian diễn ra *</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:text-slate-150 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Link phòng họp (Google Meet, Zoom...) - Không bắt buộc</label>
                <input
                  type="text"
                  placeholder="Ví dụ: meet.google.com/abc-defg-hij"
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full h-11 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 text-sm font-medium focus:outline-none border-2 border-transparent focus:border-emerald-500 dark:text-slate-150 transition-colors"
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  disabled={creatingInterview}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-11 flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  {creatingInterview ? "Đang lên lịch..." : "Gửi lời mời phỏng vấn"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )

  if (role === "organizer") {
    return (
      <OrgLayout
        activeTab="chat"
        setActiveTab={(tab) => navigate(`/?tab=${tab}`)}
        isPremium={localStorage.getItem("em_premium_recruiter") === "true"}
        userProfile={{
          fullName: currentUser?.raw_user_meta_data?.full_name || "Nhà tuyển dụng",
          avatarUrl: currentUser?.raw_user_meta_data?.avatar_url || "",
          email: currentUser?.email || ""
        }}
        onLogout={async () => {
          localStorage.removeItem("em_user_profile")
          await supabase.auth.signOut()
          navigate("/")
        }}
      >
        <div className="py-2">
          {chatUI}
        </div>
      </OrgLayout>
    )
  }

  return (
    <MainLayout role={role}>
      {chatUI}
    </MainLayout>
  )
}
