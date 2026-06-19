import { Heart, BookOpen, Trophy, Cpu, Music, Tag } from "lucide-react"
import { useSearchParams } from "react-router-dom"

interface TrendingCategoriesSliderProps {
  events: any[]
  setCurrentPage: (page: number) => void
}

export default function TrendingCategoriesSlider({ events, setCurrentPage }: TrendingCategoriesSliderProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeCategory = searchParams.get("category") || ""

  const categories = [
    { label: "Tất cả", value: "", icon: Tag, color: "text-slate-500 bg-slate-50 border-slate-200" },
    { label: "Tình nguyện", value: "Tình nguyện", icon: Heart, color: "text-rose-500 bg-rose-50 border-rose-100" },
    { label: "Workshop", value: "Workshop", icon: BookOpen, color: "text-blue-500 bg-blue-50 border-blue-100" },
    { label: "Thể thao", value: "Thể thao", icon: Trophy, color: "text-amber-500 bg-amber-50 border-amber-100" },
    { label: "Công nghệ", value: "Công nghệ", icon: Cpu, color: "text-purple-500 bg-purple-50 border-purple-100" },
    { label: "Lễ hội Âm nhạc", value: "Lễ hội Âm nhạc", icon: Music, color: "text-emerald-500 bg-emerald-50 border-emerald-100" }
  ]

  const getEventCount = (catValue: string) => {
    if (!catValue) return events.length
    return events.filter(e => e.category === catValue).length
  }

  const handleCategoryClick = (catValue: string) => {
    if (catValue === "") {
      searchParams.delete("category")
    } else {
      searchParams.set("category", catValue)
    }
    setSearchParams(searchParams)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-black text-slate-800 tracking-tight uppercase">Danh mục nổi bật 🔥</h3>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-1 px-1">
        {categories.map((cat) => {
          const Icon = cat.icon
          const count = getEventCount(cat.value)
          const isActive = activeCategory === cat.value

          return (
            <button
              key={cat.label}
              onClick={() => handleCategoryClick(cat.value)}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all shrink-0 hover:shadow-md hover:-translate-y-0.5 ${
                isActive
                  ? "bg-emerald-600 border-emerald-600 text-white"
                  : "bg-white border-slate-100 text-slate-700"
              }`}
            >
              <div className={`p-2 rounded-xl shrink-0 ${isActive ? "bg-white/20 text-white" : cat.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black leading-none">{cat.label}</p>
                <p className={`text-[10px] font-bold mt-1 leading-none ${isActive ? "text-emerald-100" : "text-slate-400"}`}>
                  {count} chiến dịch
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
