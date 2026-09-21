"use client"

interface FeatureItem {
  id: string
  nodeId: string
  icon: string
  title: string
  desc: string
}

const features: FeatureItem[] = [
  {
    id: "resume-search",
    nodeId: "5875:27428",
    icon: "/images/organizer-features/feat-database.svg",
    title: "Tìm kiếm ứng viên",
    desc: "Sàng lọc hồ sơ chuẩn xác theo kỹ năng, ca trực và kinh nghiệm cho sự kiện.",
  },
  {
    id: "performance",
    nodeId: "5875:27429",
    icon: "/images/organizer-features/feat-cpu.svg",
    title: "Linh hoạt & Hiệu suất",
    desc: "Tự động hóa thông báo ca làm, khớp nối và xác nhận lịch trực ngay lập tức.",
  },
  {
    id: "process",
    nodeId: "5875:27430",
    icon: "/images/organizer-features/feat-atom.svg",
    title: "Quy trình tinh gọn",
    desc: "Quản lý tuyển dụng tập trung từ duyệt đơn, xếp ca đến điểm danh QR.",
  },
  {
    id: "visibility",
    nodeId: "5875:27431",
    icon: "/images/organizer-features/feat-shield.svg",
    title: "Gia tăng độ phủ & Uy tín",
    desc: "Nâng cao nhận diện thương hiệu nhà tổ chức và thu hút nhân sự chất lượng.",
  },
]

export default function OrganizerFeaturesGrid() {
  return (
    <section id="employer-features" className="w-full py-8 sm:py-10 lg:py-10 scroll-mt-20" data-node-id="5875:27425">
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 flex flex-col gap-[32px] items-center">
        {/* Section Header (Figma node 5875:27426: Titr home) */}
        <div
          className="flex flex-col items-center gap-[8px] text-center max-w-[650px] px-4"
          data-node-id="5875:27426"
          data-name="Titr home"
        >
          <h2 className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] tracking-tight leading-tight">
            Giải pháp hiệu quả cho tuyển dụng thành công
          </h2>
          <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6]">
            Tối ưu hóa quy trình tuyển dụng với các công cụ mạnh mẽ về tìm kiếm, hiệu suất, quy trình và độ phủ thương hiệu
          </p>
        </div>

        {/* 4 Feature Cards (Figma node 5875:27427: Frame 2147224983) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] w-full"
          data-node-id="5875:27427"
        >
          {features.map((item) => (
            <div
              key={item.id}
              data-node-id={item.nodeId}
              className="bg-white border border-[#EDEDED] rounded-[16px] p-[20px] sm:p-[24px] min-h-[240px] flex flex-col items-center justify-center gap-[8px] text-center transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] hover:-translate-y-1 group"
            >
              {/* 80x80px SVG Icon */}
              <div className="relative shrink-0 size-[80px] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img
                  src={item.icon}
                  alt={item.title}
                  className="size-full object-contain select-none"
                  loading="lazy"
                />
              </div>

              {/* Title and Description */}
              <div className="flex flex-col gap-[8px] items-center text-center w-full">
                <h3 className="font-['Inter'] font-semibold text-[#222222] text-[20px] sm:text-[22px] lg:text-[24px] leading-tight group-hover:text-[#005DDC] transition-colors">
                  {item.title}
                </h3>
                <p className="font-['Inter'] font-normal sm:font-medium text-[#757575] text-[13px] sm:text-[14px] leading-[1.6]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
