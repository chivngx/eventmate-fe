import type { NextConfig } from "next"
import { withSentryConfig } from "@sentry/nextjs"

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
 *
 * Sentry: wrapped with withSentryConfig — no-op when NEXT_PUBLIC_SENTRY_DSN
 * is empty (tree-shaken out of the bundle).
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

// 🔒 P2.9: Sentry wrapper — no-op tree-shakes when DSN empty.
export default withSentryConfig(nextConfig, {
  // Only relevant in production builds; dev is unaffected.
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Disable telemetry upload in dev.
  disableLogger: true,
})
