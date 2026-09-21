import type { Metadata } from "next"
import ChatView from "@/features/chat/ChatView"

export const metadata: Metadata = {
  title: "Tin nhắn trao đổi",
  description: "Trò chuyện trực tiếp với Ban tổ chức và người tham gia sự kiện trong thời gian thực.",
}

export default function ChatConversationPage() {
  return <ChatView embedded={true} />
}
