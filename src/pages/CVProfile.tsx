import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import MainLayout from "@/components/layout/MainLayout"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { GraduationCap, Phone, UserCircle, Sparkles, Save, FileText } from "lucide-react"

export default function CVProfile() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [role, setRole] = useState<string>("student")

    // State form CV
    const [phone, setPhone] = useState("")
    const [university, setUniversity] = useState("")
    const [bio, setBio] = useState("")
    const [skills, setSkills] = useState("")

    useEffect(() => {
        const fetchCV = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                navigate("/login")
                return
            }

            const { data } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .maybeSingle()

            if (data) {
                setRole(data.role)
                setPhone(data.phone || "")
                setUniversity(data.university || "")
                setBio(data.bio || "")
                setSkills(data.skills || "")
            }
            setLoading(false)
        }
        fetchCV()
    }, [navigate])

    const handleSaveCV = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { error } = await supabase
                .from("profiles")
                .update({
                    phone,
                    university,
                    bio,
                    skills
                })
                .eq("id", user.id)

            if (error) {
                alert("Lỗi khi lưu CV: " + error.message)
            } else {
                alert("Đã lưu Hồ sơ CV thành công! Mức độ hoàn thiện CV của bạn đã tăng lên.")
            }
        }
        setSaving(false)
    }

    if (loading) return null

    return (
        <MainLayout role={role}>
            <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">

                <div className="mb-8">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <FileText className="w-8 h-8 text-emerald-500" />
                        Hồ sơ Năng lực (CV)
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">
                        Bổ sung đầy đủ thông tin giúp bạn tăng 300% cơ hội được Ban tổ chức lựa chọn.
                    </p>
                </div>

                <div className="bg-white rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-emerald-900/5 overflow-hidden">
                    <div className="h-32 bg-emerald-500 relative">
                        <div className="absolute -bottom-10 left-8">
                            <div className="w-24 h-24 bg-white rounded-2xl p-2 shadow-sm flex items-center justify-center">
                                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-emerald-600">
                                    <UserCircle className="w-10 h-10" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSaveCV} className="p-8 pt-16 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-emerald-600" /> Số điện thoại
                                </label>
                                <Input
                                    placeholder="Nhập số điện thoại liên hệ..."
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-base font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-emerald-600" /> Trường Đại học / Cao đẳng
                                </label>
                                <Input
                                    placeholder="Ví dụ: Đại học FPT..."
                                    value={university}
                                    onChange={e => setUniversity(e.target.value)}
                                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-base font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-600" /> Kỹ năng nổi bật
                            </label>
                            <Input
                                placeholder="Ví dụ: Giao tiếp, Chụp ảnh, Quản lý thời gian (Cách nhau bằng dấu phẩy)"
                                value={skills}
                                onChange={e => setSkills(e.target.value)}
                                className="h-12 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 text-base font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Giới thiệu bản thân (Bio)</label>
                            <textarea
                                placeholder="Viết một đoạn ngắn giới thiệu về tính cách, đam mê và kinh nghiệm của bạn..."
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                rows={5}
                                className="w-full rounded-xl bg-slate-50 border-2 border-slate-200 p-4 text-base font-medium focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                            />
                        </div>

                        <div className="flex justify-end pt-4 border-t-2 border-slate-50">
                            <Button
                                type="submit"
                                disabled={saving}
                                className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 transition-transform active:scale-95 shadow-md shadow-emerald-600/20"
                            >
                                {saving ? "Đang lưu..." : <><Save className="w-5 h-5 mr-2" /> Lưu Hồ sơ CV</>}
                            </Button>
                        </div>
                    </form>
                </div>

            </div>
        </MainLayout>
    )
}