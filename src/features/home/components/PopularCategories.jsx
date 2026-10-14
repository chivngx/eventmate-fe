"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"

/* ---------------------------------------------------------
   Dual-tone Brand-aligned SVG Icons (viewBox: 0 0 64 64)
   Palette: Dark Slate (#1E293B) + Brand Mint/Teal (#0D9488 / #14B8A6 / #2DD4BF)
   --------------------------------------------------------- */

function IconPgPb() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <circle cx="32" cy="20" r="8" fill="#1E293B" />
      <path d="M18 46C18 37.163 24.268 30 32 30C39.732 30 46 37.163 46 46V48H18V46Z" fill="#1E293B" />
      <path d="M27 30L32 37L37 30" stroke="#F0FDFA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M28 37L32 41L36 37" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
      <rect x="29" y="41" width="6" height="5" rx="1.5" fill="#0D9488" />
      <path d="M46 13L47.2 17L51 18.2L47.2 19.4L46 23.4L44.8 19.4L41 18.2L44.8 17L46 13Z" fill="#14B8A6" />
      <circle cx="16" cy="22" r="2" fill="#2DD4BF" />
    </svg>
  )
}

function IconReception() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <rect x="17" y="16" width="30" height="36" rx="5" fill="#1E293B" />
      <rect x="25" y="12" width="14" height="7" rx="2.5" fill="#64748B" />
      <circle cx="32" cy="15.5" r="1.5" fill="#FFFFFF" />
      <rect x="23" y="24" width="12" height="3" rx="1.5" fill="#94A3B8" />
      <rect x="23" y="31" width="18" height="3" rx="1.5" fill="#94A3B8" />
      <rect x="23" y="38" width="14" height="3" rx="1.5" fill="#94A3B8" />
      <circle cx="43" cy="42" r="10.5" fill="#0D9488" />
      <path d="M38 42L41.5 45.5L48 38.5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconLogistics() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <rect x="14" y="21" width="36" height="28" rx="4" fill="#1E293B" />
      <rect x="14" y="21" width="36" height="7" rx="2" fill="#334155" />
      <rect x="14" y="21" width="7" height="7" rx="2" fill="#64748B" />
      <rect x="43" y="21" width="7" height="7" rx="2" fill="#64748B" />
      <rect x="14" y="42" width="7" height="7" rx="2" fill="#64748B" />
      <rect x="43" y="42" width="7" height="7" rx="2" fill="#64748B" />
      <rect x="28" y="25" width="8" height="5" rx="1.5" fill="#94A3B8" />
      <circle cx="45" cy="19" r="9.5" fill="#0D9488" />
      <path d="M45 24V14M45 14L41 18M45 14L49 18" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconCoordination() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <rect x="23" y="10" width="4" height="13" rx="2" fill="#1E293B" />
      <rect x="35" y="15" width="5" height="8" rx="2" fill="#475569" />
      <rect x="19" y="21" width="26" height="31" rx="5" fill="#1E293B" />
      <line x1="25" y1="29" x2="39" y2="29" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="25" y1="34" x2="39" y2="34" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="25" y1="39" x2="34" y2="39" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 14C47.5 17.5 47.5 23.5 44 27" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M49 10C54 15 54 26 49 31" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="24" cy="46" r="2.5" fill="#10B981" />
    </svg>
  )
}

function IconMcHost() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <rect x="25" y="14" width="14" height="22" rx="7" fill="#1E293B" />
      <line x1="25" y1="24" x2="39" y2="24" stroke="#475569" strokeWidth="2" />
      <path d="M19 29C19 36.18 24.82 42 32 42C39.18 42 45 36.18 45 29" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M32 42V50" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="24" y1="50" x2="40" y2="50" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M48 21C51 24.5 51 31.5 48 35" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 21C13 24.5 13 31.5 16 35" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M44 11L45.2 14.5L49 15.7L45.2 16.9L44 20.4L42.8 16.9L39 15.7L42.8 14.5L44 11Z" fill="#14B8A6" />
    </svg>
  )
}

