import LogoLoop from "@/components/LogoLoop"

const sponsorLogos = [
    { src: "https://sukienachau.com/wp-content/uploads/2021/06/achauevent.png", alt: "Sponsor 1" },
    { src: "https://cdn.hoabinhevents.com/logos/HBE%201-8.png", alt: "Sponsor 2" },
    { src: "https://hsvmedia.vn/datafiles/setone/1769678811_1833_logo-facebook-1-1.png", alt: "Sponsor 3" },
    { src: "https://media.licdn.com/dms/image/v2/C561BAQEweUWkk9Kb_Q/company-background_10000/company-background_10000/0/1649213128553/vietlink_event_cover?e=2147483647&v=beta&t=bWe7k3prru_aglWsPgpaET0hgEVcHjQ8tV9zAi47MqE", alt: "Sponsor 4" },
    { src: "https://static.topcv.vn/company_logos/lObj7xUxBqNl2D1aajLUTd5XkHlnoGRZ_1682393661____d2cdbbc892c8571828c400c1990ac956.png", alt: "Sponsor 5" },
]

export default function SponsorsSection() {
    return (
        <div className="w-full py-8 bg-slate-50/50 mt-16 border-t border-slate-200/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <LogoLoop
                    logos={sponsorLogos}
                    speed={40}
                    direction="left"
                    logoHeight={64}
                    gap={96}
                    hoverSpeed={0}
                    scaleOnHover
                    fadeOut
                    fadeOutColor="#f8fafc"
                    ariaLabel="Nhà tài trợ"
                />
            </div>
        </div>
    )
}
