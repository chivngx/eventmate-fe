import type { Metadata } from"next"
import { Analytics } from"@vercel/analytics/next"
import { Providers } from"./providers"
import"./globals.css"
// 🔒 P2.9: Sentry error tracking (no-op if NEXT_PUBLIC_SENTRY_DSN empty)
import"../../sentry.client.config"

export const metadata: Metadata = {
 title: {
 default:"EventMate — Sự kiện cho sinh viên",
 template:"%s | EventMate",
 },
 description:"EventMate — Nền tảng kết nối nhân sự và cơ hội sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
 applicationName:"EventMate",
 keywords: ["sự kiện","tình nguyện viên","CTV sự kiện","ban tổ chức","Đà Nẵng","sinh viên","tuyển nhân sự sự kiện",
 ],
 authors: [{ name:"EventMate" }],
 openGraph: {
 type:"website",
 locale:"vi_VN",
 title:"EventMate — Sự kiện cho sinh viên",
 description:"Nền tảng kết nối nhân sự và cơ hội sự kiện hàng đầu dành cho sinh viên và ban tổ chức tại Đà Nẵng.",
 siteName:"EventMate",
 },
 icons: {
 icon:"/favicon.svg",
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
 <Analytics />
 </body>
 </html>
 )
}
