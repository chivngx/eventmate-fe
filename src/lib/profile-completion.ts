/**
 * Shared Profile Completion Scoring Logic for Student / Event Crew Profiles
 * Chuẩn hóa 100% công thức tính điểm độ hoàn thiện hồ sơ trên toàn ứng dụng:
 * - Ảnh đại diện: 25%
 * - Số điện thoại (Zalo): 20%
 * - Họ và tên: 15%
 * - Trường Đại học / Cao đẳng: 15%
 * - Kinh nghiệm sự kiện: 15%
 * - Kỹ năng nổi bật & Ngoại ngữ: 5%
 * - Giới thiệu bản thân hoặc CV PDF: 5%
 * Tổng: 100%
 */

export interface ProfileCompletionInput {
  fullName?: string | null
  avatarUrl?: string | null
  phone?: string | null
  university?: string | null
  experiences?: any[] | null
  skills?: string[] | string | null
  bio?: string | null
  cvUrl?: string | null
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

export function calculateProfileCompletion(input: ProfileCompletionInput): ProfileCompletionResult {
  const missing: MissingQualityItem[] = []
  let score = 0

  // 1. Họ và tên (15%)
  const hasName = Boolean(input.fullName && input.fullName.trim())
  if (hasName) {
    score += 15
  } else {
    missing.push({ key: "name", title: "Cập nhật Họ và tên", score: 15 })
  }

  // 2. Ảnh đại diện (25%)
  const hasAvatar = Boolean(input.avatarUrl && input.avatarUrl.trim())
  if (hasAvatar) {
    score += 25
  } else {
    missing.push({ key: "avatar", title: "Tải lên ảnh đại diện", score: 25 })
  }

  // 3. Số điện thoại Zalo (20%)
  const hasPhone = Boolean(input.phone && input.phone.trim())
  if (hasPhone) {
    score += 20
  } else {
    missing.push({ key: "phone", title: "Cập nhật số điện thoại (Zalo)", score: 20 })
  }

  // 4. Trường Đại học / Cao đẳng (15%)
  const hasUniversity = Boolean(input.university && input.university.trim())
  if (hasUniversity) {
    score += 15
  } else {
    missing.push({ key: "university", title: "Cập nhật trường Đại học / CĐ", score: 15 })
  }

  // 5. Kinh nghiệm làm sự kiện (15%)
  const hasExperiences = Array.isArray(input.experiences) && input.experiences.length > 0
  if (hasExperiences) {
    score += 15
  } else {
    missing.push({ key: "experiences", title: "Thêm kinh nghiệm chạy sự kiện", score: 15 })
  }

  // 6. Kỹ năng nổi bật (5%)
  const hasSkills = Array.isArray(input.skills)
    ? input.skills.length > 0
    : typeof input.skills === "string" && input.skills.trim().length > 0
  if (hasSkills) {
    score += 5
  } else {
    missing.push({ key: "skills", title: "Thêm kỹ năng & ngoại ngữ", score: 5 })
  }

  // 7. Giới thiệu bản thân (5%)
  const hasBio = Boolean(input.bio && input.bio.trim())
  if (hasBio) {
    score += 5
  } else {
    missing.push({ key: "bio", title: "Thêm phần giới thiệu bản thân", score: 5 })
  }

  const finalPercent = Math.min(score, 100)
  return {
    percent: finalPercent,
    missing: missing.slice(0, 3),
  }
}

/**
 * Trích xuất an toàn từ Supabase User và Profile object
 */
export function getStudentProfileCompletion(
  user: any,
  profile: any,
  extra?: { experiences?: any[]; cvUrl?: string; skills?: any }
): ProfileCompletionResult {
  const fullName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || ""
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url || ""
  const phone = profile?.phone || user?.user_metadata?.phone || ""
  const university = profile?.university || user?.user_metadata?.university || ""
  const bio = profile?.bio || user?.user_metadata?.bio || ""
  const cvUrl = extra?.cvUrl || profile?.cv_url || user?.user_metadata?.cv_url || ""

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
    cvUrl,
  })
}
