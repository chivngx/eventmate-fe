"use client"

import { Users, MessageSquareMore, UserRoundCheck, SquareArrowOutUpRight } from "lucide-react"

interface EmployerStatsCardsProps {
  candidatesCount?: number
  messagesCount?: number
  interviewsCount?: number
  onNavigateTab?: (tab: string) => void
}

export default function EmployerStatsCards({
  candidatesCount = 0,
  messagesCount = 0,
  interviewsCount = 0,
  onNavigateTab,
}: EmployerStatsCardsProps) {
  const cards = [
    {
      id: "candidates",
      number: candidatesCount,
      label: "Ứng viên chờ duyệt",
      icon: Users,
      tab: "events",
    },
    {
      id: "messages",
      number: messagesCount,
      label: "Tin nhắn nhận được",
      icon: MessageSquareMore,
      tab: "chat",
    },
    {
      id: "interviews",
      number: interviewsCount,
      label: "Lịch phỏng vấn",
      icon: UserRoundCheck,
      tab: "events",
    },
  ]

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[16px] px-[16px] py-[18px] w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[16px]">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.id}
              onClick={() => onNavigateTab && onNavigateTab(card.tab)}
              className="bg-white dark:bg-zinc-900 border border-[#ededed] dark:border-zinc-800 rounded-[16px] px-[16px] py-[24px] relative flex items-center justify-between cursor-pointer hover:border-slate-300 dark:hover:border-zinc-700 transition-all group"
            >
              <div className="flex items-center gap-[16px] min-w-0">
                {/* 40x40px Clean Icon without background color box */}
                <div className="size-[40px] flex items-center justify-center shrink-0 text-[#222222] dark:text-zinc-100">
                  <Icon className="w-8 h-8 stroke-[1.75]" />
                </div>

                <div className="min-w-0 flex flex-col justify-center">
                  <p className="font-['Inter'] font-semibold text-[24px] text-[#222222] dark:text-white leading-[normal]">
                    {card.number}
                  </p>
                  <p className="font-['Inter'] font-normal text-[12px] text-[#222222] dark:text-zinc-400 leading-[normal] mt-0.5 truncate">
                    {card.label}
                  </p>
                </div>
              </div>

              {/* Arrow Export icon at top right */}
              <div className="absolute top-[16px] right-[16px] text-[#222222] dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                <SquareArrowOutUpRight className="w-[18px] h-[18px] stroke-[1.75]" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
