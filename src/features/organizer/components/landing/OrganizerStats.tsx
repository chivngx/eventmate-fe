"use client"

export default function OrganizerStats() {
  const stats = [
    {
      id: "review",
      label: "Đánh giá",
      value: "1M",
      chart: "/images/chart-review.svg",
      alt: "Biểu đồ tăng trưởng lượt đánh giá",
      nodeId: "5875:27384",
    },
    {
      id: "rating",
      label: "Điểm đánh giá",
      value: "4.6",
      chart: "/images/chart-rating.svg",
      alt: "Biểu đồ tăng trưởng điểm đánh giá",
      nodeId: "5875:27385",
    },
    {
      id: "company",
      label: "Doanh nghiệp",
      value: "2K",
      chart: "/images/chart-company.svg",
      alt: "Biểu đồ tăng trưởng số lượng doanh nghiệp",
      nodeId: "5875:27386",
    },
  ]

  return (
    <section className="w-full pt-14 sm:pt-16 lg:pt-20 pb-8 sm:pb-10 lg:pb-10" data-node-id="5875:27381">
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 flex flex-col gap-[32px] items-center">
        {/* Section Header (Figma node 5875:27382: Titr home) */}
        <div
          className="flex flex-col items-center gap-[8px] text-center max-w-[650px] px-4"
          data-node-id="5875:27382"
          data-name="Titr home"
        >
          <h2 className="font-['Inter'] font-semibold text-2xl sm:text-3xl lg:text-[36px] text-[#222222] tracking-tight leading-tight">
            Được hơn 2.000 doanh nghiệp tin tưởng
          </h2>
          <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] leading-[1.6]">
            Đánh giá thực tế từ các đơn vị và ban tổ chức sự kiện đã đồng hành cùng EventMate
          </p>
        </div>

        {/* Stats Cards (Figma node 5875:27383) */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-[16px] w-full"
          data-node-id="5875:27383"
        >
          {stats.map((item) => (
            <div
              key={item.id}
              data-node-id={item.nodeId}
              data-name="Data"
              className="bg-white rounded-[16px] p-[24px] h-[141px] flex items-end justify-between gap-[32px] shadow-[2px_4px_32px_rgba(1,70,177,0.08)] hover:shadow-[2px_8px_36px_rgba(1,70,177,0.12)] transition-all duration-300"
            >
              <div className="flex flex-col gap-[4px] items-start text-left shrink-0">
                <span className="font-['Inter'] font-medium text-[#757575] text-[20px] sm:text-[24px] leading-normal">
                  {item.label}
                </span>
                <span className="font-['Inter'] font-semibold text-[#222222] text-[32px] sm:text-[36px] leading-none">
                  {item.value}
                </span>
              </div>

              <div className="w-[118px] h-[60px] relative shrink-0">
                <img
                  src={item.chart}
                  alt={item.alt}
                  className="w-full h-full block object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
