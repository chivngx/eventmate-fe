import { Search, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RotatingText from "@/components/RotatingText"

interface StudentHeroProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  locationTerm: string
  setLocationTerm: (value: string) => void
}

export default function StudentHero({
  searchTerm,
  setSearchTerm,
  locationTerm,
  setLocationTerm
}: StudentHeroProps) {
  return (
    <div 
      className="relative overflow-hidden rounded-3xl px-6 py-14 shadow-lg sm:px-16 sm:py-16 animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{
        background: "linear-gradient(135deg, #002b33 0%, #008060 60%, #2bab60 100%)"
      }}
    >
      <div className="relative z-10 mx-auto max-w-3xl text-center space-y-5">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl leading-tight flex flex-col items-center justify-center gap-3">
          <span>Tìm cơ hội sự kiện</span>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <span>phù hợp nhất với</span>
            <RotatingText
              texts={["sự nghiệp", "tương lai", "năng lực", "đam mê"]}
              mainClassName="text-emerald-700 bg-white px-3 sm:px-4 py-0.5 sm:py-1 rounded-xl inline-flex overflow-hidden justify-center shadow-md border border-emerald-100"
              staggerFrom="first"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-120%", opacity: 0 }}
              staggerDuration={0.02}
              splitLevelClassName="overflow-hidden pb-0.5"
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              rotationInterval={2500}
            />
          </div>
        </h1>
        <p className="mx-auto max-w-xl text-sm sm:text-base text-emerald-50/80 font-medium">
          Hàng ngàn vị trí Tình nguyện viên, CTV Truyền thông và Điều phối đang chờ đón bạn.
        </p>
 
        <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-md sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center px-4 py-2 sm:py-0">
            <Search className="h-5 w-5 text-emerald-600 shrink-0" />
            <Input
              placeholder="Tìm tên sự kiện, BTC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-800 font-bold text-base placeholder:text-slate-400 h-11"
            />
          </div>
          <div className="hidden h-8 w-[2px] bg-slate-100 sm:block"></div>
          <div className="flex flex-1 items-center px-4 py-2 sm:py-0">
            <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
            <Input
              placeholder="Địa điểm (VD: Hà Nội, Đà Nẵng)"
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-800 font-bold text-base placeholder:text-slate-400 h-11"
            />
          </div>
          <Button className="h-11 w-full rounded-xl bg-[#00b14f] hover:bg-[#009b45] px-8 text-sm font-black text-white sm:w-auto transition-all shadow-md shadow-emerald-700/20">
            Tìm kiếm ngay
          </Button>
        </div>
      </div>
    </div>
  )
}
