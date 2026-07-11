"use client"

import { memo } from"react"
import { Heart, MapPin } from"lucide-react"
import { useNavigate } from"@/lib/router"
import { cn } from"@/lib/utils"

interface EventCardProps {
 job: any
 idx: number
 isBookmarked: boolean
 onToggleBookmark: (eventId: string) => void
 onNavigateToJob: (jobId: string) => void
}

function EventCard({
 job,
 idx,
 isBookmarked,
 onToggleBookmark,
 onNavigateToJob,
}: EventCardProps) {
 const navigate = useNavigate()

 return (
 <div
 onClick={() => onNavigateToJob(job.id)}
 className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-md cursor-pointer animate-in fade-in slide-in-from-bottom-3"
 style={{ animationDelay: `${idx * 40}ms` }}
 >
 {/* Header: avatar + title + organizer */}
 <div className="flex gap-3 items-start">
 <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-lg border border-slate-100 shrink-0 bg-slate-50 flex items-center justify-center overflow-hidden">
 {job.profiles?.avatar_url ? (
 <img
 src={job.profiles.avatar_url}
 alt={job.profiles?.full_name ||"Organizer"}
 loading="lazy"
 className="object-cover w-full h-full"
 />
 ) : (
 <div className="flex w-full h-full items-center justify-center bg-accent text-primary font-bold uppercase transition-colors">
 {job.profiles?.full_name ? job.profiles.full_name.charAt(0) :"O"}
 </div>
 )}
 </div>

 <div className="flex-1 min-w-0">
 <h3
 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2"
 title={job.title}
 >
 {job.title}
 </h3>
 <p
 onClick={(e) => {
 e.stopPropagation()
 navigate(`/companies/${job.profiles?.slug || job.organizer_id}`)
 }}
 className="text-xs text-slate-500 mt-1 truncate hover:text-primary transition-colors"
 title={job.profiles?.full_name}
 >
 {job.profiles?.full_name ||"Đơn vị ẩn danh"}
 </p>
 </div>

 {/* Bookmark button */}
 <button
 onClick={(e) => {
 e.stopPropagation()
 onToggleBookmark(job.id)
 }}
 aria-label={isBookmarked ?"Bỏ lưu việc làm này" :"Lưu việc làm này"}
 aria-pressed={isBookmarked}
 className={cn("w-8 h-8 flex items-center justify-center rounded-lg transition-all shrink-0 active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
 isBookmarked
 ?"bg-rose-50 text-rose-500 hover:bg-rose-100"
 :"text-slate-400 hover:bg-slate-100 hover:text-rose-500"
 )}
 >
 <Heart className={cn("w-4 h-4", isBookmarked &&"fill-current")} />
 </button>
 </div>

 {/* Footer: tags (benefit + location) */}
 <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
 {job.benefits && (
 <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[140px]" title={job.benefits}>
 {job.benefits}
 </span>
 )}
 <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md inline-flex items-center gap-1 truncate max-w-[120px]" title={job.danang_wards?.name || job.location}>
 <MapPin className="w-3 h-3 shrink-0" />
 {job.danang_wards?.name || job.location ||"Đà Nẵng"}
 </span>
 </div>
 </div>
 )
}

// PERF: memoize so the card only re-renders when its own props change,
// avoiding re-renders triggered by parent state updates (filters, search).
export default memo(EventCard)
