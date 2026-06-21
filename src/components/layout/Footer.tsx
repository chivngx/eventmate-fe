import { Link, useNavigate } from "react-router-dom"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  const navigate = useNavigate()

  return (
    <footer className="bg-[#0f172a] text-slate-400 font-sans border-t-[3px] border-[#00b14f] mt-16 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      {/* Upper Footer: Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12">

          {/* Column 1: Brand & Bio */}
          <div className="space-y-5">
            <div
              onClick={() => navigate("/")}
              className="font-black text-3xl tracking-tight text-white cursor-pointer select-none transition-transform active:scale-95 duration-150"
            >
              Event<span className="text-[#00b14f]">Mate</span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-400 font-medium max-w-[280px]">
              Nền tảng công nghệ tiên phong kết nối sinh viên năng động với các cơ hội tình nguyện, vị trí CTV bán thời gian và ban tổ chức sự kiện chuyên nghiệp tại Đà Nẵng.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-[#00b14f] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 border border-slate-700/50 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6c0-.55.45-1 1-1h1.72V1H12C9.79 1 8 2.79 8 5v3H9z" /></svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-[#00b14f] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 border border-slate-700/50 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800/60 hover:bg-[#00b14f] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-300 hover:scale-105 border border-slate-700/50 shadow-sm"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163c-.272-1.022-1.074-1.826-2.099-2.099C19.55 3.5 12 3.5 12 3.5s-7.55 0-9.4.564c-1.025.273-1.827 1.077-2.099 2.099C0 8.013 0 12 0 12s0 3.987.502 5.837c.272 1.022 1.074 1.826 2.099 2.099C4.45 20.5 12 20.5 12 20.5s7.55 0 9.4-.564c1.025-.273 1.827-1.077 2.099-2.099C24 15.987 24 12 24 12s0-3.987-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
              </a>
            </div>
          </div>

          {/* Column 2: For Students */}
          <div>
            <h3 className="text-[13px] font-bold text-white uppercase tracking-widest mb-5 border-l-3 border-[#00b14f] pl-3">
              Dành cho sinh viên
            </h3>
            <ul className="space-y-3.5 text-sm font-medium">
              <li className="transform hover:translate-x-1.5 transition-all duration-300">
                <Link to="/" className="text-slate-400 hover:text-[#00b14f] transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#00b14f] transition-colors" />
                  Tìm kiếm sự kiện
                </Link>
              </li>
              <li className="transform hover:translate-x-1.5 transition-all duration-300">
                <Link to="/my-jobs" className="text-slate-400 hover:text-[#00b14f] transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#00b14f] transition-colors" />
                  Sự kiện đã ứng tuyển
                </Link>
              </li>
              <li className="transform hover:translate-x-1.5 transition-all duration-300">
                <Link to="/my-jobs" className="text-slate-400 hover:text-[#00b14f] transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#00b14f] transition-colors" />
                  Việc làm đã lưu
                </Link>
              </li>
              <li className="transform hover:translate-x-1.5 transition-all duration-300">
                <Link to="/settings" className="text-slate-400 hover:text-[#00b14f] transition-colors flex items-center gap-1.5 group">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-[#00b14f] transition-colors" />
                  Quản lý hồ sơ CV
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div>
            <h3 className="text-[13px] font-bold text-white uppercase tracking-widest mb-5 border-l-3 border-[#00b14f] pl-3">
              Liên hệ với chúng tôi
            </h3>
            <div className="space-y-3.5 text-[13px] font-medium text-slate-350">
              <div className="bg-slate-800/30 p-3.5 rounded-2xl border border-slate-700/20 flex items-start gap-3 hover:bg-slate-800/40 transition-all duration-300">
                <MapPin className="w-5 h-5 text-[#00b14f] shrink-0 mt-0.5" />
                <span className="leading-relaxed">Đường Ngũ Hành Sơn, Quận Ngũ Hành Sơn, TP. Đà Nẵng, Việt Nam</span>
              </div>

              <div className="bg-slate-800/30 p-3.5 rounded-2xl border border-slate-700/20 flex items-center gap-3 hover:bg-slate-800/40 transition-all duration-300">
                <Phone className="w-5 h-5 text-[#00b14f] shrink-0" />
                <span>+84 236 395 1234</span>
              </div>

              <div className="bg-slate-800/30 p-3.5 rounded-2xl border border-slate-700/20 flex items-center gap-3 hover:bg-slate-800/40 transition-all duration-300">
                <Mail className="w-5 h-5 text-[#00b14f] shrink-0" />
                <a href="mailto:support@eventmate.vn" className="hover:text-[#00b14f] transition-colors">support@eventmate.vn</a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  )
}