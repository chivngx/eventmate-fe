import type { MetadataRoute } from "next"
import { supabase } from "@/lib/supabase"
import { BLOG_POSTS } from "@/data/blogData"

const BASE_URL = "https://www.eventmate.top"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/events`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  // Blog posts
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  // Dynamic events from DB
  let eventRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: events } = await supabase
      .from("events")
      .select("id, slug, created_at, bumped_at")
      .is("deleted_at", null)
      .limit(100)

    if (events) {
      eventRoutes = events.map((event) => ({
        url: `${BASE_URL}/events/${event.slug || event.id}`,
        lastModified: event.bumped_at
          ? new Date(event.bumped_at)
          : event.created_at
          ? new Date(event.created_at)
          : new Date(),
        changeFrequency: "daily",
        priority: 0.85,
      }))
    }
  } catch {
    // Fallback if DB fetch fails at build time
  }

  // Dynamic company profiles
  let companyRoutes: MetadataRoute.Sitemap = []
  try {
    const { data: companies } = await supabase
      .from("profiles")
      .select("id, slug, created_at")
      .eq("role", "organizer")
      .limit(50)

    if (companies) {
      companyRoutes = companies.map((c) => ({
        url: `${BASE_URL}/companies/${c.slug || c.id}`,
        lastModified: c.created_at ? new Date(c.created_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.75,
      }))
    }
  } catch {
    // Fallback if DB fetch fails
  }

  return [...staticRoutes, ...eventRoutes, ...companyRoutes, ...blogRoutes]
}
