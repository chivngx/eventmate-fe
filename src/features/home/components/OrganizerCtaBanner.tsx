"use client"

interface OrganizerCtaBannerProps {
  title?: string
  description?: string
  buttonText?: string
  onCtaClick?: () => void
}

export default function OrganizerCtaBanner({
  title = "Bạn là Ban Tổ Chức Sự Kiện?",
  description = "Tiếp cận ngay nguồn nhân sự sinh viên, CTV năng động, chuyên nghiệp và có tinh thần trách nhiệm cao tại Đà Nẵng. Đăng tin tuyển dụng nhanh chóng và quản lý ứng viên dễ dàng cùng EventMate.",
  buttonText = "Đăng tin sự kiện ngay",
  onCtaClick,
}: OrganizerCtaBannerProps) {
  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick()
      return
    }
    // Open auth or redirect to organizer registration
    window.dispatchEvent(
      new CustomEvent("open-auth-modal", { detail: { mode: "register", role: "organizer" } })
    )
  }

  return (
    <section
      className="w-full bg-[#EFF5FF] relative overflow-hidden"
      data-node-id="5875:29524"
      data-name="Analyze"
    >
      {/* Centered 1440px canvas frame */}
      <div className="relative max-w-[1440px] mx-auto min-h-[511px] w-full flex flex-col lg:flex-row items-center justify-between overflow-hidden">
        {/* 4 Authentic Background Contour Vectors from Figma */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          {/* Vector 1 (5875:29525): Left organic contour */}
          <div
            className="absolute w-[854px] h-[717px] -left-[430px] -top-[289px]"
            data-node-id="5875:29525"
          >
            <img
              src="/images/home/cta-vector-1.svg"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Vector 2 (5875:29526): Right contour 1 */}
          <div
            className="absolute w-[480px] h-[446px] left-[860px] top-[173px] hidden md:block"
            data-node-id="5875:29526"
          >
            <img
              src="/images/home/cta-vector-2.svg"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Vector 3 (5875:29527): Right contour 2 */}
          <div
            className="absolute w-[767px] h-[621px] left-[630px] top-[47px] hidden md:block"
            data-node-id="5875:29527"
          >
            <img
              src="/images/home/cta-vector-3.svg"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>

          {/* Vector 4 (5875:29528): Right contour 3 */}
          <div
            className="absolute w-[501px] h-[340px] left-[770px] top-[70px] hidden md:block"
            data-node-id="5875:29528"
          >
            <img
              src="/images/home/cta-vector-4.svg"
              alt=""
              className="w-full h-full object-contain pointer-events-none"
            />
          </div>
        </div>

        {/* Left Copy & CTA Button Block (Figma node 5875:29535) */}
        <div
          className="relative z-20 px-6 sm:px-12 lg:px-0 lg:ml-[120px] xl:ml-[184px] max-w-[520px] py-12 lg:py-0 flex flex-col gap-[32px] text-left shrink-0"
          data-node-id="5875:29535"
        >
          <div className="flex flex-col gap-[24px]" data-node-id="5875:29536">
            <h2
              className="font-['Inter'] font-bold text-3xl sm:text-4xl lg:text-[48px] text-[#222222] leading-[1.18] tracking-tight"
              data-node-id="5875:29537"
            >
              {title}
            </h2>
            <p
              className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#515151] leading-[1.6]"
              data-node-id="5875:29538"
            >
              {description}
            </p>
          </div>

          {/* CTA Button (Figma node 5875:29539) */}
          <div data-node-id="5875:29539">
            <button
              onClick={handleCtaClick}
              className="w-full sm:w-[288px] h-[56px] bg-[#005DDC] hover:bg-[#004EB7] text-white font-['Inter'] font-medium text-[20px] rounded-[8px] transition-all duration-200 shadow-[0_4px_16px_rgba(0,93,220,0.2)] active:scale-[0.98] flex items-center justify-center cursor-pointer select-none"
            >
              {buttonText}
            </button>
          </div>
        </div>

        {/* Right Person Visual (Figma node 5875:29540) */}
        {/* Desktop placement: absolute matching Figma exact coordinates (left: 699px, top: -62.2px, 628x706) */}
        <div
          className="hidden lg:block absolute right-0 xl:right-auto xl:left-[699px] top-[-62.2px] w-[628px] h-[706px] pointer-events-none select-none z-10"
          data-node-id="5875:29540"
          data-name="handsome-manager-glasses-working-using-clipboard-standing 1"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src="/images/home/cta-manager.png"
              alt="Manager"
              className="absolute h-full left-[-31.55%] max-w-none top-0 w-[168.67%]"
            />
          </div>
        </div>

        {/* Mobile & Tablet placement: sits cleanly below the text content */}
        <div className="block lg:hidden relative z-10 w-full max-w-[340px] sm:max-w-[420px] h-[360px] sm:h-[440px] mx-auto mt-2 overflow-hidden pointer-events-none select-none">
          <div className="relative w-full h-full overflow-hidden">
            <img
              src="/images/home/cta-manager.png"
              alt="Manager"
              className="absolute h-full left-[-31.55%] max-w-none top-0 w-[168.67%]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

