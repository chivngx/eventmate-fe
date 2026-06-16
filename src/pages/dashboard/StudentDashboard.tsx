import { Search, MapPin, Clock, DollarSign, ChevronRight, CheckCircle2, Bookmark } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function StudentDashboard() {
    return (
        <div className="space-y-8 pb-10">

            {/* 1. BANNER PHẲNG - MÀU NGỌC LỤC BẢO SÁNG BỪNG */}
            <div className="relative overflow-hidden rounded-[2rem] bg-emerald-500 px-6 py-14 shadow-md sm:px-16 sm:py-16">
                <div className="relative z-10 mx-auto max-w-3xl text-center space-y-5">
                    <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl leading-tight">
                        Nắm bắt cơ hội sự kiện <br className="hidden sm:block" /> bứt phá sự nghiệp
                    </h1>
                    <p className="mx-auto max-w-xl text-lg text-emerald-50 font-medium">
                        Hàng ngàn vị trí Tình nguyện viên, CTV Truyền thông và Điều phối đang chờ đón bạn.
                    </p>

                    {/* Form tìm kiếm - Nút đen nhám cực ngầu tương phản với nền xanh ngọc */}
                    <div className="mx-auto mt-8 flex w-full max-w-3xl flex-col gap-2 rounded-3xl bg-white p-2 shadow-xl sm:flex-row sm:items-center sm:rounded-full">
                        <div className="flex flex-1 items-center px-4 py-2 sm:py-0">
                            <Search className="h-5 w-5 text-emerald-600" />
                            <Input
                                placeholder="Tìm tên sự kiện, vị trí..."
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-900 font-bold text-base placeholder:text-slate-400 h-11"
                            />
                        </div>
                        <div className="hidden h-8 w-[2px] bg-slate-100 sm:block"></div>
                        <div className="flex flex-1 items-center px-4 py-2 sm:py-0">
                            <MapPin className="h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="Địa điểm"
                                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-slate-900 font-bold text-base placeholder:text-slate-400 h-11"
                            />
                        </div>
                        <Button className="h-12 w-full rounded-2xl sm:rounded-full bg-slate-900 px-10 text-base font-bold text-white hover:bg-slate-800 sm:w-auto transition-transform hover:scale-105 active:scale-95">
                            Tìm việc ngay
                        </Button>
                    </div>
                </div>
            </div>

            {/* 2. BỐ CỤC NỘI DUNG */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">

                {/* CỘT CHÍNH */}
                <div className="space-y-6 lg:col-span-8">
                    <div className="flex items-center justify-between pb-2">
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Việc làm mới nhất</h2>
                        <a href="#" className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">Xem tất cả</a>
                    </div>

                    <div className="flex flex-col gap-5">
                        {[
                            { title: "Điều phối viên Lễ hội Giao lưu Văn hóa Việt - Nhật", org: "Danang Events & Festivals", type: "Part-time", salary: "Thỏa thuận", loc: "Hải Châu, Đà Nẵng", tag: "Hot", color: "bg-orange-100 text-orange-700" },
                            { title: "CTV Truyền thông Sự kiện Âm nhạc Sóng Trẻ", org: "CLB Truyền Thông FPT", type: "Tình nguyện", salary: "Có Certificate", loc: "Ngũ Hành Sơn", tag: "Mới", color: "bg-emerald-100 text-emerald-700" },
                            { title: "Nhân sự Chạy sự kiện Tech Expo 2026", org: "TechCorp Vietnam", type: "Freelance", salary: "500k/ngày", loc: "Hội An, Quảng Nam", tag: "Tuyển gấp", color: "bg-rose-100 text-rose-700" }
                        ].map((job, idx) => (
                            <div key={idx} className="group relative flex flex-col sm:flex-row sm:items-center justify-between rounded-[1.5rem] border-2 border-slate-100 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-900/5">

                                <button className="absolute right-6 top-6 text-slate-300 hover:text-emerald-600 transition-colors">
                                    <Bookmark className="h-6 w-6" />
                                </button>

                                <div className="flex gap-5 items-start">
                                    <Avatar className="h-16 w-16 rounded-2xl border-2 border-slate-50 mt-1 shrink-0">
                                        <AvatarFallback className="rounded-2xl bg-slate-100 text-2xl font-black text-slate-700 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                            {job.org.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="pr-8">
                                        <div className="mb-2">
                                            <Badge variant="secondary" className={`font-bold px-3 py-1 rounded-lg ${job.color}`}>
                                                {job.tag}
                                            </Badge>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors cursor-pointer leading-tight">
                                            {job.title}
                                        </h3>
                                        <p className="mt-1.5 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                            {job.org}
                                        </p>

                                        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-600">
                                            <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-emerald-600"><DollarSign className="h-4 w-4" /> {job.salary}</span>
                                            <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" /> {job.loc}</span>
                                            <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-slate-600"><Clock className="h-4 w-4 text-slate-400" /> {job.type}</span>
                                        </div>
                                    </div>
                                </div>

                                <Button className="mt-6 w-full rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white font-bold sm:mt-0 sm:w-auto sm:self-center shadow-none transition-colors px-6 h-11">
                                    Ứng tuyển
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* CỘT PHỤ */}
                <div className="space-y-6 lg:col-span-4 lg:pl-2 mt-2">

                    <div className="overflow-hidden rounded-[1.5rem] border-2 border-slate-100 bg-white">
                        <div className="bg-emerald-50 p-6 flex items-center gap-4">
                            <Avatar className="h-16 w-16 border-4 border-white shadow-sm">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback className="bg-emerald-500 text-white font-bold">SV</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">Chào bạn mới! 👋</h3>
                                <p className="text-sm font-bold text-emerald-700 mt-0.5">Tài khoản Ứng viên</p>
                            </div>
                        </div>
                        <div className="p-6 pt-4">
                            <div className="space-y-3">
                                <div className="flex items-end justify-between">
                                    <span className="text-sm font-bold text-slate-700">Mức độ hoàn thiện CV</span>
                                    <span className="text-lg font-black text-emerald-600">45%</span>
                                </div>
                                {/* Progress bar phẳng, tròn vo */}
                                <Progress value={45} className="h-3 bg-slate-100 [&>div]:bg-emerald-500 rounded-full" />
                                <p className="text-sm text-slate-500 font-medium leading-relaxed pt-2">
                                    Hồ sơ đầy đủ giúp bạn tăng <strong className="text-emerald-600">x3 cơ hội</strong> được gọi phỏng vấn.
                                </p>
                            </div>
                            <Button className="w-full mt-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 font-bold transition-transform hover:scale-[1.02] active:scale-[0.98] h-12">
                                Cập nhật CV ngay <ChevronRight className="ml-1 h-5 w-5 text-emerald-400" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-[1.5rem] border-2 border-slate-100 bg-white p-6">
                        <h3 className="font-extrabold text-slate-900 mb-5 tracking-tight flex items-center gap-2">
                            Bí kíp trúng tuyển 🚀
                        </h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 group cursor-pointer">
                                <CheckCircle2 className="h-6 w-6 text-slate-200 shrink-0 group-hover:text-emerald-500 transition-colors" />
                                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors mt-0.5">Cập nhật ảnh đại diện chỉn chu</span>
                            </li>
                            <li className="flex items-start gap-3 group cursor-pointer">
                                <CheckCircle2 className="h-6 w-6 text-slate-200 shrink-0 group-hover:text-emerald-500 transition-colors" />
                                <span className="text-sm font-bold text-slate-600 group-hover:text-emerald-600 transition-colors mt-0.5">Liệt kê các kỹ năng mềm nổi bật</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                                <span className="text-sm font-bold text-slate-400 line-through mt-0.5">Xác thực địa chỉ Email</span>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    )
}