function IconCamera() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M14 24C14 21.7909 15.7909 20 18 20H23L25.5 16.5H38.5L41 20H46C48.2091 20 50 21.7909 50 24V44C50 46.2091 48.2091 48 46 48H18C15.7909 48 14 46.2091 14 44V24Z" fill="#1E293B" />
      <circle cx="32" cy="34" r="11" fill="#0D9488" />
      <circle cx="32" cy="34" r="7" fill="#134E4A" />
      <circle cx="29.5" cy="31.5" r="2.5" fill="#5EEAD4" />
      <circle cx="45" cy="25" r="2.5" fill="#14B8A6" />
    </svg>
  )
}

function IconBanquet() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M16 38C16 26.9543 23.1634 18 32 18C40.8366 18 48 26.9543 48 38H16Z" fill="#1E293B" />
      <circle cx="32" cy="15.5" r="3.5" fill="#1E293B" />
      <rect x="12" y="39" width="40" height="5" rx="2.5" fill="#1E293B" />
      <path d="M27 12C27 8 30 7 30 4" stroke="#0D9488" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M35 12C35 8 37 7 37 4" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="30" r="3" fill="#14B8A6" />
    </svg>
  )
}

function IconBarista() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M21 25L23.5 46C23.5 47.6569 24.8431 49 26.5 49H35.5C37.1569 49 38.5 47.6569 38.5 46L41 25H21Z" fill="#1E293B" />
      <rect x="20" y="20.5" width="22" height="4.5" rx="2" fill="#334155" />
      <path d="M26 20.5V16C26 14.3431 27.3431 13 29 13H33C34.6569 13 36 14.3431 36 16V20.5H26Z" fill="#1E293B" />
      <circle cx="44" cy="22" r="9" fill="#0D9488" />
      <path d="M39.5 22C39.5 24.5 41.5 26.5 44 26.5C46.5 26.5 48.5 24.5 48.5 22H39.5Z" fill="#FFFFFF" />
      <circle cx="44" cy="18" r="1.5" fill="#5EEAD4" />
    </svg>
  )
}

function IconMascot() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M18 22C18 34 26 44 34 44C42 44 50 34 50 22C42 24 26 24 18 22Z" fill="#1E293B" />
      <circle cx="27" cy="29" r="3" fill="#F0FDFA" />
      <circle cx="41" cy="29" r="3" fill="#F0FDFA" />
      <path d="M28 36C30.5 39 37.5 39 40 36" stroke="#F0FDFA" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="20" cy="14" r="2.5" fill="#0D9488" />
      <path d="M32 9L33 12L36 13L33 14L32 17L31 14L28 13L31 12L32 9Z" fill="#14B8A6" />
      <circle cx="46" cy="13" r="3" fill="#2DD4BF" />
    </svg>
  )
}

function IconVolunteer() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M15 39C15 39 19 34 25 34C28 34 30 36 32 37C34 36 36 34 39 34C45 34 49 39 49 39L46 47H18L15 39Z" fill="#1E293B" />
      <path d="M32 16.5C29.5 13 24 13.5 22 17C19.5 21.5 24 28 32 32.5C40 28 44.5 21.5 42 17C40 13.5 34.5 13 32 16.5Z" fill="#0D9488" />
      <circle cx="26" cy="18" r="2" fill="#5EEAD4" />
    </svg>
  )
}

function IconAudioLighting() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <rect x="15" y="24" width="34" height="24" rx="4" fill="#1E293B" />
      <line x1="22" y1="29" x2="22" y2="43" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="22" cy="35" r="3.5" fill="#0D9488" />
      <line x1="32" y1="29" x2="32" y2="43" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="32" r="3.5" fill="#14B8A6" />
      <line x1="42" y1="29" x2="42" y2="43" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="42" cy="38" r="3.5" fill="#0D9488" />
      <path d="M32 11L26 21H38L32 11Z" fill="#1E293B" />
      <circle cx="32" cy="11" r="2" fill="#2DD4BF" />
    </svg>
  )
}

