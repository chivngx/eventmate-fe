"use client"

export interface StepItem {
  step: string
  title: string
  caption: string
  nodeId?: string
}

export const STEPS: StepItem[] = [
  {
    step: "1",
    title: "Tạo tài khoản",
    caption: "Đăng ký nhanh tài khoản sinh viên hoặc CTV sự kiện chỉ trong 30 giây.",
    nodeId: "5875:29419",
  },
  {
    step: "2",
    title: "Hoàn thiện hồ sơ & CV",
    caption: "Cập nhật kỹ năng, ảnh chân dung và kinh nghiệm thực tế để tăng cơ hội trúng tuyển.",
    nodeId: "5875:29420",
  },
  {
    step: "3",
    title: "Tìm & Ứng tuyển",
    caption: "Khám phá sự kiện phù hợp theo thời gian, mức thù lao và nộp đơn trong 1 click.",
    nodeId: "5875:29421",
  },
  {
    step: "4",
    title: "Nhận việc & Bắt đầu",
    caption: "Nhận thông báo duyệt từ Ban tổ chức, tham gia tập huấn và bắt đầu công việc.",
    nodeId: "5875:29422",
  },
]

export interface HowItWorksStepsProps {
  title?: string
  subtitle?: string
  steps?: StepItem[]
}

export default function HowItWorksSteps({
  title = "4 Bước Đơn Giản Để Nhận Việc Sự Kiện",
  subtitle = "Quy trình đăng ký và kết nối việc làm sự kiện nhanh chóng, minh bạch tại Đà Nẵng",
  steps = STEPS,
}: HowItWorksStepsProps) {
  return (
    <section
      id="how-it-works-steps"
      className="w-full pt-4"
      data-node-id="5875:29416"
      data-name="Frame 2147225772"
    >
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0">
        {/* Section Header (Figma node 5875:29417: Titr home) */}
        <div
          className="flex flex-col items-center justify-center text-center mb-10 sm:mb-14 space-y-2"
          data-node-id="5875:29417"
          data-name="Titr home"
        >
          <h2
            className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] tracking-tight leading-tight text-center"
            data-node-id="I5875:29417;874:9496"
          >
            {title}
          </h2>
          <p
            className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6] text-center max-w-[600px]"
            data-node-id="I5875:29417;874:9497"
          >
            {subtitle}
          </p>
        </div>

        {/* 4 Steps Grid (Figma node 5875:29418: Frame 2147225771) */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] w-full pt-[36px]"
          data-node-id="5875:29418"
        >
          {steps.map((item) => (
            <div
              key={item.step}
              data-node-id={item.nodeId}
              data-name="Step"
              className="group relative bg-white border border-[#EDEDED] rounded-[8px] pt-[48px] pb-[24px] px-[20px] h-[140px] hover:border-[#005DDC]/50 hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-start"
            >
              {/* Floating Number Badge at top-left (56x56) */}
              <div
                className="absolute -top-[28px] left-[19px] w-[56px] h-[56px] rounded-[8px] bg-[#EFF5FF] flex items-center justify-center text-[#005DDC] font-medium text-[20px] transition-colors group-hover:bg-[#005DDC] group-hover:text-white select-none shadow-xs"
              >
                {item.step}
              </div>

              {/* Title & Caption */}
              <div className="flex flex-col gap-[12px] items-start text-left w-full">
                <h3 className="font-semibold text-[18px] text-[#222222] leading-normal truncate w-full group-hover:text-[#005DDC] transition-colors">
                  {item.title}
                </h3>
                <p className="font-normal text-[14px] text-[#757575] leading-normal line-clamp-2">
                  {item.caption}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
