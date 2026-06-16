import { useNavigate } from "react-router-dom"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"

export default function OrgDashboard() {
    const navigate = useNavigate()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate("/login")
    }

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Organizer Dashboard</h1>
                    <p className="text-slate-500">Bảng điều khiển dành cho Ban tổ chức và Doanh nghiệp.</p>
                </div>
                <Button variant="destructive" onClick={handleLogout}>Đăng xuất</Button>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-xl border p-6 bg-white shadow-sm">
                    <h3 className="font-semibold text-lg">Tin tuyển dụng đang chạy</h3>
                    <p className="text-3xl font-bold mt-2 text-indigo-600">0</p>
                </div>
                <div className="rounded-xl border p-6 bg-white shadow-sm">
                    <h3 className="font-semibold text-lg">Đơn ứng tuyển mới</h3>
                    <p className="text-3xl font-bold mt-2 text-amber-500">0</p>
                </div>
            </div>
        </div>
    )
}