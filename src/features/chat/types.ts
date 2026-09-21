export interface EventContextItem {
  chatId: string
  eventId: string
  eventTitle: string
}

export interface ChatPartnerProfile {
  id: string
  full_name: string
  avatar_url: string
}

export interface ChatItem {
  id: string
  partnerId: string
  event_id: string
  student_id: string
  organizer_id: string
  created_at: string
  events: { title: string }
  allEvents: EventContextItem[]
  allChatIds: string[]
  student_profile: ChatPartnerProfile
  organizer_profile: ChatPartnerProfile
  lastMessage?: string
  lastMessageTime?: string | null
  unreadCount?: number
}

export interface Message {
  id: string
  chat_id: string | null
  sender_id: string | null
  content: string
  created_at: string | null
  reply_to?: {
    sender_name: string
    content: string
  } | null
  is_voice?: boolean
  voice_duration?: string
}

export interface ChatProps {
  embedded?: boolean
  initialChatId?: string | null
}
