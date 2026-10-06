import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/admin/*",
        "/dashboard",
        "/dashboard/*",
        "/checkout",
        "/checkout/*",
        "/checkin",
        "/checkin/*",
        "/api",
        "/api/*",
        "/reset-password",
        "/saved",
      ],
    },
    sitemap: "https://www.eventmate.top/sitemap.xml",
  }
}
