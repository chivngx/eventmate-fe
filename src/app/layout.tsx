import type { Metadata } from "next"
import { Providers } from "./providers"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "EventMate — Việc làm sự kiện cho sinh viên",
    template: "%s | EventMate",
  },
  description:
    "EventMate — Nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
  applicationName: "EventMate",
  keywords: [
    "việc làm sự kiện",
    "tình nguyện viên",
    "CTV sự kiện",
    "ban tổ chức",
    "Đà Nẵng",
    "sinh viên",
    "tuyển dụng sự kiện",
  ],
  authors: [{ name: "EventMate" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    title: "EventMate — Việc làm sự kiện cho sinh viên",
    description:
      "Nền tảng kết nối nhân sự và cơ hội việc làm sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
    siteName: "EventMate",
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
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
