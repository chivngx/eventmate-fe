import type { Metadata } from "next"
import MainLayout from "@/components/layout/MainLayout"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Chính Sách Bảo Mật — EventMate",
  description: "Chính sách bảo mật thông tin cá nhân và dữ liệu hồ sơ người dùng trên nền tảng EventMate.",
}

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="bg-white min-h-screen py-10 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="border-b border-slate-200 pb-6 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Shield className="w-3.5 h-3.5" />
              Bảo Vệ Người Dùng
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-[#222222] tracking-tight">
              Chính Sách Bảo Mật Thông Tin
            </h1>
            <p className="text-sm text-[#757575]">
              Cập nhật lần cuối: Ngày 20 tháng 09 năm 2026
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-8 text-sm sm:text-base text-[#353535] leading-relaxed">
            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#005DDC]" />
                1. Mục Đích Thu Thập Thông Tin
              </h2>
              <p>
                EventMate thu thập thông tin của Người tìm việc (Ứng viên) và Ban tổ chức sự kiện (Nhà tuyển dụng) nhằm mục đích:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#515151]">
                <li>Tạo lập và xác thực tài khoản sử dụng nền tảng.</li>
                <li>Hỗ trợ kết nối ứng tuyển vào các vị trí sự kiện phù hợp tại TP. Đà Nẵng.</li>
                <li>Xác minh danh tính nhằm đảm bảo môi trường làm việc minh bạch, an toàn và chuyên nghiệp.</li>
                <li>Gửi thông báo về trạng thái duyệt đơn, lịch phỏng vấn và các sự kiện mới.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#005DDC]" />
                2. Phạm Vi Dữ Liệu Thu Thập
              </h2>
              <p>Các dữ liệu chúng tôi lưu trữ bao gồm:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#515151]">
                <li><strong>Thông tin cơ bản:</strong> Họ tên, số điện thoại, địa chỉ email, ảnh đại diện, trường học.</li>
                <li><strong>Hồ sơ năng lực (CV):</strong> Kinh nghiệm tham gia sự kiện, kỹ năng, ngoại ngữ và tệp CV đính kèm.</li>
                <li><strong>Thông tin đơn vị tổ chức:</strong> Tên đơn vị, mã số thuế, địa chỉ văn phòng, thông tin liên hệ.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-[#222222] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#005DDC]" />
                3. Cam Kết Bảo Mật
              </h2>
              <p>
                EventMate cam kết không bán, chia sẻ hoặc thương mại hóa thông tin cá nhân của người dùng cho bất kỳ bên thứ ba nào ngoại trừ các đơn vị tổ chức sự kiện mà ứng viên trực tiếp nộp hồ sơ. Toàn bộ mật khẩu và phiên đăng nhập được mã hóa an toàn qua hạ tầng Supabase Auth tiêu chuẩn quốc tế.
              </p>
            </section>
          </div>

        </div>
      </div>
    </MainLayout>
  )
}