function IconSecurity() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M32 14L46 19V30C46 39.5 39.5 47 32 50C24.5 47 18 39.5 18 30V19L32 14Z" fill="#1E293B" />
      <circle cx="32" cy="32" r="8" fill="#0D9488" />
      <path d="M28.5 32L31 34.5L35.5 29.5" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconTicketing() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <rect x="20" y="15" width="24" height="34" rx="4" fill="#1E293B" />
      <rect x="24" y="19" width="16" height="10" rx="1.5" fill="#475569" />
      <circle cx="26" cy="34" r="1.5" fill="#94A3B8" />
      <circle cx="32" cy="34" r="1.5" fill="#94A3B8" />
      <circle cx="38" cy="34" r="1.5" fill="#94A3B8" />
      <circle cx="26" cy="39" r="1.5" fill="#94A3B8" />
      <circle cx="32" cy="39" r="1.5" fill="#94A3B8" />
      <circle cx="38" cy="39" r="1.5" fill="#94A3B8" />
      <rect x="25" y="10" width="14" height="7" rx="1.5" fill="#0D9488" />
      <line x1="28" y1="13" x2="36" y2="13" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function IconModel() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M32 15C32 12.5 34 11 36 12.5C38 14 36.5 16.5 35 17.5L32 19.5" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M16 32L32 20L48 32H16Z" fill="#1E293B" />
      <line x1="16" y1="32" x2="48" y2="32" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
      <path d="M26 32L21 48H43L38 32H26Z" fill="#334155" />
      <path d="M46 16L47.2 19.5L51 20.7L47.2 21.9L46 25.4L44.8 21.9L41 20.7L44.8 19.5L46 16Z" fill="#14B8A6" />
      <circle cx="17" cy="22" r="2" fill="#0D9488" />
    </svg>
  )
}

function IconChoreography() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <circle cx="34" cy="17" r="5" fill="#1E293B" />
      <path d="M22 25C26 23 31 23 35 24L39 33L45 36" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M33 25L30 36L22 47" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 36L38 48" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="18" r="3.5" fill="#0D9488" />
      <path d="M22.5 18V10L30 8V13" stroke="#0D9488" strokeWidth="2" strokeLinecap="round" />
      <circle cx="27" cy="13" r="2.5" fill="#14B8A6" />
    </svg>
  )
}

function IconTourGuide() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-12 h-12 sm:w-14 sm:h-14">
      <circle cx="32" cy="32" r="30" fill="#F0FDFA" />
      <path d="M19 28V36H24L33 42V22L24 28H19Z" fill="#1E293B" />
      <path d="M24 36L26 44H29L27 36" fill="#475569" />
      <line x1="43" y1="12" x2="43" y2="38" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M43 14L52 19L43 24V14Z" fill="#0D9488" />
      <path d="M37 27C38.5 28.5 38.5 33.5 37 35" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ---------------------------------------------------------
   16 Event Categories (Split into 2 pages of 8 cards: 4x2 grid)
   --------------------------------------------------------- */
