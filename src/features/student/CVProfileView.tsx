"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { getUserFacingMessage } from "@/lib/error"
import { useUser } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/providers/ToastProvider"
import CVPreviewModal from "./components/CVPreviewModal"
import ProfileUploading from "./components/ProfileUploading"
import ResumeQualityCard from "./components/ResumeQualityCard"
import AboutMeCard from "./components/AboutMeCard"
import PersonalInformationCard from "./components/PersonalInformationCard"
import ProfessionalSkillsCard from "./components/ProfessionalSkillsCard"
import WorkExperienceCard from "./components/WorkExperienceCard"
import { SkeletonGenericPage } from "@/components/ui/skeleton"
import DashboardLayout from "@/components/layout/DashboardLayout"
import { calculateProfileCompletion } from "@/lib/profile-completion"

export default function CVProfile({ embedded = false }: { embedded?: boolean } = {}) {
  const router = useRouter()
  const { user, profile, role, loading: authLoading, refreshProfile } = useUser()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [cvPreviewOpen, setCvPreviewOpen] = useState(false)

  // 1. Personal Information State (Đồng bộ với DB `profiles`)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [birthYear, setBirthYear] = useState("")
  const [gender, setGender] = useState("Nam")
  const [jobTitle, setJobTitle] = useState("")
  const [university, setUniversity] = useState("")
  const [socialLink, setSocialLink] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [reliabilityScore, setReliabilityScore] = useState(100)

  // 2. Resume Sections State (Thực tế từ DB / Auth metadata / Local storage)
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [experiences, setExperiences] = useState<{ id: string; title: string; company: string; year: string }[]>([])
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Search state in top bar
  const [searchQuery, setSearchQuery] = useState("")

  // Load real profile & metadata from Supabase DB
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.push("/login")
      return
    }
    if (role === "organizer" || profile?.role === "organizer") {
      router.replace("/dashboard")
      return
    }

    const fetchCV = async () => {
      // 1. Fetch DB Profiles row
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (data) {
        if (data.full_name) {
          setFullName(data.full_name)
        }
        setEmail(data.email || user.email || "")
        setAvatarUrl(data.avatar_url || "")
        if (data.phone) setPhone(data.phone)
        if (data.address) setCity(data.address)
        if (data.university) setUniversity(data.university)
        if (data.bio) {
          setBio(data.bio)
        }
        if (data.skills) {
          const sArr = typeof data.skills === "string" ? data.skills.split(",").map((s: string) => s.trim()).filter(Boolean) : []
          setSkills(sArr)
        }
        setReliabilityScore(data.reliability_score ?? 100)
        setJobTitle(role === "organizer" ? "Nhà tuyển dụng" : "Nhân sự sự kiện")

        if (data.experiences && Array.isArray(data.experiences)) {
          setExperiences(data.experiences as any)
        }
        if (data.social_link) {
          setSocialLink(data.social_link)
        }
        if (data.gender) setGender(data.gender)
        if (data.birth_year) setBirthYear(String(data.birth_year))
      } else {
        setEmail(user.email || "")
      }

      // 2. Fetch extra metadata fallback from user_metadata / LocalStorage cache if not in DB
      let extraData: any = user.user_metadata || {}
      try {
        const localCache = localStorage.getItem(`eventmate_cv_extra_${user.id}`)
        if (localCache) {
          const parsed = JSON.parse(localCache)
          extraData = { ...extraData, ...parsed }
        }
      } catch (err) {
        console.error("Error loading CV local cache:", err)
      }

      if (!data?.experiences && extraData.experiences && Array.isArray(extraData.experiences)) {
        setExperiences(extraData.experiences)
      }
      if (!data?.social_link && (extraData.social_link || extraData.socialLink)) {
        setSocialLink(extraData.social_link || extraData.socialLink)
      }
      if (!data?.gender && extraData.gender) setGender(extraData.gender)
      if (!data?.birth_year && extraData.birth_year) setBirthYear(String(extraData.birth_year))

      setLoading(false)
    }

    fetchCV()
  }, [user, role, authLoading, router])

  // Tính toán mức độ hoàn thiện hồ sơ thực tế chuẩn cho nhân sự sự kiện (100% cân đối)
  const qualityStats = useMemo(() => {
    return calculateProfileCompletion({
      fullName,
      avatarUrl,
      phone,
      university,
      experiences,
      skills,
      bio,
    })
  }, [fullName, avatarUrl, phone, university, experiences, skills, bio])

  // Upload Avatar to bucket 'avatars'
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (!file.type.startsWith("image/")) {
      showToast({ title: "File không hợp lệ", message: "Vui lòng chọn file hình ảnh (JPG, PNG, WEBP).", type: "error" })
      return
    }

    setUploadingAvatar(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}_avatar.${fileExt}`

    try {
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true })

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(fileName)
        const newAvatarUrl = publicUrlData.publicUrl
        setAvatarUrl(newAvatarUrl)
        await supabase.from("profiles").update({ avatar_url: newAvatarUrl }).eq("id", user.id)
        showToast({ title: "Cập nhật ảnh đại diện", message: "Ảnh hồ sơ đã được thay đổi thành công.", type: "success" })
        if (refreshProfile) refreshProfile()
      } else {
        showToast({ title: "Lỗi tải ảnh", message: getUserFacingMessage(uploadError, "Không thể tải ảnh lên."), type: "error" })
      }
    } finally {
      setUploadingAvatar(false)
    }
  }

  const fullNameFormatted = fullName.trim() || profile?.full_name || ""
  const displayUniversity = university || ""

  if (loading) {
    if (embedded) {
      return (
        <div className="flex h-[400px] w-full items-center justify-center">
          <div className="size-6 border-2 border-[#005DDC] border-t-transparent rounded-full animate-spin mr-3" />
          <span className="text-sm text-slate-500">Đang tải hồ sơ...</span>
        </div>
      )
    }
    return <SkeletonGenericPage />
  }

  const cvContent = (
    <>
      <div className="w-full">
        {/* MAIN TWO-COLUMN CONTENT GRID (Dynamic 1fr Main Form & Right 364px Widgets matching Title width) */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_364px] gap-6 items-start w-full">

            {/* =========================================================================
                CENTER COLUMN: Main Profile Cards (Dynamic full width)
                Đã tinh gọn chuẩn nhân sự sự kiện
               ========================================================================= */}
            <main className="flex flex-col gap-6 w-full min-w-0">

              {/* 1. Profile Uploading Hero Card */}
              <ProfileUploading
                state={uploadingAvatar ? "Uploading" : "Uploaded"}
                fullName={fullNameFormatted}
                jobTitle={jobTitle || (role === "organizer" ? "Nhà tuyển dụng" : "Nhân sự sự kiện")}
                university={displayUniversity}
                avatarUrl={avatarUrl}
                onAvatarUpload={handleAvatarUpload}
                onViewResume={() => setCvPreviewOpen(true)}
              />

              {/* 2. Personal Information Card */}
              <PersonalInformationCard
                data={{
                  fullName,
                  email,
                  phone,
                  city,
                  university,
                  socialLink,
                  birthYear,
                  gender,
                  reliabilityScore
                }}
                onSave={async (updated) => {
                  setFullName(updated.fullName)
                  setEmail(updated.email)
                  setPhone(updated.phone)
                  setCity(updated.city)
                  setBirthYear(updated.birthYear)
                  setGender(updated.gender)
                  if (updated.university !== undefined) setUniversity(updated.university)
                  if (updated.socialLink !== undefined) setSocialLink(updated.socialLink)

                  // Sync to Supabase DB profiles & local cache
                  if (user) {
                    const combinedName = updated.fullName.trim() || fullNameFormatted
                    await supabase.from("profiles").update({
                      full_name: combinedName || undefined,
                      phone: updated.phone.trim() || null,
                      address: updated.city.trim() || null,
                      university: updated.university?.trim() || null,
                      social_link: updated.socialLink?.trim() || null,
                      gender: updated.gender || null,
                      birth_year: updated.birthYear ? parseInt(updated.birthYear, 10) : null,
                      experiences: experiences || []
                    }).eq("id", user.id)

                    const extraData = {
                      experiences,
                      social_link: updated.socialLink?.trim() || null,
                      gender: updated.gender,
                      birth_year: updated.birthYear
                    }
                    localStorage.setItem(`eventmate_cv_extra_${user.id}`, JSON.stringify(extraData))
                    await supabase.auth.updateUser({ data: extraData })
                  }

                  showToast({ title: "Đã cập nhật", message: "Thông tin cá nhân đã được lưu thành công.", type: "success" })
                  if (refreshProfile) refreshProfile()
                }}
              />

              {/* 3. Professional Skills & Languages Card */}
              <ProfessionalSkillsCard
                skills={skills}
                onSaveSkills={async (newSkills) => {
                  setSkills(newSkills)
                  if (user) {
                    await supabase.from("profiles").update({ skills: newSkills.length > 0 ? newSkills.join(", ") : null }).eq("id", user.id)
                  }
                  showToast({ title: "Đã cập nhật", message: "Danh sách kỹ năng & ngoại ngữ đã được lưu thành công.", type: "success" })
                  if (refreshProfile) refreshProfile()
                }}
              />

              {/* 4. Work Experience Card */}
              <WorkExperienceCard
                experiences={experiences}
                onSaveExperiences={async (newExps) => {
                  setExperiences(newExps)
                  if (user) {
                    await (supabase.from("profiles") as any).update({
                      experiences: newExps
                    }).eq("id", user.id)

                    const extraData = {
                      experiences: newExps,
                      social_link: socialLink,
                      gender,
                      birth_year: birthYear
                    }
                    localStorage.setItem(`eventmate_cv_extra_${user.id}`, JSON.stringify(extraData))
                    await supabase.auth.updateUser({ data: extraData })
                  }
                  showToast({ title: "Đã cập nhật", message: "Kinh nghiệm sự kiện đã được cập nhật.", type: "success" })
                }}
              />

            </main>

            {/* =========================================================================
                RIGHT COLUMN: Quality Gauge & About Me Bio (Figma: w: 364px)
               ========================================================================= */}
            <aside className="w-full xl:w-[364px] flex flex-col gap-6 shrink-0">

              {/* 1. Chất lượng Hồ sơ */}
              <ResumeQualityCard
                percent={qualityStats.percent}
                missingItems={qualityStats.missing}
              />

              {/* 2. Giới thiệu bản thân */}
              <AboutMeCard
                bio={bio}
                onSaveBio={async (newBio) => {
                  setBio(newBio)
                  if (user) {
                    await supabase.from("profiles").update({ bio: newBio.trim() || null }).eq("id", user.id)
                  }
                  showToast({ title: "Đã cập nhật", message: "Đã lưu giới thiệu bản thân.", type: "success" })
                  if (refreshProfile) refreshProfile()
                }}
              />

            </aside>

          </div>
        </div>

        {/* CV Preview Modal */}
        <CVPreviewModal
          isOpen={cvPreviewOpen}
          onClose={() => setCvPreviewOpen(false)}
          profile={{
            full_name: fullNameFormatted,
            email: email,
            avatar_url: avatarUrl || undefined,
            phone: phone || undefined,
            reliability_score: reliabilityScore,
            university: displayUniversity || undefined,
            bio: bio || undefined,
            skills: skills.length > 0 ? skills.join(", ") : undefined,
            cv_completion_percent: qualityStats.percent,
            gender: gender || undefined,
            birth_year: birthYear || undefined,
            social_link: socialLink || undefined,
            experiences: experiences.length > 0 ? experiences : undefined,
          }}
        />
    </>
  )

  if (embedded) {
    return <div className="w-full">{cvContent}</div>
  }

  return (
    <DashboardLayout
      role="student"
      activeTab="resume"
      activeItem="resume"
      title="Hồ sơ của tôi"
      subtitle="Xây dựng hồ sơ năng lực và kỹ năng để ứng tuyển các sự kiện"
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      unreadCount={0}
      avatarUrl={avatarUrl}
      userProfile={{
        fullName: fullNameFormatted,
        avatarUrl,
        email,
      }}
    >
      {cvContent}
    </DashboardLayout>
  )
}
