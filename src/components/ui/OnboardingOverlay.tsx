import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
  X, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Award, 
  GraduationCap, 
  Building2, 
  Sparkles, 
  ArrowRight, 
  ChevronRight, 
  ChevronLeft 
} from "lucide-react"

export default function OnboardingOverlay() {
  const [show, setShow] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0) // -1 for back, 1 for forward
  const [selectedRole, setSelectedRole] = useState<"student" | "organizer" | null>(null)

  useEffect(() => {
    // Chỉ chạy ở client-side
    const visited = localStorage.getItem("em_onboarding_visited")
    if (!visited) {
      setShow(true)
      // Khóa cuộn trang khi đang hiển thị onboarding
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleClose = (role?: "student" | "organizer") => {
    localStorage.setItem("em_onboarding_visited", "true")
    if (role) {
      localStorage.setItem("em_preferred_role", role)
    }
    setShow(false)
    document.body.style.overflow = "unset"
  }

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    } else {
      handleClose(selectedRole || undefined)
    }
  }

  const handleBack = () => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
    }
  }

  const handleDotClick = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  if (!show) return null

  const slides = [
    // Slide 0: Welcome
    {
      title: (
        <>
          Chào mừng bạn đến với <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">EventMate</span>
        </>
      ),
      subtitle: "Nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho sinh viên và ban tổ chức.",
      illustration: (
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          {/* Decorative glowing circles */}
          <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute w-36 h-36 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-3xl opacity-20 rotate-12 animate-spin-[spin_20s_linear_infinite]" />
          <div className="absolute w-36 h-36 bg-gradient-to-bl from-teal-500 to-emerald-400 rounded-3xl opacity-20 -rotate-12 animate-spin-[spin_15s_linear_infinite]" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="relative z-10 w-28 h-28 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex items-center justify-center border-2 border-emerald-500/20"
          >
            <Sparkles className="w-12 h-12 text-emerald-600" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute -top-2 -right-2 bg-amber-500 text-white p-2 rounded-2xl shadow-lg"
          >
            <Briefcase className="w-5 h-5" />
          </motion.div>

          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }}
            className="absolute -bottom-2 -left-2 bg-emerald-500 text-white p-2 rounded-2xl shadow-lg"
          >
            <Users className="w-5 h-5" />
          </motion.div>
        </div>
      ),
      content: (
        <div className="text-center max-w-md mx-auto space-y-4">
          <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base leading-relaxed">
            Chúng tôi ở đây để giúp bạn tìm kiếm các công việc sự kiện bán thời gian hấp dẫn, quản lý nhân sự chuyên nghiệp, và xây dựng hồ sơ năng lực đột phá.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Khám phá ngay trong 4 bước đơn giản
          </div>
        </div>
      )
    },
    // Slide 1: For Students
    {
      title: "Dành Cho Sinh Viên & CTV",
      subtitle: "Tìm kiếm công việc sự kiện bán thời gian, thời vụ chất lượng và gia tăng thu nhập.",
      illustration: (
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[
            { icon: Briefcase, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400", title: "Việc làm sự kiện", desc: "Hàng trăm công việc" },
            { icon: FileText, color: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400", title: "Hồ sơ CV số", desc: "Showcase năng lực" },
            { icon: MessageSquare, color: "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400", title: "Chat trực tiếp", desc: "Kết nối tức thì" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm"
            >
              <div className={`p-2.5 rounded-xl ${item.color} mb-2`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">{item.title}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
            </motion.div>
          ))}
        </div>
      ),
      content: (
        <div className="space-y-3 max-w-md mx-auto text-left">
          <div className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Lịch trình linh hoạt</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Đăng ký ca làm, vị trí theo thời gian rảnh. Phù hợp cho sinh viên muốn trải nghiệm.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Nhận chứng chỉ làm việc</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sau mỗi sự kiện hoàn thành tốt, bạn sẽ nhận được chứng nhận online lưu vào hồ sơ CV.</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 2: For Organizers
    {
      title: "Dành Cho Nhà Tuyển Dụng",
      subtitle: "Giải pháp quản lý, tuyển dụng và phân bổ nhân sự sự kiện thông minh.",
      illustration: (
        <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
          {[
            { icon: Users, color: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400", title: "Tìm CTV nhanh", desc: "Tiếp cận 1000+ SV" },
            { icon: CheckCircle2, color: "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400", title: "Duyệt hồ sơ", desc: "Quản lý tập trung" },
            { icon: Award, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400", title: "Cấp chứng nhận", desc: "Nâng tầm uy tín" },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-3 flex flex-col items-center text-center shadow-sm"
            >
              <div className={`p-2.5 rounded-xl ${item.color} mb-2`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">{item.title}</span>
              <span className="text-[10px] text-slate-400 leading-tight">{item.desc}</span>
            </motion.div>
          ))}
        </div>
      ),
      content: (
        <div className="space-y-3 max-w-md mx-auto text-left">
          <div className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Đăng tin nhanh chóng</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Tạo chiến dịch tuyển dụng, chia nhỏ vị trí công việc, và tiếp nhận hồ sơ ngay lập tức.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-800/40">
            <div className="bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 p-1.5 rounded-lg shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hệ thống đánh giá tin cậy</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Đánh giá sao, chấm điểm tin cậy và xây dựng đội ngũ CTV ruột cho các sự kiện tiếp theo.</p>
            </div>
          </div>
        </div>
      )
    },
    // Slide 3: Select Role & Start
    {
      title: "Sẵn Sàng Bắt Đầu?",
      subtitle: "Hãy chọn vai trò của bạn để khám phá EventMate ngay bây giờ.",
      illustration: null,
      content: (
        <div className="space-y-6 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedRole("student")}
              className={`group/role flex flex-col items-center p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedRole === "student"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20"
                  : "border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-sm"
              }`}
            >
              <div className={`p-4 rounded-full mb-3 transition-colors ${
                selectedRole === "student" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover/role:bg-emerald-50 group-hover/role:text-emerald-600"
              }`}>
                <GraduationCap className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Tìm việc làm</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">Sinh viên / Freelancer muốn tìm kiếm cơ hội</span>
            </button>

            <button
              onClick={() => setSelectedRole("organizer")}
              className={`group/role flex flex-col items-center p-5 rounded-2xl border text-center transition-all cursor-pointer ${
                selectedRole === "organizer"
                  ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-md ring-2 ring-emerald-500/20"
                  : "border-slate-100 hover:border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60 shadow-sm"
              }`}
            >
              <div className={`p-4 rounded-full mb-3 transition-colors ${
                selectedRole === "organizer" 
                  ? "bg-emerald-600 text-white" 
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 group-hover/role:bg-emerald-50 group-hover/role:text-emerald-600"
              }`}>
                <Building2 className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Tuyển nhân sự</span>
              <span className="text-[10px] text-slate-450 dark:text-slate-500 mt-1">BTC / Doanh nghiệp có nhu cầu đăng tuyển</span>
            </button>
          </div>
          
          <p className="text-[11px] text-slate-400 dark:text-slate-550 italic text-center">
            Bạn có thể dễ dàng chuyển đổi vai trò và cập nhật cài đặt bất kỳ lúc nào sau đó.
          </p>
        </div>
      )
    }
  ]

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md p-4 overflow-hidden select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-lg bg-gradient-to-b from-white to-slate-50/95 dark:from-slate-900 dark:to-slate-950/95 border border-slate-200/50 dark:border-slate-800/80 rounded-[2.25rem] shadow-2xl p-6 md:p-8 flex flex-col items-stretch overflow-hidden"
        >
          {/* Skip button */}
          <button
            onClick={() => handleClose()}
            className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-20"
            title="Bỏ qua giới thiệu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Progress dots at the top */}
          <div className="flex justify-center gap-1.5 mb-6 z-10">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className="h-1.5 rounded-full transition-all focus:outline-none"
                style={{
                  width: currentSlide === index ? "1.5rem" : "0.375rem",
                  backgroundColor: currentSlide === index ? "var(--color-primary, #059669)" : "rgba(156, 163, 175, 0.4)"
                }}
              />
            ))}
          </div>

          {/* Animated Slide Content */}
          <div className="relative min-h-[380px] md:min-h-[400px] flex flex-col justify-between py-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="w-full flex flex-col items-stretch text-center space-y-6"
              >
                {/* Text Group */}
                <div className="space-y-2">
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {slides[currentSlide].title}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                    {slides[currentSlide].subtitle}
                  </p>
                </div>

                {/* Illustration Area */}
                {slides[currentSlide].illustration && (
                  <div className="flex-1 py-2 flex items-center justify-center min-h-[140px]">
                    {slides[currentSlide].illustration}
                  </div>
                )}

                {/* Content Details */}
                <div className="flex-1">
                  {slides[currentSlide].content}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action buttons at the bottom */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 z-10">
            {currentSlide > 0 ? (
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-4 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Quay lại
              </button>
            ) : (
              <button
                onClick={() => handleClose()}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-350 px-4 py-2.5 rounded-full transition-all cursor-pointer"
              >
                Bỏ qua
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1 && !selectedRole}
              className={`flex items-center gap-1.5 px-6 py-2.5 rounded-full text-xs font-bold shadow-md shadow-emerald-500/10 transition-all cursor-pointer ${
                currentSlide === slides.length - 1 && !selectedRole
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {currentSlide === slides.length - 1 ? (
                <>
                  Bắt đầu ngay
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Tiếp theo
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
