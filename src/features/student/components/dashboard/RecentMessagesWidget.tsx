import Link from "next/link"
import { ChevronRight } from "lucide-react"

interface RecentMessagesWidgetProps {
  recentChats: any[]
}

export function RecentMessagesWidget({ recentChats }: RecentMessagesWidgetProps) {
  return (
    <div className="bg-white rounded-[16px] border border-[#ededed] p-[20px] shadow-xs h-[523px] flex flex-col justify-start relative overflow-hidden">
      {/* Header (Figma Node 7381:43824, Frame 2147224826) */}
      <div className="flex flex-col gap-[8px] w-full pb-[12px] border-b border-[#ededed]">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-['Inter'] font-semibold text-[16px] text-[#222222] leading-normal">
            Tin nhắn
          </h3>
          <Link
            href="/chat"
            className="flex items-center gap-[4px] text-[12px] font-semibold text-[#005ddc] hover:underline cursor-pointer group"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#005ddc] transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Messages Content */}
      {recentChats.length > 0 ? (
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[#ededed] -mx-[4px]">
          {recentChats.map((chat) => {
            const orgName = chat.organizer?.full_name || "Ban tổ chức"
            const orgAvatar =
              chat.organizer?.avatar_url ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=005DDC&color=fff`
            const sortedMsgs = chat.messages
              ? [...chat.messages].sort(
                  (a, b) =>
                    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                )
              : []
            const lastMsgObj = sortedMsgs[sortedMsgs.length - 1]
            const lastMsg = lastMsgObj?.content || "Bắt đầu cuộc trò chuyện..."

            // Relative time calculation
            let timeStr = "Vừa xong"
            if (lastMsgObj?.created_at) {
              const diffMs = Date.now() - new Date(lastMsgObj.created_at).getTime()
              const diffMin = Math.floor(diffMs / (1000 * 60))
              if (diffMin < 1) timeStr = "Vừa xong"
              else if (diffMin < 60) timeStr = `${diffMin} phút trước`
              else if (diffMin < 1440) timeStr = `${Math.floor(diffMin / 60)} giờ trước`
              else timeStr = `${Math.floor(diffMin / 1440)} ngày trước`
            }

            return (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className="h-[72px] px-[8px] py-[12px] flex items-center gap-[12px] hover:bg-slate-50/70 transition-colors cursor-pointer group"
              >
                <div className="relative rounded-[32px] shrink-0 size-[40px] overflow-hidden bg-slate-100 border border-[#ededed]">
                  <img
                    src={orgAvatar}
                    alt={orgName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(orgName)}&background=005DDC&color=fff`
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-[4px]">
                  <div className="flex items-center justify-between w-full">
                    <p className="font-['Inter'] font-medium text-[14px] text-[#222222] truncate group-hover:text-[#005ddc] transition-colors">
                      {orgName}
                    </p>
                    <span className="font-['Inter'] font-normal text-[10px] text-[#757575] shrink-0 ml-2">
                      {timeStr}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-[8px] w-full">
                    <p className="font-['Inter'] font-normal text-[12px] text-[#515151] truncate flex-1">
                      {lastMsg}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <p className="font-['Inter'] font-medium text-[16px] text-[#a5a5a5] leading-normal select-none">
            Bạn chưa có tin nhắn nào
          </p>
        </div>
      )}
    </div>
  )
}
