export interface ProfileCompletionInput {
  fullName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  university?: string | null
  experiences?: unknown[] | null
  skills?: string[] | string | null
  bio?: string | null
}

export interface MissingQualityItem {
  title: string
  score: number
  key: string
}

export interface ProfileCompletionResult {
  percent: number
  missing: MissingQualityItem[]
}

interface Criterion {
  key: string
  title: string
  score: number
  check: (input: ProfileCompletionInput) => boolean
}

const CRITERIA: Criterion[] = [
  { key: "name", title: "Cập nhật Họ và tên", score: 15, check: (i) => Boolean(i.fullName?.trim()) },
  { key: "avatar", title: "Tải lên ảnh đại diện", score: 25, check: (i) => Boolean(i.avatarUrl?.trim()) },
  { key: "phone", title: "Cập nhật số điện thoại (Zalo)", score: 20, check: (i) => Boolean(i.phone?.trim()) },
  { key: "university", title: "Cập nhật trường Đại học / CĐ", score: 15, check: (i) => Boolean(i.university?.trim()) },
  { key: "experiences", title: "Thêm kinh nghiệm chạy sự kiện", score: 15, check: (i) => Array.isArray(i.experiences) && i.experiences.length > 0 },
  { key: "skills", title: "Thêm kỹ năng & ngoại ngữ", score: 5, check: (i) => Array.isArray(i.skills) ? i.skills.length > 0 : Boolean(typeof i.skills === "string" && i.skills.trim()) },
  { key: "bio", title: "Thêm phần giới thiệu bản thân", score: 5, check: (i) => Boolean(i.bio?.trim()) },
]

export function calculateProfileCompletion(input: ProfileCompletionInput): ProfileCompletionResult {
  const missing: MissingQualityItem[] = []
  let score = 0

  for (const c of CRITERIA) {
    if (c.check(input)) {
      score += c.score
    } else {
      missing.push({ key: c.key, title: c.title, score: c.score })
    }
  }

  return {
    percent: Math.min(score, 100),
    missing: missing.slice(0, 3),
  }
}

export function getStudentProfileCompletion(
  user: any,
  profile: any,
  extra?: { experiences?: any[]; skills?: any }
): ProfileCompletionResult {
  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ""
  const phone = profile?.phone || user?.user_metadata?.phone || ""
  const university = profile?.university || user?.user_metadata?.university || ""
  const bio = profile?.bio || user?.user_metadata?.bio || ""
  const skills = extra?.skills !== undefined ? extra.skills : (profile?.skills || user?.user_metadata?.skills || "")

  let experiences = extra?.experiences
  if (!experiences) {
    if (user?.user_metadata?.experiences && Array.isArray(user.user_metadata.experiences)) {
      experiences = user.user_metadata.experiences
    } else if (typeof window !== "undefined" && user?.id) {
      try {
        const localCache = localStorage.getItem(`eventmate_cv_extra_${user.id}`)
        if (localCache) {
          const parsed = JSON.parse(localCache)
          if (parsed.experiences && Array.isArray(parsed.experiences)) {
            experiences = parsed.experiences
          }
        }
      } catch {
        // ignore
      }
    }
  }

  return calculateProfileCompletion({
    fullName,
    avatarUrl,
    phone,
    university,
    experiences,
    skills,
    bio,
  })
}
