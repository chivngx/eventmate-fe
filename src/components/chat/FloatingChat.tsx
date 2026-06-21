import { useEffect, useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Send, MessageSquare, User, ArrowLeft, X, MessageCircle } from "lucide-react"
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

export default function FloatingChat({ user, role }: { user: any; role: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState<ChatItem[]>([])
  const [activeChat, setActiveChat] = useState<ChatItem | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<any>(null)

  // Fetch list of chats
  const fetchChats = async () => {
    if (!user) return

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
      .eq(queryField, user.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      const formattedChats = data.map((item: any) => ({
        ...item,
        events: Array.isArray(item.events) ? item.events[0] || { title: "Sự kiện chung" } : item.events || { title: "Sự kiện chung" },
        student_profile: Array.isArray(item.student_profile) ? item.student_profile[0] || { id: "", full_name: "Ứng viên", avatar_url: "" } : item.student_profile || { id: "", full_name: "Ứng viên", avatar_url: "" },
        organizer_profile: Array.isArray(item.organizer_profile) ? item.organizer_profile[0] || { id: "", full_name: "Ban tổ chức", avatar_url: "" } : item.organizer_profile || { id: "", full_name: "Ban tổ chức", avatar_url: "" }
      })) as ChatItem[]

      setChats(formattedChats)
    }
  }

  // Fetch messages in active chat
  const fetchMessages = async (chatId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(30)

    if (!error && data) {
      const reversed = [...data].reverse()
      setMessages(reversed)
      scrollToBottom()
    }
  }

  useEffect(() => {
    if (user) {
      fetchChats()
    }
  }, [user, role])

  // Watch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id)

      // Realtime subscription
      const channel = supabase
        .channel(`floating-chat-${activeChat.id}`)
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
              scrollToBottom()
            }
          }
        )
        .subscribe()

      // Polling fallback
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(activeChat.id)
      }, 4000)

      return () => {
        supabase.removeChannel(channel)
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
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
    if (!newMessage.trim() || !activeChat || !user || sending) return

    setSending(true)
    const tempMsg = newMessage
    setNewMessage("")

    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          chat_id: activeChat.id,
          sender_id: user.id,
          content: tempMsg
        }
      ])
      .select()
      .single()

    setSending(false)

    if (error) {
      console.error(error.message)
      setNewMessage(tempMsg)
    } else if (data) {
      setMessages((prev) => [...prev, data as Message])
      scrollToBottom()
    }
  }

  const getPartnerProfile = (chat: ChatItem) => {
    return role === "organizer" ? chat.student_profile : chat.organizer_profile
  }

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans flex flex-col items-end">
      {/* Messenger Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[380px] h-[520px] bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#00b14f] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeChat && (
                <button
                  onClick={() => setActiveChat(null)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              {activeChat ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="h-8 w-8 border border-white/20 shrink-0">
                    <AvatarImage src={getPartnerProfile(activeChat).avatar_url} />
                    <AvatarFallback className="bg-white/25 text-white font-bold text-xs">
                      {getPartnerProfile(activeChat).full_name?.charAt(0).toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold truncate leading-tight">
                      {getPartnerProfile(activeChat).full_name}
                    </h3>
                    <p className="text-[9px] text-white/80 truncate font-semibold leading-none">
                      {activeChat.events.title}
                    </p>
                  </div>
                </div>
              ) : (
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Hộp thư trò chuyện
                </h3>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-slate-900/10">
            {activeChat ? (
              <>
                {/* Chat Room Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user.id
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-xs font-medium leading-relaxed shadow-sm ${
                            isMe
                              ? "bg-[#00b14f] text-white rounded-tr-none"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700"
                          }`}
                        >
                          <p className="break-words">{msg.content}</p>
                          <span className={`block text-[8px] text-right mt-1 font-bold ${isMe ? "text-emerald-100" : "text-slate-400"}`}>
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

                {/* Form Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 h-10 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 text-xs font-medium focus:outline-none border-2 border-transparent focus:border-[#00b14f] dark:text-slate-100 transition-colors"
                  />
                  <Button
                    type="submit"
                    disabled={sending}
                    className="rounded-xl bg-[#00b14f] hover:bg-[#009e47] text-white h-10 w-10 shrink-0 p-0 flex items-center justify-center shadow-md shadow-[#00b14f]/15"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </>
            ) : (
              /* Chat List */
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
                {chats.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 dark:text-slate-500 font-semibold text-xs">
                    Chưa có hội thoại nào
                  </div>
                ) : (
                  chats.map((chat) => {
                    const partner = getPartnerProfile(chat)
                    return (
                      <button
                        key={chat.id}
                        onClick={() => setActiveChat(chat)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/40 transition-colors text-left border border-transparent"
                      >
                        <Avatar className="h-9 w-9 border border-white dark:border-slate-850 shadow-sm shrink-0">
                          <AvatarImage src={partner.avatar_url} />
                          <AvatarFallback className="bg-emerald-50 text-[#00b14f] font-bold text-xs">
                            {partner.full_name?.charAt(0).toUpperCase() || <User className="w-3.5 h-3.5" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">
                            {partner.full_name}
                          </h4>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate font-semibold">
                            Sự kiện: {chat.events.title}
                          </p>
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Messenger Circle Bubble Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#00b14f] hover:bg-[#009e47] text-white rounded-full flex items-center justify-center shadow-xl shadow-[#00b14f]/25 transition-all transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
        title="Trò chuyện"
      >
        <MessageCircle className="w-7 h-7" />
      </button>
    </div>
  )
}