const CATEGORIES_DATA = [
  // Page 1
  {
    id: "pg-pb-su-kien",
    name: "PG & PB Sự kiện",
    icon: IconPgPb,
    searchKeyword: "PG & PB Sự kiện",
    keywords: ["pg", "pb", "brand ambassador", "khuyến mãi", "sampling", "hoạt náo viên"],
  },
  {
    id: "le-tan-check-in",
    name: "Lễ tân & Check-in",
    icon: IconReception,
    searchKeyword: "Lễ tân & Check-in",
    keywords: ["lễ tân", "check-in", "check in", "soát vé", "đón tiếp", "đón khách", "ghi danh"],
  },
  {
    id: "hau-can-san-khau",
    name: "Hậu cần & Sân khấu",
    icon: IconLogistics,
    searchKeyword: "Hậu cần & Sân khấu",
    keywords: ["hậu cần", "sân khấu", "setup", "đạo cụ", "kỹ thuật", "hậu trường"],
  },
  {
    id: "dieu-phoi-su-kien",
    name: "Điều phối sự kiện",
    icon: IconCoordination,
    searchKeyword: "Điều phối sự kiện",
    keywords: ["điều phối", "supervisor", "giám sát", "quản lý", "điều hành"],
  },
  {
    id: "mc-hoat-nao",
    name: "MC & Hoạt náo",
    icon: IconMcHost,
    searchKeyword: "MC & Hoạt náo",
    keywords: ["mc", "hoạt náo", "dẫn chương trình", "host", "diễn thuyết"],
  },
  {
    id: "quay-phim-chup-anh",
    name: "Quay phim & Chụp ảnh",
    icon: IconCamera,
    searchKeyword: "Quay phim & Chụp ảnh",
    keywords: ["quay phim", "chụp ảnh", "camera", "media", "photographer", "videographer", "nhiếp ảnh"],
  },
  {
    id: "phuc-vu-tiec-banquet",
    name: "Phục vụ tiệc (Banquet)",
    icon: IconBanquet,
    searchKeyword: "Phục vụ tiệc (Banquet)",
    keywords: ["phục vụ", "tiệc", "banquet", "bồi bàn", "waiter", "waitress", "catering", "bàn tiệc"],
  },
  {
    id: "pha-che-su-kien",
    name: "Pha chế sự kiện",
    icon: IconBarista,
    searchKeyword: "Pha chế sự kiện",
    keywords: ["pha chế", "bartender", "barista", "đồ uống", "cocktail"],
  },
  // Page 2
  {
    id: "mascot-bieu-dien",
    name: "Mascot & Biểu diễn",
    icon: IconMascot,
    searchKeyword: "Mascot & Biểu diễn",
    keywords: ["mascot", "biểu diễn", "cosplay", "vũ đạo", "nhảy", "ca sĩ", "vũ công", "ảo thuật"],
  },
  {
    id: "tinh-nguyen-vien",
    name: "Tình nguyện viên",
    icon: IconVolunteer,
    searchKeyword: "Tình nguyện viên",
    keywords: ["tình nguyện", "tnv", "volunteer", "hỗ trợ viên", "cộng tác viên"],
  },
  {
    id: "am-thanh-anh-sang",
    name: "Âm thanh & Ánh sáng",
    icon: IconAudioLighting,
    searchKeyword: "Âm thanh & Ánh sáng",
    keywords: ["âm thanh", "ánh sáng", "sound", "lighting", "audio", "kỹ thuật viên"],
  },
  {
    id: "an-ninh-bao-ve",
    name: "An ninh & Điều hướng",
    icon: IconSecurity,
    searchKeyword: "An ninh & Điều hướng",
    keywords: ["an ninh", "bảo vệ", "trật tự", "security", "điều hướng", "giữ xe"],
  },
  {
    id: "thu-ngan-ban-ve",
    name: "Thu ngân & Bán vé",
    icon: IconTicketing,
    searchKeyword: "Thu ngân & Bán vé",
    keywords: ["thu ngân", "bán vé", "cashier", "soát vé", "bán hàng"],
  },
  {
    id: "mau-anh-lookbook",
    name: "Mẫu ảnh & Lookbook",
    icon: IconModel,
    searchKeyword: "Mẫu ảnh & Lookbook",
    keywords: ["mẫu ảnh", "lookbook", "model", "người mẫu", "thời trang"],
  },
  {
    id: "bien-dao-vu-doan",
    name: "Biên đạo & Vũ đoàn",
    icon: IconChoreography,
    searchKeyword: "Biên đạo & Vũ đoàn",
    keywords: ["biên đạo", "vũ đoàn", "vũ công", "dancer", "nhóm nhảy"],
  },
  {
    id: "huong-dan-dan-tour",
    name: "Hướng dẫn & Dẫn tour",
    icon: IconTourGuide,
    searchKeyword: "Hướng dẫn & Dẫn tour",
    keywords: ["hướng dẫn", "dẫn tour", "tour guide", "thuyết minh", "chỉ dẫn"],
  },
]

