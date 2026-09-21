"use client"

import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"

export default function OrganizerPartnerCloud() {
  const router = useRouter()

  const row1 = [
    { name: "ActiveCampaign", src: "/images/partners/logo-activecampaign.svg", width: 237 },
    { name: "Evernote", src: "/images/partners/logo-evernote.svg", width: 164 },
    { name: "Outreach", src: "/images/partners/logo-outreach.svg", width: 169 },
    { name: "Afterpay", src: "/images/partners/logo-afterpay.svg", width: 156 },
    { name: "Figma", src: "/images/partners/logo-figma.svg", width: 94 },
  ]

  const row2 = [
    { name: "PayPal", src: "/images/partners/logo-paypal.svg", width: 143 },
    { name: "Airbnb", src: "/images/partners/logo-airbnb.svg", width: 128 },
    { name: "Fivetran", src: "/images/partners/logo-fivetran.svg", width: 162 },
    { name: "Pendo", src: "/images/partners/logo-pendo.svg", width: 128 },
    { name: "Airtable", src: "/images/partners/logo-airtable.svg", width: 154 },
    { name: "Framer", src: "/images/partners/logo-framer.svg", width: 135 },
  ]

  const row3 = [
    { name: "Pipedrive", src: "/images/partners/logo-pipedrive.svg", width: 162 },
    { name: "Airtasker", src: "/images/partners/logo-airtasker.svg", width: 144 },
    { name: "Freshworks", src: "/images/partners/logo-freshworks.svg", width: 160 },
  ]

  return (
    <section className="w-full py-8 sm:py-10 lg:py-10" data-node-id="5875:27387">
      <div className="max-w-[1232px] mx-auto px-4 sm:px-6 lg:px-0 flex flex-col items-center">
        
        {/* Title and Subtitle (Figma node 5875:27389) */}
        <div className="text-center max-w-3xl mx-auto mb-8" data-node-id="5875:27389">
          <h2 className="font-['Inter'] font-semibold text-3xl sm:text-4xl lg:text-[40px] text-[#222222] tracking-tight leading-tight">
            Phù hợp cho mọi quy mô doanh nghiệp & sự kiện
          </h2>
          <p className="font-['Inter'] font-normal text-[15px] sm:text-[16px] text-[#757575] mt-3 leading-[1.6] max-w-xl mx-auto">
            &ldquo;Nền tảng kết nối trực tiếp bạn với những nhân sự hiểu rõ từng khâu vận hành của sự kiện.&rdquo;
          </p>
        </div>

        {/* Action Buttons (Figma node 5875:27390) */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-[24px] mb-12 sm:mb-14" data-node-id="5875:27390">
          <button
            onClick={() => router.push("/register?role=organizer")}
            className="bg-[#282828] hover:bg-black text-white text-[18px] font-medium h-[48px] w-full sm:w-[225px] rounded-[8px] flex items-center justify-center transition-all duration-200 shadow-sm active:scale-98 cursor-pointer"
          >
            Đăng ký miễn phí
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("employer-features")
              el?.scrollIntoView({ behavior: "smooth" })
            }}
            className="border border-[#282828] hover:bg-slate-50 text-[#282828] text-[18px] font-medium h-[48px] w-full sm:w-[224px] rounded-[8px] flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer group"
          >
            <span>Xem các gói giải pháp</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Pill Logos Rows matching Figma (Figma node 5875:27393) */}
        <div className="flex flex-col gap-[19px] items-center w-full" data-node-id="5875:27393">
          {/* Row 1 */}
          <div className="flex flex-wrap items-center justify-center gap-[19px] w-full">
            {row1.map((logo) => (
              <div
                key={logo.name}
                className="bg-[#f9f9f9] hover:bg-white hover:shadow-md border border-slate-200/40 rounded-[32px] px-[24px] py-[4px] h-[56px] flex items-center justify-center transition-all duration-200 group cursor-default"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{ maxWidth: logo.width }}
                  className="h-[32px] sm:h-[36px] w-auto object-contain block transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Row 2 */}
          <div className="flex flex-wrap items-center justify-center gap-[19px] w-full">
            {row2.map((logo) => (
              <div
                key={logo.name}
                className="bg-[#f9f9f9] hover:bg-white hover:shadow-md border border-slate-200/40 rounded-[32px] px-[24px] py-[4px] h-[56px] flex items-center justify-center transition-all duration-200 group cursor-default"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{ maxWidth: logo.width }}
                  className="h-[32px] sm:h-[36px] w-auto object-contain block transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>

          {/* Row 3 */}
          <div className="flex flex-wrap items-center justify-center gap-[19px] w-full">
            {row3.map((logo) => (
              <div
                key={logo.name}
                className="bg-[#f9f9f9] hover:bg-white hover:shadow-md border border-slate-200/40 rounded-[32px] px-[24px] py-[4px] h-[56px] flex items-center justify-center transition-all duration-200 group cursor-default"
              >
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{ maxWidth: logo.width }}
                  className="h-[32px] sm:h-[36px] w-auto object-contain block transition-transform group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
