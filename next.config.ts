import type { NextConfig } from "next"

/**
 * Next.js configuration.
 *
 * Security headers: applied to every route. CSP allows Supabase (REST +
 * Realtime WebSocket), Google Fonts, and inline styles/scripts (needed for
 * the framer-motion + base-ui runtime). `frame-ancestors 'none'` blocks
 * clickjacking. Images may load from any https origin (Supabase storage,
 * Unsplash defaults).
 *
 * Images: remote patterns for next/image — Supabase storage + Unsplash
 * (used as default avatar fallback in OrgLayout/OrgDashboard).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // CSP: supabase REST + Realtime (wss), Google Fonts, inline styles (Tailwind
  // + framer-motion inject style tags), inline scripts (next runtime), self
  // for everything else. `frame-ancestors 'none'` = X-Frame-Options DENY.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
]

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
}

export default nextConfig
