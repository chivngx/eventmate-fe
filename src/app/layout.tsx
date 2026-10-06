import type { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
    metadataBase: new URL("https://www.eventmate.top"),
    title: {
        default: "EventMate — Sự kiện cho sinh viên",
        template: "%s | EventMate",
    },
    description: "EventMate — Nền tảng kết nối nhân sự và cơ hội sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
    applicationName: "EventMate",
    keywords: [
        "sự kiện",
        "tình nguyện viên",
        "CTV sự kiện",
        "ban tổ chức",
        "Đà Nẵng",
        "sinh viên",
        "tuyển nhân sự sự kiện",
    ],
    authors: [{ name: "EventMate" }],
    openGraph: {
        type: "website",
        locale: "vi_VN",
        url: "https://www.eventmate.top",
        title: "EventMate — Sự kiện cho sinh viên",
        description: "Nền tảng kết nối nhân sự và cơ hội sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
        siteName: "EventMate",
        images: [
            {
                url: "/images/logo/eventmate-logo-square-512.png",
                width: 512,
                height: 512,
                alt: "EventMate Logo",
            },
        ],
    },
    twitter: {
        card: "summary",
        title: "EventMate — Sự kiện cho sinh viên",
        description: "Nền tảng kết nối nhân sự và cơ hội sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
        images: ["/images/logo/eventmate-logo-square-512.png"],
    },
    icons: {
        icon: "/favicon.svg",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "EventMate",
        url: "https://www.eventmate.top",
        description: "Nền tảng kết nối nhân sự và cơ hội sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
        potentialAction: {
            "@type": "SearchAction",
            target: "https://www.eventmate.top/events?keyword={search_term_string}",
            "query-input": "required name=search_term_string",
        },
    }

    return (
        <html lang="vi">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </head>
            <body>
                <Providers>{children}</Providers>
                <Analytics />
            </body>
        </html>
    )
}