function matchesKeyword(text, keyword) {
  const lowerText = text.toLowerCase()
  const lowerKw = keyword.toLowerCase()
  if (lowerKw.length <= 3) {
    const escaped = lowerKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(
      `(^|[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ])${escaped}([^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]|$)`,
      "i"
    )
    return regex.test(lowerText)
  }
  return lowerText.includes(lowerKw)
}

export default function PopularCategories() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(0)
  const touchStartX = useRef(null)

  // Real job counts state fetched from Supabase
  const [counts, setCounts] = useState({})
  const [loadingCounts, setLoadingCounts] = useState(true)

  // Fetch real count of active event jobs from Supabase
  useEffect(() => {
    let isMounted = true

    const fetchRealJobCounts = async () => {
      try {
        const { data: events, error } = await supabase
          .from("events")
          .select(`
            id,
            title,
            position_type,
            category,
            status,
            deleted_at,
            event_positions (
              id,
              title,
              slots_needed
            )
          `)
          .is("deleted_at", null)
          .neq("status", "closed")
          .neq("status", "cancelled")

        if (error) {
          console.error("Lỗi khi tải số liệu việc làm theo danh mục:", error)
          return
        }

        if (events && isMounted) {
          const newCounts = {}

          CATEGORIES_DATA.forEach((cat) => {
            let matchCount = 0

            events.forEach((event) => {
              // 1. Chỉ xét các vị trí thực tế ĐANG CÒN CHỈ TIÊU (slots_needed > 0)
              const hasPositionsTable =
                Array.isArray(event.event_positions) && event.event_positions.length > 0

              let activeHiringTitles = []

              if (hasPositionsTable) {
                // Nếu sự kiện có bảng event_positions chi tiết, CHỈ lấy vị trí có slots_needed > 0
                activeHiringTitles = event.event_positions
                  .filter((p) => Number(p.slots_needed) > 0)
                  .map((p) => p.title)
              } else {
                // Sự kiện đơn giản không có bảng con: chỉ lấy khi slots_needed của sự kiện > 0
                if (Number(event.slots_needed || 0) > 0 && event.position_type) {
                  activeHiringTitles = [event.position_type]
                }
              }

              // Nếu sự kiện không còn vị trí nào cần tuyển (tất cả đã tuyển đủ), bỏ qua
              if (activeHiringTitles.length === 0) return

              // So khớp từ khóa danh mục với các vị trí đang thực sự tuyển
              const hiringText = activeHiringTitles.join(" ").toLowerCase()

              const isMatch = cat.keywords.some((kw) => matchesKeyword(hiringText, kw))
              if (isMatch) {
                matchCount++
              }
            })

            newCounts[cat.id] = matchCount
          })

          setCounts(newCounts)
        }
      } catch (err) {
        console.error("Lỗi kết nối Supabase:", err)
      } finally {
        if (isMounted) setLoadingCounts(false)
      }
    }

    fetchRealJobCounts()

    // Realtime listener for event and position changes
    const channel = supabase
      .channel("popular-categories-counts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => {
          fetchRealJobCounts()
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "event_positions" },
        () => {
          fetchRealJobCounts()
        }
      )
      .subscribe()

    return () => {
      isMounted = false
      supabase.removeChannel(channel)
    }
  }, [])

  // 8 items per page to form a 4x2 grid
  const itemsPerPage = 8
  const totalPages = Math.ceil(CATEGORIES_DATA.length / itemsPerPage)

  const pages = [
    CATEGORIES_DATA.slice(0, itemsPerPage),
    CATEGORIES_DATA.slice(itemsPerPage, itemsPerPage * 2),
  ]

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
  }

  const handleCategoryClick = (keyword) => {
    router.push(`/events?search=${encodeURIComponent(keyword)}`)
  }

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return
    const touchEndX = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX
    if (diff > 50 && currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1)
    } else if (diff < -50 && currentPage > 0) {
      setCurrentPage((p) => p - 1)
    }
    touchStartX.current = null
  }

  return (
    <section
      className="w-full bg-white rounded-2xl p-5 sm:p-7 md:p-8 border border-gray-200/90 shadow-2xs relative"
      aria-label="Các vị trí sự kiện phổ biến"
    >
      {/* Header matching user reference image */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
        <div>
          <p className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#0D9488] mb-1">
            DANH MỤC TUYỂN DỤNG HÀNG ĐẦU
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Các vị trí sự kiện phổ biến
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bạn muốn tìm việc mới? Xem danh sách việc làm{" "}
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="font-semibold text-[#0D9488] underline underline-offset-4 hover:text-teal-700 transition-colors cursor-pointer"
            >
              tại đây
            </button>
          </p>
        </div>

        {/* Circular Prev / Next Navigation Arrows */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentPage === 0}
            aria-label="Xem trang trước"
            className="size-9 sm:size-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#0D9488] hover:border-teal-400 hover:bg-teal-50/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-slate-400 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentPage === totalPages - 1}
            aria-label="Xem trang sau"
            className="size-9 sm:size-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-slate-600 hover:text-[#0D9488] hover:border-teal-400 hover:bg-teal-50/40 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-slate-400 disabled:hover:bg-white transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Grid Container with smooth horizontal sliding between pages */}
      <div
        className="overflow-hidden w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          {pages.map((pageCategories, pageIdx) => (
            <div
              key={pageIdx}
              className="w-full shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5"
            >
              {pageCategories.map((cat) => {
                const IconComponent = cat.icon
                const jobCount = counts[cat.id] ?? 0
                const countText = loadingCounts
                  ? "Đang tải..."
                  : `${jobCount} việc làm`

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.searchKeyword)}
                    className="group bg-[#F8F9FA] hover:bg-white border border-slate-100/90 hover:border-teal-300 hover:shadow-md rounded-2xl p-4 sm:p-5 md:p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer select-none active:scale-[0.98]"
                  >
                    {/* Centered Graphic Icon */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center mb-2.5 sm:mb-3 transition-transform duration-200 group-hover:scale-105">
                      <IconComponent />
                    </div>

                    {/* Category Title */}
                    <span className="font-bold text-slate-800 group-hover:text-teal-700 text-xs sm:text-sm md:text-[15px] leading-snug tracking-tight transition-colors line-clamp-1 w-full px-1">
                      {cat.name}
                    </span>

                    {/* Job Count with Real Database Number */}
                    <span
                      className={`text-[11px] sm:text-xs md:text-[13px] mt-1 sm:mt-1.5 transition-colors ${
                        loadingCounts
                          ? "text-slate-400 animate-pulse"
                          : jobCount > 0
                          ? "text-[#0D9488] font-bold"
                          : "text-slate-400 font-medium"
                      }`}
                    >
                      {countText}
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Subtle indicator dots for mobile/touch screens */}
      <div className="flex items-center justify-center gap-1.5 mt-4 sm:hidden">
        {pages.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentPage(idx)}
            aria-label={`Chuyển tới trang ${idx + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentPage === idx ? "w-6 bg-[#0D9488]" : "w-1.5 bg-gray-200"
            }`}
          />
        ))}
      </div>
    </section>
  )
}
